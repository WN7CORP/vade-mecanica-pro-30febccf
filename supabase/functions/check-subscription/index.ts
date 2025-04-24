
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      logStep("Authentication failed", { error: userError });
      throw new Error("Usuário não autenticado");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get user's subscription from database
    const { data: subscription, error: subError } = await supabaseClient
      .from("user_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    logStep("Fetched subscription from DB", { found: !!subscription, error: subError?.message });

    if (!subscription) {
      // No subscription found in DB - return inactive status
      logStep("No active subscription found in database");
      
      return new Response(
        JSON.stringify({ active: false }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    try {
      // Verify subscription status in Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );
      
      logStep("Retrieved Stripe subscription", { 
        id: stripeSubscription.id, 
        status: stripeSubscription.status,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      });

      const active = stripeSubscription.status === "active";
      
      // Update subscription status if needed
      if (!active && subscription.status === "active") {
        logStep("Updating subscription status to inactive");
        
        await supabaseClient
          .from("user_subscriptions")
          .update({ 
            status: "inactive",
            updated_at: new Date().toISOString()
          })
          .eq("id", subscription.id);
      } else {
        // Update other subscription details
        await supabaseClient
          .from("user_subscriptions")
          .update({
            current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          })
          .eq("id", subscription.id);
      }

      return new Response(
        JSON.stringify({
          active,
          subscription_tier: subscription.subscription_plans.name,
          plan: {
            id: subscription.subscription_plans.id,
            name: subscription.subscription_plans.name,
            price: subscription.subscription_plans.price,
            interval: subscription.subscription_plans.interval
          },
          current_period_end: stripeSubscription.current_period_end,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (stripeError) {
      logStep("Stripe error", { error: stripeError.message });
      
      // If we can't get the subscription from Stripe but have it in DB,
      // mark it as inactive in our database
      await supabaseClient
        .from("user_subscriptions")
        .update({ status: "inactive" })
        .eq("id", subscription.id);
      
      return new Response(
        JSON.stringify({ active: false, error: "Failed to verify subscription" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    logStep("ERROR", { message: error.message });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

export {};
