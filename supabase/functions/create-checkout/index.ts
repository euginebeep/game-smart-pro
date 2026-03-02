import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  'https://www.eugineai.com',
  'https://eugineai.com',
  'https://game-smart-pro.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

type Currency = 'brl' | 'usd' | 'eur';
type Tier = 'basic' | 'advanced' | 'premium' | 'dayuse';

const TIER_PRICES: Record<Currency, Record<Tier, string>> = {
  brl: {
    basic: 'price_1SprZDBQSLreveKU8QmxRF80',
    advanced: 'price_1Spry1BQSLreveKU7NcHTNVx',
    premium: 'price_1SpryWBQSLreveKU7x6v5S9f',
    dayuse: 'price_dayuse_brl',
  },
  usd: {
    basic: 'price_1SptWYBQSLreveKUetIBcgIW',
    advanced: 'price_1SpttwBQSLreveKUGOKhunsn',
    premium: 'price_1SptvkBQSLreveKUNeLpNdBJ',
    dayuse: 'price_dayuse_usd',
  },
  eur: {
    basic: 'price_1SptvxBQSLreveKUCrsr9k8q',
    advanced: 'price_1SpuHlBQSLreveKUJvXZgTEv',
    premium: 'price_1SpuaxBQSLreveKUKskrtfH8',
    dayuse: 'price_dayuse_eur',
  },
};

// Country code → currency mapping
const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  BR: 'brl',
  US: 'usd', GB: 'usd', CA: 'usd', AU: 'usd', NZ: 'usd',
  // Euro zone
  IT: 'eur', ES: 'eur', DE: 'eur', FR: 'eur', PT: 'eur', NL: 'eur',
  BE: 'eur', AT: 'eur', IE: 'eur', FI: 'eur', GR: 'eur', LU: 'eur',
  MT: 'eur', CY: 'eur', SK: 'eur', SI: 'eur', EE: 'eur', LV: 'eur',
  LT: 'eur', HR: 'eur',
};

const LANGUAGE_TO_CURRENCY: Record<string, Currency> = {
  pt: 'brl',
  en: 'usd',
  es: 'eur',
  it: 'eur',
};

// Detect country from IP using free API
async function detectCountryFromIP(req: Request): Promise<string | null> {
  try {
    // Try X-Forwarded-For, then CF headers, then direct connection
    const forwarded = req.headers.get('x-forwarded-for');
    const cfCountry = req.headers.get('cf-ipcountry');
    
    // Cloudflare already provides country code
    if (cfCountry && cfCountry !== 'XX') {
      logStep("Country from CF header", { country: cfCountry });
      return cfCountry.toUpperCase();
    }

    const ip = forwarded?.split(',')[0]?.trim();
    if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return null;
    }

    const resp = await fetch(`https://ipapi.co/${ip}/country/`, {
      signal: AbortSignal.timeout(3000),
    });
    if (resp.ok) {
      const country = (await resp.text()).trim().toUpperCase();
      if (country.length === 2) {
        logStep("Country from IP lookup", { ip, country });
        return country;
      }
    }
  } catch (e) {
    logStep("IP detection failed, will use fallback", { error: String(e) });
  }
  return null;
}

// Resolve currency with IP + profile cross-check
function resolveCurrency(
  ipCountry: string | null,
  profileCountry: string | null,
  languageFallback: string
): { currency: Currency; source: string } {
  const ipCurrency = ipCountry ? COUNTRY_TO_CURRENCY[ipCountry] : null;
  const profileCurrency = profileCountry ? COUNTRY_TO_CURRENCY[profileCountry.toUpperCase()] : null;

  // Both match → use that currency (most secure)
  if (ipCurrency && profileCurrency && ipCurrency === profileCurrency) {
    return { currency: ipCurrency, source: 'ip+profile_match' };
  }

  // Profile exists but IP doesn't match → trust profile (VPN case)
  if (profileCurrency) {
    return { currency: profileCurrency, source: 'profile_country' };
  }

  // Only IP available → use IP
  if (ipCurrency) {
    return { currency: ipCurrency, source: 'ip_country' };
  }

  // Fallback to language
  const langCurrency = LANGUAGE_TO_CURRENCY[languageFallback] || 'brl';
  return { currency: langCurrency, source: 'language_fallback' };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const body = await req.json();
    const tier = body.tier as Tier;
    const language = (body.language as string) || 'pt';
    
    const validTiers: Tier[] = ['basic', 'advanced', 'premium', 'dayuse'];
    if (!tier || !validTiers.includes(tier)) {
      throw new Error(`Invalid tier: ${tier}. Valid options: basic, advanced, premium, dayuse`);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = {
      id: claimsData.claims.sub,
      email: (claimsData.claims as any).email as string | undefined,
    };

    if (!user.email) {
      return new Response(
        JSON.stringify({ error: "User not authenticated or email not available" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authenticated", { email: user.email });

    // --- CURRENCY RESOLUTION: IP + Profile ---
    // 1. Detect country from IP
    const ipCountry = await detectCountryFromIP(req);

    // 2. Get country_code from user profile
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const { data: profile } = await adminClient
      .from('profiles')
      .select('country_code')
      .eq('user_id', user.id)
      .single();
    
    const profileCountry = profile?.country_code || null;

    // 3. Resolve currency
    const { currency, source } = resolveCurrency(ipCountry, profileCountry, language);
    logStep("Currency resolved", { currency, source, ipCountry, profileCountry, language });

    const isDayUse = tier === 'dayuse';
    const priceId = TIER_PRICES[currency][tier];

    if (priceId.startsWith('price_dayuse_')) {
      throw new Error('Day Use ainda não está disponível. Em breve!');
    }

    logStep("Tier and price selected", { tier, currency, priceId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    const origin = req.headers.get("origin") || "https://www.eugineai.com";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isDayUse ? "payment" : "subscription",
      payment_method_types: isDayUse ? ['card', 'pix'] : ['card'],
      success_url: `${origin}/?subscription=success`,
      cancel_url: `${origin}/?subscription=canceled`,
      metadata: {
        user_id: user.id,
        tier: tier,
        is_dayuse: isDayUse ? 'true' : 'false',
        currency_source: source,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
