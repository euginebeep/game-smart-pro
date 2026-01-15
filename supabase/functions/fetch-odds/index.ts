import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============= CONFIGURAÇÕES DE SEGURANÇA =============

const ALLOWED_ORIGINS = [
  'https://game-smart-pro.lovable.app',
  'https://id-preview--aab53d6d-d532-46c9-ba03-774d15718c4d.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';

  // IMPORTANT: quando a origem é permitida por sufixo (ex: *.lovableproject.com),
  // precisamos "ecoar" exatamente a origem recebida, senão o browser bloqueia por CORS.
  const isAllowed = !!origin && (
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith('.lovable.app') ||
    origin.endsWith('.lovableproject.com')
  );

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!userLimit || userLimit.resetTime < now) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    const resetIn = userLimit.resetTime - now;
    return { allowed: false, remaining: 0, resetIn };
  }
  
  userLimit.count++;
  return { 
    allowed: true, 
    remaining: RATE_LIMIT_MAX - userLimit.count, 
    resetIn: userLimit.resetTime - now 
  };
}

function secureLog(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const sanitizedData = data ? sanitizeLogData(data) : undefined;
  
  const logEntry = {
    timestamp,
    level,
    message,
    ...(sanitizedData && { data: sanitizedData })
  };
  
  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}

