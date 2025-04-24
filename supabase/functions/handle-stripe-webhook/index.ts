
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the stripe signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No stripe signature found in request");
    }

    // Get the raw body as text
    const body = await req.text();
    
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
        event = stripe.webhooks.constructEvent(
          body, 
          signature, 
          webhookSecret
        );
      } else {
        // For testing without webhook signature verification
        event = JSON.parse(body);
        console.log("Warning: Processing webhook without signature verification");
      }
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Log the event type
    console.log(`Processing webhook event: ${event.type}`);

    // Record the event in our database
    const { data: eventRecord, error: recordError } = await supabaseClient
      .from("subscription_events")
      .insert({
        stripe_event_id: event.id,
        type: event.type,
        data: event
      })
      .select()
      .single();

    if (recordError) {
      console.error("Error recording webhook event:", recordError);
    }

    // Process different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Get the subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );
        
        // Get the customer
        const customer = await stripe.customers.retrieve(
          session.customer
        );
        
        // Update or create user subscription in our database
        if (session.metadata && session.metadata.user_id) {
          const userId = session.metadata.user_id;
          const planId = session.metadata.plan_id;
          
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
            console.error("Error updating subscription record:", error);
          } else {
            console.log("Successfully updated subscription for user", userId);
          }
        } else {
          console.error("Missing user_id or plan_id in session metadata");
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Find the user associated with this subscription
        const { data: userSubscription, error } = await supabaseClient
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();
          
        if (error || !userSubscription) {
          console.error("Error finding subscription or subscription not found:", error);
          break;
        }
        
        // Update subscription status
        const { error: updateError } = await supabaseClient
          .from("user_subscriptions")
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end
          })
          .eq("stripe_subscription_id", subscription.id);
          
        if (updateError) {
          console.error("Error updating subscription:", updateError);
        } else {
          console.log("Subscription updated for", userSubscription.user_id);
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        // Update subscription status to inactive
        const { error } = await supabaseClient
          .from("user_subscriptions")
          .update({
            status: "inactive"
          })
          .eq("stripe_subscription_id", subscription.id);
          
        if (error) {
          console.error("Error deactivating subscription:", error);
        } else {
          console.log("Subscription deactivated");
        }
        break;
      }
    }

    // Update event as processed
    if (eventRecord) {
      await supabaseClient
        .from("subscription_events")
        .update({ status: "processed" })
        .eq("id", eventRecord.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
