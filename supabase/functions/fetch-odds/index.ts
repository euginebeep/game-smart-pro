import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============= CONFIGURAÇÕES DE SEGURANÇA =============

const ALLOWED_ORIGINS = [
  'https://game-smart-pro.eugine.app',
  'https://eugineai.com',
  'https://www.eugineai.com',
  'https://game-smart-pro.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function isOriginAllowed(origin: string): boolean {
  if (!origin) return true;

  const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');

  // Lovable preview domains
  const isLovablePreview =
    /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/.test(origin) ||
    /^https:\/\/[a-z0-9-]+-preview--[a-z0-9-]+\.lovable\.app$/.test(origin);

  return ALLOWED_ORIGINS.includes(origin) || isLocalhost || isLovablePreview;
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const allowed = isOriginAllowed(origin);

  return {
    'Access-Control-Allow-Origin': allowed ? (origin || '*') : 'null',
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
  homeTeamId?: number;
  awayTeamId?: number;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  league: string;
  leagueId?: number;
  leagueLogo?: string;
  season?: number;
  startTime: string;
  startTimeUTC: string; // Horário original UTC
  brazilTime: string; // Horário de Brasília formatado (HH:mm)
  localTime: string; // Horário local do evento (se diferente)
  bookmaker: string;
  odds: {
    home: number;
    draw: number;
    away: number;
    over: number;
    under: number;
    over15?: number;
    under15?: number;
    over35?: number;
    under35?: number;
    over45?: number;
    under45?: number;
    bttsYes?: number;
    bttsNo?: number;
    doubleChanceHomeOrDraw?: number;
    doubleChanceAwayOrDraw?: number;
    doubleChanceHomeOrAway?: number;
    drawNoBet?: number;
  };
  dayType: 'today' | 'tomorrow' | 'future';
  dayLabel: string;
  advancedData?: AdvancedGameData;
  fixtureStats?: FixtureStats;
}

interface FixtureStats {
  homePossession?: number;
  awayPossession?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
  homeTotalShots?: number;
  awayTotalShots?: number;
}

interface InjuryDetail {
  player: string;
  type: 'injury' | 'suspension' | 'doubt';
  reason?: string;
}

interface PlayerInfo {
  name: string;
  number?: number;
  position?: string;
}

interface TopScorerInfo {
  name: string;
  goals: number;
  assists?: number;
  team: string;
}

interface CornersData {
  homeAvgCorners: number;
  awayAvgCorners: number;
  homeAvgCornersFor: number;
  awayAvgCornersFor: number;
  homeAvgCornersAgainst: number;
  awayAvgCornersAgainst: number;
  over95Percentage: number;
  over105Percentage: number;
}

interface CardsData {
  homeAvgYellow: number;
  awayAvgYellow: number;
  homeAvgRed: number;
  awayAvgRed: number;
  over35CardsPercentage: number;
  over45CardsPercentage: number;
}

interface LineupsData {
  homeFormation?: string;
  awayFormation?: string;
  homeStarting?: PlayerInfo[];
  awayStarting?: PlayerInfo[];
  homeCoach?: string;
  awayCoach?: string;
}

interface AdvancedGameData {
  h2h?: {
    totalGames: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    avgGoals: number;
    lastGames: { home: number; away: number; date: string }[];
    homeWinRate?: number;
    awayWinRate?: number;
    drawRate?: number;
  };
  homeStats?: TeamStats;
  awayStats?: TeamStats;
  homePosition?: number;
  awayPosition?: number;
  homeForm?: string;
  awayForm?: string;
  homeInjuries?: number;
  awayInjuries?: number;
  homeInjuryDetails?: InjuryDetail[];
  awayInjuryDetails?: InjuryDetail[];
  apiPrediction?: {
    winner?: string;
    winnerConfidence?: number;
    homeGoals?: string;
    awayGoals?: string;
    advice?: string;
    under_over?: string;
    // Enhanced prediction data
    homeWinPct?: number;
    drawPct?: number;
    awayWinPct?: number;
    homeFormPct?: number;
    awayFormPct?: number;
    homeAttackPct?: number;
    awayAttackPct?: number;
    homeDefensePct?: number;
    awayDefensePct?: number;
    homeTotalPct?: number;
    awayTotalPct?: number;
  };
  // Enhanced standings data
  standings?: {
    totalTeams: number;
    homePosition: number | null;
    awayPosition: number | null;
    homePoints: number | null;
    awayPoints: number | null;
    homeGoalDiff: number | null;
    awayGoalDiff: number | null;
  };
  // Home/Away specific stats from standings
  homeGoalsScored?: number;
  homeMatchesPlayed?: number;
  homeGoalsConceded?: number;
  homeHomeGoalsFor?: number;
  homeHomeGoalsAgainst?: number;
  awayGoalsScored?: number;
  awayMatchesPlayed?: number;
  awayGoalsConceded?: number;
  awayAwayGoalsFor?: number;
  awayAwayGoalsAgainst?: number;
  h2hAvgGoals?: number;
  // ===== PREMIUM DATA =====
  cornersData?: CornersData;
  cardsData?: CardsData;
  lineups?: LineupsData;
  bttsOdds?: {
    yes: number;
    no: number;
  };
  topScorers?: {
    home?: TopScorerInfo[];
    away?: TopScorerInfo[];
  };
}

interface TeamStats {
  goalsScored: number;
  goalsConceded: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  cleanSheets: number;
  failedToScore: number;
  bttsPercentage: number;
  over25Percentage: number;
  homeGoalsAvg?: number;
  awayGoalsAvg?: number;
  homeGoalsConcededAvg?: number;
  awayGoalsConcededAvg?: number;
}

interface BettingAnalysis {
  type: string;
  reason: string;
  profit: number;
  confidence?: number;
  factors?: AnalysisFactor[];
  valuePercentage?: number;
  impliedProbability?: number;
  estimatedProbability?: number;
  isSkip?: boolean;
  skipReason?: string;
}

interface AnalysisFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

// ============= PESOS DINÂMICOS POR LIGA E TIPO DE APOSTA =============

interface DynamicWeights {
  stats: number;
  form: number;
  h2h: number;
  value: number;
  standings: number;
  injuries: number;
  apiPrediction: number;
  homeAway: number; // Novo: boost casa/fora
}

// Configuração de pesos base
const BASE_WEIGHTS: DynamicWeights = {
  stats: 25,
  form: 20,
  h2h: 15,
  value: 15,
  standings: 10,
  injuries: 10,
  apiPrediction: 5,
  homeAway: 0,
};

// Ajustes por liga (baseado em características conhecidas)
const LEAGUE_WEIGHT_ADJUSTMENTS: Record<string, Partial<DynamicWeights>> = {
  // Premier League: Jogo mais físico e imprevisível, estatísticas muito importantes
  'Premier League': { stats: 32, h2h: 10, form: 18, injuries: 12 },
  'Championship': { stats: 28, form: 22, h2h: 12 },
  
  // Serie A (Itália): Táticas defensivas, lesões impactam muito
  'Serie A': { stats: 20, injuries: 18, standings: 15, form: 18 },
  'Serie B': { stats: 22, injuries: 15, form: 20 },
  
  // La Liga: Estatísticas e posse de bola muito relevantes
  'La Liga': { stats: 30, form: 18, standings: 12 },
  'La Liga 2': { stats: 25, form: 22 },
  
  // Bundesliga: Muitos gols, over/under relevante
  'Bundesliga': { stats: 30, form: 22, h2h: 12 },
  '2. Bundesliga': { stats: 28, form: 22 },
  
  // Ligue 1: PSG domina, standings muito importante
  'Ligue 1': { standings: 18, stats: 22, form: 20 },
  
  // Brasil: Casa muito forte, forma recente crucial
  'Brasileirão Série A': { homeAway: 10, form: 25, standings: 12 },
  'Brasileirão Série B': { homeAway: 12, form: 25 },
  
  // Argentina: H2H e rivalidades importantes
  'Liga Profesional Argentina': { h2h: 20, form: 22, homeAway: 8 },
  
  // Competições europeias: H2H crucial
  'UEFA Champions League': { h2h: 22, form: 18, stats: 25 },
  'UEFA Europa League': { h2h: 18, form: 22 },
  'UEFA Europa Conference League': { form: 25, standings: 15 },
};

// Ajustes por tipo de aposta
function getWeightsForBetType(baseWeights: DynamicWeights, betType: 'result' | 'over_under' | 'btts'): DynamicWeights {
  const adjusted = { ...baseWeights };
  
  switch (betType) {
    case 'over_under':
      // Over/Under: estatísticas de gols são cruciais
      adjusted.stats += 12;
      adjusted.h2h += 5;
      adjusted.form -= 5;
      adjusted.standings -= 8;
      break;
    case 'btts':
      // BTTS: estatísticas ofensivas/defensivas importantes
      adjusted.stats += 10;
      adjusted.h2h += 3;
      adjusted.injuries += 5;
      adjusted.standings -= 10;
      break;
    case 'result':
    default:
      // 1X2: forma e classificação mais relevantes
      adjusted.form += 8;
      adjusted.standings += 5;
      adjusted.stats -= 5;
      break;
  }
  
  // Normalizar para somar 100
  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  const factor = 100 / total;
  
  return {
    stats: Math.round(adjusted.stats * factor),
    form: Math.round(adjusted.form * factor),
    h2h: Math.round(adjusted.h2h * factor),
    value: Math.round(adjusted.value * factor),
    standings: Math.round(adjusted.standings * factor),
    injuries: Math.round(adjusted.injuries * factor),
    apiPrediction: Math.round(adjusted.apiPrediction * factor),
    homeAway: Math.round(adjusted.homeAway * factor),
  };
}

function calculateDynamicWeights(leagueName: string, betType: 'result' | 'over_under' | 'btts'): DynamicWeights {
  // Começar com pesos base
  let weights = { ...BASE_WEIGHTS };
  
  // Aplicar ajustes da liga (busca parcial no nome)
  for (const [league, adjustments] of Object.entries(LEAGUE_WEIGHT_ADJUSTMENTS)) {
    if (leagueName.toLowerCase().includes(league.toLowerCase())) {
      weights = { ...weights, ...adjustments };
      break;
    }
  }
  
  // Aplicar ajustes por tipo de aposta
  weights = getWeightsForBetType(weights, betType);
  
  secureLog('info', 'Dynamic weights calculated', { league: leagueName, betType, weights });
  
  return weights;
}

// ============= VALUE BETTING FUNCTIONS =============

const MIN_VALUE_THRESHOLD = 3; // 3 pontos percentuais de edge mínimo (aumentado de 2)
const MIN_CONFIDENCE_THRESHOLD = 12; // 12% de probabilidade mínima (aumentado de 8)

function calculateImpliedProbability(odds: number): number {
  if (odds <= 1) return 100;
  return (1 / odds) * 100;
}

function calculateValue(estimatedProb: number, odds: number): number {
  const impliedProb = calculateImpliedProbability(odds);
  // Value = diferença simples em pontos percentuais
  // Se EUGINE diz 55% e casa diz 50%, edge = +5 pontos
  return Math.round((estimatedProb - impliedProb) * 100) / 100;
}

function shouldSkipBet(confidence: number, value: number): { skip: boolean; reason?: string } {
  // Value agora é em pontos percentuais (edge = estimatedProb - impliedProb)
  if (value < MIN_VALUE_THRESHOLD) {
    return { skip: true, reason: `Edge insuficiente (${value.toFixed(1)}pp < ${MIN_VALUE_THRESHOLD}pp mínimo)` };
  }
  if (confidence < MIN_CONFIDENCE_THRESHOLD) {
    return { skip: true, reason: `Probabilidade muito baixa (${confidence}% < ${MIN_CONFIDENCE_THRESHOLD}% mínimo)` };
  }
  return { skip: false };
}

// ============================================================================
// CALIBRAÇÃO DE PROBABILIDADE — FUNÇÃO CRÍTICA
// ============================================================================
// O score interno (0-100) mede CONFIANÇA nos fatores analisados.
// NÃO é probabilidade. Para converter em probabilidade real:
// 1. Calcula a probabilidade implícita da odd (o que a casa diz)
// 2. Usa o score para determinar QUANTO o EUGINE discorda da casa
// 3. Limita o edge máximo por faixa de odd (mercado eficiente)
// ============================================================================

function calculateCalibratedProbability(score: number, odd: number): number {
  if (!odd || odd <= 1.0) return 50;
  
  // 1. Probabilidade implícita da odd (o que a casa calcula)
  const impliedProb = (1 / odd) * 100;
  
  // 2. Edge máximo permitido por faixa de odd
  // Quanto menor a odd, mais eficiente o mercado, menor o edge possível
  // maxEdgePoints: Máximo de pontos percentuais que o EUGINE pode discordar da casa
  // Valores CONSERVADORES v4 — mercados são eficientes, edges grandes são raríssimos
  let maxEdgePoints: number;
  if (odd <= 1.20) {
    maxEdgePoints = 2;    // Super favorito — mercado quase perfeito
  } else if (odd <= 1.40) {
    maxEdgePoints = 3;    // Favorito forte
  } else if (odd <= 1.60) {
    maxEdgePoints = 4;    // Favorito moderado
  } else if (odd <= 2.00) {
    maxEdgePoints = 5;    // Leve favorito — máximo realista
  } else if (odd <= 2.50) {
    maxEdgePoints = 6;    // Jogo equilibrado
  } else if (odd <= 3.50) {
    maxEdgePoints = 5;    // Underdog leve — mercado mais volátil mas edge raro
  } else if (odd <= 5.00) {
    maxEdgePoints = 4;    // Underdog — casas precificam bem
  } else if (odd <= 8.00) {
    maxEdgePoints = 3;    // Underdog forte — edge quase impossível
  } else {
    maxEdgePoints = 2;    // Zebra — edge > 2% seria milagre
  }
  
  // 3. Converter score (0-100) em fator de ajuste
  // score 50 = neutro, score 80 = positivo forte, score 30 = negativo
  const adjustmentFactor = Math.max(-1, Math.min(1, (score - 50) / 50));
  
  // 4. Calcular edge em pontos percentuais
  const edgePoints = adjustmentFactor * maxEdgePoints;
  
  // 5. Probabilidade calibrada = implícita + edge
  const calibrated = impliedProb + edgePoints;
  
  // 6. Limitar entre 2% e 95%
  return Math.round(Math.min(95, Math.max(2, calibrated)));
}

// ============= FORMA PONDERADA (últimos 3 com 60%, últimos 5 com 40%) =============

function calculateWeightedForm(form: string): number {
  if (!form || form.length === 0) return 50;
  
  const getPoints = (result: string): number => {
    switch (result.toUpperCase()) {
      case 'W': return 3;
      case 'D': return 1;
      case 'L': return 0;
      default: return 0;
    }
  };
  
  const results = form.split('').reverse(); // Mais recente primeiro
  
  // Últimos 3 jogos (peso 60%)
  const last3 = results.slice(0, 3);
  const last3Points = last3.reduce((sum, r) => sum + getPoints(r), 0);
  const last3Max = last3.length * 3;
  const last3Score = last3Max > 0 ? (last3Points / last3Max) * 100 : 50;
  
  // Últimos 5 jogos (peso 40%)
  const last5 = results.slice(0, 5);
  const last5Points = last5.reduce((sum, r) => sum + getPoints(r), 0);
  const last5Max = last5.length * 3;
  const last5Score = last5Max > 0 ? (last5Points / last5Max) * 100 : 50;
  
  // Média ponderada
  const weightedScore = (last3Score * 0.6) + (last5Score * 0.4);
  
  return Math.round(weightedScore);
}

// ============= TRADUÇÕES =============

const analysisTranslations: Record<string, Record<string, any>> = {
  pt: {
    over25: 'MAIS DE 2.5 GOLS',
    under25: 'MENOS DE 2.5 GOLS',
    btts: 'AMBAS MARCAM',
    bttsNo: 'AMBAS NÃO MARCAM',
    homeWin: 'VITÓRIA CASA',
    awayWin: 'VITÓRIA FORA',
    draw: 'EMPATE',
    skip: 'SKIP - SEM EDGE',
    highConfidence: 'Alta confiança baseada em análise completa',
    h2hFactor: 'Histórico de confrontos',
    formFactor: 'Forma recente',
    statsFactor: 'Estatísticas da temporada',
    predictionFactor: 'Previsão Analítica Matemática',
    injuriesFactor: 'Lesões e desfalques',
    standingsFactor: 'Posição na tabela',
    homeAwayFactor: 'Desempenho casa/fora',
    valueFactor: 'Value positivo nas odds',
    favorite: 'Favorito',
    withConfidence: 'com',
    confidence: 'de confiança',
    noEdge: 'Sem edge suficiente',
    lowConfidence: 'Confiança insuficiente',
    // Factor descriptions
    avgGoalsH2H: 'Média {goals} gols nos confrontos',
    avgGoalsLow: 'Média baixa: {goals} gols',
    homeWonPercent: 'Casa venceu {percent}% dos jogos',
    awayWonPercent: 'Visitante venceu {percent}% dos jogos',
    homeGreatForm: 'Casa em ótima forma ({percent}%)',
    awayGreatForm: 'Visitante em ótima forma ({percent}%)',
    avgCombinedGoals: 'Média combinada: {goals} gols/jogo',
    avgCombinedLow: 'Média baixa: {goals} gols/jogo',
    bttsPercent: 'BTTS {percent}% das partidas',
    over25Percent: 'Over 2.5 em {percent}% dos jogos',
    homeStrongGoals: 'Casa forte: {goals} gols/jogo em casa',
    apiPredicts: 'Previsão API: {prediction}',
    homeInjured: 'Casa tem {count} lesionados',
    awayInjured: 'Visitante tem {count} lesionados',
    homeTopPosition: 'Casa no Top 5 ({position}º)',
    awayTopPosition: 'Visitante no Top 5 ({position}º)',
    valueDetected: 'Edge de {percent}% detectado',
    oddIndicates: 'Odd de {odd} indica alta expectativa de gols.',
    balancedGame: 'Jogo equilibrado com odds similares (Casa: {home} / Fora: {away}).',
  },
  en: {
    over25: 'OVER 2.5 GOALS',
    under25: 'UNDER 2.5 GOALS',
    btts: 'BOTH TEAMS TO SCORE',
    bttsNo: 'NO BTTS',
    homeWin: 'HOME WIN',
    awayWin: 'AWAY WIN',
    draw: 'DRAW',
    skip: 'SKIP - NO EDGE',
    highConfidence: 'High confidence based on complete analysis',
    h2hFactor: 'Head to head history',
    formFactor: 'Recent form',
    statsFactor: 'Season statistics',
    predictionFactor: 'Mathematical Analytical Prediction',
    injuriesFactor: 'Injuries and absences',
    standingsFactor: 'League position',
    homeAwayFactor: 'Home/away performance',
    valueFactor: 'Positive value in odds',
    favorite: 'Favorite',
    withConfidence: 'with',
    confidence: 'confidence',
    noEdge: 'No edge found',
    lowConfidence: 'Insufficient confidence',
    // Factor descriptions
    avgGoalsH2H: 'Average {goals} goals in head to head',
    avgGoalsLow: 'Low average: {goals} goals',
    homeWonPercent: 'Home won {percent}% of games',
    awayWonPercent: 'Away won {percent}% of games',
    homeGreatForm: 'Home in great form ({percent}%)',
    awayGreatForm: 'Away in great form ({percent}%)',
    avgCombinedGoals: 'Combined average: {goals} goals/game',
    avgCombinedLow: 'Low average: {goals} goals/game',
    bttsPercent: 'BTTS in {percent}% of matches',
    over25Percent: 'Over 2.5 in {percent}% of games',
    homeStrongGoals: 'Strong home: {goals} goals/game at home',
    apiPredicts: 'API Prediction: {prediction}',
    homeInjured: 'Home has {count} injured',
    awayInjured: 'Away has {count} injured',
    homeTopPosition: 'Home in Top 5 ({position}th)',
    awayTopPosition: 'Away in Top 5 ({position}th)',
    valueDetected: 'Edge of {percent}% detected',
    oddIndicates: 'Odd of {odd} indicates high goal expectation.',
    balancedGame: 'Balanced game with similar odds (Home: {home} / Away: {away}).',
  },
  es: {
    over25: 'MÁS DE 2.5 GOLES',
    under25: 'MENOS DE 2.5 GOLES',
    btts: 'AMBOS MARCAN',
    bttsNo: 'AMBOS NO MARCAN',
    homeWin: 'VICTORIA LOCAL',
    awayWin: 'VICTORIA VISITANTE',
    draw: 'EMPATE',
    skip: 'SKIP - SIN EDGE',
    highConfidence: 'Alta confianza basada en análisis completo',
    h2hFactor: 'Historial de enfrentamientos',
    formFactor: 'Forma reciente',
    statsFactor: 'Estadísticas de temporada',
    predictionFactor: 'Predicción Analítica Matemática',
    injuriesFactor: 'Lesiones y ausencias',
    standingsFactor: 'Posición en la tabla',
    homeAwayFactor: 'Rendimiento local/visitante',
    valueFactor: 'Valor positivo en las cuotas',
    favorite: 'Favorito',
    withConfidence: 'con',
    confidence: 'de confianza',
    noEdge: 'Sin edge suficiente',
    lowConfidence: 'Confianza insuficiente',
    // Factor descriptions
    avgGoalsH2H: 'Promedio {goals} goles en enfrentamientos',
    avgGoalsLow: 'Promedio bajo: {goals} goles',
    homeWonPercent: 'Local ganó {percent}% de los partidos',
    awayWonPercent: 'Visitante ganó {percent}% de los partidos',
    homeGreatForm: 'Local en gran forma ({percent}%)',
    awayGreatForm: 'Visitante en gran forma ({percent}%)',
    avgCombinedGoals: 'Promedio combinado: {goals} goles/partido',
    avgCombinedLow: 'Promedio bajo: {goals} goles/partido',
    bttsPercent: 'BTTS en {percent}% de los partidos',
    over25Percent: 'Over 2.5 en {percent}% de los partidos',
    homeStrongGoals: 'Local fuerte: {goals} goles/partido en casa',
    apiPredicts: 'Predicción API: {prediction}',
    homeInjured: 'Local tiene {count} lesionados',
    awayInjured: 'Visitante tiene {count} lesionados',
    homeTopPosition: 'Local en Top 5 ({position}º)',
    awayTopPosition: 'Visitante en Top 5 ({position}º)',
    valueDetected: 'Edge de {percent}% detectado',
    oddIndicates: 'Cuota de {odd} indica alta expectativa de goles.',
    balancedGame: 'Partido equilibrado con cuotas similares (Local: {home} / Visitante: {away}).',
  },
  it: {
    over25: 'PIÙ DI 2.5 GOL',
    under25: 'MENO DI 2.5 GOL',
    btts: 'ENTRAMBE SEGNANO',
    bttsNo: 'ENTRAMBE NON SEGNANO',
    homeWin: 'VITTORIA CASA',
    awayWin: 'VITTORIA TRASFERTA',
    draw: 'PAREGGIO',
    skip: 'SKIP - NESSUN EDGE',
    highConfidence: 'Alta fiducia basata su analisi completa',
    h2hFactor: 'Storico scontri diretti',
    formFactor: 'Forma recente',
    statsFactor: 'Statistiche stagionali',
    predictionFactor: 'Previsione Analitica Matematica',
    injuriesFactor: 'Infortuni e assenze',
    standingsFactor: 'Posizione in classifica',
    homeAwayFactor: 'Prestazioni casa/trasferta',
    valueFactor: 'Valore positivo nelle quote',
    favorite: 'Favorito',
    withConfidence: 'con',
    confidence: 'di fiducia',
    noEdge: 'Nessun edge trovato',
    lowConfidence: 'Fiducia insufficiente',
    // Factor descriptions
    avgGoalsH2H: 'Media {goals} gol negli scontri diretti',
    avgGoalsLow: 'Media bassa: {goals} gol',
    homeWonPercent: 'Casa ha vinto il {percent}% delle partite',
    awayWonPercent: 'Trasferta ha vinto il {percent}% delle partite',
    homeGreatForm: 'Casa in ottima forma ({percent}%)',
    awayGreatForm: 'Trasferta in ottima forma ({percent}%)',
    avgCombinedGoals: 'Media combinata: {goals} gol/partita',
    avgCombinedLow: 'Media bassa: {goals} gol/partita',
    bttsPercent: 'BTTS nel {percent}% delle partite',
    over25Percent: 'Over 2.5 nel {percent}% delle partite',
    homeStrongGoals: 'Casa forte: {goals} gol/partita in casa',
    apiPredicts: 'Previsione API: {prediction}',
    homeInjured: 'Casa ha {count} infortunati',
    awayInjured: 'Trasferta ha {count} infortunati',
    homeTopPosition: 'Casa nel Top 5 ({position}º)',
    awayTopPosition: 'Trasferta nel Top 5 ({position}º)',
    valueDetected: 'Edge del {percent}% rilevato',
    oddIndicates: 'Quota di {odd} indica alta aspettativa di gol.',
    balancedGame: 'Partita equilibrata con quote simili (Casa: {home} / Trasferta: {away}).',
  },
};

const adviceTranslations: Record<string, Record<string, string>> = {
  pt: {
    'Double chance : Home or Draw': 'Dupla chance: Vitória Casa ou Empate',
    'Double chance : Draw or Away': 'Dupla chance: Empate ou Vitória Fora',
    'Double chance : Home or Away': 'Dupla chance: Vitória Casa ou Fora',
    'Combo Double chance : Home or Draw and target Over 1.5': 'Combo: Casa/Empate + Mais de 1.5 gols',
    'Combo Double chance : Home or Draw and target Over 2.5': 'Combo: Casa/Empate + Mais de 2.5 gols',
    'Combo Double chance : Home or Draw and target Under 3.5': 'Combo: Casa/Empate + Menos de 3.5 gols',
    'Combo Double chance : Draw or Away and target Over 1.5': 'Combo: Empate/Fora + Mais de 1.5 gols',
    'Combo Double chance : Draw or Away and target Over 2.5': 'Combo: Empate/Fora + Mais de 2.5 gols',
    'Combo Double chance : Draw or Away and target Under 3.5': 'Combo: Empate/Fora + Menos de 3.5 gols',
    'Winner : Home': 'Vencedor: Casa',
    'Winner : Away': 'Vencedor: Fora',
    'Winner : Draw': 'Resultado: Empate',
  },
  es: {
    'Double chance : Home or Draw': 'Doble oportunidad: Victoria Local o Empate',
    'Double chance : Draw or Away': 'Doble oportunidad: Empate o Victoria Visitante',
    'Double chance : Home or Away': 'Doble oportunidad: Victoria Local o Visitante',
    'Winner : Home': 'Ganador: Local',
    'Winner : Away': 'Ganador: Visitante',
    'Winner : Draw': 'Resultado: Empate',
  },
  it: {
    'Double chance : Home or Draw': 'Doppia chance: Vittoria Casa o Pareggio',
    'Double chance : Draw or Away': 'Doppia chance: Pareggio o Vittoria Trasferta',
    'Double chance : Home or Away': 'Doppia chance: Vittoria Casa o Trasferta',
    'Winner : Home': 'Vincitore: Casa',
    'Winner : Away': 'Vincitore: Trasferta',
    'Winner : Draw': 'Risultato: Pareggio',
  },
};

function translateAdvice(advice: string | undefined, lang: string): string | undefined {
  if (!advice) return undefined;
  if (lang === 'en') return advice;
  
  const translations = adviceTranslations[lang];
  if (!translations) return advice;
  
  if (translations[advice]) return translations[advice];
  
  let translated = advice;
  const patterns: Record<string, Record<string, string>> = {
    pt: {
      'Double chance': 'Dupla chance',
      'Home or Draw': 'Casa ou Empate',
      'Draw or Away': 'Empate ou Fora',
      'Home or Away': 'Casa ou Fora',
      'Winner': 'Vencedor',
      'Home': 'Casa',
      'Away': 'Fora',
      'Draw': 'Empate',
      'Over': 'Mais de',
      'Under': 'Menos de',
      'goals': 'gols',
      'and target': 'e objetivo',
      'Combo': 'Combo',
    },
    es: {
      'Double chance': 'Doble oportunidad',
      'Home or Draw': 'Local o Empate',
      'Draw or Away': 'Empate o Visitante',
      'Winner': 'Ganador',
      'Home': 'Local',
      'Away': 'Visitante',
      'Draw': 'Empate',
      'Over': 'Más de',
      'Under': 'Menos de',
      'goals': 'goles',
    },
    it: {
      'Double chance': 'Doppia chance',
      'Home or Draw': 'Casa o Pareggio',
      'Draw or Away': 'Pareggio o Trasferta',
      'Winner': 'Vincitore',
      'Home': 'Casa',
      'Away': 'Trasferta',
      'Draw': 'Pareggio',
      'Over': 'Più di',
      'Under': 'Meno di',
      'goals': 'gol',
    },
  };
  
  const langPatterns = patterns[lang];
  if (langPatterns) {
    for (const [en, local] of Object.entries(langPatterns)) {
      translated = translated.replace(new RegExp(en, 'gi'), local);
    }
  }
  
  return translated;
}

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

// ============= MODELO DE POISSON PARA PROBABILIDADES DE GOLS =============

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function poissonProb(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

interface GoalProbabilities {
  over15: number;
  over25: number;
  over35: number;
  over45: number;
  btts: number;
  under15: number;
  under25: number;
  under35: number;
  homeWin: number;
  awayWin: number;
  draw: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
}

function calculatePoissonProbabilities(homeExpectedGoals: number, awayExpectedGoals: number): GoalProbabilities {
  let over15 = 0, over25 = 0, over35 = 0, over45 = 0;
  let btts = 0;
  let homeWin = 0, awayWin = 0, draw = 0;

  for (let h = 0; h <= 8; h++) {
    for (let a = 0; a <= 8; a++) {
      const prob = poissonProb(homeExpectedGoals, h) * poissonProb(awayExpectedGoals, a);
      const totalGoals = h + a;

      if (totalGoals > 1) over15 += prob;
      if (totalGoals > 2) over25 += prob;
      if (totalGoals > 3) over35 += prob;
      if (totalGoals > 4) over45 += prob;
      if (h > 0 && a > 0) btts += prob;
      if (h > a) homeWin += prob;
      if (a > h) awayWin += prob;
      if (h === a) draw += prob;
    }
  }

  return {
    over15: Math.round(over15 * 100),
    over25: Math.round(over25 * 100),
    over35: Math.round(over35 * 100),
    over45: Math.round(over45 * 100),
    btts: Math.round(btts * 100),
    under15: Math.round((1 - over15) * 100),
    under25: Math.round((1 - over25) * 100),
    under35: Math.round((1 - over35) * 100),
    homeWin: Math.round(homeWin * 100),
    awayWin: Math.round(awayWin * 100),
    draw: Math.round(draw * 100),
    expectedHomeGoals: homeExpectedGoals,
    expectedAwayGoals: awayExpectedGoals,
  };
}

function getExpectedGoals(game: Game): { home: number; away: number } {
  const adv = game.advancedData;
  
  if (adv?.homeStats?.homeGoalsAvg && adv?.awayStats?.awayGoalsAvg) {
    return {
      home: adv.homeStats.homeGoalsAvg,
      away: adv.awayStats.awayGoalsAvg,
    };
  }
  
  if (adv?.homeStats?.avgGoalsScored && adv?.awayStats?.avgGoalsScored) {
    return {
      home: adv.homeStats.avgGoalsScored,
      away: adv.awayStats.avgGoalsScored,
    };
  }
  
  if (game.odds.over > 0 && game.odds.under > 0) {
    const overProb = 1 / game.odds.over;
    const totalExpected = overProb > 0.5 ? 3.0 : 2.2;
    return { home: totalExpected * 0.55, away: totalExpected * 0.45 };
  }
  
  return { home: 1.3, away: 1.1 };
}

// ============= KELLY CRITERION PARA STAKE =============

function kellyStake(estimatedProb: number, odd: number, bankroll: number = 1000): number {
  const p = Math.min(0.95, Math.max(0.01, estimatedProb / 100));
  const q = 1 - p;
  const b = odd - 1;
  
  if (b <= 0) return 0;
  
  const kelly = (b * p - q) / b;
  const fractionalKelly = Math.max(0, kelly * 0.25);
  const maxStake = bankroll * 0.10;
  const stake = Math.min(maxStake, bankroll * fractionalKelly);
  
  return Math.round(stake);
}

// ============= MOTOR DE ANÁLISE AVANÇADO V2 =============

function analyzeAdvanced(game: Game, lang: string = 'pt'): BettingAnalysis {
  const betAmount = 40;
  const t = analysisTranslations[lang] || analysisTranslations['pt'];
  const factors: AnalysisFactor[] = [];
  
  // Obter pesos dinâmicos baseados na liga
  const leagueName = game.league || '';
  
  // Scores para cada tipo de aposta
  let over25Score = 50;
  let under25Score = 50;
  let bttsScore = 50;
  let homeWinScore = 50;
  let awayWinScore = 50;
  let drawScore = 50;
  
  const adv = game.advancedData;
  const stats = game.fixtureStats;
  
  // ===== 1. ANÁLISE DO H2H (peso dinâmico) =====
  const h2hWeights = calculateDynamicWeights(leagueName, 'result');
  
  if (adv?.h2h && adv.h2h.totalGames >= 3) {
    const h2h = adv.h2h;
    const h2hMultiplier = h2hWeights.h2h / 15; // Normalizado pelo peso base
    
    if (h2h.avgGoals >= 3.0) {
      over25Score += Math.round(15 * h2hMultiplier);
      under25Score -= Math.round(10 * h2hMultiplier);
      factors.push({ 
        name: t.h2hFactor, 
        impact: 'positive', 
        weight: Math.round(15 * h2hMultiplier), 
        description: t.avgGoalsH2H.replace('{goals}', h2h.avgGoals.toFixed(1))
      });
    } else if (h2h.avgGoals <= 2.0) {
      under25Score += Math.round(15 * h2hMultiplier);
      over25Score -= Math.round(10 * h2hMultiplier);
      factors.push({ 
        name: t.h2hFactor, 
        impact: 'positive', 
        weight: Math.round(15 * h2hMultiplier), 
        description: t.avgGoalsLow.replace('{goals}', h2h.avgGoals.toFixed(1))
      });
    }
    
    const homeWinRate = h2h.homeWins / h2h.totalGames;
    const awayWinRate = h2h.awayWins / h2h.totalGames;
    if (homeWinRate >= 0.6) {
      homeWinScore += Math.round(12 * h2hMultiplier);
      factors.push({ 
        name: t.h2hFactor, 
        impact: 'positive', 
        weight: Math.round(12 * h2hMultiplier), 
        description: t.homeWonPercent.replace('{percent}', (homeWinRate * 100).toFixed(0))
      });
    } else if (awayWinRate >= 0.5) {
      awayWinScore += Math.round(12 * h2hMultiplier);
      factors.push({ 
        name: t.h2hFactor, 
        impact: 'positive', 
        weight: Math.round(12 * h2hMultiplier), 
        description: t.awayWonPercent.replace('{percent}', (awayWinRate * 100).toFixed(0))
      });
    }
  }
  
  // ===== 2. ANÁLISE DE FORMA PONDERADA =====
  const formWeights = calculateDynamicWeights(leagueName, 'result');
  
  if (adv?.homeForm && adv?.awayForm) {
    const homeFormScore = calculateWeightedForm(adv.homeForm);
    const awayFormScore = calculateWeightedForm(adv.awayForm);
    const formMultiplier = formWeights.form / 20;
    
    if (homeFormScore >= 70) {
      homeWinScore += Math.round(15 * formMultiplier);
      factors.push({ 
        name: t.formFactor, 
        impact: 'positive', 
        weight: Math.round(15 * formMultiplier), 
        description: `Casa em ótima forma (${homeFormScore}%)` 
      });
    } else if (homeFormScore <= 30) {
      homeWinScore -= Math.round(10 * formMultiplier);
      awayWinScore += Math.round(8 * formMultiplier);
    }
    
    if (awayFormScore >= 70) {
      awayWinScore += Math.round(15 * formMultiplier);
      factors.push({ 
        name: t.formFactor, 
        impact: 'positive', 
        weight: Math.round(15 * formMultiplier), 
        description: `Visitante em ótima forma (${awayFormScore}%)` 
      });
    } else if (awayFormScore <= 30) {
      awayWinScore -= Math.round(10 * formMultiplier);
      homeWinScore += Math.round(8 * formMultiplier);
    }
    
    // Se ambos em má forma, empate mais provável
    if (homeFormScore <= 40 && awayFormScore <= 40) {
      drawScore += Math.round(12 * formMultiplier);
    }
  }
  
  // ===== 3. ANÁLISE DE ESTATÍSTICAS (com dados de fixture se disponível) =====
  const statsWeights = calculateDynamicWeights(leagueName, 'over_under');
  
  if (adv?.homeStats && adv?.awayStats) {
    const homeStats = adv.homeStats;
    const awayStats = adv.awayStats;
    const statsMultiplier = statsWeights.stats / 25;
    
    // Over 2.5 baseado em média de gols
    const avgGoalsTotal = homeStats.avgGoalsScored + awayStats.avgGoalsScored;
    if (avgGoalsTotal >= 3.2) {
      over25Score += Math.round(20 * statsMultiplier);
      factors.push({ 
        name: t.statsFactor, 
        impact: 'positive', 
        weight: Math.round(20 * statsMultiplier), 
        description: `Média combinada: ${avgGoalsTotal.toFixed(1)} gols/jogo` 
      });
    } else if (avgGoalsTotal <= 2.0) {
      under25Score += Math.round(20 * statsMultiplier);
      factors.push({ 
        name: t.statsFactor, 
        impact: 'positive', 
        weight: Math.round(20 * statsMultiplier), 
        description: `Média baixa: ${avgGoalsTotal.toFixed(1)} gols/jogo` 
      });
    }
    
    // BTTS baseado em percentual histórico
    const avgBtts = (homeStats.bttsPercentage + awayStats.bttsPercentage) / 2;
    if (avgBtts >= 60) {
      bttsScore += Math.round(18 * statsMultiplier);
      factors.push({ 
        name: t.statsFactor, 
        impact: 'positive', 
        weight: Math.round(18 * statsMultiplier), 
        description: `BTTS ${avgBtts.toFixed(0)}% das partidas` 
      });
    } else if (avgBtts <= 35) {
      bttsScore -= Math.round(15 * statsMultiplier);
    }
    
    // Over 2.5 baseado em percentual histórico
    const avgOver25 = (homeStats.over25Percentage + awayStats.over25Percentage) / 2;
    if (avgOver25 >= 65) {
      over25Score += Math.round(18 * statsMultiplier);
      factors.push({ 
        name: t.statsFactor, 
        impact: 'positive', 
        weight: Math.round(18 * statsMultiplier), 
        description: `Over 2.5 em ${avgOver25.toFixed(0)}% dos jogos` 
      });
    }
    
    // Clean sheets vs Failed to score
    if (homeStats.cleanSheets >= 40 && awayStats.failedToScore >= 40) {
      under25Score += Math.round(12 * statsMultiplier);
      homeWinScore += Math.round(8 * statsMultiplier);
    }
    
    // ===== HOME/AWAY SPLITS =====
    if (homeStats.homeGoalsAvg && awayStats.awayGoalsConcededAvg) {
      const homeAdvantage = homeStats.homeGoalsAvg - (awayStats.awayGoalsConcededAvg || 0);
      if (homeAdvantage > 0.5) {
        homeWinScore += Math.round(10 * (formWeights.homeAway / 10 || 1));
        factors.push({
          name: t.homeAwayFactor,
          impact: 'positive',
          weight: 10,
          description: `Casa forte: ${homeStats.homeGoalsAvg?.toFixed(1)} gols/jogo em casa`
        });
      }
    }
  }
  
  // ===== 4. SHOTS & POSSESSION (dados de fixture) =====
  if (stats) {
    if (stats.homeShotsOnTarget && stats.awayShotsOnTarget) {
      const shotsDiff = stats.homeShotsOnTarget - stats.awayShotsOnTarget;
      if (shotsDiff > 3) {
        homeWinScore += 8;
        over25Score += 5;
      } else if (shotsDiff < -3) {
        awayWinScore += 8;
        over25Score += 5;
      }
    }
    
    if (stats.homePossession && stats.awayPossession) {
      if (stats.homePossession > 60) {
        homeWinScore += 5;
      } else if (stats.awayPossession > 60) {
        awayWinScore += 5;
      }
    }
  }
  
  // ===== 5. ANÁLISE DE POSIÇÃO NA TABELA =====
  const standingsWeights = calculateDynamicWeights(leagueName, 'result');
  
  if (adv?.homePosition && adv?.awayPosition) {
    const posDiff = adv.awayPosition - adv.homePosition;
    const standingsMultiplier = standingsWeights.standings / 10;
    
    if (posDiff >= 10) {
      homeWinScore += Math.round(12 * standingsMultiplier);
      factors.push({ 
        name: t.standingsFactor, 
        impact: 'positive', 
        weight: Math.round(12 * standingsMultiplier), 
        description: `Casa: ${adv.homePosition}º vs Fora: ${adv.awayPosition}º` 
      });
    } else if (posDiff <= -10) {
      awayWinScore += Math.round(12 * standingsMultiplier);
      factors.push({ 
        name: t.standingsFactor, 
        impact: 'positive', 
        weight: Math.round(12 * standingsMultiplier), 
        description: `Fora: ${adv.awayPosition}º vs Casa: ${adv.homePosition}º` 
      });
    } else if (Math.abs(posDiff) <= 3) {
      drawScore += Math.round(8 * standingsMultiplier);
    }
  }
  
  // ===== 6. ANÁLISE DE LESÕES =====
  const injuryWeights = calculateDynamicWeights(leagueName, 'result');
  
  if (adv?.homeInjuries !== undefined && adv?.awayInjuries !== undefined) {
    const injuryMultiplier = injuryWeights.injuries / 10;
    
    if (adv.homeInjuries >= 3) {
      homeWinScore -= Math.round(10 * injuryMultiplier);
      awayWinScore += Math.round(8 * injuryMultiplier);
      factors.push({ 
        name: t.injuriesFactor, 
        impact: 'negative', 
        weight: Math.round(10 * injuryMultiplier), 
        description: `Casa: ${adv.homeInjuries} desfalques` 
      });
    }
    if (adv.awayInjuries >= 3) {
      awayWinScore -= Math.round(10 * injuryMultiplier);
      homeWinScore += Math.round(8 * injuryMultiplier);
      factors.push({ 
        name: t.injuriesFactor, 
        impact: 'negative', 
        weight: Math.round(10 * injuryMultiplier), 
        description: `Visitante: ${adv.awayInjuries} desfalques` 
      });
    }
  }
  
  // ===== 7. PREVISÃO DA API =====
  if (adv?.apiPrediction) {
    const pred = adv.apiPrediction;
    
    if (pred.advice) {
      if (pred.advice.toLowerCase().includes('over')) {
        over25Score += 10;
        factors.push({ name: t.predictionFactor, impact: 'positive', weight: 10, description: pred.advice });
      } else if (pred.advice.toLowerCase().includes('under')) {
        under25Score += 10;
        factors.push({ name: t.predictionFactor, impact: 'positive', weight: 10, description: pred.advice });
      }
    }
    
    if (pred.winner && pred.winnerConfidence && pred.winnerConfidence >= 60) {
      if (pred.winner === 'Home') {
        homeWinScore += 12;
      } else if (pred.winner === 'Away') {
        awayWinScore += 12;
      }
      factors.push({ 
        name: t.predictionFactor, 
        impact: 'positive', 
        weight: 12, 
        description: `${pred.winner} com ${pred.winnerConfidence}% de confiança` 
      });
    }
  }
  
  // ===== 8. MODELO DE POISSON — Sobrescrever scores com probabilidades reais =====
  const expectedGoals = getExpectedGoals(game);
  const poissonProbs = calculatePoissonProbabilities(expectedGoals.home, expectedGoals.away);
  
  // Usar Poisson como base forte (peso 60%) e manter scores anteriores como ajuste (40%)
  over25Score = Math.round(poissonProbs.over25 * 0.6 + over25Score * 0.4);
  under25Score = Math.round(poissonProbs.under25 * 0.6 + under25Score * 0.4);
  bttsScore = Math.round(poissonProbs.btts * 0.6 + bttsScore * 0.4);
  homeWinScore = Math.round(poissonProbs.homeWin * 0.6 + homeWinScore * 0.4);
  awayWinScore = Math.round(poissonProbs.awayWin * 0.6 + awayWinScore * 0.4);
  drawScore = Math.round(poissonProbs.draw * 0.6 + drawScore * 0.4);

  // ============= CALIBRAÇÃO COM PREDICTIONS DA API =============
  const apiPred = game.advancedData?.apiPrediction;
  
  if (apiPred) {
    const apiHomePct = apiPred.homeWinPct || 0;
    const apiAwayPct = apiPred.awayWinPct || 0;
    const apiDrawPct = apiPred.drawPct || 0;
    
    if (apiHomePct > 0) {
      // Mix: 60% our calculation + 40% API model
      homeWinScore = Math.round(homeWinScore * 0.60 + apiHomePct * 0.40);
      awayWinScore = Math.round(awayWinScore * 0.60 + apiAwayPct * 0.40);
      drawScore = Math.round(drawScore * 0.60 + apiDrawPct * 0.40);
      
      secureLog('info', 'API_PRED_CALIBRATION', {
        game: `${game.homeTeam} vs ${game.awayTeam}`,
        apiHome: apiHomePct,
        apiDraw: apiDrawPct,
        apiAway: apiAwayPct,
        adjustedHome: homeWinScore,
        adjustedDraw: drawScore,
        adjustedAway: awayWinScore,
      });
    }
    
    // Use API total strength for Over/Under adjustment
    const apiTotalHome = apiPred.homeTotalPct || 50;
    const apiTotalAway = apiPred.awayTotalPct || 50;
    
    if (apiTotalHome > 65 || apiTotalAway > 65) {
      over25Score = Math.min(95, Math.round(over25Score * 1.05));
    }
  }

  // ============= STANDINGS-BASED 1X2 SCORING (ENHANCED) =============
  const standingsData = game.advancedData?.standings;
  
  if (standingsData && standingsData.homePosition && standingsData.awayPosition && standingsData.totalTeams) {
    const totalTeams = standingsData.totalTeams;
    const homePos = standingsData.homePosition;
    const awayPos = standingsData.awayPosition;
    const posDiff = awayPos - homePos; // Positive = home is better
    const relativeStrength = posDiff / totalTeams; // -1 to +1
    
    // Adjust 1X2 scores based on relative position
    if (relativeStrength > 0.40) {
      homeWinScore += 10;
      awayWinScore -= 5;
    } else if (relativeStrength > 0.20) {
      homeWinScore += 5;
    } else if (relativeStrength < -0.40) {
      awayWinScore += 10;
      homeWinScore -= 5;
    } else if (relativeStrength < -0.20) {
      awayWinScore += 5;
    }
    
    // Goal difference as quality factor
    const homeGD = standingsData.homeGoalDiff || 0;
    const awayGD = standingsData.awayGoalDiff || 0;
    
    if (homeGD > 10 && awayGD < -5) homeWinScore += 5;
    if (awayGD > 10 && homeGD < -5) awayWinScore += 5;
    
    secureLog('info', 'STANDINGS_FACTOR', {
      game: `${game.homeTeam} vs ${game.awayTeam}`,
      homePos, awayPos, totalTeams, posDiff: posDiff,
      relativeStrength: relativeStrength.toFixed(2),
      homeGD, awayGD,
    });
  }
  
  // ============= HOME/AWAY SPECIFIC FORM FROM STANDINGS =============
  const advData = game.advancedData;
  
  if (advData) {
    const homeHomeGF = advData.homeHomeGoalsFor || 0;
    const homeHomeGA = advData.homeHomeGoalsAgainst || 0;
    const awayAwayGF = advData.awayAwayGoalsFor || 0;
    const awayAwayGA = advData.awayAwayGoalsAgainst || 0;
    
    // Home team scores a lot at home AND away team concedes a lot away
    if (homeHomeGF > homeHomeGA * 1.5 && awayAwayGA > awayAwayGF) {
      homeWinScore += 6;
      secureLog('info', 'HOME_AWAY_SPLIT_BOOST', {
        game: `${game.homeTeam} vs ${game.awayTeam}`,
        boost: 'home', homeHomeGF, homeHomeGA, awayAwayGF, awayAwayGA,
      });
    }
    
    // Away team scores a lot away AND home team concedes a lot at home
    if (awayAwayGF > awayAwayGA * 1.3 && homeHomeGA > homeHomeGF) {
      awayWinScore += 6;
      secureLog('info', 'HOME_AWAY_SPLIT_BOOST', {
        game: `${game.homeTeam} vs ${game.awayTeam}`,
        boost: 'away', homeHomeGF, homeHomeGA, awayAwayGF, awayAwayGA,
      });
    }
  }

  // ============= FILTRO 2: PERFIL OFENSIVO PARA OVER/UNDER =============
  if (adv?.homeStats && adv?.awayStats) {
    const homeGPG = adv.homeStats.avgGoalsScored || 0;
    const awayGPG = adv.awayStats.avgGoalsScored || 0;
    const combinedAvg = homeGPG + awayGPG;
    
    // Se um dos times quase não marca (< 0.90/jogo), PENALIZAR Over 2.5 pesadamente
    if (homeGPG < 0.90 || awayGPG < 0.90) {
      over25Score = Math.min(over25Score, 30);
      secureLog('info', 'FILTER2_WEAK_ATTACKER', {
        home: game.homeTeam, away: game.awayTeam,
        homeGPG: homeGPG.toFixed(2), awayGPG: awayGPG.toFixed(2),
      });
    }
    
    // Se a soma combinada é baixa (< 2.20), penalizar Over 2.5
    if (combinedAvg < 2.20) {
      over25Score = Math.min(over25Score, 40);
    }
    
    // Se a soma combinada é muito alta (> 3.50), penalizar Under 2.5
    if (combinedAvg > 3.50) {
      under25Score = Math.min(under25Score, 35);
    }
  }
  
  // FILTRO 2B: Proxy via odds para Over/Under quando mercado discorda
  if (game.odds.over && game.odds.over > 2.10 && over25Score > 55) {
    over25Score = Math.min(over25Score, 50);
    secureLog('info', 'MARKET_DISAGREES_OVER', {
      game: `${game.homeTeam} vs ${game.awayTeam}`,
      overOdd: game.odds.over,
      scoreCapped: 50,
    });
  }
  if (game.odds.under && game.odds.under > 2.10 && under25Score > 55) {
    under25Score = Math.min(under25Score, 50);
  }
  
  // H2H: se jogos diretos têm poucos gols, penalizar Over
  const h2hAvgGoals = adv?.h2h?.avgGoals || null;
  if (h2hAvgGoals !== null && h2hAvgGoals < 2.0) {
    over25Score = Math.min(over25Score, Math.round(over25Score * 0.70));
    secureLog('info', 'FILTER2_H2H_LOW_GOALS', {
      home: game.homeTeam, away: game.awayTeam, h2hAvgGoals,
    });
  }

  // ============= FILTRO 3: H2H DESFAVORÁVEL =============
  if (adv?.h2h && adv.h2h.totalGames >= 3) {
    const h2hData = adv.h2h;
    const homeWinRateH2H = (h2hData.homeWins || 0) / h2hData.totalGames;
    const awayWinRateH2H = (h2hData.awayWins || 0) / h2hData.totalGames;
    
    // Penalizar vitória do mandante se H2H é muito desfavorável
    if (homeWinRateH2H < 0.20 && awayWinRateH2H > 0.50) {
      homeWinScore = Math.min(homeWinScore, 30);
      secureLog('info', 'FILTER3_H2H_UNFAVORABLE_HOME', {
        home: game.homeTeam, away: game.awayTeam,
        homeWinRate: (homeWinRateH2H * 100).toFixed(0) + '%',
        awayWinRate: (awayWinRateH2H * 100).toFixed(0) + '%',
      });
    }
    
    // Penalizar vitória do visitante se H2H é muito desfavorável
    if (awayWinRateH2H < 0.20 && homeWinRateH2H > 0.50) {
      awayWinScore = Math.min(awayWinScore, 30);
      secureLog('info', 'FILTER3_H2H_UNFAVORABLE_AWAY', {
        home: game.homeTeam, away: game.awayTeam,
        homeWinRate: (homeWinRateH2H * 100).toFixed(0) + '%',
        awayWinRate: (awayWinRateH2H * 100).toFixed(0) + '%',
      });
    }
    
    // Se H2H tem poucos gols, penalizar Over mais
    if (h2hAvgGoals !== null && h2hAvgGoals < 1.8) {
      over25Score = Math.min(over25Score, 35);
    }
  }

  // ===== DETERMINAR MELHOR APOSTA COM VALUE =====
  const allScores = [
    { type: t.over25, score: over25Score, odd: game.odds.over, betType: 'over25' as const },
    { type: t.under25, score: under25Score, odd: game.odds.under, betType: 'under25' as const },
    { type: t.btts, score: bttsScore, odd: game.odds.bttsYes || game.advancedData?.bttsOdds?.yes || Math.round((1 / Math.max(0.01, poissonProbs.btts / 100)) * 100) / 100, betType: 'btts' as const },
    { type: t.homeWin, score: homeWinScore, odd: game.odds.home, betType: 'home' as const },
    { type: t.awayWin, score: awayWinScore, odd: game.odds.away, betType: 'away' as const },
    { type: t.draw, score: drawScore, odd: game.odds.draw, betType: 'draw' as const },
  ];
  
  // Calcular value para cada aposta
  const scoresWithValue = allScores.map(bet => {
    // CALIBRADO: usa odd como âncora, score como ajuste
    const estimatedProb = calculateCalibratedProbability(bet.score, bet.odd);
    const impliedProb = calculateImpliedProbability(bet.odd);
    const value = estimatedProb - impliedProb; // Edge em pontos percentuais simples
    
    return {
      ...bet,
      estimatedProb,
      impliedProb,
      value,
    };
  });
  
  // ============= DEBUG: LOG CADA APOSTA =============
  for (const bet of scoresWithValue) {
    secureLog('info', 'BET_DEBUG', {
      game: `${game.homeTeam} vs ${game.awayTeam}`,
      betType: bet.betType,
      odd: bet.odd,
      rawScore: bet.score,
      impliedProb: Math.round(bet.impliedProb),
      estimatedProb: Math.round(bet.estimatedProb),
      edge: Math.round((bet.estimatedProb - bet.impliedProb) * 10) / 10,
      value: Math.round(bet.value * 100) / 100,
    });
  }
  // ============= FIM DEBUG =============

  // Ordenar por score (confiança)
  scoresWithValue.sort((a, b) => b.score - a.score);
  const best = scoresWithValue[0];
  
  // ============= FILTRO 1: POSIÇÃO NA TABELA / ODDS PROXY =============
  if (best.betType === 'home' || best.betType === 'away') {
    // FILTRO 1A: Posição na tabela (se disponível)
    if (adv?.homePosition && adv?.awayPosition) {
      // Estimar total de times (usar 20 como padrão)
      const totalTeams = 20;
      const bottomThird = Math.ceil(totalTeams * 0.67);
      const topThird = Math.ceil(totalTeams * 0.33);
      
      const recommendedPos = best.betType === 'home' ? adv.homePosition : adv.awayPosition;
      const opponentPos = best.betType === 'home' ? adv.awayPosition : adv.homePosition;
      
      const isRecommendedWeak = recommendedPos >= bottomThird;
      const isOpponentStrong = opponentPos <= topThird;
      
      if (isRecommendedWeak && isOpponentStrong) {
        const recentForm = best.betType === 'home' ? adv.homeForm : adv.awayForm;
        const recentWins = recentForm ? recentForm.split('').filter((c: string) => c === 'W').length : 0;
        
        if (recentWins < 3) {
          secureLog('warn', 'FILTER1_TABLE_POSITION_BLOCK', {
            home: game.homeTeam, away: game.awayTeam,
            recommendedPos, opponentPos, recentWins,
          });
          return {
            type: t.skip,
            reason: `Time na posição ${recommendedPos}º contra time do topo (${opponentPos}º). Risco alto.`,
            profit: 0, confidence: best.estimatedProb,
            factors: factors.slice(0, 3),
            valuePercentage: best.value,
            impliedProbability: best.impliedProb,
            estimatedProbability: best.estimatedProb,
            isSkip: true, skipReason: 'table_position_mismatch',
          };
        }
      }
    }
    
    // FILTRO 1B: Proxy via odds quando standings não disponível
    const recommendedOdd = best.odd;
    const opponentOdd = best.betType === 'home' ? game.odds.away : game.odds.home;
    
    if (recommendedOdd > 2.50 && opponentOdd < 1.80) {
      const recentForm = best.betType === 'home' ? adv?.homeForm : adv?.awayForm;
      const recentWins = recentForm ? recentForm.split('').filter((c: string) => c === 'W').length : 0;
      
      if (recentWins < 3) {
        secureLog('warn', 'FILTER1B_UNDERDOG_BLOCK', {
          home: game.homeTeam, away: game.awayTeam,
          recommendedOdd, opponentOdd, recentWins,
        });
        return {
          type: t.skip,
          reason: `Underdog @${recommendedOdd.toFixed(2)} contra favorito @${opponentOdd.toFixed(2)}. Arriscado.`,
          profit: 0, confidence: best.estimatedProb,
          factors: factors.slice(0, 3),
          valuePercentage: best.value,
          impliedProbability: best.impliedProb,
          estimatedProbability: best.estimatedProb,
          isSkip: true, skipReason: 'underdog_vs_heavy_favorite',
        };
      }
    }
  }
  
  // Confidence agora é a probabilidade calibrada, não o score bruto
  const confidence = best.estimatedProb;
  
  // ============= VERIFICAÇÃO DE SANIDADE =============
  // Se estimatedProb <= impliedProb, não há edge. SEMPRE skip.
  const sanityFailed = best.estimatedProb <= best.impliedProb;
  
  if (sanityFailed) {
    secureLog('warn', 'SANITY_FAIL', {
      game: `${game.homeTeam} vs ${game.awayTeam}`,
      betType: best.betType,
      estimatedProb: best.estimatedProb,
      impliedProb: best.impliedProb,
    });
    
    return {
      type: t.skip,
      reason: 'Sem vantagem matemática identificada.',
      profit: 0,
      confidence,
      factors: factors.slice(0, 3),
      valuePercentage: 0,
      impliedProbability: best.impliedProb,
      estimatedProbability: best.estimatedProb,
      isSkip: true,
      skipReason: 'sanity_check_failed',
    };
  }
  
  // ============= SKIP CHECK NORMAL =============
  const skipCheck = shouldSkipBet(confidence, best.value);
  
  if (skipCheck.skip) {
    secureLog('info', 'BET_SKIPPED', {
      game: `${game.homeTeam} vs ${game.awayTeam}`,
      reason: skipCheck.reason,
      value: best.value,
      confidence,
    });
    
    return {
      type: t.skip,
      reason: skipCheck.reason || t.noEdge,
      profit: 0,
      confidence,
      factors: factors.slice(0, 3),
      valuePercentage: best.value,
      impliedProbability: best.impliedProb,
      estimatedProbability: best.estimatedProb,
      isSkip: true,
      skipReason: skipCheck.reason,
    };
  }
  
  // Adicionar fator de value se positivo
  if (best.value >= MIN_VALUE_THRESHOLD) {
    factors.unshift({
      name: t.valueFactor,
      impact: 'positive',
      weight: Math.round(best.value),
      description: `Value +${best.value.toFixed(1)}% nas odds`
    });
  }
  
  // Gerar razão baseada nos fatores
  let reason = '';
  if (factors.length > 0) {
    const topFactors = factors.slice(0, 3);
    reason = topFactors.map(f => f.description).join('. ') + '.';
  } else {
    reason = t.highConfidence;
  }
  
  return {
    type: best.type,
    reason,
    profit: parseFloat((betAmount * best.odd - betAmount).toFixed(2)),
    confidence,
    factors: factors.slice(0, 5),
    valuePercentage: best.value,
    impliedProbability: best.impliedProb,
    estimatedProbability: best.estimatedProb,
    isSkip: false,
  };
}

// Fallback para análise simples quando não há dados avançados
function analyzeSimple(game: Game, lang: string = 'pt'): BettingAnalysis {
  const betAmount = 40;
  const t = analysisTranslations[lang] || analysisTranslations['pt'];
  
  // Calcular value mesmo na análise simples
  const homeImplied = calculateImpliedProbability(game.odds.home);
  const awayImplied = calculateImpliedProbability(game.odds.away);
  const overImplied = calculateImpliedProbability(game.odds.over);
  
  // Análise básica baseada apenas em odds
  if (game.odds.over > 0 && game.odds.over < 2.0) {
    const estimatedProb = calculateCalibratedProbability(60, game.odds.over);
    const impliedProbOver = calculateImpliedProbability(game.odds.over);
    const value = estimatedProb - impliedProbOver;
    
    return {
      type: t.over25,
      reason: `Odd de ${game.odds.over.toFixed(2)} indica alta expectativa de gols.`,
      profit: parseFloat((betAmount * game.odds.over - betAmount).toFixed(2)),
      confidence: 55,
      valuePercentage: value,
      impliedProbability: overImplied,
      estimatedProbability: estimatedProb,
      isSkip: value < MIN_VALUE_THRESHOLD,
    };
  }
  
  const avgOdd = (game.odds.home + game.odds.away) / 2;
  const estimatedProb = calculateCalibratedProbability(50, avgOdd);
  const impliedProbAvg = calculateImpliedProbability(avgOdd);
  const value = estimatedProb - impliedProbAvg;
  
  return {
    type: t.btts,
    reason: `Jogo equilibrado com odds similares (Casa: ${game.odds.home.toFixed(2)} / Fora: ${game.odds.away.toFixed(2)}).`,
    profit: parseFloat((betAmount * avgOdd - betAmount).toFixed(2)),
    confidence: 50,
    valuePercentage: value,
    impliedProbability: (homeImplied + awayImplied) / 2,
    estimatedProbability: estimatedProb,
    isSkip: value < MIN_VALUE_THRESHOLD,
  };
}

// ============================================================================
// SMART ACCUMULATOR BUILDER — Seleção Otimizada de Acumuladas 5-6 Pernas
// ============================================================================

interface SmartAccBet {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  betType: string;
  betLabel: string;
  odd: number;
  estimatedProb: number;
  impliedProb: number;
  edge: number;
  startTime: string;
}

interface SmartAccumulator {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  badge: string;
  bets: SmartAccBet[];
  totalOdd: number;
  combinedProb: number;
  bookmakerProb: number;
  combinedEdge: number;
  expectedValue: number;
  suggestedStake: number;
  riskLevel: 'medium' | 'high';
  qualityScore: number;
}

// ============= VALIDAÇÃO ANTI-ARMADILHA PARA ACUMULADAS =============
function isGameSafeForAccumulator(game: any, riskLevel: string = 'safe'): boolean {
  const a = game.analysis;
  if (!a || a.isSkip) return false;
  
  if (a.skipReason === 'underdog_vs_favorite' || a.skipReason === 'underdog_vs_heavy_favorite') return false;
  if (a.skipReason === 'sanity_check_failed' || a.skipReason === 'table_position_mismatch') return false;
  
  const edge = (a.estimatedProbability || 0) - (a.impliedProbability || 0);
  
  if (riskLevel === 'safe' || riskLevel === 'low') {
    if (edge < 3) return false;
    if ((a.estimatedProbability || 0) < 45) return false;
    const odd = a.recommendedOdd || (a.profit ? (a.profit / 40) + 1 : 0);
    if (odd > 2.50) return false;
    return true;
  }
  
  if (riskLevel === 'medium' || riskLevel === 'balanced') {
    if (edge < 2) return false;
    if ((a.estimatedProbability || 0) < 35) return false;
    const odd = a.recommendedOdd || (a.profit ? (a.profit / 40) + 1 : 0);
    if (odd > 3.50) return false;
    return true;
  }
  
  // Bold
  if (edge < 1) return false;
  if ((a.estimatedProbability || 0) < 20) return false;
  return true;
}

function buildSmartAccumulators(
  analyzedGames: any[],
  lang: string = 'pt'
): SmartAccumulator[] {
  // 1. Pegar todos os jogos que TÊM análise válida com edge > 0
  const eligible: SmartAccBet[] = [];
  
  for (const game of analyzedGames) {
    if (!game.analysis) continue;
    if (game.analysis.isSkip) continue;
    
    const a = game.analysis;
    if (!a.estimatedProbability || !a.impliedProbability) continue;
    
    const edge = a.estimatedProbability - a.impliedProbability;
    
    // VALIDAÇÃO TRIPLA DE SEGURANÇA
    if (edge <= 3) continue;
    if (a.estimatedProbability <= a.impliedProbability) continue;
    if (a.confidence < 15) continue;
    
    // ============= FILTRO 4: ANTI-ARMADILHA PARA ACUMULADAS =============
    // Bloquear qualquer jogo com skipReason (armadilha detectada)
    if (a.skipReason) continue;
    
    // Regra: Probabilidade estimada mínima de 40% para jogo individual
    if ((a.estimatedProbability || 0) < 40) continue;
    
    // Regra: Confidence mínima de 35%
    if ((a.confidence || 0) < 35) continue;
    
    // Regra: Não incluir underdogs pesados (@3.50+) em acumuladas
    const gameOdd = a.recommendedOdd || (a.profit ? (a.profit / 40) + 1 : 0);
    if (gameOdd > 3.50) continue;
    
    secureLog('info', 'SMART_ACC_ELIGIBLE', {
      game: `${game.homeTeam} vs ${game.awayTeam}`,
      edge: Math.round(edge * 100) / 100,
      confidence: a.confidence,
      odd: gameOdd || 'N/A'
    });
    
    // Calcular odd do jogo
    let odd = 0;
    if (a.recommendedOdd && a.recommendedOdd > 1) {
      odd = a.recommendedOdd;
    } else if (a.impliedProbability > 0) {
      odd = Math.round((100 / a.impliedProbability) * 100) / 100;
    } else if (a.profit && a.profit > 0) {
      odd = Math.round(((a.profit / 40) + 1) * 100) / 100;
    }
    
    if (odd < 1.10 || odd > 6.00) continue;
    
    eligible.push({
      fixtureId: game.id || `${game.homeTeam}-${game.awayTeam}`,
      homeTeam: game.homeTeam || 'Time A',
      awayTeam: game.awayTeam || 'Time B',
      league: game.league || '',
      betType: a.type || '',
      betLabel: a.type || '',
      odd: odd,
      estimatedProb: a.estimatedProbability,
      impliedProb: a.impliedProbability,
      edge: edge,
      startTime: game.startTime || '',
    });
  }
  
  console.log(`[SMART-ACC] Eligible games: ${eligible.length} out of ${analyzedGames.length}`);
  
  // Se menos de 4 jogos, não dá para montar
  if (eligible.length < 4) {
    console.log('[SMART-ACC] Not enough eligible games');
    return [];
  }
  
  // 2. Ordenar por edge (maior primeiro)
  eligible.sort((a, b) => b.edge - a.edge);
  
  // 3. Montar até 3 combos diferentes
  const results: SmartAccumulator[] = [];
  
  const titles = lang === 'en' 
    ? { safe: 'Safe Combo', balanced: 'Balanced Combo', bold: 'Bold Combo' }
    : lang === 'es'
    ? { safe: 'Combo Seguro', balanced: 'Combo Equilibrado', bold: 'Combo Audaz' }
    : lang === 'it'
    ? { safe: 'Combo Sicuro', balanced: 'Combo Equilibrato', bold: 'Combo Audace' }
    : { safe: 'Combo Seguro', balanced: 'Combo Equilibrado', bold: 'Combo Ousado' };
  
  const gamesLabel = lang === 'en' ? 'games' : lang === 'es' ? 'juegos' : lang === 'it' ? 'partite' : 'jogos';
  
  // COMBO 1: Top 5 por edge (ou todos se menos de 5)
  const combo1Size = Math.min(5, eligible.length);
  const combo1 = eligible.slice(0, combo1Size);
  results.push(makeSmartCombo(combo1, '🛡️', `${titles.safe} — ${combo1Size} ${gamesLabel}`, combo1Size, 50, 'medium'));
  
  // COMBO 2: Se tem 8+ jogos, pegar posições 3-8 (jogos diferentes do combo 1)
  if (eligible.length >= 8) {
    const combo2Size = Math.min(6, eligible.length - 3);
    const combo2 = eligible.slice(3, 3 + combo2Size);
    results.push(makeSmartCombo(combo2, '🧠', `${titles.balanced} — ${combo2Size} ${gamesLabel}`, combo2Size, 30, 'medium'));
  }
  
  // COMBO 3: Se tem 12+ jogos, pegar mix de odds altas
  if (eligible.length >= 12) {
    const highOddGames = [...eligible].sort((a, b) => b.odd - a.odd);
    const combo3 = highOddGames.slice(0, Math.min(5, highOddGames.length));
    results.push(makeSmartCombo(combo3, '🚀', `${titles.bold} — ${combo3.length} ${gamesLabel}`, combo3.length, 20, 'high'));
  }
  
  console.log(`[SMART-ACC] Generated ${results.length} combos`);
  
  return results;
}

function makeSmartCombo(bets: SmartAccBet[], emoji: string, title: string, numGames: number, stake: number, risk: 'medium' | 'high'): SmartAccumulator {
  const totalOdd = bets.reduce((acc, b) => acc * b.odd, 1);
  const combinedProb = bets.reduce((acc, b) => acc * (b.estimatedProb / 100), 1) * 100;
  const bookmakerProb = bets.reduce((acc, b) => acc * (b.impliedProb / 100), 1) * 100;
  
  return {
    id: `smart-${numGames}-${Math.round(totalOdd * 100)}`,
    emoji: emoji,
    title: title,
    subtitle: `${numGames} ${title.includes('games') ? 'games selected by AI' : 'jogos selecionados por IA'}`,
    badge: title.split(' — ')[0],
    bets: bets,
    totalOdd: Math.round(totalOdd * 100) / 100,
    combinedProb: Math.round(combinedProb * 10) / 10,
    bookmakerProb: Math.round(bookmakerProb * 10) / 10,
    combinedEdge: Math.round((combinedProb - bookmakerProb) * 10) / 10,
    expectedValue: Math.round((combinedProb / 100) * totalOdd * 1000) / 1000,
    suggestedStake: stake,
    riskLevel: risk,
    qualityScore: 1,
  };
}

function analyzeBet(game: Game, lang: string = 'pt'): BettingAnalysis {
  if (game.advancedData && Object.keys(game.advancedData).length > 0) {
    return analyzeAdvanced(game, lang);
  }
  return analyzeSimple(game, lang);
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

// ============================================================================
// RATE LIMIT CONTROLLER FOR API-FOOTBALL
// ============================================================================
const API_CALLS_LIMIT = 120; // Max calls per execution (standings cached = ~10 + 50 games * 2 calls avg)
let apiCallsUsed = 0;

// Helper function to make API-Football requests with rate limit
async function apiFootballRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  if (apiCallsUsed >= API_CALLS_LIMIT) {
    secureLog('warn', 'API_RATE_LIMIT_REACHED', { callsUsed: apiCallsUsed, limit: API_CALLS_LIMIT });
    return { response: [] };
  }
  
  apiCallsUsed++;
  
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  secureLog('info', 'API-Football request', { endpoint, params, callsUsed: apiCallsUsed });
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY!,
    },
  });
  
  // Check rate limit headers from API-Football
  const remaining = response.headers.get('x-ratelimit-requests-remaining');
  if (remaining && parseInt(remaining) < 5) {
    secureLog('warn', 'API_RATE_LIMIT_LOW', { remaining });
    apiCallsUsed = API_CALLS_LIMIT; // Stop making extra calls
  }
  
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

