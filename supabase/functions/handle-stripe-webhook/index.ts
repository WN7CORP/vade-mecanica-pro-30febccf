
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced logging for better debugging
const logWebhookEvent = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logWebhookEvent("Processing webhook request");
    
    // Get the stripe signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logWebhookEvent("Error: No stripe signature found in request");
      throw new Error("No stripe signature found in request");
    }

    // Get the raw body as text
    const body = await req.text();
    logWebhookEvent("Request body received", { bodyLength: body.length });
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Verify webhook signature
    let event;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    try {
      if (webhookSecret) {
        logWebhookEvent("Verifying webhook signature with secret");
        event = stripe.webhooks.constructEvent(
          body, 
          signature, 
          webhookSecret
        );
        logWebhookEvent("Webhook signature verified successfully");
      } else {
        // Fallback for environments without signature verification
        logWebhookEvent("WARNING: Processing webhook without signature verification");
        event = JSON.parse(body);
      }
    } catch (err) {
      logWebhookEvent("Webhook signature verification failed", { error: err.message });
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Log the event type for debugging
    logWebhookEvent("Processing event", { type: event.type });

    // Process subscription-related events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        logWebhookEvent("Checkout session completed", { 
          sessionId: session.id, 
          customerId: session.customer,
          hasMetadata: !!session.metadata,
          metadata: session.metadata
        });
        
        // Ensure we have user and plan metadata
        if (!session.metadata || !session.metadata.user_id || !session.metadata.plan_id) {
          logWebhookEvent("Error: Missing metadata", { metadata: session.metadata });
          console.error("Missing user_id or plan_id in session metadata");
          break;
        }

        const userId = session.metadata.user_id;
        const planId = session.metadata.plan_id;
        
        // Retrieve the subscription details
        logWebhookEvent("Retrieving subscription details", { subscriptionId: session.subscription });
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        
        // Update user subscription in Supabase
        logWebhookEvent("Updating subscription record", { 
          userId,
          planId,
          status: subscription.status
        });
        
        const { error } = await supabaseClient
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: "active",
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscription.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end
          }, {
            onConflict: "user_id"
          });
        
        if (error) {
          logWebhookEvent("Error updating subscription record", { error });
          console.error("Error updating subscription record:", error);
        } else {
          logWebhookEvent("Subscription record updated successfully");
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        logWebhookEvent("Customer subscription updated", { 
          subscriptionId: subscription.id, 
          status: subscription.status 
        });
        
        // Update subscription status in Supabase
        const { error } = await supabaseClient
          .from("user_subscriptions")
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end
          })
          .eq("stripe_subscription_id", subscription.id);
          
        if (error) {
          logWebhookEvent("Error updating subscription", { error });
          console.error("Error updating subscription:", error);
        } else {
          logWebhookEvent("Subscription updated successfully");
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        // Mark subscription as inactive
        const subscription = event.data.object;
        logWebhookEvent("Customer subscription deleted", { subscriptionId: subscription.id });
        
        const { error } = await supabaseClient
          .from("user_subscriptions")
          .update({ status: "inactive" })
          .eq("stripe_subscription_id", subscription.id);
          
        if (error) {
          logWebhookEvent("Error deactivating subscription", { error });
          console.error("Error deactivating subscription:", error);
        } else {
          logWebhookEvent("Subscription deactivated successfully");
        }
        break;
      }
    }

    logWebhookEvent("Webhook processing completed successfully");
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logWebhookEvent("Error processing webhook", { message: errorMessage });
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: errorMessage || "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
