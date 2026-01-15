import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============= CONFIGURAÇÕES DE SEGURANÇA =============

// Lista de origens permitidas (CORS restrito)
const ALLOWED_ORIGINS = [
  'https://game-smart-pro.lovable.app',
  'https://id-preview--aab53d6d-d532-46c9-ba03-774d15718c4d.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

// Rate limiting por usuário (em memória - para produção usar Redis/KV)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30; // Máximo de requisições
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // Janela de 1 minuto

// Função para validar e obter origem CORS
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  
  // Verificar se a origem está na lista permitida (includes .lovable.app AND .lovableproject.com)
  const allowedOrigin = ALLOWED_ORIGINS.find(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com')
  ) || '';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin || ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

// Rate limiter
function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  // Limpar entradas antigas periodicamente
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!userLimit || userLimit.resetTime < now) {
    // Primeira requisição ou janela expirada
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

// Logger seguro - nunca expõe secrets
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

// Sanitiza dados para log - remove campos sensíveis
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
      
      secureLog('info', `Jogos encontrados para dia +${diasNoFuturo}`, { count: jogosValidos.length });
      
      return {
        jogos: jogosValidos,
        diaEncontrado: diasNoFuturo,
        dataAlvo: dataAlvo,
        mensagem: diasNoFuturo === 0 ? alerts.today :
                  diasNoFuturo === 1 ? alerts.tomorrow :
                  `${alerts.future} ${diaTexto}`
      };
    }
    
    secureLog('warn', `Nenhum jogo válido para dia +${diasNoFuturo}`);
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
    secureLog('error', 'API key não configurada no backend');
    throw new Error('Configuração do servidor incompleta');
  }

  // Buscar esportes disponíveis - não loga a URL com apiKey
  const sportsUrl = `${API_BASE}/sports`;
  secureLog('info', 'Buscando esportes disponíveis', { endpoint: sportsUrl });
  
  const sportsResponse = await fetch(`${sportsUrl}?apiKey=${API_KEY}`);
  
  if (!sportsResponse.ok) {
    secureLog('error', 'Erro ao buscar esportes', { status: sportsResponse.status });
    throw new Error(`Erro ao buscar esportes: ${sportsResponse.status}`);
  }
  
  const sports = await sportsResponse.json();
  const remaining = sportsResponse.headers.get('x-requests-remaining');
  
  secureLog('info', 'Esportes carregados', { total: sports.length, apiRemaining: remaining });
  
  // Filtrar futebol
  const soccerSports = sports.filter((s: any) => 
    s.group === 'Soccer' || s.key.includes('soccer')
  );
  
  if (soccerSports.length === 0) {
    throw new Error('Nenhum campeonato de futebol disponível');
  }
  
  const activeSports = soccerSports.filter((s: any) => s.active);
  
  secureLog('info', 'Campeonatos de futebol ativos', { count: activeSports.length });
  
  // Buscar jogos de múltiplos campeonatos
  let allOddsData: any[] = [];
  let apiRemaining = parseInt(remaining || '0');
  
  for (const sport of activeSports) {
    secureLog('info', 'Buscando odds', { league: sport.title });
    
    try {
      const oddsResponse = await fetch(
        `${API_BASE}/sports/${sport.key}/odds?apiKey=${API_KEY}&regions=us&markets=h2h,totals&oddsFormat=decimal`
      );
      
      if (!oddsResponse.ok) {
        secureLog('warn', 'Erro ao buscar liga', { league: sport.title, status: oddsResponse.status });
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
      
      secureLog('info', 'Odds carregadas', { 
        league: sport.title, 
        games: oddsData?.length || 0, 
        totalAccumulated: allOddsData.length 
      });
      
    } catch (err) {
      secureLog('warn', 'Erro ao processar liga', { league: sport.title });
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
        dayLabel: '' // Será preenchido por translateCachedData
      };
    })
    .filter((game): game is Game => game !== null);
  
  if (games.length === 0) {
    throw new Error('Não foi possível processar os jogos encontrados');
  }
  
  secureLog('info', 'Jogos processados com sucesso', { count: games.length });
  
  // Retornar jogos SEM análise para o cache (análise é traduzida dinamicamente)
  return { 
    games: games,
    remaining: apiRemaining,
    isToday: resultado.diaEncontrado === 0,
    alertMessage: resultado.mensagem,
    foundDate: resultado.dataAlvo.toISOString(),
    _lang: lang
  };
}

// Cache duration in minutes
const CACHE_DURATION_MINUTES = 10;

// Gerar chave de cache baseada na data atual
function getCacheKey(): string {
  const hoje = new Date();
  const dataStr = hoje.toISOString().split('T')[0]; // YYYY-MM-DD
  return `odds_${dataStr}`;
}

// Buscar do cache
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
  
  // Verificar se expirou
  if (new Date(data.expires_at) < new Date()) {
    secureLog('info', 'Cache expirado', { cacheKey });
    return null;
  }
  
  secureLog('info', 'Cache hit', { cacheKey });
  return data.data;
}

// Salvar no cache
async function saveToCache(supabaseAdmin: any, data: any): Promise<void> {
  const cacheKey = getCacheKey();
  const expiresAt = new Date(Date.now() + CACHE_DURATION_MINUTES * 60 * 1000);
  
  // Upsert para atualizar se já existir
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

// Traduzir dados do cache para o idioma correto
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
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar método HTTP
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validar origem (além do CORS header)
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
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      secureLog('warn', 'Requisição sem autenticação');
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

    // Cliente com autenticação do usuário
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
    
    // ============= RATE LIMITING =============
    const rateLimit = checkRateLimit(userId);
    
    // Adicionar headers de rate limit na resposta
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

    // Cliente admin para operações de cache e verificação de limite diário
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ============= VERIFICAR LIMITE DIÁRIO DE BUSCAS (USUÁRIOS TRIAL) =============
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

    // Tentar buscar do cache primeiro
    const cachedData = await getFromCache(supabaseAdmin);
    
    if (cachedData) {
      // Traduzir para o idioma solicitado
      const translatedData = translateCachedData(cachedData, validLang);
      translatedData.fromCache = true;
      translatedData.dailySearchesRemaining = dailySearchInfo.remaining;
      translatedData.isTrial = dailySearchInfo.is_trial;
      
      return new Response(
        JSON.stringify(translatedData),
        { headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache miss - buscar da API
    secureLog('info', 'Buscando dados frescos da API');
    const result = await fetchOddsFromAPI(validLang);
    
    // Salvar no cache (não bloqueia a resposta)
    saveToCache(supabaseAdmin, result).catch(err => 
      secureLog('error', 'Erro ao salvar cache em background')
    );
    
    // Adicionar análise e dayLabel traduzidos para a resposta direta
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