// ============= BUSCAR DADOS AVANÇADOS =============

async function fetchH2H(homeTeamId: number, awayTeamId: number): Promise<AdvancedGameData['h2h'] | undefined> {
  try {
    const data = await apiFootballRequest('/fixtures/headtohead', {
      h2h: `${homeTeamId}-${awayTeamId}`,
      last: '10'
    });
    
    if (!data.response || data.response.length === 0) return undefined;
    
    const games = data.response;
    let homeWins = 0, awayWins = 0, draws = 0, totalGoals = 0;
    const lastGames: { home: number; away: number; date: string }[] = [];
    
    for (const game of games) {
      const homeGoals = game.goals.home || 0;
      const awayGoals = game.goals.away || 0;
      totalGoals += homeGoals + awayGoals;
      
      const isHomeTeamHome = game.teams.home.id === homeTeamId;
      
      if (homeGoals > awayGoals) {
        if (isHomeTeamHome) homeWins++;
        else awayWins++;
      } else if (awayGoals > homeGoals) {
        if (isHomeTeamHome) awayWins++;
        else homeWins++;
      } else {
        draws++;
      }
      
      lastGames.push({ home: homeGoals, away: awayGoals, date: game.fixture.date });
    }
    
    return {
      totalGames: games.length,
      homeWins,
      awayWins,
      draws,
      avgGoals: totalGoals / games.length,
      lastGames: lastGames.slice(0, 5)
    };
  } catch (err) {
    secureLog('warn', 'Erro ao buscar H2H', { error: String(err) });
    return undefined;
  }
}

