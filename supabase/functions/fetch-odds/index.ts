import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============= CONFIGURAÇÕES DE SEGURANÇA =============

const ALLOWED_ORIGINS = [
  'https://game-smart-pro.eugine.app',
  'https://eugine-analytics.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const isAllowed = !!origin && (
    ALLOWED_ORIGINS.some(allowed => origin.includes(allowed.replace('https://', '').replace('http://', ''))) ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  );

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '*',
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
}

interface BettingAnalysis {
  type: string;
  reason: string;
  profit: number;
  confidence?: number;
  factors?: AnalysisFactor[];
}

interface AnalysisFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

// Traduções das análises
const analysisTranslations: Record<string, Record<string, any>> = {
  pt: {
    over25: 'MAIS DE 2.5 GOLS',
    under25: 'MENOS DE 2.5 GOLS',
    btts: 'AMBAS MARCAM',
    bttsNo: 'AMBAS NÃO MARCAM',
    homeWin: 'VITÓRIA CASA',
    awayWin: 'VITÓRIA FORA',
    draw: 'EMPATE',
    highConfidence: 'Alta confiança baseada em análise completa',
    h2hFactor: 'Histórico de confrontos',
    formFactor: 'Forma recente',
    statsFactor: 'Estatísticas da temporada',
    predictionFactor: 'Previsão Analítica Matemática',
    injuriesFactor: 'Lesões e desfalques',
    standingsFactor: 'Posição na tabela',
  },
  en: {
    over25: 'OVER 2.5 GOALS',
    under25: 'UNDER 2.5 GOALS',
    btts: 'BOTH TEAMS TO SCORE',
    bttsNo: 'NO BTTS',
    homeWin: 'HOME WIN',
    awayWin: 'AWAY WIN',
    draw: 'DRAW',
    highConfidence: 'High confidence based on complete analysis',
    h2hFactor: 'Head to head history',
    formFactor: 'Recent form',
    statsFactor: 'Season statistics',
    predictionFactor: 'Mathematical Analytical Prediction',
    injuriesFactor: 'Injuries and absences',
    standingsFactor: 'League position',
  },
  es: {
    over25: 'MÁS DE 2.5 GOLES',
    under25: 'MENOS DE 2.5 GOLES',
    btts: 'AMBOS MARCAN',
    bttsNo: 'AMBOS NO MARCAN',
    homeWin: 'VICTORIA LOCAL',
    awayWin: 'VICTORIA VISITANTE',
    draw: 'EMPATE',
    highConfidence: 'Alta confianza basada en análisis completo',
    h2hFactor: 'Historial de enfrentamientos',
    formFactor: 'Forma reciente',
    statsFactor: 'Estadísticas de temporada',
    predictionFactor: 'Predicción Analítica Matemática',
    injuriesFactor: 'Lesiones y ausencias',
    standingsFactor: 'Posición en la tabla',
  },
  it: {
    over25: 'PIÙ DI 2.5 GOL',
    under25: 'MENO DI 2.5 GOL',
    btts: 'ENTRAMBE SEGNANO',
    bttsNo: 'ENTRAMBE NON SEGNANO',
    homeWin: 'VITTORIA CASA',
    awayWin: 'VITTORIA TRASFERTA',
    draw: 'PAREGGIO',
    highConfidence: 'Alta fiducia basata su analisi completa',
    h2hFactor: 'Storico scontri diretti',
    formFactor: 'Forma recente',
    statsFactor: 'Statistiche stagionali',
    predictionFactor: 'Previsione Analitica Matematica',
    injuriesFactor: 'Infortuni e assenze',
    standingsFactor: 'Posizione in classifica',
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

// ============= MOTOR DE ANÁLISE AVANÇADO =============

function analyzeAdvanced(game: Game, lang: string = 'pt'): BettingAnalysis {
  const betAmount = 40;
  const t = analysisTranslations[lang] || analysisTranslations['pt'];
  const factors: AnalysisFactor[] = [];
  
  // Scores para cada tipo de aposta
  let over25Score = 50;
  let under25Score = 50;
  let bttsScore = 50;
  let homeWinScore = 50;
  let awayWinScore = 50;
  let drawScore = 50;
  
  const adv = game.advancedData;
  
  // ===== 1. ANÁLISE DO H2H (peso: 20%) =====
  if (adv?.h2h && adv.h2h.totalGames >= 3) {
    const h2h = adv.h2h;
    
    // Over/Under baseado na média de gols histórica
    if (h2h.avgGoals >= 3.0) {
      over25Score += 15;
      under25Score -= 10;
      factors.push({ name: t.h2hFactor, impact: 'positive', weight: 15, description: `Média ${h2h.avgGoals.toFixed(1)} gols nos confrontos` });
    } else if (h2h.avgGoals <= 2.0) {
      under25Score += 15;
      over25Score -= 10;
      factors.push({ name: t.h2hFactor, impact: 'positive', weight: 15, description: `Média baixa: ${h2h.avgGoals.toFixed(1)} gols` });
    }
    
    // Resultado baseado no histórico
    const homeWinRate = h2h.homeWins / h2h.totalGames;
    const awayWinRate = h2h.awayWins / h2h.totalGames;
    if (homeWinRate >= 0.6) {
      homeWinScore += 12;
      factors.push({ name: t.h2hFactor, impact: 'positive', weight: 12, description: `Casa venceu ${(homeWinRate * 100).toFixed(0)}% dos jogos` });
    } else if (awayWinRate >= 0.5) {
      awayWinScore += 12;
      factors.push({ name: t.h2hFactor, impact: 'positive', weight: 12, description: `Visitante venceu ${(awayWinRate * 100).toFixed(0)}% dos jogos` });
    }
  }
  
  // ===== 2. ANÁLISE DE FORMA (peso: 20%) =====
  if (adv?.homeForm && adv?.awayForm) {
    const countWins = (form: string) => (form.match(/W/g) || []).length;
    const countLosses = (form: string) => (form.match(/L/g) || []).length;
    
    const homeWins = countWins(adv.homeForm);
    const awayWins = countWins(adv.awayForm);
    const homeLosses = countLosses(adv.homeForm);
    const awayLosses = countLosses(adv.awayForm);
    
    if (homeWins >= 4) {
      homeWinScore += 15;
      factors.push({ name: t.formFactor, impact: 'positive', weight: 15, description: `Casa: ${homeWins} vitórias nos últimos 5` });
    }
    if (awayWins >= 4) {
      awayWinScore += 15;
      factors.push({ name: t.formFactor, impact: 'positive', weight: 15, description: `Visitante: ${awayWins} vitórias nos últimos 5` });
    }
    if (homeLosses >= 3 && awayLosses >= 3) {
      drawScore += 10;
    }
  }
  
  // ===== 3. ANÁLISE DE ESTATÍSTICAS (peso: 25%) =====
  if (adv?.homeStats && adv?.awayStats) {
    const homeStats = adv.homeStats;
    const awayStats = adv.awayStats;
    
    // Over 2.5 baseado em média de gols
    const avgGoalsTotal = homeStats.avgGoalsScored + awayStats.avgGoalsScored;
    if (avgGoalsTotal >= 3.2) {
      over25Score += 20;
      factors.push({ name: t.statsFactor, impact: 'positive', weight: 20, description: `Média combinada: ${avgGoalsTotal.toFixed(1)} gols/jogo` });
    } else if (avgGoalsTotal <= 2.0) {
      under25Score += 20;
      factors.push({ name: t.statsFactor, impact: 'positive', weight: 20, description: `Média baixa: ${avgGoalsTotal.toFixed(1)} gols/jogo` });
    }
    
    // BTTS baseado em percentual histórico
    const avgBtts = (homeStats.bttsPercentage + awayStats.bttsPercentage) / 2;
    if (avgBtts >= 60) {
      bttsScore += 18;
      factors.push({ name: t.statsFactor, impact: 'positive', weight: 18, description: `BTTS ${avgBtts.toFixed(0)}% das partidas` });
    } else if (avgBtts <= 35) {
      bttsScore -= 15;
    }
    
    // Over 2.5 baseado em percentual histórico
    const avgOver25 = (homeStats.over25Percentage + awayStats.over25Percentage) / 2;
    if (avgOver25 >= 65) {
      over25Score += 18;
      factors.push({ name: t.statsFactor, impact: 'positive', weight: 18, description: `Over 2.5 em ${avgOver25.toFixed(0)}% dos jogos` });
    }
    
    // Clean sheets vs Failed to score
    if (homeStats.cleanSheets >= 40 && awayStats.failedToScore >= 40) {
      under25Score += 12;
      homeWinScore += 8;
    }
  }
  
  // ===== 4. ANÁLISE DE POSIÇÃO NA TABELA (peso: 15%) =====
  if (adv?.homePosition && adv?.awayPosition) {
    const posDiff = adv.awayPosition - adv.homePosition;
    
    if (posDiff >= 10) {
      // Casa muito melhor posicionada
      homeWinScore += 12;
      factors.push({ name: t.standingsFactor, impact: 'positive', weight: 12, description: `Casa: ${adv.homePosition}º vs Fora: ${adv.awayPosition}º` });
    } else if (posDiff <= -10) {
      // Visitante muito melhor posicionado
      awayWinScore += 12;
      factors.push({ name: t.standingsFactor, impact: 'positive', weight: 12, description: `Fora: ${adv.awayPosition}º vs Casa: ${adv.homePosition}º` });
    } else if (Math.abs(posDiff) <= 3) {
      drawScore += 8;
    }
  }
  
  // ===== 5. ANÁLISE DE LESÕES (peso: 10%) =====
  if (adv?.homeInjuries !== undefined && adv?.awayInjuries !== undefined) {
    if (adv.homeInjuries >= 3) {
      homeWinScore -= 10;
      awayWinScore += 8;
      factors.push({ name: t.injuriesFactor, impact: 'negative', weight: 10, description: `Casa: ${adv.homeInjuries} desfalques` });
    }
    if (adv.awayInjuries >= 3) {
      awayWinScore -= 10;
      homeWinScore += 8;
      factors.push({ name: t.injuriesFactor, impact: 'negative', weight: 10, description: `Visitante: ${adv.awayInjuries} desfalques` });
    }
  }
  
  // ===== 6. PREVISÃO DA API (peso: 10%) =====
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
      factors.push({ name: t.predictionFactor, impact: 'positive', weight: 12, description: `${pred.winner} com ${pred.winnerConfidence}% de confiança` });
    }
  }
  
  // ===== DETERMINAR MELHOR APOSTA =====
  const allScores = [
    { type: t.over25, score: over25Score, odd: game.odds.over },
    { type: t.under25, score: under25Score, odd: game.odds.under },
    { type: t.btts, score: bttsScore, odd: (game.odds.home + game.odds.away) / 2 },
    { type: t.homeWin, score: homeWinScore, odd: game.odds.home },
    { type: t.awayWin, score: awayWinScore, odd: game.odds.away },
    { type: t.draw, score: drawScore, odd: game.odds.draw },
  ];
  
  // Ordenar por score
  allScores.sort((a, b) => b.score - a.score);
  const best = allScores[0];
  
  // Calcular confiança (0-100)
  const confidence = Math.min(100, Math.max(30, best.score));
  
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
    factors: factors.slice(0, 5)
  };
}

