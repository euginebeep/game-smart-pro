import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============= LÓGICA PROTEGIDA DO EUGINE =============

const API_KEY = Deno.env.get('ODDS_API_KEY');
const API_BASE = 'https://api.the-odds-api.com/v4';

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string;
  bookmaker: string;
  odds: {
    home: number;
    draw: number;
    away: number;
    over: number;
    under: number;
  };
  dayType: 'today' | 'tomorrow' | 'future';
  dayLabel: string;
}

interface BettingAnalysis {
  type: string;
  reason: string;
  profit: number;
}

// Traduções das análises
const analysisTranslations: Record<string, Record<string, any>> = {
  pt: {
    over25: 'MAIS DE 2.5 GOLS',
    over25Reason: (odd: string, home: string, away: string) => 
      `Odd de ${odd} indica alta expectativa de gols. Mercado aposta em jogo movimentado entre ${home} e ${away}.`,
    btts: 'AMBAS EQUIPES MARCAM',
    bttsReason: (homeOdd: string, awayOdd: string) => 
      `Jogo equilibrado com odds similares (Casa: ${homeOdd} / Fora: ${awayOdd}). Times tendem a ter boa performance ofensiva.`,
  },
  en: {
    over25: 'OVER 2.5 GOALS',
    over25Reason: (odd: string, home: string, away: string) => 
      `Odd of ${odd} indicates high goal expectation. Market betting on an eventful game between ${home} and ${away}.`,
    btts: 'BOTH TEAMS TO SCORE',
    bttsReason: (homeOdd: string, awayOdd: string) => 
      `Balanced game with similar odds (Home: ${homeOdd} / Away: ${awayOdd}). Teams tend to have good offensive performance.`,
  },
  es: {
    over25: 'MÁS DE 2.5 GOLES',
    over25Reason: (odd: string, home: string, away: string) => 
      `Cuota de ${odd} indica alta expectativa de goles. El mercado apuesta por un partido con muchos goles entre ${home} y ${away}.`,
    btts: 'AMBOS EQUIPOS MARCAN',
    bttsReason: (homeOdd: string, awayOdd: string) => 
      `Partido equilibrado con cuotas similares (Local: ${homeOdd} / Visitante: ${awayOdd}). Los equipos tienden a tener buen rendimiento ofensivo.`,
  },
  it: {
    over25: 'PIÙ DI 2.5 GOL',
    over25Reason: (odd: string, home: string, away: string) => 
      `Quota di ${odd} indica alta aspettativa di gol. Il mercato scommette su una partita movimentata tra ${home} e ${away}.`,
    btts: 'ENTRAMBE SEGNANO',
    bttsReason: (homeOdd: string, awayOdd: string) => 
      `Partita equilibrata con quote simili (Casa: ${homeOdd} / Trasferta: ${awayOdd}). Le squadre tendono ad avere buone prestazioni offensive.`,
  },
};

// Day labels translations
const dayLabelsTranslations: Record<string, Record<string, string>> = {
  pt: { today: '🔴 HOJE', tomorrow: '📅 AMANHÃ' },
  en: { today: '🔴 TODAY', tomorrow: '📅 TOMORROW' },
  es: { today: '🔴 HOY', tomorrow: '📅 MAÑANA' },
  it: { today: '🔴 OGGI', tomorrow: '📅 DOMANI' },
};

// Alert messages translations
const alertTranslations: Record<string, Record<string, string>> = {
  pt: { today: '🔴 JOGOS DE HOJE', tomorrow: '📅 JOGOS DE AMANHÃ', future: '📅 JOGOS DE' },
  en: { today: '🔴 TODAY\'S GAMES', tomorrow: '📅 TOMORROW\'S GAMES', future: '📅 GAMES ON' },
  es: { today: '🔴 PARTIDOS DE HOY', tomorrow: '📅 PARTIDOS DE MAÑANA', future: '📅 PARTIDOS DEL' },
  it: { today: '🔴 PARTITE DI OGGI', tomorrow: '📅 PARTITE DI DOMANI', future: '📅 PARTITE DEL' },
};