async function fetchTeamStats(teamId: number, leagueId: number, season: number): Promise<TeamStats | undefined> {
  try {
    const data = await apiFootballRequest('/teams/statistics', {
      team: teamId.toString(),
      league: leagueId.toString(),
      season: season.toString()
    });
    
    if (!data.response) return undefined;
    
    const stats = data.response;
    const totalGames = stats.fixtures?.played?.total || 1;
    const goalsFor = stats.goals?.for?.total?.total || 0;
    const goalsAgainst = stats.goals?.against?.total?.total || 0;
    
    // Gols casa/fora
    const homeGames = stats.fixtures?.played?.home || 1;
    const awayGames = stats.fixtures?.played?.away || 1;
    const homeGoals = stats.goals?.for?.total?.home || 0;
    const awayGoals = stats.goals?.for?.total?.away || 0;
    const homeGoalsConceded = stats.goals?.against?.total?.home || 0;
    const awayGoalsConceded = stats.goals?.against?.total?.away || 0;
    
    const cleanSheets = ((stats.clean_sheet?.total || 0) / totalGames) * 100;
    const failedToScore = ((stats.failed_to_score?.total || 0) / totalGames) * 100;
    
    return {
      goalsScored: goalsFor,
      goalsConceded: goalsAgainst,
      avgGoalsScored: goalsFor / totalGames,
      avgGoalsConceded: goalsAgainst / totalGames,
      cleanSheets,
      failedToScore,
      bttsPercentage: Math.min(95, Math.max(5, Math.round((1 - failedToScore / 100) * (1 - cleanSheets / 100) * 100))),
      over25Percentage: (() => {
        const lambda = (goalsFor + goalsAgainst) / totalGames;
        const p0 = Math.exp(-lambda);
        const p1 = lambda * Math.exp(-lambda);
        const p2 = (lambda * lambda / 2) * Math.exp(-lambda);
        return Math.min(95, Math.max(5, Math.round((1 - p0 - p1 - p2) * 100)));
      })(),
      homeGoalsAvg: homeGoals / homeGames,
      awayGoalsAvg: awayGoals / awayGames,
      homeGoalsConcededAvg: homeGoalsConceded / homeGames,
      awayGoalsConcededAvg: awayGoalsConceded / awayGames,
    };
  } catch (err) {
    secureLog('warn', 'Erro ao buscar estatísticas do time', { teamId, error: String(err) });
    return undefined;
  }
}

