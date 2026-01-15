import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Mapeamento de price IDs para tiers
const PRICE_TO_TIER: Record<string, string> = {
  'price_1SprZDBQSLreveKU8QmxRF80': 'basic',
  'price_1Spry1BQSLreveKU7NcHTNVx': 'advanced',
  'price_1SpryWBQSLreveKU7x6v5S9f': 'premium',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { 
          sessionId: session.id, 
          customerId: session.customer,
          customerEmail: session.customer_email 
        });

        // Get subscription details
        if (session.subscription && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price?.id;
          const tier = PRICE_TO_TIER[priceId] || 'basic';
          const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();

          // Find user by email
          const customerEmail = session.customer_email || session.customer_details?.email;
          if (customerEmail) {
            const { data: profile, error: profileError } = await supabaseClient
              .from('profiles')
              .select('user_id')
              .eq('email', customerEmail)
              .single();

            if (profile && !profileError) {
              await supabaseClient
                .from('profiles')
                .update({
                  subscription_tier: tier,
                  subscription_status: 'active',
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: subscription.id,
                  subscription_end_date: subscriptionEnd,
                })
                .eq('user_id', profile.user_id);

              logStep("Profile updated after checkout", { 
                userId: profile.user_id, 
                tier, 
                subscriptionEnd 
              });
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { 
          subscriptionId: subscription.id, 
          status: subscription.status 
        });

        const priceId = subscription.items.data[0]?.price?.id;
        const tier = PRICE_TO_TIER[priceId] || 'basic';
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const customerId = subscription.customer as string;

        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;

        const customerEmail = (customer as Stripe.Customer).email;
        if (customerEmail) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('user_id')
            .eq('email', customerEmail)
            .single();

          if (profile) {
            const updateData: Record<string, any> = {
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              subscription_end_date: subscriptionEnd,
            };

            // Update status based on subscription status
            if (subscription.status === 'active') {
              updateData.subscription_tier = tier;
              updateData.subscription_status = 'active';
            } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
              updateData.subscription_status = 'inactive';
            } else if (subscription.status === 'past_due') {
              updateData.subscription_status = 'past_due';
            }

            await supabaseClient
              .from('profiles')
              .update(updateData)
              .eq('user_id', profile.user_id);

            logStep("Profile updated after subscription change", { 
              userId: profile.user_id, 
              tier, 
              status: subscription.status 
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;

        const customerEmail = (customer as Stripe.Customer).email;
        if (customerEmail) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('user_id')
            .eq('email', customerEmail)
            .single();

          if (profile) {
            await supabaseClient
              .from('profiles')
              .update({
                subscription_tier: 'free',
                subscription_status: 'inactive',
                stripe_subscription_id: null,
              })
              .eq('user_id', profile.user_id);

            logStep("Profile updated after subscription deletion", { 
              userId: profile.user_id 
            });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment succeeded", { 
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription 
        });

        // Refresh subscription status on successful payment
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const priceId = subscription.items.data[0]?.price?.id;
          const tier = PRICE_TO_TIER[priceId] || 'basic';
          const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          const customerId = subscription.customer as string;

          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted) {
            const customerEmail = (customer as Stripe.Customer).email;
            if (customerEmail) {
              const { data: profile } = await supabaseClient
                .from('profiles')
                .select('user_id')
                .eq('email', customerEmail)
                .single();

              if (profile) {
                await supabaseClient
                  .from('profiles')
                  .update({
                    subscription_tier: tier,
                    subscription_status: 'active',
                    subscription_end_date: subscriptionEnd,
                  })
                  .eq('user_id', profile.user_id);

                logStep("Profile updated after invoice payment", { 
                  userId: profile.user_id, 
                  tier 
                });
              }
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment failed", { 
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription 
        });

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customerId = subscription.customer as string;

          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted) {
            const customerEmail = (customer as Stripe.Customer).email;
            if (customerEmail) {
              const { data: profile } = await supabaseClient
                .from('profiles')
                .select('user_id')
                .eq('email', customerEmail)
                .single();

              if (profile) {
                await supabaseClient
                  .from('profiles')
                  .update({
                    subscription_status: 'past_due',
                  })
                  .eq('user_id', profile.user_id);

                logStep("Profile updated after payment failure", { 
                  userId: profile.user_id 
                });
              }
            }
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