function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['apiKey', 'api_key', 'token', 'secret', 'password', 'authorization', 'key'];
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 100) {
      sanitized[key] = value.substring(0, 50) + '...[truncated]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// ============= API-FOOTBALL CONFIGURATION =============

const API_KEY = Deno.env.get('API_FOOTBALL_KEY');
const API_BASE = 'https://v3.football.api-sports.io';

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

const dayLabelsTranslations: Record<string, Record<string, string>> = {
  pt: { today: '🔴 HOJE', tomorrow: '📅 AMANHÃ' },
  en: { today: '🔴 TODAY', tomorrow: '📅 TOMORROW' },
  es: { today: '🔴 HOY', tomorrow: '📅 MAÑANA' },
  it: { today: '🔴 OGGI', tomorrow: '📅 DOMANI' },
};

const alertTranslations: Record<string, Record<string, string>> = {
  pt: { today: '🔴 JOGOS DE HOJE', tomorrow: '📅 JOGOS DE AMANHÃ', future: '📅 JOGOS DE' },
  en: { today: '🔴 TODAY\'S GAMES', tomorrow: '📅 TOMORROW\'S GAMES', future: '📅 GAMES ON' },
  es: { today: '🔴 PARTIDOS DE HOY', tomorrow: '📅 PARTIDOS DE MAÑANA', future: '📅 PARTIDOS DEL' },
  it: { today: '🔴 PARTITE DI OGGI', tomorrow: '📅 PARTITE DI DOMANI', future: '📅 PARTITE DEL' },
};

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

// Helper function to make API-Football requests
async function apiFootballRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  secureLog('info', 'API-Football request', { endpoint, params });
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY!,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    secureLog('error', 'API-Football error', { status: response.status, error: errorText.substring(0, 200) });
    throw new Error(`API-Football error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.errors && Object.keys(data.errors).length > 0) {
    secureLog('error', 'API-Football returned errors', { errors: data.errors });
    throw new Error(`API-Football errors: ${JSON.stringify(data.errors)}`);
  }
  
  return data;
}

// Buscar fixtures e odds da API-Football
async function fetchOddsFromAPI(lang: string = 'pt') {
  if (!API_KEY) {
    secureLog('error', 'API_FOOTBALL_KEY não configurada no backend');
    throw new Error('Configuração do servidor incompleta');
  }

  const alerts = alertTranslations[lang] || alertTranslations['pt'];
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : lang === 'it' ? 'it-IT' : 'en-US';
  
  // Tentar buscar jogos para os próximos 7 dias
  const hoje = new Date();
  let jogosEncontrados: any[] = [];
  let diaEncontrado = 0;
  let dataAlvo = hoje;
  
  for (let diasNoFuturo = 0; diasNoFuturo <= 7; diasNoFuturo++) {
    const targetDate = new Date(hoje);
    targetDate.setDate(targetDate.getDate() + diasNoFuturo);
    const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    secureLog('info', `Buscando fixtures para ${dateStr}`);
    
    try {
      // Buscar fixtures do dia
      const fixturesData = await apiFootballRequest('/fixtures', {
        date: dateStr,
        status: 'NS', // Not Started
        timezone: 'America/Sao_Paulo'
      });
      
      if (fixturesData.response && fixturesData.response.length > 0) {
        // Filtrar jogos que começam em mais de 10 minutos
        const agora = new Date();
        const limiteMinimo = new Date(agora.getTime() + 10 * 60 * 1000);
        
        const jogosValidos = fixturesData.response.filter((fixture: any) => {
          const dataJogo = new Date(fixture.fixture.date);
          return dataJogo > limiteMinimo;
        });
        
        if (jogosValidos.length > 0) {
          jogosEncontrados = jogosValidos;
          diaEncontrado = diasNoFuturo;
          dataAlvo = targetDate;
          secureLog('info', `Encontrados ${jogosValidos.length} jogos para dia +${diasNoFuturo}`);
          break;
        }
      }
      
      secureLog('warn', `Nenhum jogo válido para ${dateStr}`);
    } catch (err) {
      secureLog('warn', `Erro ao buscar fixtures para ${dateStr}`, { error: String(err) });
    }
  }
  
  if (jogosEncontrados.length === 0) {
    throw new Error('Não foi possível encontrar jogos disponíveis nos próximos 7 dias');
  }
  
  // Buscar odds para os fixtures encontrados (máximo 5)
  const fixturesParaOdds = jogosEncontrados.slice(0, 10); // Buscar odds de até 10 para ter margem
  const gamesWithOdds: Game[] = [];
  
  for (const fixture of fixturesParaOdds) {
    if (gamesWithOdds.length >= 5) break;
    
    try {
      const fixtureId = fixture.fixture.id;
      
      // Buscar odds do fixture
      const oddsData = await apiFootballRequest('/odds', {
        fixture: fixtureId.toString(),
        bookmaker: '8', // Bet365
      });
      
      let homeOdd = 2.0;
      let drawOdd = 3.2;
      let awayOdd = 3.5;
      let overOdd = 1.85;
      let underOdd = 1.9;
      let bookmakerName = 'Bet365';
      
      if (oddsData.response && oddsData.response.length > 0) {
        const bookmaker = oddsData.response[0]?.bookmakers?.[0];
        if (bookmaker) {
          bookmakerName = bookmaker.name;
          
          // Match Winner (1X2)
          const matchWinner = bookmaker.bets?.find((b: any) => b.name === 'Match Winner');
          if (matchWinner) {
            homeOdd = parseFloat(matchWinner.values.find((v: any) => v.value === 'Home')?.odd) || homeOdd;
            drawOdd = parseFloat(matchWinner.values.find((v: any) => v.value === 'Draw')?.odd) || drawOdd;
            awayOdd = parseFloat(matchWinner.values.find((v: any) => v.value === 'Away')?.odd) || awayOdd;
          }
          
          // Goals Over/Under 2.5
          const goalsOU = bookmaker.bets?.find((b: any) => b.name === 'Goals Over/Under' && b.values?.some((v: any) => v.value === 'Over 2.5'));
          if (goalsOU) {
            overOdd = parseFloat(goalsOU.values.find((v: any) => v.value === 'Over 2.5')?.odd) || overOdd;
            underOdd = parseFloat(goalsOU.values.find((v: any) => v.value === 'Under 2.5')?.odd) || underOdd;
          }
        }
      }
      
      const startTime = new Date(fixture.fixture.date);
      const dayType = getDayType(diaEncontrado);
      
      gamesWithOdds.push({
        id: fixture.fixture.id.toString(),
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        league: fixture.league.name,
        startTime: startTime.toISOString(),
        bookmaker: bookmakerName,
        odds: {
          home: homeOdd,
          draw: drawOdd,
          away: awayOdd,
          over: overOdd,
          under: underOdd,
        },
        dayType,
        dayLabel: '', // Será preenchido por translateCachedData
      });
      
      secureLog('info', 'Jogo processado', { 
        fixture: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        league: fixture.league.name 
      });
      
    } catch (err) {
      secureLog('warn', 'Erro ao buscar odds do fixture', { 
        fixtureId: fixture.fixture.id,
        error: String(err)
      });
      // Continua sem odds, usando valores padrão
      const startTime = new Date(fixture.fixture.date);
      const dayType = getDayType(diaEncontrado);
      
      gamesWithOdds.push({
        id: fixture.fixture.id.toString(),
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        league: fixture.league.name,
        startTime: startTime.toISOString(),
        bookmaker: 'N/A',
        odds: {
          home: 2.0,
          draw: 3.2,
          away: 3.5,
          over: 1.85,
          under: 1.9,
        },
        dayType,
        dayLabel: '',
      });
    }
  }
  
  if (gamesWithOdds.length === 0) {
    throw new Error('Não foi possível processar os jogos encontrados');
  }
  
  const diaTexto = dataAlvo.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  const mensagem = diaEncontrado === 0 ? alerts.today :
                   diaEncontrado === 1 ? alerts.tomorrow :
                   `${alerts.future} ${diaTexto}`;
  
  secureLog('info', 'Jogos processados com sucesso', { count: gamesWithOdds.length });
  
  return { 
    games: gamesWithOdds,
    remaining: 100, // API-Football não retorna remaining da mesma forma
    isToday: diaEncontrado === 0,
    alertMessage: mensagem,
    foundDate: dataAlvo.toISOString(),
    _lang: lang
  };
}

// Cache
const CACHE_DURATION_MINUTES = 10;

function getCacheKey(): string {
  const hoje = new Date();
  const dataStr = hoje.toISOString().split('T')[0];
  return `odds_${dataStr}`;
}

async function getFromCache(supabaseAdmin: any): Promise<any | null> {
  const cacheKey = getCacheKey();
  
  const { data, error } = await supabaseAdmin
    .from('odds_cache')
    .select('data, expires_at')
    .eq('cache_key', cacheKey)
    .single();
  
  if (error || !data) {
    secureLog('info', 'Cache miss', { cacheKey });
    return null;
  }
  
  if (new Date(data.expires_at) < new Date()) {
    secureLog('info', 'Cache expirado', { cacheKey });
    return null;
  }
  
  secureLog('info', 'Cache hit', { cacheKey });
  return data.data;
}

async function saveToCache(supabaseAdmin: any, data: any): Promise<void> {
  const cacheKey = getCacheKey();
  const expiresAt = new Date(Date.now() + CACHE_DURATION_MINUTES * 60 * 1000);
  
  const { error } = await supabaseAdmin
    .from('odds_cache')
    .upsert({
      cache_key: cacheKey,
      data: data,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    }, { onConflict: 'cache_key' });
  
  if (error) {
    secureLog('error', 'Erro ao salvar cache', { cacheKey });
  } else {
    secureLog('info', 'Cache salvo', { cacheKey, expiresInMinutes: CACHE_DURATION_MINUTES });
  }
}

function translateCachedData(cachedData: any, lang: string): any {
  const games = cachedData.games.map((game: any) => ({
    ...game,
    dayLabel: getDayLabel(new Date(game.startTime), lang),
    analysis: analyzeBet(game as Game, lang)
  }));
  
  const alerts = alertTranslations[lang] || alertTranslations['pt'];
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : lang === 'it' ? 'it-IT' : 'en-US';
  
  const foundDate = new Date(cachedData.foundDate);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const foundDateNorm = new Date(foundDate);
  foundDateNorm.setHours(0, 0, 0, 0);
  const diffDias = Math.round((foundDateNorm.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  let alertMessage: string;
  if (diffDias === 0) {
    alertMessage = alerts.today;
  } else if (diffDias === 1) {
    alertMessage = alerts.tomorrow;
  } else {
    const diaTexto = foundDate.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
    alertMessage = `${alerts.future} ${diaTexto}`;
  }
  
  return {
    ...cachedData,
    games,
    alertMessage
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const origin = req.headers.get('Origin') || '';
  const isAllowedOrigin = ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com')
  );
  
  if (origin && !isAllowedOrigin) {
    secureLog('warn', 'Requisição de origem não autorizada', { origin: origin.substring(0, 50) });
    return new Response(
      JSON.stringify({ error: 'Origem não autorizada' }), 
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      secureLog('warn', 'Requisição sem autenticação');
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let lang = 'pt';
    try {
      const body = await req.json();
      lang = body?.lang || 'pt';
    } catch {
      const url = new URL(req.url);
      lang = url.searchParams.get('lang') || req.headers.get('Accept-Language')?.split(',')[0]?.split('-')[0] || 'pt';
    }
    const validLang = ['pt', 'en', 'es', 'it'].includes(lang) ? lang : 'pt';

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      secureLog('warn', 'Token inválido');
      return new Response(
        JSON.stringify({ error: 'Token inválido' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;
    
    const rateLimit = checkRateLimit(userId);
    
    const rateLimitHeaders = {
      'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
    };
    
    if (!rateLimit.allowed) {
      secureLog('warn', 'Rate limit excedido', { userId: userId.substring(0, 8) + '...' });
      return new Response(
        JSON.stringify({ 
          error: 'Limite de requisições excedido. Tente novamente em alguns segundos.',
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        }), 
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            ...rateLimitHeaders,
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString()
          } 
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: searchLimitData, error: searchLimitError } = await supabaseAdmin
      .rpc('increment_search_count', { p_user_id: userId });
    
    if (searchLimitError) {
      secureLog('error', 'Erro ao verificar limite de buscas', { error: searchLimitError.message });
    } else if (searchLimitData && !searchLimitData.allowed) {
      secureLog('warn', 'Limite diário de buscas atingido', { userId: userId.substring(0, 8) + '...' });
      return new Response(
        JSON.stringify({ 
          error: 'Limite diário de buscas atingido. Usuários gratuitos podem fazer 3 buscas por dia.',
          dailyLimitReached: true,
          remaining: 0,
          isTrial: true
        }), 
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            ...rateLimitHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    const dailySearchInfo = searchLimitData || { remaining: -1, is_trial: false };

    secureLog('info', 'Requisição autenticada', { 
      userId: userId.substring(0, 8) + '...', 
      lang: validLang,
      rateLimitRemaining: rateLimit.remaining,
      dailySearchesRemaining: dailySearchInfo.remaining
    });

    const cachedData = await getFromCache(supabaseAdmin);
    
    if (cachedData) {
      const translatedData = translateCachedData(cachedData, validLang);
      translatedData.fromCache = true;
      translatedData.dailySearchesRemaining = dailySearchInfo.remaining;
      translatedData.isTrial = dailySearchInfo.is_trial;
      
      return new Response(
        JSON.stringify(translatedData),
        { headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } }
      );
    }

    secureLog('info', 'Buscando dados frescos da API-Football');
    const result = await fetchOddsFromAPI(validLang);
    
    saveToCache(supabaseAdmin, result).catch(err => 
      secureLog('error', 'Erro ao salvar cache em background')
    );
    
    const translatedResult = translateCachedData(result, validLang);
    
    return new Response(
      JSON.stringify({ 
        ...translatedResult, 
        fromCache: false,
        dailySearchesRemaining: dailySearchInfo.remaining,
        isTrial: dailySearchInfo.is_trial
      }),
      { headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno';
    secureLog('error', 'Erro na função fetch-odds', { error: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