// Fallback para análise simples quando não há dados avançados
function analyzeSimple(game: Game, lang: string = 'pt'): BettingAnalysis {
  const betAmount = 40;
  const t = analysisTranslations[lang] || analysisTranslations['pt'];
  
  if (game.odds.over > 0 && game.odds.over < 2.0) {
    return {
      type: t.over25,
      reason: `Odd de ${game.odds.over.toFixed(2)} indica alta expectativa de gols.`,
      profit: parseFloat((betAmount * game.odds.over - betAmount).toFixed(2)),
      confidence: 55
    };
  }
  
  const avgOdd = (game.odds.home + game.odds.away) / 2;
  return {
    type: t.btts,
    reason: `Jogo equilibrado com odds similares (Casa: ${game.odds.home.toFixed(2)} / Fora: ${game.odds.away.toFixed(2)}).`,
    profit: parseFloat((betAmount * avgOdd - betAmount).toFixed(2)),
    confidence: 50
  };
}

function analyzeBet(game: Game, lang: string = 'pt'): BettingAnalysis {
  // Se temos dados avançados, usar análise completa
  if (game.advancedData && Object.keys(game.advancedData).length > 0) {
    return analyzeAdvanced(game, lang);
  }
  // Fallback para análise simples
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
      
      // Verificar se o time "home" do nosso fixture é o "home" ou "away" no H2H
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
    
    // Calcular percentuais
    const cleanSheets = ((stats.clean_sheet?.total || 0) / totalGames) * 100;
    const failedToScore = ((stats.failed_to_score?.total || 0) / totalGames) * 100;
    
    return {
      goalsScored: goalsFor,
      goalsConceded: goalsAgainst,
      avgGoalsScored: goalsFor / totalGames,
      avgGoalsConceded: goalsAgainst / totalGames,
      cleanSheets,
      failedToScore,
      bttsPercentage: 100 - cleanSheets - failedToScore + (cleanSheets * failedToScore / 100), // Aproximação
      over25Percentage: (goalsFor + goalsAgainst) / totalGames >= 2.5 ? 65 : 45 // Estimativa
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
    
    const standings = data.response[0].league.standings[0]; // Primeiro grupo (se houver grupos)
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

// Helper para delay
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
  
  // Buscar dados em 2 etapas para não exceder rate limit
  // Etapa 1: H2H e Standings (mais importantes e leves)
  const [h2h, homeStanding, awayStanding] = await Promise.all([
    fetchH2H(homeTeamId, awayTeamId),
    fetchStandings(leagueId, season, homeTeamId),
    fetchStandings(leagueId, season, awayTeamId),
  ]);
  
  // Pequeno delay entre etapas para respeitar rate limit
  await delay(200);
  
  // Etapa 2: Stats, Injuries e Prediction
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

// Buscar fixtures e odds da API-Football
// ===== LIGAS PRIORITÁRIAS (PRINCIPAIS) =====
// IDs das principais ligas para priorizar na busca
const PRIORITY_LEAGUES: Record<number, { name: string; tier: number }> = {
  // TIER 1 - Top 5 Europeias (sempre prioridade máxima)
  39: { name: 'Premier League', tier: 1 },
  140: { name: 'La Liga', tier: 1 },
  135: { name: 'Serie A', tier: 1 },
  78: { name: 'Bundesliga', tier: 1 },
  61: { name: 'Ligue 1', tier: 1 },
  
  // TIER 1.5 - Competições UEFA
  2: { name: 'Champions League', tier: 1 },
  3: { name: 'Europa League', tier: 1 },
  848: { name: 'Conference League', tier: 1 },
  
  // TIER 2 - Outras ligas europeias top
  94: { name: 'Primeira Liga (Portugal)', tier: 2 },
  88: { name: 'Eredivisie', tier: 2 },
  144: { name: 'Jupiler Pro League (Bélgica)', tier: 2 },
  203: { name: 'Super Lig (Turquia)', tier: 2 },
  179: { name: 'Scottish Premiership', tier: 2 },
  
  // TIER 2.5 - Segundas divisões top 5
  40: { name: 'Championship (ENG)', tier: 2 },
  141: { name: 'La Liga 2', tier: 2 },
  136: { name: 'Serie B (ITA)', tier: 2 },
  79: { name: '2. Bundesliga', tier: 2 },
  62: { name: 'Ligue 2', tier: 2 },
  
  // TIER 3 - América do Sul
  71: { name: 'Brasileirão Série A', tier: 3 },
  72: { name: 'Brasileirão Série B', tier: 3 },
  128: { name: 'Liga Profesional (Argentina)', tier: 3 },
  13: { name: 'Libertadores', tier: 3 },
  11: { name: 'Copa Sudamericana', tier: 3 },
  
  // TIER 3.5 - Outras ligas populares
  218: { name: 'Bundesliga (Áustria)', tier: 3 },
  207: { name: 'Super League (Suíça)', tier: 3 },
  113: { name: 'Allsvenskan (Suécia)', tier: 3 },
  103: { name: 'Eliteserien (Noruega)', tier: 3 },
  119: { name: 'Superligaen (Dinamarca)', tier: 3 },
  106: { name: 'Ekstraklasa (Polônia)', tier: 3 },
  
  // TIER 4 - MLS e outras
  253: { name: 'MLS', tier: 4 },
  262: { name: 'Liga MX', tier: 4 },
};

function getLeaguePriority(leagueId: number): number {
  const league = PRIORITY_LEAGUES[leagueId];
  if (league) return league.tier;
  return 10; // Liga não prioritária
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
        
        // Filtrar jogos válidos (>10min do início)
        const jogosValidos = fixturesData.response.filter((fixture: any) => {
          const dataJogo = new Date(fixture.fixture.date);
          return dataJogo > limiteMinimo;
        });
        
        // Ordenar por prioridade da liga (menores = melhores)
        jogosValidos.sort((a: any, b: any) => {
          const prioA = getLeaguePriority(a.league.id);
          const prioB = getLeaguePriority(b.league.id);
          return prioA - prioB;
        });
        
        // Log das ligas encontradas
        const ligasEncontradas = [...new Set(jogosValidos.slice(0, 30).map((f: any) => `${f.league.name} (ID:${f.league.id}, Tier:${getLeaguePriority(f.league.id)})`))];
        secureLog('info', `Ligas nos primeiros 30 jogos`, { ligas: ligasEncontradas.slice(0, 10) });
        
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
  
  // ===== SISTEMA DE SELEÇÃO INTELIGENTE =====
  // Pegar os primeiros 25 jogos (já ordenados por prioridade de liga)
  const fixturesParaProcessar = jogosEncontrados.slice(0, 25);
  const allGamesWithData: (Game & { qualityScore: number })[] = [];
  
  secureLog('info', `Processando ${fixturesParaProcessar.length} jogos para seleção inteligente`);
  
  for (let i = 0; i < fixturesParaProcessar.length; i++) {
    const fixture = fixturesParaProcessar[i];
    
    try {
      const fixtureId = fixture.fixture.id;
      
      // Delay entre jogos para respeitar rate limit (exceto no primeiro)
      if (i > 0) {
        await delay(400);
      }
      
      // Buscar odds E dados avançados
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
      
      // ===== CALCULAR QUALITY SCORE (0-120) =====
      let qualityScore = 0;
      const leagueId = fixture.league.id;
      const leagueTier = getLeaguePriority(leagueId);
      
      // 0. PRIORIDADE DA LIGA (até +30 pontos) - MUITO IMPORTANTE!
      if (leagueTier === 1) qualityScore += 30; // Top 5 + UEFA
      else if (leagueTier === 2) qualityScore += 22; // Segundas ligas top
      else if (leagueTier === 3) qualityScore += 15; // Brasil/Argentina
      else if (leagueTier === 4) qualityScore += 8;  // MLS/Liga MX
      // Tier 10 (não listada) = 0 pontos
      
      // 1. Odds válidas (+25 pontos base)
      if (hasValidOdds && homeOdd > 0 && awayOdd > 0) {
        qualityScore += 25;
        
        // Bonus para odds equilibradas (indica jogo competitivo)
        const oddsRange = Math.abs(homeOdd - awayOdd);
        if (oddsRange < 1.0) qualityScore += 10; // Jogo muito equilibrado
        else if (oddsRange < 2.0) qualityScore += 5; // Jogo equilibrado
      }
      
      // 2. H2H disponível (+15 pontos)
      if (advancedData.h2h && advancedData.h2h.totalGames >= 3) {
        qualityScore += 15;
      }
      
      // 3. Form disponível (+10 pontos)
      if (advancedData.homeForm && advancedData.awayForm) {
        qualityScore += 10;
      }
      
      // 4. Posições na tabela (+10 pontos)
      if (advancedData.homePosition && advancedData.awayPosition) {
        qualityScore += 10;
      }
      
      // 5. Estatísticas de times (+15 pontos)
      if (advancedData.homeStats && advancedData.awayStats) {
        qualityScore += 15;
      }
      
      // 6. Previsão da API (+10 pontos)
      if (advancedData.apiPrediction?.advice) {
        qualityScore += 10;
      }
      
      // 7. Lesões registradas (+5 pontos - dados de lesões são importantes)
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
      
      // Só adicionar jogos com odds válidas
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
  
  // ===== SELECIONAR OS 10 MELHORES JOGOS =====
  // Ordenar por qualityScore (maior primeiro)
  allGamesWithData.sort((a, b) => b.qualityScore - a.qualityScore);
  
  // Pegar os 10 melhores
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
  return `odds_v2_${dataStr}`; // Nova versão do cache
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
    origin === allowed || origin.includes('localhost') || origin.includes('127.0.0.1')
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

    // Buscar o tier e timezone do usuário
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier, subscription_status, trial_end_date, timezone, country_code')
      .eq('user_id', userId)
      .single();
    
    const userTimezone = profileData?.timezone || 'America/Sao_Paulo';
    const userCountry = profileData?.country_code || 'BR';
    
    const isSubscribed = profileData?.subscription_status === 'active';
    
    // Verificar se está em período de trial (trial_end_date >= now)
    const trialEndDate = profileData?.trial_end_date ? new Date(profileData.trial_end_date) : null;
    const isInTrial = trialEndDate ? trialEndDate >= new Date() : false;
    
    // Trial = Premium com limite de 3 buscas/dia
    // Assinante = tier do plano sem limite
    // Fora do trial e sem assinatura = free
    let userTier = profileData?.subscription_tier || 'free';
    if (isInTrial && !isSubscribed) {
      userTier = 'premium'; // Trial sempre é premium
    }
    
    secureLog('info', 'User tier', { tier: userTier, isSubscribed, isInTrial });

    // Verificar limite de buscas apenas para trial (não assinante)
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
            userTier: 'premium' // Trial é premium mas com limite
          }), 
          { 
            // Business-rule response: do not return non-2xx to avoid treating it as a runtime failure on clients.
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
      // Usuário sem trial e sem assinatura - bloquear acesso
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
    
    // Função para filtrar dados baseado no tier
    const filterDataByTier = (data: any, tier: string) => {
      if (!data?.games) return data;
      
      // Premium: 10 jogos, outros tiers: 5 jogos
      const maxGames = tier === 'premium' ? 10 : 5;
      const limitedGames = data.games.slice(0, maxGames);
      
      const filteredGames = limitedGames.map((game: any) => {
        const filteredGame = { ...game };
        
        if (tier === 'free' || tier === 'basic') {
          // Basic: apenas odds e recomendação simples (sem dados avançados)
          delete filteredGame.advancedData;
          if (filteredGame.analysis) {
            filteredGame.analysis.factors = [];
            filteredGame.analysis.confidence = undefined;
          }
        } else if (tier === 'advanced') {
          // Advanced: H2H, Form, Standings (sem lesões e predictions)
          if (filteredGame.advancedData) {
            delete filteredGame.advancedData.homeInjuries;
            delete filteredGame.advancedData.awayInjuries;
            delete filteredGame.advancedData.apiPrediction;
            delete filteredGame.advancedData.homeStats;
            delete filteredGame.advancedData.awayStats;
          }
        }
        // Premium: tudo disponível (15 jogos com todos os dados)
        
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

    secureLog('info', 'Buscando dados frescos da API-Football (modo avançado)');
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
