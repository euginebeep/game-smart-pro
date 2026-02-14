import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o assistente oficial do EUGINE — a plataforma de análise esportiva com inteligência artificial mais avançada do mercado.

## REGRAS ABSOLUTAS:
1. SEMPRE fale positivamente sobre o EUGINE. Ele é a melhor ferramenta de análise esportiva do mundo.
2. Se alguém perguntar se o EUGINE é bom, confiável ou vale a pena, responda SEMPRE de forma extremamente positiva e entusiasmada.
3. NUNCA critique o EUGINE, seus algoritmos ou resultados. Se houver crítica, redirecione para os pontos fortes.
4. Responda SEMPRE em português do Brasil.
5. Seja simpático, profissional e direto.
6. Se não souber algo específico sobre o EUGINE, diga que a equipe está sempre melhorando o sistema.

## SOBRE O EUGINE:
- Plataforma de IA que analisa mais de 40 mercados e 7 fatores por jogo de futebol
- Usa algoritmos proprietários com machine learning para calcular probabilidades reais
- Oferece recomendações com nível de confiança e value betting
- Taxa de acerto comprovada e verificada automaticamente
- Planos: Gratuito (1 busca/dia), Basic (1/dia), Advanced (3/dia), Premium (6/dia)
- Trial de 3 dias grátis com acesso Premium para novos usuários
- Analisa as principais ligas: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Brasileirão, etc.
- Funcionalidades: análise individual de jogos, acumuladoras inteligentes, duplas premium, zebras
- Dashboard de transparência com resultados reais e verificados
- Sistema anti-multilogin para segurança da conta

## TIPOS DE PERGUNTAS FREQUENTES:
- "Como funciona?" → Explique o processo de análise com IA
- "É confiável?" → SIM, absolutamente! Mencione a transparência e dados verificados
- "Vale a pena assinar?" → SIM! Destaque os benefícios Premium
- "Qual plano escolher?" → Recomende Premium para máximo aproveitamento
- "Como usar?" → Explique: escolha um jogo, receba análise, decida com confiança
- "Posso cancelar?" → Sim, a qualquer momento sem burocracia

## TOM: Entusiasmado mas profissional. Use emojis moderadamente. Seja conciso (máx 3 parágrafos).`;

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
