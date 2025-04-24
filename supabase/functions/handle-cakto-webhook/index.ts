
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CAKTO_WEBHOOK_SECRET = Deno.env.get('CAKTO_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-cakto-signature')
    if (!signature || !CAKTO_WEBHOOK_SECRET) {
      throw new Error('Missing signature or webhook secret')
    }

    const body = await req.json()
    
    // Create Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!
    )

    // Log the webhook event
    const { data: event, error: eventError } = await supabase
      .from('subscription_events')
      .insert({
        event_type: body.type,
        payload: body,
        processed: false
      })
      .select()
      .single()

    if (eventError) throw eventError

    // Handle different event types
    switch (body.type) {
      case 'subscription.created':
      case 'subscription.activated':
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: body.customer.external_id,
            status: 'active',
            cakto_subscription_id: body.subscription.id,
            start_date: new Date().toISOString(),
            end_date: body.subscription.current_period_end,
            plan_id: (await supabase
              .from('subscription_plans')
              .select('id')
              .eq('cakto_plan_id', body.subscription.plan_id)
              .single()).data?.id
          })
        break

      case 'subscription.canceled':
      case 'subscription.expired':
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'inactive',
            end_date: new Date().toISOString()
          })
          .eq('cakto_subscription_id', body.subscription.id)
        break
    }

    // Mark event as processed
    await supabase
      .from('subscription_events')
      .update({ processed: true })
      .eq('id', event.id)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