// Cache for full standings (avoid repeated calls per league)
const standingsCache = new Map<string, any>();

async function fetchFullStandings(leagueId: number, season: number): Promise<any> {
  const key = `${leagueId}-${season}`;
  
  if (standingsCache.has(key)) {
    return standingsCache.get(key);
  }
  
  try {
    const data = await apiFootballRequest('/standings', {
      league: leagueId.toString(),
      season: season.toString()
    });
    
    if (!data.response || !data.response[0]?.league?.standings) return null;
    
    const standings = data.response[0].league.standings;
    const table = Array.isArray(standings[0]) ? standings[0] : standings;
    
    const result = {
      totalTeams: table.length,
      teams: table.map((entry: any) => ({
        teamId: entry.team?.id,
        teamName: entry.team?.name,
        rank: entry.rank,
        points: entry.points,
        goalsDiff: entry.goalsDiff,
        played: entry.all?.played || 0,
        win: entry.all?.win || 0,
        draw: entry.all?.draw || 0,
        lose: entry.all?.lose || 0,
        goalsFor: entry.all?.goals?.for || 0,
        goalsAgainst: entry.all?.goals?.against || 0,
        form: entry.form || '',
        homeWin: entry.home?.win || 0,
        homeDraw: entry.home?.draw || 0,
        homeLose: entry.home?.lose || 0,
        homeGoalsFor: entry.home?.goals?.for || 0,
        homeGoalsAgainst: entry.home?.goals?.against || 0,
        awayWin: entry.away?.win || 0,
        awayDraw: entry.away?.draw || 0,
        awayLose: entry.away?.lose || 0,
        awayGoalsFor: entry.away?.goals?.for || 0,
        awayGoalsAgainst: entry.away?.goals?.against || 0,
      })),
    };
    
    standingsCache.set(key, result);
    secureLog('info', 'STANDINGS_FETCHED', { leagueId, totalTeams: result.totalTeams });
    return result;
  } catch (err) {
    secureLog('warn', 'STANDINGS_FETCH_ERROR', { leagueId, error: String(err) });
    return null;
  }
}

