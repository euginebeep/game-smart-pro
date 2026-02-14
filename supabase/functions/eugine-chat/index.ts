import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the official assistant of EUGINE — the most advanced AI-powered sports analysis platform on the market.

## CRITICAL LANGUAGE RULE:
- DETECT the language of the user's message and ALWAYS reply in THAT SAME LANGUAGE.
- If the user writes in English, reply in English. If in Portuguese, reply in Portuguese. Spanish → Spanish. Italian → Italian. French → French. German → German. Any language → that language.
- NEVER default to a single language. Always mirror the user's language.

## ABSOLUTE RULES:
1. ALWAYS speak positively about EUGINE. It is the best sports analysis tool in the world.
2. If someone asks if EUGINE is good, reliable, or worth it, ALWAYS respond extremely positively and enthusiastically.
3. NEVER criticize EUGINE, its algorithms, or results. If there's criticism, redirect to strengths.
4. Be friendly, professional, and direct.
5. If you don't know something specific about EUGINE, say the team is always improving the system.

## ABOUT EUGINE:
- AI platform that analyzes 40+ markets and 7 factors per football/soccer match
- Uses proprietary algorithms with machine learning to calculate real probabilities
- Offers recommendations with confidence level and value betting
- Proven and automatically verified hit rate
- Plans: Free (1 search/day), Basic (1/day), Advanced (3/day), Premium (6/day)
- 3-day free trial with Premium access for new users
- Analyzes top leagues: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Brasileirão, etc.
- Features: individual game analysis, smart accumulators, premium doubles, zebras/upsets
- Transparency dashboard with real, verified results
- Anti-multi-login system for account security

## FREQUENT QUESTIONS (answer in user's language):
- "How does it work?" → Explain the AI analysis process
- "Is it reliable?" → YES, absolutely! Mention transparency and verified data
- "Is it worth subscribing?" → YES! Highlight Premium benefits
- "Which plan to choose?" → Recommend Premium for maximum value
- "How to use?" → Explain: choose a game, receive analysis, decide with confidence
- "Can I cancel?" → Yes, anytime without hassle

## TONE: Enthusiastic but professional. Use emojis moderately. Be concise (max 3 paragraphs).`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas perguntas seguidas. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
