
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Parse request body
    const { planId } = await req.json();
    if (!planId) {
      throw new Error("planId is required");
    }
    logStep("Request validated", { planId });

    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error(`Auth error: ${userError?.message || "User not found"}`);
    }
    
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get plan details from database
    const { data: planData, error: planError } = await supabaseClient
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();
    
    if (planError || !planData) {
      throw new Error(`Plan not found: ${planError?.message || "Unknown error"}`);
    }
    logStep("Plan details retrieved", { planName: planData.name, price: planData.price });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    // Check if user already has a Stripe customer ID
    const { data: customerData, error: customerError } = await supabaseClient
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    logStep("Checked for existing customer", { 
      hasCustomer: !!customerData?.stripe_customer_id,
      customerId: customerData?.stripe_customer_id 
    });

    // Create or retrieve customer
    let customerId = customerData?.stripe_customer_id;
    if (!customerId) {
      // Look up customer in Stripe by email
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
        logStep("Found customer in Stripe by email", { customerId });
      } else {
        // Create new customer
        const newCustomer = await stripe.customers.create({
          email: user.email,
          name: user.user_metadata?.full_name,
          metadata: {
            user_id: user.id
          }
        });
        customerId = newCustomer.id;
        logStep("Created new customer", { customerId });
      }
    }

    // Set up Stripe Checkout Session
    const origin = req.headers.get("origin") || "https://juris-flash-flow.lovable.app";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "brl",
          product_data: {
            name: planData.name,
            description: planData.description || `Assinatura ${planData.name}`,
          },
          unit_amount: Math.round(planData.price * 100), // Price in cents
          recurring: {
            interval: planData.interval === "mês" ? "month" : "year"
          }
        },
        quantity: 1,
      }],
      metadata: {
        user_id: user.id,
        plan_id: planId
      },
      success_url: `${origin}/subscription?success=true`,
      cancel_url: `${origin}/subscription?canceled=true`,
    });

    logStep("Checkout session created", { 
      sessionId: session.id,
      url: session.url,
      metadata: session.metadata
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