function getTeamStandingsData(standings: any, teamId: number, teamName: string): any {
  if (!standings || !standings.teams) return null;
  
  let team = standings.teams.find((t: any) => t.teamId === teamId);
  if (!team) {
    team = standings.teams.find((t: any) => 
      t.teamName.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(t.teamName.toLowerCase())
    );
  }
  
  return team || null;
}

// Legacy wrapper for backward compatibility
async function fetchStandings(leagueId: number, season: number, teamId: number): Promise<{ position: number; form: string } | undefined> {
  const fullStandings = await fetchFullStandings(leagueId, season);
  if (!fullStandings) return undefined;
  
  const teamData = fullStandings.teams.find((s: any) => s.teamId === teamId);
  if (!teamData) return undefined;
  
  return {
    position: teamData.rank,
    form: teamData.form || ''
  };
}

async function fetchInjuries(teamId: number, fixtureId: number): Promise<number> {
  try {
    const data = await apiFootballRequest('/injuries', {
      fixture: fixtureId.toString()
    });
    
    if (!data.response) return 0;
    
    return data.response.filter((inj: any) => inj.team.id === teamId).length;
  } catch (err) {
    secureLog('warn', 'Erro ao buscar lesões', { teamId, error: String(err) });
    return 0;
  }
}

async function fetchPrediction(fixtureId: number): Promise<AdvancedGameData['apiPrediction'] | undefined> {
  try {
    const data = await apiFootballRequest('/predictions', {
      fixture: fixtureId.toString()
    });
    
    if (!data.response || !data.response[0]) return undefined;
    
    const pred = data.response[0];
    const predictions = pred.predictions;
    const comparison = pred.comparison;
    
    const result: AdvancedGameData['apiPrediction'] = {
      winner: predictions?.winner?.name,
      winnerConfidence: predictions?.percent?.home ? parseInt(predictions.percent.home) : undefined,
      homeGoals: predictions?.goals?.home,
      awayGoals: predictions?.goals?.away,
      advice: predictions?.advice,
      under_over: predictions?.under_over,
      // Enhanced: percentage probabilities from API model
      homeWinPct: parseInt(predictions?.percent?.home || '0'),
      drawPct: parseInt(predictions?.percent?.draw || '0'),
      awayWinPct: parseInt(predictions?.percent?.away || '0'),
      // Comparison data
      homeFormPct: parseInt(comparison?.form?.home || '0'),
      awayFormPct: parseInt(comparison?.form?.away || '0'),
      homeAttackPct: parseInt(comparison?.att?.home || '0'),
      awayAttackPct: parseInt(comparison?.att?.away || '0'),
      homeDefensePct: parseInt(comparison?.def?.home || '0'),
      awayDefensePct: parseInt(comparison?.def?.away || '0'),
      homeTotalPct: parseInt(comparison?.total?.home || '0'),
      awayTotalPct: parseInt(comparison?.total?.away || '0'),
    };
    
    secureLog('info', 'API_PREDICTION_FETCHED', {
      fixtureId,
      homeWinPct: result.homeWinPct,
      drawPct: result.drawPct,
      awayWinPct: result.awayWinPct,
      advice: result.advice,
    });
    
    return result;
  } catch (err) {
    secureLog('warn', 'PREDICTIONS_FETCH_ERROR', { fixtureId, error: String(err) });
    return undefined;
  }
}

// ============= PREMIUM DATA FUNCTIONS =============

// Buscar detalhes de lesões (nomes dos jogadores)
async function fetchInjuryDetails(teamId: number, fixtureId: number): Promise<{ count: number; details: InjuryDetail[] }> {
  try {
    const data = await apiFootballRequest('/injuries', {
      fixture: fixtureId.toString()
    });
    
    if (!data.response) return { count: 0, details: [] };
    
    const teamInjuries = data.response.filter((inj: any) => inj.team.id === teamId);
    const details: InjuryDetail[] = teamInjuries.map((inj: any) => ({
      player: inj.player?.name || 'Unknown',
      type: inj.player?.type === 'Missing Fixture' ? 'suspension' : 
            inj.player?.type === 'Doubtful' ? 'doubt' : 'injury',
      reason: inj.player?.reason || undefined
    }));
    
    return { count: teamInjuries.length, details };
  } catch (err) {
    secureLog('warn', 'Erro ao buscar detalhes de lesões', { teamId, error: String(err) });
    return { count: 0, details: [] };
  }
}

