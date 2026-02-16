import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Mapeamento de price IDs para tiers
const PRICE_TO_TIER: Record<string, string> = {
  'price_1SprZDBQSLreveKU8QmxRF80': 'basic',
  'price_1Spry1BQSLreveKU7NcHTNVx': 'advanced',
  'price_1SpryWBQSLreveKU7x6v5S9f': 'premium',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Use an anon client to validate JWT claims (signing-keys compatible)
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Try getClaims first, fall back to getUser if it fails
    let userId: string | undefined;
    let userEmail: string | undefined;

    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (!claimsError && claimsData?.claims?.sub) {
      userId = claimsData.claims.sub;
      userEmail = (claimsData.claims as any).email as string | undefined;
    } else {
      logStep("getClaims failed, falling back to getUser", { error: claimsError?.message });
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError || !userData?.user) {
        logStep("getUser also failed", { error: userError?.message });
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      userId = userData.user.id;
      userEmail = userData.user.email;
    }

    const user = { id: userId, email: userEmail };

    if (!user.email) {
      return new Response(JSON.stringify({ error: "User not authenticated or email not available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // If an admin manually granted access (via admin panel), do NOT downgrade the user here.
    // This prevents the periodic subscription check from overriding manual entitlement.
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_tier, subscription_status, subscription_end_date, stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      logStep("Warning: could not load profile", { message: profileError.message });
    }

    const manualEndDate = profileData?.subscription_end_date ? new Date(profileData.subscription_end_date) : null;
    const hasManualAccess =
      profileData?.subscription_status === 'active' &&
      profileData?.subscription_tier &&
      profileData.subscription_tier !== 'free' &&
      // If an end date exists, require it to be in the future
      (!manualEndDate || manualEndDate >= new Date()) &&
      // If Stripe subscription exists, allow Stripe to be source-of-truth
      !profileData?.stripe_subscription_id;

    if (hasManualAccess) {
      logStep("Manual access detected - skipping Stripe sync", {
        tier: profileData?.subscription_tier,
        end: profileData?.subscription_end_date,
      });

      return new Response(JSON.stringify({
        subscribed: true,
        tier: profileData!.subscription_tier,
        subscription_end: profileData!.subscription_end_date,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, returning free tier");
      
      // Atualizar profile para tier free
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_tier: 'free',
          subscription_status: 'inactive'
        })
        .eq('user_id', user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: 'free',
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let tier = 'free';
    let subscriptionEnd = null;
    let subscriptionId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionId = subscription.id;
      
      // Determinar tier pelo price ID
      const priceId = subscription.items.data[0]?.price?.id;
      tier = PRICE_TO_TIER[priceId] || 'basic';
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        tier,
        endDate: subscriptionEnd 
      });
      
      // Atualizar profile
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_tier: tier,
          subscription_status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_end_date: subscriptionEnd
        })
        .eq('user_id', user.id);
        
    } else {
      logStep("No active subscription found");
      
      // Atualizar profile para free
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_tier: 'free',
          subscription_status: 'inactive',
          stripe_customer_id: customerId
        })
        .eq('user_id', user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier: tier,
      subscription_end: subscriptionEnd
    }), {
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
