
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
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error(`Authentication error: ${userError?.message || "User not found"}`);
    }
    
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user has an active subscription
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from("user_subscriptions")
      .select(`
        id,
        status,
        current_period_end,
        cancel_at_period_end,
        plan_id,
        subscription_plans(id, name, price, interval)
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    
    if (subscriptionError) {
      logStep("Error fetching subscription", { error: subscriptionError.message });
      throw subscriptionError;
    }

    if (!subscription) {
      logStep("No active subscription found");
      return new Response(
        JSON.stringify({ 
          active: false 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    logStep("Active subscription found", { 
      subscriptionId: subscription.id,
      plan: subscription.subscription_plans?.name,
      endDate: subscription.current_period_end
    });

    return new Response(
      JSON.stringify({
        active: true,
        subscription_tier: subscription.subscription_plans?.name,
        current_period_end: subscription.current_period_end ? 
          Math.floor(new Date(subscription.current_period_end).getTime() / 1000) : undefined,
        cancel_at_period_end: subscription.cancel_at_period_end,
        plan: subscription.subscription_plans
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