// Buscar estatísticas de escanteios
async function fetchCornersStats(teamId: number, leagueId: number, season: number): Promise<{ avgFor: number; avgAgainst: number } | undefined> {
  try {
    const data = await apiFootballRequest('/teams/statistics', {
      team: teamId.toString(),
      league: leagueId.toString(),
      season: season.toString()
    });
    
    if (!data.response) return undefined;
    
    const stats = data.response;
    // A API-Football retorna corners em fixtures->played
    // Vamos estimar baseado no número de gols (times que atacam mais têm mais escanteios)
    const totalGames = stats.fixtures?.played?.total || 1;
    const goalsFor = stats.goals?.for?.total?.total || 0;
    const goalsAgainst = stats.goals?.against?.total?.total || 0;
    
    // Estimativa: times que marcam mais tendem a ter mais escanteios
    // Média da liga é ~10 escanteios por jogo
    const avgFor = Math.max(2, Math.min(8, 4 + (goalsFor / totalGames)));
    const avgAgainst = Math.max(2, Math.min(8, 4 + (goalsAgainst / totalGames)));
    
    return { avgFor, avgAgainst };
  } catch (err) {
    secureLog('warn', 'Erro ao buscar estatísticas de escanteios', { teamId, error: String(err) });
    return undefined;
  }
}

// Buscar estatísticas de cartões
async function fetchCardsStats(teamId: number, leagueId: number, season: number): Promise<{ avgYellow: number; avgRed: number } | undefined> {
  try {
    const data = await apiFootballRequest('/teams/statistics', {
      team: teamId.toString(),
      league: leagueId.toString(),
      season: season.toString()
    });
    
    if (!data.response) return undefined;
    
    const stats = data.response;
    const totalGames = stats.fixtures?.played?.total || 1;
    
    // Cartões da temporada
    const yellowCards = stats.cards?.yellow || {};
    const redCards = stats.cards?.red || {};
    
    // Somar todos os cartões por período
    let totalYellow = 0;
    let totalRed = 0;
    
    for (const period of Object.values(yellowCards)) {
      totalYellow += (period as any)?.total || 0;
    }
    for (const period of Object.values(redCards)) {
      totalRed += (period as any)?.total || 0;
    }
    
    return {
      avgYellow: totalYellow / totalGames,
      avgRed: totalRed / totalGames
    };
  } catch (err) {
    secureLog('warn', 'Erro ao buscar estatísticas de cartões', { teamId, error: String(err) });
    return undefined;
  }
}

// Buscar escalações
async function fetchLineups(fixtureId: number): Promise<LineupsData | undefined> {
  try {
    const data = await apiFootballRequest('/fixtures/lineups', {
      fixture: fixtureId.toString()
    });
    
    if (!data.response || data.response.length < 2) return undefined;
    
    const homeLineup = data.response[0];
    const awayLineup = data.response[1];
    
    return {
      homeFormation: homeLineup?.formation,
      awayFormation: awayLineup?.formation,
      homeStarting: homeLineup?.startXI?.map((p: any) => ({
        name: p.player?.name,
        number: p.player?.number,
        position: p.player?.pos
      })) || [],
      awayStarting: awayLineup?.startXI?.map((p: any) => ({
        name: p.player?.name,
        number: p.player?.number,
        position: p.player?.pos
      })) || [],
      homeCoach: homeLineup?.coach?.name,
      awayCoach: awayLineup?.coach?.name
    };
  } catch (err) {
    secureLog('warn', 'Erro ao buscar escalações', { fixtureId, error: String(err) });
    return undefined;
  }
}

// Buscar odds de BTTS
async function fetchBTTSOdds(fixtureId: number): Promise<{ yes: number; no: number } | undefined> {
  try {
    const data = await apiFootballRequest('/odds', {
      fixture: fixtureId.toString(),
      bookmaker: '8' // Bet365
    });
    
    if (!data.response?.[0]?.bookmakers?.[0]?.bets) return undefined;
    
    const bets = data.response[0].bookmakers[0].bets;
    const btts = bets.find((b: any) => b.name === 'Both Teams Score');
    
    if (!btts) return undefined;
    
    return {
      yes: parseFloat(btts.values.find((v: any) => v.value === 'Yes')?.odd) || 0,
      no: parseFloat(btts.values.find((v: any) => v.value === 'No')?.odd) || 0
    };
  } catch (err) {
    secureLog('warn', 'Erro ao buscar odds BTTS', { fixtureId, error: String(err) });
    return undefined;
  }
}

// Buscar artilheiros da liga
async function fetchTopScorers(leagueId: number, season: number): Promise<TopScorerInfo[] | undefined> {
  try {
    const data = await apiFootballRequest('/players/topscorers', {
      league: leagueId.toString(),
      season: season.toString()
    });
    
    if (!data.response) return undefined;
    
    return data.response.slice(0, 5).map((p: any) => ({
      name: p.player?.name || 'Unknown',
      goals: p.statistics?.[0]?.goals?.total || 0,
      assists: p.statistics?.[0]?.goals?.assists || 0,
      team: p.statistics?.[0]?.team?.name || ''
    }));
  } catch (err) {
    secureLog('warn', 'Erro ao buscar artilheiros', { leagueId, error: String(err) });
    return undefined;
  }
}

// ============= BUSCAR DADOS COMPLETOS =============

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAdvancedData(fixture: any, isPremium: boolean = false): Promise<AdvancedGameData> {
  const homeTeamId = fixture.teams.home.id;
  const awayTeamId = fixture.teams.away.id;
  const leagueId = fixture.league.id;
  const season = fixture.league.season;
  const fixtureId = fixture.fixture.id;
  const homeTeamName = fixture.teams.home.name;
  const awayTeamName = fixture.teams.away.name;
  
  secureLog('info', 'Buscando dados avançados', { 
    fixture: `${homeTeamName} vs ${awayTeamName}`,
    fixtureId,
    isPremium
  });
  
  // Base data for all tiers - fetch full standings (cached per league) + H2H
  const [h2h, fullStandings] = await Promise.all([
    fetchH2H(homeTeamId, awayTeamId),
    fetchFullStandings(leagueId, season),
  ]);
  
  await delay(200);
  
  // Standard advanced data
  const [homeStats, awayStats, homeInjuryData, awayInjuryData, prediction] = await Promise.all([
    fetchTeamStats(homeTeamId, leagueId, season),
    fetchTeamStats(awayTeamId, leagueId, season),
    fetchInjuryDetails(homeTeamId, fixtureId),
    fetchInjuryDetails(awayTeamId, fixtureId),
    fetchPrediction(fixtureId)
  ]);
  
  // Extract full standings data for both teams
  const homeStandingData = fullStandings ? getTeamStandingsData(fullStandings, homeTeamId, homeTeamName) : null;
  const awayStandingData = fullStandings ? getTeamStandingsData(fullStandings, awayTeamId, awayTeamName) : null;
  
  let advancedData: AdvancedGameData = {
    h2h: h2h ? {
      ...h2h,
      homeWinRate: h2h.totalGames > 0 ? h2h.homeWins / h2h.totalGames : 0,
      awayWinRate: h2h.totalGames > 0 ? h2h.awayWins / h2h.totalGames : 0,
      drawRate: h2h.totalGames > 0 ? h2h.draws / h2h.totalGames : 0,
    } : undefined,
    homeStats,
    awayStats,
    homePosition: homeStandingData?.rank,
    awayPosition: awayStandingData?.rank,
    homeForm: homeStandingData?.form || undefined,
    awayForm: awayStandingData?.form || undefined,
    homeInjuries: homeInjuryData.count,
    awayInjuries: awayInjuryData.count,
    homeInjuryDetails: homeInjuryData.details,
    awayInjuryDetails: awayInjuryData.details,
    apiPrediction: prediction,
    // H2H avg goals
    h2hAvgGoals: h2h?.avgGoals,
    // Full standings data
    standings: fullStandings ? {
      totalTeams: fullStandings.totalTeams,
      homePosition: homeStandingData?.rank || null,
      awayPosition: awayStandingData?.rank || null,
      homePoints: homeStandingData?.points || null,
      awayPoints: awayStandingData?.points || null,
      homeGoalDiff: homeStandingData?.goalsDiff || null,
      awayGoalDiff: awayStandingData?.goalsDiff || null,
    } : undefined,
    // Home-specific stats from standings
    homeGoalsScored: homeStandingData?.goalsFor,
    homeMatchesPlayed: homeStandingData?.played,
    homeGoalsConceded: homeStandingData?.goalsAgainst,
    homeHomeGoalsFor: homeStandingData?.homeGoalsFor,
    homeHomeGoalsAgainst: homeStandingData?.homeGoalsAgainst,
    // Away-specific stats from standings
    awayGoalsScored: awayStandingData?.goalsFor,
    awayMatchesPlayed: awayStandingData?.played,
    awayGoalsConceded: awayStandingData?.goalsAgainst,
    awayAwayGoalsFor: awayStandingData?.awayGoalsFor,
    awayAwayGoalsAgainst: awayStandingData?.awayGoalsAgainst,
  };
  
  if (homeStandingData || awayStandingData) {
    secureLog('info', 'STANDINGS_DATA_LOADED', {
      game: `${homeTeamName} vs ${awayTeamName}`,
      homePos: homeStandingData?.rank,
      awayPos: awayStandingData?.rank,
      homeGD: homeStandingData?.goalsDiff,
      awayGD: awayStandingData?.goalsDiff,
      totalTeams: fullStandings?.totalTeams,
    });
  }
  
  // Premium-only data: Corners, Cards, Lineups, BTTS Odds, Top Scorers
  if (isPremium) {
    await delay(200);
    
    const [homeCornersStats, awayCornersStats, homeCardsStats, awayCardsStats, bttsOdds, lineups, topScorers] = await Promise.all([
      fetchCornersStats(homeTeamId, leagueId, season),
      fetchCornersStats(awayTeamId, leagueId, season),
      fetchCardsStats(homeTeamId, leagueId, season),
      fetchCardsStats(awayTeamId, leagueId, season),
      fetchBTTSOdds(fixtureId),
      fetchLineups(fixtureId),
      fetchTopScorers(leagueId, season)
    ]);
    
    // Corners data
    if (homeCornersStats && awayCornersStats) {
      const totalAvgCorners = homeCornersStats.avgFor + awayCornersStats.avgFor + 
                              homeCornersStats.avgAgainst + awayCornersStats.avgAgainst;
      const avgCornersPerGame = totalAvgCorners / 2;
      
      advancedData.cornersData = {
        homeAvgCorners: homeCornersStats.avgFor + homeCornersStats.avgAgainst,
        awayAvgCorners: awayCornersStats.avgFor + awayCornersStats.avgAgainst,
        homeAvgCornersFor: homeCornersStats.avgFor,
        awayAvgCornersFor: awayCornersStats.avgFor,
        homeAvgCornersAgainst: homeCornersStats.avgAgainst,
        awayAvgCornersAgainst: awayCornersStats.avgAgainst,
        over95Percentage: avgCornersPerGame >= 9.5 ? 65 : avgCornersPerGame >= 8 ? 55 : 45,
        over105Percentage: avgCornersPerGame >= 10.5 ? 55 : avgCornersPerGame >= 9 ? 45 : 35
      };
    }
    
    // Cards data
    if (homeCardsStats && awayCardsStats) {
      const totalAvgCards = homeCardsStats.avgYellow + awayCardsStats.avgYellow;
      
      advancedData.cardsData = {
        homeAvgYellow: homeCardsStats.avgYellow,
        awayAvgYellow: awayCardsStats.avgYellow,
        homeAvgRed: homeCardsStats.avgRed,
        awayAvgRed: awayCardsStats.avgRed,
        over35CardsPercentage: totalAvgCards >= 3.5 ? 68 : totalAvgCards >= 3 ? 55 : 45,
        over45CardsPercentage: totalAvgCards >= 4.5 ? 55 : totalAvgCards >= 4 ? 45 : 35
      };
    }
    
    // BTTS Odds
    if (bttsOdds && bttsOdds.yes > 0) {
      advancedData.bttsOdds = bttsOdds;
    }
    
    // Lineups
    if (lineups) {
      advancedData.lineups = lineups;
    }
    
    // Top Scorers - filter for teams in this match
    if (topScorers) {
      const homeName = fixture.teams.home.name;
      const awayName = fixture.teams.away.name;
      
      advancedData.topScorers = {
        home: topScorers.filter(s => s.team === homeName),
        away: topScorers.filter(s => s.team === awayName)
      };
    }
    
    secureLog('info', 'Premium data loaded', {
      hasCorners: !!advancedData.cornersData,
      hasCards: !!advancedData.cardsData,
      hasBTTS: !!advancedData.bttsOdds,
      hasLineups: !!advancedData.lineups,
      hasTopScorers: !!(advancedData.topScorers?.home?.length || advancedData.topScorers?.away?.length)
    });
  }
  
  return advancedData;
}

// ===== LIGAS PRIORITÁRIAS =====
const PRIORITY_LEAGUES: Record<number, { name: string; tier: number }> = {
  39: { name: 'Premier League', tier: 1 },
  140: { name: 'La Liga', tier: 1 },
  135: { name: 'Serie A', tier: 1 },
  78: { name: 'Bundesliga', tier: 1 },
  61: { name: 'Ligue 1', tier: 1 },
  2: { name: 'Champions League', tier: 1 },
  3: { name: 'Europa League', tier: 1 },
  848: { name: 'Conference League', tier: 1 },
  94: { name: 'Primeira Liga (Portugal)', tier: 2 },
  88: { name: 'Eredivisie', tier: 2 },
  144: { name: 'Jupiler Pro League (Bélgica)', tier: 2 },
  203: { name: 'Super Lig (Turquia)', tier: 2 },
  179: { name: 'Scottish Premiership', tier: 2 },
  40: { name: 'Championship (ENG)', tier: 2 },
  141: { name: 'La Liga 2', tier: 2 },
  136: { name: 'Serie B (ITA)', tier: 2 },
  79: { name: '2. Bundesliga', tier: 2 },
  62: { name: 'Ligue 2', tier: 2 },
  71: { name: 'Brasileirão Série A', tier: 3 },
  72: { name: 'Brasileirão Série B', tier: 3 },
  128: { name: 'Liga Profesional (Argentina)', tier: 3 },
  13: { name: 'Libertadores', tier: 3 },
  11: { name: 'Copa Sudamericana', tier: 3 },
  218: { name: 'Bundesliga (Áustria)', tier: 3 },
  207: { name: 'Super League (Suíça)', tier: 3 },
  113: { name: 'Allsvenskan (Suécia)', tier: 3 },
  103: { name: 'Eliteserien (Noruega)', tier: 3 },
  119: { name: 'Superligaen (Dinamarca)', tier: 3 },
  106: { name: 'Ekstraklasa (Polônia)', tier: 3 },
  253: { name: 'MLS', tier: 4 },
  262: { name: 'Liga MX', tier: 4 },
  // Tier 4 — Ligas com odds menos eficientes (mais oportunidades de value)
  169: { name: 'Super Lig 1. Lig (Turquia 2)', tier: 4 },
  210: { name: 'Fortuna Liga (Eslováquia)', tier: 4 },
  197: { name: 'First League (Sérvia)', tier: 4 },
  283: { name: 'Liga Betplay (Colômbia)', tier: 4 },
  239: { name: 'A-League (Austrália)', tier: 4 },
  188: { name: 'Super League (Grécia)', tier: 4 },
  235: { name: 'Russian Premier League', tier: 4 },
  345: { name: 'Czech Liga', tier: 4 },
  307: { name: 'Saudi Pro League', tier: 4 },
  332: { name: 'Liga Portuguesa 2', tier: 4 },
  333: { name: 'K-League (Coreia)', tier: 4 },
  98: { name: 'J-League (Japão)', tier: 4 },
};

function getLeaguePriority(leagueId: number): number {
  const league = PRIORITY_LEAGUES[leagueId];
  if (league) return league.tier;
  return 10;
}