// Análise de apostas - LÓGICA SECRETA
function analyzeBet(game: Game, lang: string = 'pt'): BettingAnalysis {
  const betAmount = 40;
  const t = analysisTranslations[lang] || analysisTranslations['pt'];
  
  if (game.odds.over > 0 && game.odds.over < 2.0) {
    return {
      type: t.over25,
      reason: t.over25Reason(game.odds.over.toFixed(2), game.homeTeam, game.awayTeam),
      profit: parseFloat((betAmount * game.odds.over - betAmount).toFixed(2))
    };
  }
  
  const avgOdd = (game.odds.home + game.odds.away) / 2;
  return {
    type: t.btts,
    reason: t.bttsReason(game.odds.home.toFixed(2), game.odds.away.toFixed(2)),
    profit: parseFloat((betAmount * avgOdd - betAmount).toFixed(2))
  };
}

// Filtrar jogos válidos de um dia específico
function filtrarJogosValidos(jogos: any[], dataReferencia: Date): any[] {
  const agora = new Date();
  const limiteMinimo = new Date(agora.getTime() + 10 * 60 * 1000);
  
  const inicioDia = new Date(dataReferencia);
  inicioDia.setHours(0, 0, 0, 0);
  
  const fimDia = new Date(dataReferencia);
  fimDia.setHours(23, 59, 59, 999);
  
  return jogos.filter((game: any) => {
    const dataJogo = new Date(game.commence_time);
    const noDiaCerto = dataJogo >= inicioDia && dataJogo <= fimDia;
    const temTempo = dataJogo > limiteMinimo;
    return noDiaCerto && temTempo;
  });
}

// Buscar jogos dia por dia até encontrar
function buscarJogosDisponiveis(oddsData: any[], lang: string = 'pt'): { jogos: any[]; diaEncontrado: number; dataAlvo: Date; mensagem: string } {
  const hoje = new Date();
  const alerts = alertTranslations[lang] || alertTranslations['pt'];
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : lang === 'it' ? 'it-IT' : 'en-US';
  
  for (let diasNoFuturo = 0; diasNoFuturo <= 7; diasNoFuturo++) {
    const dataAlvo = new Date(hoje);
    dataAlvo.setDate(dataAlvo.getDate() + diasNoFuturo);
    
    const jogosValidos = filtrarJogosValidos(oddsData, dataAlvo);
    
    if (jogosValidos.length > 0) {
      const diaTexto = dataAlvo.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
      
      console.log(`✅ Encontrados ${jogosValidos.length} jogos para dia +${diasNoFuturo}`);
      
      return {
        jogos: jogosValidos,
        diaEncontrado: diasNoFuturo,
        dataAlvo: dataAlvo,
        mensagem: diasNoFuturo === 0 ? alerts.today :
                  diasNoFuturo === 1 ? alerts.tomorrow :
                  `${alerts.future} ${diaTexto}`
      };
    }
    
    console.log(`⚠️ Nenhum jogo válido para dia +${diasNoFuturo}. Tentando próximo dia...`);
  }
  
  throw new Error('Nenhum jogo encontrado nos próximos 7 dias');
}

function getDayType(diaEncontrado: number): 'today' | 'tomorrow' | 'future' {
  if (diaEncontrado === 0) return 'today';
  if (diaEncontrado === 1) return 'tomorrow';
  return 'future';
}

