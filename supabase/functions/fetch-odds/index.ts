import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============= CONFIGURAÇÕES DE SEGURANÇA =============

const ALLOWED_ORIGINS = [
  'https://game-smart-pro.eugine.app',
  'https://eugine-analytics.com',
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
  league: string;
  leagueId?: number;
  season?: number;
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

interface AdvancedGameData {
  h2h?: {
    totalGames: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    avgGoals: number;
    lastGames: { home: number; away: number; date: string }[];
  };
  homeStats?: TeamStats;
  awayStats?: TeamStats;
  homePosition?: number;
  awayPosition?: number;
  homeForm?: string;
  awayForm?: string;
  homeInjuries?: number;
  awayInjuries?: number;
  apiPrediction?: {
    winner?: string;
    winnerConfidence?: number;
    homeGoals?: string;
    awayGoals?: string;
    advice?: string;
    under_over?: string;
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

const MIN_VALUE_THRESHOLD = 5; // 5% de edge mínimo
const MIN_CONFIDENCE_THRESHOLD = 65; // 65% de confiança mínima

function calculateImpliedProbability(odds: number): number {
  if (odds <= 1) return 100;
  return (1 / odds) * 100;
}

function calculateValue(estimatedProb: number, odds: number): number {
  const impliedProb = calculateImpliedProbability(odds);
  // Value = (Prob Estimada / Prob Implícita - 1) * 100
  const value = ((estimatedProb / impliedProb) - 1) * 100;
  return Math.round(value * 100) / 100;
}

function shouldSkipBet(confidence: number, value: number): { skip: boolean; reason?: string } {
  if (confidence < MIN_CONFIDENCE_THRESHOLD) {
    return { skip: true, reason: `Confiança baixa (${confidence}% < ${MIN_CONFIDENCE_THRESHOLD}%)` };
  }
  if (value < MIN_VALUE_THRESHOLD) {
    return { skip: true, reason: `Sem edge suficiente (Value ${value.toFixed(1)}% < ${MIN_VALUE_THRESHOLD}%)` };
  }
  return { skip: false };
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
  
  // ===== DETERMINAR MELHOR APOSTA COM VALUE =====
  const allScores = [
    { type: t.over25, score: over25Score, odd: game.odds.over, betType: 'over25' as const },
    { type: t.under25, score: under25Score, odd: game.odds.under, betType: 'under25' as const },
    { type: t.btts, score: bttsScore, odd: (game.odds.home + game.odds.away) / 2, betType: 'btts' as const },
    { type: t.homeWin, score: homeWinScore, odd: game.odds.home, betType: 'home' as const },
    { type: t.awayWin, score: awayWinScore, odd: game.odds.away, betType: 'away' as const },
    { type: t.draw, score: drawScore, odd: game.odds.draw, betType: 'draw' as const },
  ];
  
  // Calcular value para cada aposta
  const scoresWithValue = allScores.map(bet => {
    const estimatedProb = Math.min(100, Math.max(0, bet.score));
    const impliedProb = calculateImpliedProbability(bet.odd);
    const value = calculateValue(estimatedProb, bet.odd);
    
    return {
      ...bet,
      estimatedProb,
      impliedProb,
      value,
    };
  });
  
  // Ordenar por score (confiança)
  scoresWithValue.sort((a, b) => b.score - a.score);
  const best = scoresWithValue[0];
  
  // Calcular confiança (0-100)
  const confidence = Math.min(100, Math.max(30, best.score));
  
  // Verificar se deve fazer skip
  const skipCheck = shouldSkipBet(confidence, best.value);
  
  if (skipCheck.skip) {
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
    const estimatedProb = 55;
    const value = calculateValue(estimatedProb, game.odds.over);
    
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
  const estimatedProb = 50;
  const value = calculateValue(estimatedProb, avgOdd);
  
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
      bttsPercentage: 100 - cleanSheets - failedToScore + (cleanSheets * failedToScore / 100),
      over25Percentage: (goalsFor + goalsAgainst) / totalGames >= 2.5 ? 65 : 45,
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

async function fetchStandings(leagueId: number, season: number, teamId: number): Promise<{ position: number; form: string } | undefined> {
  try {
    const data = await apiFootballRequest('/standings', {
      league: leagueId.toString(),
      season: season.toString()
    });
    
    if (!data.response || !data.response[0]?.league?.standings) return undefined;
    
    const standings = data.response[0].league.standings[0];
    const teamStanding = standings.find((s: any) => s.team.id === teamId);
    
    if (!teamStanding) return undefined;
    
    return {
      position: teamStanding.rank,
      form: teamStanding.form || ''
    };
  } catch (err) {
    secureLog('warn', 'Erro ao buscar standings', { leagueId, error: String(err) });
    return undefined;
  }
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
    
    const pred = data.response[0].predictions;
    
    return {
      winner: pred?.winner?.name,
      winnerConfidence: pred?.percent?.home ? parseInt(pred.percent.home) : undefined,
      homeGoals: pred?.goals?.home,
      awayGoals: pred?.goals?.away,
      advice: pred?.advice,
      under_over: pred?.under_over
    };
  } catch (err) {
    secureLog('warn', 'Erro ao buscar previsão', { fixtureId, error: String(err) });
    return undefined;
  }
}

// ============= BUSCAR DADOS COMPLETOS =============

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAdvancedData(fixture: any): Promise<AdvancedGameData> {
  const homeTeamId = fixture.teams.home.id;
  const awayTeamId = fixture.teams.away.id;
  const leagueId = fixture.league.id;
  const season = fixture.league.season;
  const fixtureId = fixture.fixture.id;
  
  secureLog('info', 'Buscando dados avançados', { 
    fixture: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
    fixtureId 
  });
  
  const [h2h, homeStanding, awayStanding] = await Promise.all([
    fetchH2H(homeTeamId, awayTeamId),
    fetchStandings(leagueId, season, homeTeamId),
    fetchStandings(leagueId, season, awayTeamId),
  ]);
  
  await delay(200);
  
  const [homeStats, awayStats, homeInjuries, awayInjuries, prediction] = await Promise.all([
    fetchTeamStats(homeTeamId, leagueId, season),
    fetchTeamStats(awayTeamId, leagueId, season),
    fetchInjuries(homeTeamId, fixtureId),
    fetchInjuries(awayTeamId, fixtureId),
    fetchPrediction(fixtureId)
  ]);
  
  return {
    h2h,
    homeStats,
    awayStats,
    homePosition: homeStanding?.position,
    awayPosition: awayStanding?.position,
    homeForm: homeStanding?.form,
    awayForm: awayStanding?.form,
    homeInjuries,
    awayInjuries,
    apiPrediction: prediction
  };
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
  
  const hoje = new Date();
  let jogosEncontrados: any[] = [];
  let diaEncontrado = 0;
  let dataAlvo = hoje;
  
  for (let diasNoFuturo = 0; diasNoFuturo <= 7; diasNoFuturo++) {
    const targetDate = new Date(hoje);
    targetDate.setDate(targetDate.getDate() + diasNoFuturo);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    secureLog('info', `Buscando fixtures para ${dateStr}`);
    
    try {
      const fixturesData = await apiFootballRequest('/fixtures', {
        date: dateStr,
        status: 'NS',
        timezone: 'America/Sao_Paulo'
      });
      
      if (fixturesData.response && fixturesData.response.length > 0) {
        const agora = new Date();
        const limiteMinimo = new Date(agora.getTime() + 10 * 60 * 1000);
        
        const jogosValidos = fixturesData.response.filter((fixture: any) => {
          const dataJogo = new Date(fixture.fixture.date);
          return dataJogo > limiteMinimo;
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
  
  const fixturesParaProcessar = jogosEncontrados.slice(0, 25);
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
      
      const startTime = new Date(fixture.fixture.date);
      const dayType = getDayType(diaEncontrado);
      
      if (hasValidOdds && homeOdd > 0) {
        allGamesWithData.push({
          id: fixtureId.toString(),
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          homeTeamId: fixture.teams.home.id,
          awayTeamId: fixture.teams.away.id,
          league: fixture.league.name,
          leagueId: fixture.league.id,
          season: fixture.league.season,
          startTime: startTime.toISOString(),
          bookmaker: bookmakerName,
          odds: { home: homeOdd, draw: drawOdd, away: awayOdd, over: overOdd, under: underOdd },
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
  
  allGamesWithData.sort((a, b) => b.qualityScore - a.qualityScore);
  
  const gamesWithOdds: Game[] = allGamesWithData.slice(0, 10).map(({ qualityScore, ...game }) => game);
  
  secureLog('info', 'Jogos selecionados por qualidade', { 
    totalAvaliados: allGamesWithData.length,
    selecionados: gamesWithOdds.length,
    topScores: allGamesWithData.slice(0, 10).map(g => ({ 
      game: `${g.homeTeam} vs ${g.awayTeam}`, 
      score: g.qualityScore 
    }))
  });
  
  const diaTexto = dataAlvo.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
  const mensagem = diaEncontrado === 0 ? alerts.today :
                   diaEncontrado === 1 ? alerts.tomorrow :
                   `${alerts.future} ${diaTexto}`;
  
  secureLog('info', 'Jogos processados com sucesso', { count: gamesWithOdds.length });
  
  return { 
    games: gamesWithOdds,
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
      .select('subscription_tier, subscription_status, trial_end_date, timezone, country_code')
      .eq('user_id', userId)
      .single();
    
    const userTimezone = profileData?.timezone || 'America/Sao_Paulo';
    const userCountry = profileData?.country_code || 'BR';
    
    const isSubscribed = profileData?.subscription_status === 'active';
    
    const trialEndDate = profileData?.trial_end_date ? new Date(profileData.trial_end_date) : null;
    const isInTrial = trialEndDate ? trialEndDate >= new Date() : false;
    
    let userTier = profileData?.subscription_tier || 'free';
    if (isInTrial && !isSubscribed) {
      userTier = 'premium';
    }
    
    secureLog('info', 'User tier', { tier: userTier, isSubscribed, isInTrial });

    let dailySearchInfo = { remaining: -1, is_trial: false };
    
    if (isInTrial && !isSubscribed) {
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
    } else if (!isSubscribed && !isInTrial) {
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
    
    const filterDataByTier = (data: any, tier: string) => {
      if (!data?.games) return data;
      
      const maxGames = tier === 'premium' ? 10 : 5;
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
            delete filteredGame.advancedData.homeInjuries;
            delete filteredGame.advancedData.awayInjuries;
            delete filteredGame.advancedData.apiPrediction;
            delete filteredGame.advancedData.homeStats;
            delete filteredGame.advancedData.awayStats;
          }
        }
        
        return filteredGame;
      });
      
      return { ...data, games: filteredGames, userTier: tier };
    };
    
    if (cachedData) {
      const translatedData = translateCachedData(cachedData, validLang);
      const filteredData = filterDataByTier(translatedData, userTier);
      filteredData.fromCache = true;
      filteredData.dailySearchesRemaining = dailySearchInfo.remaining;
      filteredData.isTrial = dailySearchInfo.is_trial;
      filteredData.userTier = userTier;
      filteredData.userTimezone = userTimezone;
      filteredData.userCountry = userCountry;
      
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
    
    const translatedResult = translateCachedData(result, validLang);
    const filteredResult = filterDataByTier(translatedResult, userTier);
    
    return new Response(
      JSON.stringify({ 
        ...filteredResult, 
        fromCache: false,
        dailySearchesRemaining: dailySearchInfo.remaining,
        isTrial: dailySearchInfo.is_trial,
        userTier: userTier,
        userTimezone: userTimezone,
        userCountry: userCountry
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