async function fetchOddsFromAPI(lang: string = 'pt') {
  if (!API_KEY) {
    secureLog('error', 'API_FOOTBALL_KEY não configurada no backend');
    throw new Error('Configuração do servidor incompleta');
  }

  const alerts = alertTranslations[lang] || alertTranslations['pt'];
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : lang === 'it' ? 'it-IT' : 'en-US';
  
  // Horário atual em UTC
  const nowUTC = new Date();
  
  // Horário atual em Brasília (UTC-3)
  const brazilOffsetMs = -3 * 60 * 60 * 1000; // -3 horas em ms
  const nowBrazil = new Date(nowUTC.getTime() + brazilOffsetMs);
  
  secureLog('info', 'Horário atual', { 
    utc: nowUTC.toISOString(),
    brazil: nowBrazil.toISOString(),
    brazilHour: nowBrazil.getUTCHours() + ':' + String(nowBrazil.getUTCMinutes()).padStart(2, '0')
  });
  
  let jogosEncontrados: any[] = [];
  let diaEncontrado = 0;
  let dataAlvo = nowBrazil;
  
  for (let diasNoFuturo = 0; diasNoFuturo <= 7; diasNoFuturo++) {
    // Data alvo baseada no horário de Brasília
    const targetDate = new Date(nowBrazil);
    targetDate.setUTCDate(targetDate.getUTCDate() + diasNoFuturo);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    secureLog('info', `Buscando fixtures para ${dateStr} (dia +${diasNoFuturo})`);
    
    try {
      const fixturesData = await apiFootballRequest('/fixtures', {
        date: dateStr,
        status: 'NS',
        timezone: 'America/Sao_Paulo'
      });
      
      if (fixturesData.response && fixturesData.response.length > 0) {
        // Limite mínimo: 50 minutos a partir de agora (em UTC)
        const limiteMinimo = new Date(nowUTC.getTime() + 50 * 60 * 1000);
        
        const jogosValidos = fixturesData.response.filter((fixture: any) => {
          // fixture.fixture.date vem em ISO UTC
          const dataJogoUTC = new Date(fixture.fixture.date);
          const valido = dataJogoUTC >= limiteMinimo;
          
          if (!valido) {
            secureLog('info', 'Jogo filtrado (começa em menos de 50min)', {
              jogo: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
              horarioUTC: dataJogoUTC.toISOString(),
              limite: limiteMinimo.toISOString()
            });
          }
          
          return valido;
        });
        
        if (jogosValidos.length > 0) {
          jogosValidos.sort((a: any, b: any) => {
            const prioA = getLeaguePriority(a.league.id);
            const prioB = getLeaguePriority(b.league.id);
            if (prioA !== prioB) return prioA - prioB;
            return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
          });
          
          jogosEncontrados = jogosValidos;
          diaEncontrado = diasNoFuturo;
          dataAlvo = targetDate;
          secureLog('info', `Encontrados ${jogosValidos.length} jogos válidos para dia +${diasNoFuturo}`);
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
  
  // Processar mais jogos para encontrar os melhores values
  // Ligas tier 1-2: pegar todos. Ligas tier 3-4: pegar até 15.
  const tier12Games = jogosEncontrados.filter((f: any) => getLeaguePriority(f.league.id) <= 2);
  const tier34Games = jogosEncontrados.filter((f: any) => getLeaguePriority(f.league.id) > 2 && getLeaguePriority(f.league.id) <= 4).slice(0, 15);
  const otherGames = jogosEncontrados.filter((f: any) => getLeaguePriority(f.league.id) > 4).slice(0, 10);
  
  const fixturesParaProcessar = [...tier12Games, ...tier34Games, ...otherGames].slice(0, 50);
  
  secureLog('info', `Pool expandido: ${tier12Games.length} tier1-2, ${tier34Games.length} tier3-4, ${otherGames.length} outras = ${fixturesParaProcessar.length} total`);
  const allGamesWithData: (Game & { qualityScore: number })[] = [];
  
  secureLog('info', `Processando ${fixturesParaProcessar.length} jogos para seleção inteligente`);
  
  for (let i = 0; i < fixturesParaProcessar.length; i++) {
    const fixture = fixturesParaProcessar[i];
    
    try {
      const fixtureId = fixture.fixture.id;
      
      if (i > 0) {
        await delay(400);
      }
      
      const [oddsData, advancedData] = await Promise.all([
        apiFootballRequest('/odds', { fixture: fixtureId.toString(), bookmaker: '8' }).catch(() => null),
        fetchAdvancedData(fixture)
      ]);
      
      let homeOdd = 0, drawOdd = 0, awayOdd = 0, overOdd = 0, underOdd = 0;
      let over15Odd = 0, under15Odd = 0, over35Odd = 0, under35Odd = 0, over45Odd = 0, under45Odd = 0;
      let bttsYesOdd = 0, bttsNoOdd = 0;
      let dcHomeDrawOdd = 0, dcAwayDrawOdd = 0, dcHomeAwayOdd = 0;
      let dnbOdd = 0;
      let bookmakerName = 'N/A';
      let hasValidOdds = false;
      
      if (oddsData?.response?.length > 0) {
        const bookmaker = oddsData.response[0]?.bookmakers?.[0];
        if (bookmaker) {
          bookmakerName = bookmaker.name;
          hasValidOdds = true;
          
          const matchWinner = bookmaker.bets?.find((b: any) => b.name === 'Match Winner');
          if (matchWinner) {
            homeOdd = parseFloat(matchWinner.values.find((v: any) => v.value === 'Home')?.odd) || 0;
            drawOdd = parseFloat(matchWinner.values.find((v: any) => v.value === 'Draw')?.odd) || 0;
            awayOdd = parseFloat(matchWinner.values.find((v: any) => v.value === 'Away')?.odd) || 0;
          }
          
          const goalsOU = bookmaker.bets?.find((b: any) => b.name === 'Goals Over/Under');
          if (goalsOU) {
            overOdd = parseFloat(goalsOU.values.find((v: any) => v.value === 'Over 2.5')?.odd) || 0;
            underOdd = parseFloat(goalsOU.values.find((v: any) => v.value === 'Under 2.5')?.odd) || 0;
          }

          // ===== NOVOS MERCADOS: Extrair odds reais =====
          over15Odd = parseFloat(goalsOU?.values?.find((v: any) => v.value === 'Over 1.5')?.odd) || 0;
          under15Odd = parseFloat(goalsOU?.values?.find((v: any) => v.value === 'Under 1.5')?.odd) || 0;
          over35Odd = parseFloat(goalsOU?.values?.find((v: any) => v.value === 'Over 3.5')?.odd) || 0;
          under35Odd = parseFloat(goalsOU?.values?.find((v: any) => v.value === 'Under 3.5')?.odd) || 0;
          over45Odd = parseFloat(goalsOU?.values?.find((v: any) => v.value === 'Over 4.5')?.odd) || 0;
          under45Odd = parseFloat(goalsOU?.values?.find((v: any) => v.value === 'Under 4.5')?.odd) || 0;

          const bttsBet = bookmaker.bets?.find((b: any) => b.name === 'Both Teams Score');
          bttsYesOdd = parseFloat(bttsBet?.values?.find((v: any) => v.value === 'Yes')?.odd) || 0;
          bttsNoOdd = parseFloat(bttsBet?.values?.find((v: any) => v.value === 'No')?.odd) || 0;

          const dcBet = bookmaker.bets?.find((b: any) => b.name === 'Double Chance');
          dcHomeDrawOdd = parseFloat(dcBet?.values?.find((v: any) => v.value === 'Home/Draw')?.odd) || 0;
          dcAwayDrawOdd = parseFloat(dcBet?.values?.find((v: any) => v.value === 'Draw/Away')?.odd) || 0;
          dcHomeAwayOdd = parseFloat(dcBet?.values?.find((v: any) => v.value === 'Home/Away')?.odd) || 0;

          const dnbBet = bookmaker.bets?.find((b: any) => b.name === 'Draw No Bet');
          dnbOdd = parseFloat(dnbBet?.values?.find((v: any) => v.value === 'Home')?.odd) || 0;
        }
      }
      
      let qualityScore = 0;
      const leagueId = fixture.league.id;
      const leagueTier = getLeaguePriority(leagueId);
      
      if (leagueTier === 1) qualityScore += 30;
      else if (leagueTier === 2) qualityScore += 22;
      else if (leagueTier === 3) qualityScore += 15;
      else if (leagueTier === 4) qualityScore += 8;
      
      if (hasValidOdds && homeOdd > 0 && awayOdd > 0) {
        qualityScore += 25;
        const oddsRange = Math.abs(homeOdd - awayOdd);
        if (oddsRange < 1.0) qualityScore += 10;
        else if (oddsRange < 2.0) qualityScore += 5;
      }
      
      if (advancedData.h2h && advancedData.h2h.totalGames >= 3) {
        qualityScore += 15;
      }
      
      if (advancedData.homeForm && advancedData.awayForm) {
        qualityScore += 10;
      }
      
      if (advancedData.homePosition && advancedData.awayPosition) {
        qualityScore += 10;
      }
      
      if (advancedData.homeStats && advancedData.awayStats) {
        qualityScore += 15;
      }
      
      if (advancedData.apiPrediction?.advice) {
        qualityScore += 10;
      }
      
      if (advancedData.homeInjuries !== undefined && advancedData.awayInjuries !== undefined) {
        qualityScore += 5;
      }
      
      secureLog('info', `Quality score para ${fixture.teams.home.name} vs ${fixture.teams.away.name}`, {
        leagueId,
        leagueTier,
        qualityScore,
        hasOdds: hasValidOdds
      });
      
      const startTimeUTC = new Date(fixture.fixture.date);
      const dayType = getDayType(diaEncontrado);
      
      // Converter para horário de Brasília (UTC-3)
      const brazilOffset = -3 * 60; // -3 horas em minutos
      const brazilTime = new Date(startTimeUTC.getTime() + (brazilOffset * 60 * 1000) + (startTimeUTC.getTimezoneOffset() * 60 * 1000));
      const brazilTimeStr = brazilTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      // Horário local do evento (do timezone da API)
      const localTimeStr = fixture.fixture.timestamp 
        ? new Date(fixture.fixture.timestamp * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
        : brazilTimeStr;
      
      if (hasValidOdds && homeOdd > 0) {
        allGamesWithData.push({
          id: fixtureId.toString(),
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          homeTeamId: fixture.teams.home.id,
          awayTeamId: fixture.teams.away.id,
          homeTeamLogo: fixture.teams.home.logo || `https://media.api-sports.io/football/teams/${fixture.teams.home.id}.png`,
          awayTeamLogo: fixture.teams.away.logo || `https://media.api-sports.io/football/teams/${fixture.teams.away.id}.png`,
          league: fixture.league.name,
          leagueId: fixture.league.id,
          leagueLogo: fixture.league.logo,
          season: fixture.league.season,
          startTime: startTimeUTC.toISOString(),
          startTimeUTC: startTimeUTC.toISOString(),
          brazilTime: brazilTimeStr,
          localTime: localTimeStr,
          bookmaker: bookmakerName,
          odds: {
            home: homeOdd, draw: drawOdd, away: awayOdd, over: overOdd, under: underOdd,
            over15: over15Odd || undefined,
            under15: under15Odd || undefined,
            over35: over35Odd || undefined,
            under35: under35Odd || undefined,
            over45: over45Odd || undefined,
            under45: under45Odd || undefined,
            bttsYes: bttsYesOdd || undefined,
            bttsNo: bttsNoOdd || undefined,
            doubleChanceHomeOrDraw: dcHomeDrawOdd || undefined,
            doubleChanceAwayOrDraw: dcAwayDrawOdd || undefined,
            doubleChanceHomeOrAway: dcHomeAwayOdd || undefined,
            drawNoBet: dnbOdd || undefined,
          },
          dayType,
          dayLabel: '',
          advancedData,
          qualityScore
        });
      }
      
      secureLog('info', `Jogo ${i + 1}/${fixturesParaProcessar.length} avaliado`, { 
        fixture: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
        qualityScore,
        hasOdds: hasValidOdds
      });
      
    } catch (err) {
      secureLog('error', 'Erro ao processar fixture', { fixtureId: fixture.fixture.id, error: String(err) });
    }
  }
  
  if (allGamesWithData.length === 0) {
    throw new Error('Não foi possível processar os jogos encontrados');
  }
  
  // ===== NOVA SELEÇÃO: Priorizar jogos COM VANTAGEM REAL =====
  
  // 1. Rodar a análise em todos os jogos para encontrar value
  const gamesWithAnalysis = allGamesWithData.map(game => {
    const analysis = analyzeBet(game as Game, lang);
    return { ...game, analysis, hasValue: !analysis.isSkip && (analysis.valuePercentage || 0) > 0 };
  });
  
  // 2. Separar: jogos com value vs jogos sem value  
  const gamesWithValue = gamesWithAnalysis
    .filter(g => g.hasValue)
    .sort((a, b) => (b.analysis.valuePercentage || 0) - (a.analysis.valuePercentage || 0));
    
  const gamesWithoutValue = gamesWithAnalysis
    .filter(g => !g.hasValue)
    .sort((a, b) => b.qualityScore - a.qualityScore);
  
  // 3. Selecionar: até 7 com value + até 3 sem value (para variedade)
  const selectedGames = [
    ...gamesWithValue.slice(0, 7),
    ...gamesWithoutValue.slice(0, Math.max(3, 10 - gamesWithValue.length))
  ].slice(0, 10);
  
  const gamesWithOdds: Game[] = selectedGames.map(({ qualityScore, hasValue, ...game }) => game as Game);
  
  secureLog('info', 'Seleção por VALUE', { 
    totalAvaliados: allGamesWithData.length,
    comValue: gamesWithValue.length,
    semValue: gamesWithoutValue.length,
    selecionados: gamesWithOdds.length,
    topValues: gamesWithValue.slice(0, 5).map(g => ({
      game: `${g.homeTeam} vs ${g.awayTeam}`,
      value: (g.analysis.valuePercentage || 0).toFixed(1) + '%',
      type: g.analysis.type,
      league: g.league
    }))
  });
  
  const diaTexto = dataAlvo.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  const mensagem = diaEncontrado === 0 ? alerts.today :
                   diaEncontrado === 1 ? alerts.tomorrow :
                   `${alerts.future} ${diaTexto}`;
  
  secureLog('info', 'Jogos processados com sucesso', { count: gamesWithOdds.length });
  
  // ===== SMART ACCUMULATOR BUILDER (PREMIUM) =====
  let smartAccumulators: SmartAccumulator[] = [];
  try {
    smartAccumulators = buildSmartAccumulators(gamesWithOdds, lang || 'pt');
    secureLog('info', 'Smart Accumulators built', { 
      eligible: gamesWithOdds.filter((g: any) => g.analysis && !g.analysis.isSkip).length,
      generated: smartAccumulators.length,
    });
  } catch (smartErr) {
    secureLog('warn', 'Smart Accumulator error', { error: String(smartErr) });
  }

  return { 
    games: gamesWithOdds,
    smartAccumulators: smartAccumulators,
    remaining: 100,
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
  return `odds_v3_${dataStr}`; // Nova versão do cache com pesos dinâmicos
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
  
  // Verifica se o primeiro jogo do cache já passou do limite de 50 minutos
  const cachedGames = data.data?.games;
  if (cachedGames && cachedGames.length > 0) {
    const agora = new Date();
    const limiteMinimo = new Date(agora.getTime() + 50 * 60 * 1000); // +50 min
    
    // Ordena por horário para pegar o primeiro
    const sortedGames = [...cachedGames].sort((a: any, b: any) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    const primeiroJogo = sortedGames[0];
    const horarioPrimeiroJogo = new Date(primeiroJogo.startTime);
    
    // Se o primeiro jogo já passou do limite de 50 minutos, invalida o cache
    if (horarioPrimeiroJogo < limiteMinimo) {
      secureLog('info', 'Cache invalidado - primeiro jogo já passou do limite de 50min', { 
        cacheKey,
        primeiroJogoHorario: primeiroJogo.startTime,
        limiteMinimo: limiteMinimo.toISOString()
      });
      
      // Deleta o cache inválido
      await supabaseAdmin
        .from('odds_cache')
        .delete()
        .eq('cache_key', cacheKey);
      
      return null;
    }
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
  const t = analysisTranslations[lang] || analysisTranslations['pt'];
  
  const games = cachedData.games.map((game: any) => {
    let translatedAdvancedData = game.advancedData;
    if (game.advancedData?.apiPrediction) {
      const prediction = game.advancedData.apiPrediction;
      translatedAdvancedData = {
        ...game.advancedData,
        apiPrediction: {
          ...prediction,
          advice: translateAdvice(prediction.advice, lang),
          winnerLabel: prediction.winner ? 
            (prediction.winner === 'Home' ? game.homeTeam : 
             prediction.winner === 'Away' ? game.awayTeam : 
             prediction.winner) : undefined,
          confidenceLabel: prediction.winnerConfidence ? 
            `${t.withConfidence} ${prediction.winnerConfidence}% ${t.confidence}` : undefined,
        }
      };
    }
    
    return {
      ...game,
      advancedData: translatedAdvancedData,
      dayLabel: getDayLabel(new Date(game.startTime), lang),
      analysis: analyzeBet({ ...game, advancedData: translatedAdvancedData } as Game, lang)
    };
  });
  
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
    alertMessage,
    _lang: lang
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // MODO DE MANUTENÇÃO - Desativar recomendações temporariamente
  const MAINTENANCE_MODE = Deno.env.get('EUGINE_MAINTENANCE_MODE') === 'true';
  if (MAINTENANCE_MODE) {
    secureLog('warn', 'MAINTENANCE_MODE_ACTIVE', {});
    return new Response(
      JSON.stringify({
        error: 'Sistema em manutenção. Voltaremos em breve.',
        games: [],
        remaining: 0,
        isToday: false,
        alertMessage: '⚠️ Sistema temporariamente indisponível para manutenção.',
        foundDate: new Date(),
        dailySearchesRemaining: 0,
        isTrial: false,
        userTier: 'maintenance',
        smartAccumulators: []
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
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

  // Enforce Origin allowlist (browser requests), but allow empty origin (server-to-server)
  if (origin && !isOriginAllowed(origin)) {
    secureLog('warn', 'Requisição de origem não autorizada', { origin });
    return new Response(
      JSON.stringify({ error: 'Origem não autorizada' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
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

    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier, subscription_status, trial_end_date, timezone, country_code, registration_source')
      .eq('user_id', userId)
      .single();
    
    const userTimezone = profileData?.timezone || 'America/Sao_Paulo';
    const userCountry = profileData?.country_code || 'BR';
    const registrationSource = profileData?.registration_source || 'organic';
    
    const isSubscribed = profileData?.subscription_status === 'active';
    
    const trialEndDate = profileData?.trial_end_date ? new Date(profileData.trial_end_date) : null;
    const isInTrial = trialEndDate ? trialEndDate >= new Date() : false;
    
    // Handle user tier based on registration source and subscription
    // FREE registration source users never get trial benefits
    const isFreeSource = registrationSource === 'free';
    
    let userTier = profileData?.subscription_tier || 'free';
    if (isFreeSource && !isSubscribed) {
      userTier = 'free'; // Free source users always stay as 'free' tier
    } else if (isInTrial && !isSubscribed) {
      userTier = 'premium'; // Organic trial users get premium features
    }
    
    secureLog('info', 'User tier', { tier: userTier, isSubscribed, isInTrial, isFreeSource, registrationSource });

    let dailySearchInfo = { remaining: -1, is_trial: false, registration_source: registrationSource };
    
    // FREE source users: 1 search/day, no trial benefits
    if (isFreeSource && !isSubscribed) {
      const { data: searchLimitData, error: searchLimitError } = await supabaseAdmin
        .rpc('increment_search_count', { p_user_id: userId });
      
      if (searchLimitError) {
        secureLog('error', 'Erro ao verificar limite de buscas (free)', { error: searchLimitError.message });
      } else if (searchLimitData && !searchLimitData.allowed) {
        secureLog('warn', 'Limite diário de buscas atingido (free user)', { userId: userId.substring(0, 8) + '...' });
        return new Response(
          JSON.stringify({ 
            error: 'Usuários grátis: apenas 1 relatório por dia. Assine um plano para acesso ilimitado.',
            dailyLimitReached: true,
            remaining: 0,
            isTrial: false,
            userTier: 'free',
            registrationSource: 'free',
            isFreeSource: true
          }), 
          { 
            status: 200, 
            headers: { 
              ...corsHeaders, 
              ...rateLimitHeaders,
              'Content-Type': 'application/json'
            } 
          }
        );
      }
      dailySearchInfo = searchLimitData || { remaining: 0, is_trial: false, registration_source: 'free' };
    }
    // Organic trial users: 3 searches/day with premium access
    else if (isInTrial && !isSubscribed) {
      const { data: searchLimitData, error: searchLimitError } = await supabaseAdmin
        .rpc('increment_search_count', { p_user_id: userId });
      
      if (searchLimitError) {
        secureLog('error', 'Erro ao verificar limite de buscas', { error: searchLimitError.message });
      } else if (searchLimitData && !searchLimitData.allowed) {
        secureLog('warn', 'Limite diário de buscas atingido', { userId: userId.substring(0, 8) + '...' });
        return new Response(
          JSON.stringify({ 
            error: 'Limite diário de buscas atingido. Assine um plano para buscas ilimitadas.',
            dailyLimitReached: true,
            remaining: 0,
            isTrial: true,
            userTier: 'premium'
          }), 
          { 
            status: 200, 
            headers: { 
              ...corsHeaders, 
              ...rateLimitHeaders,
              'Content-Type': 'application/json'
            } 
          }
        );
      }
      dailySearchInfo = searchLimitData || { remaining: -1, is_trial: true };
    } 
    // No subscription, no trial, not free source = blocked (expired trial)
    else if (!isSubscribed && !isInTrial && !isFreeSource) {
      return new Response(
        JSON.stringify({ 
          error: 'Período de trial expirado. Assine um plano para continuar.',
          trialExpired: true,
          isTrial: false,
          userTier: 'free'
        }), 
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            ...rateLimitHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    secureLog('info', 'Requisição autenticada', { 
      userId: userId.substring(0, 8) + '...', 
      lang: validLang,
      tier: userTier,
      rateLimitRemaining: rateLimit.remaining,
      dailySearchesRemaining: dailySearchInfo.remaining
    });

    const cachedData = await getFromCache(supabaseAdmin);
    
    // Função para filtrar jogos que já passaram do limite de 50 minutos
    const filterByTime = (data: any) => {
      if (!data?.games) return data;
      
      const agora = new Date();
      const limiteMinimo = new Date(agora.getTime() + 50 * 60 * 1000); // +50 min
      
      const jogosValidos = data.games.filter((game: any) => {
        const dataJogo = new Date(game.startTime);
        return dataJogo >= limiteMinimo;
      });
      
      if (jogosValidos.length === 0) {
        return { ...data, games: [], noGamesAvailable: true };
      }
      
      return { ...data, games: jogosValidos };
    };
    
    const filterDataByTier = (data: any, tier: string, registrationSource?: string) => {
      if (!data?.games) return data;
      
      // Free users (from "Receber Análise Grátis" button) get limited report
      // 3 best games, 1 combined odds bet, 1 zebra, games with odds > 1.8 and high win chance
      if (tier === 'free' && registrationSource === 'free') {
        // Sort games by confidence/win probability (best first)
        const sortedGames = [...data.games].sort((a: any, b: any) => {
          const aConf = a.analysis?.confidence || 0;
          const bConf = b.analysis?.confidence || 0;
          return bConf - aConf;
        });
        
        // Filter games with odds > 1.8 for better value
        const highValueGames = sortedGames.filter((g: any) => {
          const maxOdd = Math.max(g.odds?.home || 0, g.odds?.away || 0);
          return maxOdd >= 1.8;
        });
        
        // Take top 3 games (prefer high value, fallback to sorted)
        const selectedGames = (highValueGames.length >= 3 ? highValueGames : sortedGames).slice(0, 3);
        
        // Remove detailed analysis for free users
        const limitedGames = selectedGames.map((game: any) => {
          const filteredGame = { ...game };
          delete filteredGame.advancedData;
          if (filteredGame.analysis) {
            filteredGame.analysis.factors = [];
            filteredGame.analysis.confidence = undefined;
            filteredGame.analysis.valuePercentage = undefined;
          }
          return filteredGame;
        });
        
        return { 
          ...data, 
          games: limitedGames, 
          userTier: tier,
          isFreeReport: true,
          isFreeSource: true,
          // 1 accumulator (combined odds), 1 zebra, 0 premium doubles
          maxAccumulators: 1,
          maxZebras: 1,
          maxDoubles: 0
        };
      }
      
      const maxGames = tier === 'premium' ? 15 : tier === 'advanced' ? 8 : 5;
      const limitedGames = data.games.slice(0, maxGames);
      
      const filteredGames = limitedGames.map((game: any) => {
        const filteredGame = { ...game };
        
        if (tier === 'free' || tier === 'basic') {
          delete filteredGame.advancedData;
          if (filteredGame.analysis) {
            filteredGame.analysis.factors = [];
            filteredGame.analysis.confidence = undefined;
            filteredGame.analysis.valuePercentage = undefined;
          }
        } else if (tier === 'advanced') {
          if (filteredGame.advancedData) {
            // Advanced: remove Premium-only data
            delete filteredGame.advancedData.homeInjuryDetails;
            delete filteredGame.advancedData.awayInjuryDetails;
            delete filteredGame.advancedData.cornersData;
            delete filteredGame.advancedData.cardsData;
            delete filteredGame.advancedData.lineups;
            delete filteredGame.advancedData.bttsOdds;
            delete filteredGame.advancedData.topScorers;
          }
        }
        // Premium tier: keep all data including corners, cards, lineups, btts, topScorers
        // Premium users get FULL analysis cached for offline viewing
        
        return filteredGame;
      });
      
      return { 
        ...data, 
        games: filteredGames, 
        userTier: tier,
        // Flag to indicate if full analysis is available for offline
        fullAnalysisCached: tier === 'premium'
      };
    };
    
    // Function to enrich games with Premium data (on-demand)
    const enrichWithPremiumData = async (data: any) => {
      if (!data?.games || data.games.length === 0) return data;
      
      secureLog('info', 'Enriching games with Premium data');
      
      const enrichedGames = await Promise.all(
        data.games.slice(0, 5).map(async (game: any, index: number) => { // Limit to 5 to save API calls
          if (index > 0) await delay(300);
          
          try {
            const fixtureId = parseInt(game.id);
            const leagueId = game.leagueId;
            const season = game.season;
            const homeTeamId = game.homeTeamId;
            const awayTeamId = game.awayTeamId;
            
            // Fetch Premium data in parallel
            const [bttsOdds, lineups, topScorers, homeCardsStats, awayCardsStats] = await Promise.all([
              fetchBTTSOdds(fixtureId),
              fetchLineups(fixtureId),
              fetchTopScorers(leagueId, season),
              fetchCardsStats(homeTeamId, leagueId, season),
              fetchCardsStats(awayTeamId, leagueId, season)
            ]);
            
            // Enrich advancedData
            const enrichedAdvancedData = { ...game.advancedData };
            
            if (bttsOdds && bttsOdds.yes > 0) {
              enrichedAdvancedData.bttsOdds = bttsOdds;
            }
            
            if (lineups) {
              enrichedAdvancedData.lineups = lineups;
            }
            
            if (topScorers) {
              const homeName = game.homeTeam;
              const awayName = game.awayTeam;
              enrichedAdvancedData.topScorers = {
                home: topScorers.filter((s: TopScorerInfo) => s.team === homeName),
                away: topScorers.filter((s: TopScorerInfo) => s.team === awayName)
              };
            }
            
            if (homeCardsStats && awayCardsStats) {
              const totalAvgCards = homeCardsStats.avgYellow + awayCardsStats.avgYellow;
              enrichedAdvancedData.cardsData = {
                homeAvgYellow: homeCardsStats.avgYellow,
                awayAvgYellow: awayCardsStats.avgYellow,
                homeAvgRed: homeCardsStats.avgRed,
                awayAvgRed: awayCardsStats.avgRed,
                over35CardsPercentage: totalAvgCards >= 3.5 ? 68 : totalAvgCards >= 3 ? 55 : 45,
                over45CardsPercentage: totalAvgCards >= 4.5 ? 55 : totalAvgCards >= 4 ? 45 : 35
              };
            }
            
            // Estimate corners based on team style
            if (game.advancedData?.homeStats && game.advancedData?.awayStats) {
              const homeAttack = game.advancedData.homeStats.avgGoalsScored || 1.2;
              const awayAttack = game.advancedData.awayStats.avgGoalsScored || 1.0;
              const avgCorners = 8 + (homeAttack + awayAttack) * 0.8;
              
              enrichedAdvancedData.cornersData = {
                homeAvgCorners: 5 + homeAttack * 0.5,
                awayAvgCorners: 4.5 + awayAttack * 0.5,
                homeAvgCornersFor: 3 + homeAttack * 0.3,
                awayAvgCornersFor: 2.8 + awayAttack * 0.3,
                homeAvgCornersAgainst: 2 + (game.advancedData.homeStats.avgGoalsConceded || 1) * 0.3,
                awayAvgCornersAgainst: 2.2 + (game.advancedData.awayStats.avgGoalsConceded || 1) * 0.3,
                over95Percentage: avgCorners >= 9.5 ? 62 : avgCorners >= 8.5 ? 52 : 42,
                over105Percentage: avgCorners >= 10.5 ? 48 : avgCorners >= 9.5 ? 38 : 28
              };
            }
            
            return { ...game, advancedData: enrichedAdvancedData };
          } catch (err) {
            secureLog('warn', 'Error enriching game with premium data', { gameId: game.id });
            return game;
          }
        })
      );
      
      // Keep remaining games without enrichment
      const remainingGames = data.games.slice(5);
      
      return { ...data, games: [...enrichedGames, ...remainingGames] };
    };
    
    if (cachedData) {
      let translatedData = translateCachedData(cachedData, validLang);
      let timeFilteredData = filterByTime(translatedData);
      
      // Enrich with Premium data if user is Premium
      if (userTier === 'premium' && timeFilteredData.games?.length > 0) {
        try {
          timeFilteredData = await enrichWithPremiumData(timeFilteredData);
        } catch (err) {
          secureLog('warn', 'Failed to enrich with premium data, using base data');
        }
      }
      
      const filteredData = filterDataByTier(timeFilteredData, userTier, registrationSource);
      filteredData.fromCache = true;
      filteredData.dailySearchesRemaining = dailySearchInfo.remaining;
      filteredData.isTrial = dailySearchInfo.is_trial;
      filteredData.userTier = userTier;
      filteredData.userTimezone = userTimezone;
      filteredData.userCountry = userCountry;
      filteredData.registrationSource = registrationSource;
      
      // ===== SMART ACCUMULATOR BUILDER (PREMIUM - from cached data) =====
      if (userTier === 'premium' && filteredData.games?.length > 0) {
        try {
          filteredData.smartAccumulators = buildSmartAccumulators(filteredData.games, validLang);
          secureLog('info', 'Smart Accumulators built (cached path)', { generated: filteredData.smartAccumulators.length });
        } catch (smartErr) {
          secureLog('warn', 'Smart Accumulator error (cached)', { error: String(smartErr) });
          filteredData.smartAccumulators = [];
        }
      }
      
      // ===== SALVAR NO TRACKING AUTOMATICAMENTE =====
      try {
        const gamesToTrack = (filteredData.games || []).filter((g: any) => g.analysis && !g.analysis.isSkip);
        for (const game of gamesToTrack) {
          await supabaseAdmin.from('bet_tracking').upsert({
            fixture_id: String(game.id),
            home_team: game.homeTeam,
            away_team: game.awayTeam,
            league: game.league,
            match_date: new Date(game.startTime).toISOString().split('T')[0],
            bet_type: game.analysis.type || 'unknown',
            bet_label: game.analysis.type || '',
            odd: game.analysis.profit ? (game.analysis.profit / 40) + 1 : 1.50,
            implied_probability: game.analysis.impliedProbability || 50,
            estimated_probability: game.analysis.estimatedProbability || 50,
            value_edge: game.analysis.valuePercentage || 0,
            confidence: game.analysis.confidence || 50,
            was_skip: false,
          }, { onConflict: 'fixture_id' });
        }
        secureLog('info', 'Tracking saved', { count: gamesToTrack.length });
      } catch (trackErr) {
        secureLog('warn', 'Error saving tracking', { error: String(trackErr) });
      }
      
      return new Response(
        JSON.stringify(filteredData),
        { headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } }
      );
    }

    secureLog('info', 'Buscando dados frescos da API-Football (modo avançado v2)');
    const result = await fetchOddsFromAPI(validLang);
    
    saveToCache(supabaseAdmin, result).catch(err => 
      secureLog('error', 'Erro ao salvar cache em background')
    );
    
    let translatedResult = translateCachedData(result, validLang);
    
    // Enrich with Premium data if user is Premium
    if (userTier === 'premium' && translatedResult.games?.length > 0) {
      try {
        translatedResult = await enrichWithPremiumData(translatedResult);
      } catch (err) {
        secureLog('warn', 'Failed to enrich fresh data with premium data, using base data');
      }
    }
    
    const filteredResult = filterDataByTier(translatedResult, userTier, registrationSource);
    
    // ===== SMART ACCUMULATOR BUILDER (PREMIUM - fresh data) =====
    let freshSmartAccumulators: SmartAccumulator[] = [];
    if (userTier === 'premium' && filteredResult.games?.length > 0) {
      try {
        freshSmartAccumulators = buildSmartAccumulators(filteredResult.games, validLang);
        secureLog('info', 'Smart Accumulators built (fresh path)', { generated: freshSmartAccumulators.length });
      } catch (smartErr) {
        secureLog('warn', 'Smart Accumulator error (fresh)', { error: String(smartErr) });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        ...filteredResult, 
        smartAccumulators: freshSmartAccumulators,
        fromCache: false,
        dailySearchesRemaining: dailySearchInfo.remaining,
        isTrial: dailySearchInfo.is_trial,
        userTier: userTier,
        userTimezone: userTimezone,
        userCountry: userCountry,
        registrationSource: registrationSource
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