function getDayLabel(dataJogo: Date, lang: string = 'pt'): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const dataJogoNormalizada = new Date(dataJogo);
  dataJogoNormalizada.setHours(0, 0, 0, 0);
  
  const diffDias = Math.round((dataJogoNormalizada.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  const dayLabels = dayLabelsTranslations[lang] || dayLabelsTranslations['pt'];
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : lang === 'it' ? 'it-IT' : 'en-US';
  
  if (diffDias === 0) return dayLabels.today;
  if (diffDias === 1) return dayLabels.tomorrow;
  return `📅 ${dataJogo.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}`;
}

// Buscar odds da API externa
async function fetchOddsFromAPI(lang: string = 'pt') {
  if (!API_KEY) {
    throw new Error('API key não configurada');
  }

  // Buscar esportes disponíveis
  const sportsResponse = await fetch(`${API_BASE}/sports?apiKey=${API_KEY}`);
  
  if (!sportsResponse.ok) {
    throw new Error(`Erro ao buscar esportes: ${sportsResponse.status}`);
  }
  
  const sports = await sportsResponse.json();
  const remaining = sportsResponse.headers.get('x-requests-remaining');
  
  console.log('Esportes disponíveis:', sports.length);
  
  // Filtrar futebol
  const soccerSports = sports.filter((s: any) => 
    s.group === 'Soccer' || s.key.includes('soccer')
  );
  
  if (soccerSports.length === 0) {
    throw new Error('Nenhum campeonato de futebol disponível');
  }
  
  const activeSports = soccerSports.filter((s: any) => s.active);
  
  console.log('Campeonatos ativos:', activeSports.length);
  
  // Buscar jogos de múltiplos campeonatos
  let allOddsData: any[] = [];
  let apiRemaining = parseInt(remaining || '0');
  
  for (const sport of activeSports) {
    console.log('Buscando odds para:', sport.title);
    
    try {
      const oddsResponse = await fetch(
        `${API_BASE}/sports/${sport.key}/odds?apiKey=${API_KEY}&regions=us&markets=h2h,totals&oddsFormat=decimal`
      );
      
      if (!oddsResponse.ok) {
        console.warn(`Erro ao buscar ${sport.title}: ${oddsResponse.status}`);
        continue;
      }
      
      apiRemaining = parseInt(oddsResponse.headers.get('x-requests-remaining') || '0');
      const oddsData = await oddsResponse.json();
      
      if (oddsData && oddsData.length > 0) {
        const jogosComLiga = oddsData.map((game: any) => ({
          ...game,
          leagueTitle: sport.title
        }));
        allOddsData = [...allOddsData, ...jogosComLiga];
      }
      
      console.log(`${oddsData?.length || 0} jogos de ${sport.title}. Total acumulado: ${allOddsData.length}`);
      
    } catch (err) {
      console.warn(`Erro ao processar ${sport.title}:`, err);
      continue;
    }
  }
  
  if (allOddsData.length === 0) {
    throw new Error('Não foi possível encontrar jogos disponíveis');
  }
  
  // BUSCAR JOGOS DIA POR DIA
  const resultado = buscarJogosDisponiveis(allOddsData, lang);
  const dayType = getDayType(resultado.diaEncontrado);
  
  // Processar os jogos encontrados (máximo 5)
  const games: Game[] = resultado.jogos
    .slice(0, 5)
    .map((game: any): Game | null => {
      const bookmaker = game.bookmakers?.[0];
      if (!bookmaker) return null;
      
      const h2h = bookmaker.markets?.find((m: any) => m.key === 'h2h');
      const totals = bookmaker.markets?.find((m: any) => m.key === 'totals');
      
      if (!h2h) return null;
      
      const startTime = new Date(game.commence_time);
      
      return {
        id: game.id || `${game.home_team}-${game.away_team}`,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        league: game.leagueTitle || 'Futebol',
        startTime: startTime.toISOString(),
        bookmaker: bookmaker.title,
        odds: {
          home: h2h.outcomes.find((o: any) => o.name === game.home_team)?.price || 2.0,
          draw: h2h.outcomes.find((o: any) => o.name === 'Draw')?.price || 3.2,
          away: h2h.outcomes.find((o: any) => o.name === game.away_team)?.price || 3.5,
          over: totals?.outcomes.find((o: any) => o.name === 'Over')?.price || 1.85,
          under: totals?.outcomes.find((o: any) => o.name === 'Under')?.price || 1.9,
        },
        dayType,
        dayLabel: getDayLabel(startTime, lang)
      };
    })
    .filter((game): game is Game => game !== null);
  
  if (games.length === 0) {
    throw new Error('Não foi possível processar os jogos encontrados');
  }
  
  // Adicionar análise de apostas a cada jogo
  const gamesWithAnalysis = games.map(game => ({
    ...game,
    analysis: analyzeBet(game, lang)
  }));
  
  console.log(`Total de ${gamesWithAnalysis.length} jogos processados para análise`);
  
  return { 
    games: gamesWithAnalysis, 
    remaining: apiRemaining,
    isToday: resultado.diaEncontrado === 0,
    alertMessage: resultado.mensagem,
    foundDate: resultado.dataAlvo.toISOString()
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obter idioma do body, query param ou header
    let lang = 'pt';
    try {
      const body = await req.json();
      lang = body?.lang || 'pt';
    } catch {
      const url = new URL(req.url);
      lang = url.searchParams.get('lang') || req.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0] || 'pt';
    }
    const validLang = ['pt', 'en', 'es', 'it'].includes(lang) ? lang : 'pt';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Erro de autenticação:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Token inválido' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Usuário autenticado:', claimsData.claims.sub, 'Idioma:', validLang);

    // Buscar odds com idioma
    const result = await fetchOddsFromAPI(validLang);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Erro na função fetch-odds:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
