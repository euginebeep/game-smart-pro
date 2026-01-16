import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration
const API_FOOTBALL_KEY = Deno.env.get('API_FOOTBALL_KEY') || '';
const API_BASE_URL = 'https://v3.football.api-sports.io';
const MIN_CONFIDENCE_THRESHOLD = 65;
const MIN_VALUE_THRESHOLD = 5;

// Weight configuration (simplified for backtest)
const BASE_WEIGHTS = {
  stats: 0.25,
  form: 0.20,
  h2h: 0.15,
  odds: 0.15,
  standings: 0.10,
  injuries: 0.10,
  apiPrediction: 0.05
};

interface BacktestParams {
  leagueIds?: number[];
  dateFrom: string;
  dateTo: string;
  minConfidence?: number;
  minValue?: number;
}

interface BacktestResult {
  fixtureId: number;
  leagueId: number;
  leagueName: string;
  season: number;
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
  recommendationType: string;
  confidenceScore: number;
  valuePercentage: number;
  oddsUsed: { home: number; draw: number; away: number; over?: number; under?: number };
  actualOutcome: string;
  actualHomeGoals: number;
  actualAwayGoals: number;
  hit: boolean;
  roiUnit: number;
}

// Helper: Calculate implied probability
function calculateImpliedProbability(odds: number): number {
  return (1 / odds) * 100;
}

// Helper: Calculate value percentage
function calculateValue(estimatedProb: number, odds: number): number {
  const impliedProb = calculateImpliedProbability(odds);
  return estimatedProb - impliedProb;
}

// Helper: Determine actual outcome from score
function determineOutcome(homeGoals: number, awayGoals: number): string {
  if (homeGoals > awayGoals) return 'home';
  if (awayGoals > homeGoals) return 'away';
  return 'draw';
}

// Helper: Check if recommendation hit
function checkHit(recommendation: string, homeGoals: number, awayGoals: number): boolean {
  const totalGoals = homeGoals + awayGoals;
  const bothScored = homeGoals > 0 && awayGoals > 0;
  
  switch (recommendation) {
    case 'home': return homeGoals > awayGoals;
    case 'away': return awayGoals > homeGoals;
    case 'draw': return homeGoals === awayGoals;
    case 'over_2.5': return totalGoals > 2.5;
    case 'under_2.5': return totalGoals < 2.5;
    case 'btts_yes': return bothScored;
    case 'btts_no': return !bothScored;
    default: return false;
  }
}

// Helper: Calculate ROI for a single bet
function calculateRoi(hit: boolean, odds: number): number {
  if (hit) {
    return odds - 1; // Profit per unit staked
  }
  return -1; // Lost the stake
}

// Simplified analysis engine for backtest
function analyzeFixture(
  homeGoalsAvg: number,
  awayGoalsAvg: number,
  homeForm: number,
  awayForm: number,
  h2hHomeWins: number,
  h2hDraws: number,
  h2hAwayWins: number,
  odds: { home: number; draw: number; away: number }
): { recommendation: string; confidence: number; valuePercent: number; selectedOdds: number } {
  // Calculate base scores
  let homeScore = 50;
  let awayScore = 50;
  let drawScore = 30;
  
  // Factor: Goals average
  if (homeGoalsAvg > awayGoalsAvg) {
    homeScore += (homeGoalsAvg - awayGoalsAvg) * 5;
  } else {
    awayScore += (awayGoalsAvg - homeGoalsAvg) * 5;
  }
  
  // Factor: Form (0-15 scale)
  homeScore += homeForm * 2;
  awayScore += awayForm * 2;
  
  // Factor: H2H
  const h2hTotal = h2hHomeWins + h2hDraws + h2hAwayWins;
  if (h2hTotal > 0) {
    homeScore += (h2hHomeWins / h2hTotal) * 10;
    awayScore += (h2hAwayWins / h2hTotal) * 10;
    drawScore += (h2hDraws / h2hTotal) * 15;
  }
  
  // Factor: Odds value (inverse - lower odds = higher probability)
  const impliedHome = calculateImpliedProbability(odds.home);
  const impliedAway = calculateImpliedProbability(odds.away);
  const impliedDraw = calculateImpliedProbability(odds.draw);
  
  homeScore += impliedHome * 0.3;
  awayScore += impliedAway * 0.3;
  drawScore += impliedDraw * 0.3;
  
  // Normalize scores to 0-100
  const maxScore = Math.max(homeScore, awayScore, drawScore);
  homeScore = Math.min(100, (homeScore / maxScore) * 80);
  awayScore = Math.min(100, (awayScore / maxScore) * 80);
  drawScore = Math.min(100, (drawScore / maxScore) * 70);
  
  // Determine recommendation
  let recommendation: string;
  let confidence: number;
  let selectedOdds: number;
  
  if (homeScore >= awayScore && homeScore >= drawScore) {
    recommendation = 'home';
    confidence = Math.round(homeScore);
    selectedOdds = odds.home;
  } else if (awayScore >= homeScore && awayScore >= drawScore) {
    recommendation = 'away';
    confidence = Math.round(awayScore);
    selectedOdds = odds.away;
  } else {
    recommendation = 'draw';
    confidence = Math.round(drawScore);
    selectedOdds = odds.draw;
  }
  
  // Calculate value
  const valuePercent = calculateValue(confidence, selectedOdds);
  
  return { recommendation, confidence, valuePercent, selectedOdds };
}

// Fetch finished fixtures from API-Football
async function fetchFinishedFixtures(leagueId: number, dateFrom: string, dateTo: string): Promise<any[]> {
  const url = `${API_BASE_URL}/fixtures?league=${leagueId}&from=${dateFrom}&to=${dateTo}&status=FT`;
  
  const response = await fetch(url, {
    headers: {
      'x-apisports-key': API_FOOTBALL_KEY,
    },
  });
  
  if (!response.ok) {
    console.error(`API error for league ${leagueId}: ${response.status}`);
    return [];
  }
  
  const data = await response.json();
  return data.response || [];
}

// Fetch odds for a fixture
async function fetchFixtureOdds(fixtureId: number): Promise<{ home: number; draw: number; away: number } | null> {
  const url = `${API_BASE_URL}/odds?fixture=${fixtureId}&bookmaker=8`; // Bet365
  
  const response = await fetch(url, {
    headers: {
      'x-apisports-key': API_FOOTBALL_KEY,
    },
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  const bets = data.response?.[0]?.bookmakers?.[0]?.bets || [];
  const matchWinner = bets.find((b: any) => b.name === 'Match Winner');
  
  if (!matchWinner) return null;
  
  const values = matchWinner.values || [];
  const homeOdd = values.find((v: any) => v.value === 'Home')?.odd;
  const drawOdd = values.find((v: any) => v.value === 'Draw')?.odd;
  const awayOdd = values.find((v: any) => v.value === 'Away')?.odd;
  
  if (!homeOdd || !drawOdd || !awayOdd) return null;
  
  return {
    home: parseFloat(homeOdd),
    draw: parseFloat(drawOdd),
    away: parseFloat(awayOdd),
  };
}

// Main backtest function
async function runBacktest(params: BacktestParams): Promise<{
  results: BacktestResult[];
  summary: {
    totalFixtures: number;
    totalRecommendations: number;
    totalSkips: number;
    totalHits: number;
    totalMisses: number;
    hitRate: number;
    totalRoi: number;
    yieldPerBet: number;
    breakdownByType: Record<string, { hits: number; total: number; roi: number }>;
    breakdownByLeague: Record<string, { hits: number; total: number; roi: number }>;
    bestBetType: string;
    worstBetType: string;
  };
}> {
  const results: BacktestResult[] = [];
  const minConfidence = params.minConfidence || MIN_CONFIDENCE_THRESHOLD;
  const minValue = params.minValue || MIN_VALUE_THRESHOLD;
  
  // Default leagues if none provided
  const leagueIds = params.leagueIds || [
    39,  // Premier League
    140, // La Liga
    135, // Serie A
    78,  // Bundesliga
    61,  // Ligue 1
    71,  // Brasileirão
  ];
  
  console.log(`Starting backtest from ${params.dateFrom} to ${params.dateTo} for ${leagueIds.length} leagues`);
  
  let totalFixtures = 0;
  let processedFixtures = 0;
  
  for (const leagueId of leagueIds) {
    console.log(`Fetching fixtures for league ${leagueId}...`);
    
    const fixtures = await fetchFinishedFixtures(leagueId, params.dateFrom, params.dateTo);
    totalFixtures += fixtures.length;
    
    console.log(`Found ${fixtures.length} finished fixtures for league ${leagueId}`);
    
    // Limit to avoid API rate limits (process max 50 per league)
    const limitedFixtures = fixtures.slice(0, 50);
    
    for (const fixture of limitedFixtures) {
      try {
        // Basic fixture data
        const fixtureId = fixture.fixture.id;
        const homeTeam = fixture.teams.home.name;
        const awayTeam = fixture.teams.away.name;
        const homeTeamId = fixture.teams.home.id;
        const awayTeamId = fixture.teams.away.id;
        const leagueName = fixture.league.name;
        const season = fixture.league.season;
        const matchDate = fixture.fixture.date;
        const homeGoals = fixture.goals.home ?? 0;
        const awayGoals = fixture.goals.away ?? 0;
        
        // Fetch odds (with delay to avoid rate limit)
        await new Promise(resolve => setTimeout(resolve, 200));
        const odds = await fetchFixtureOdds(fixtureId);
        
        if (!odds) {
          console.log(`No odds found for fixture ${fixtureId}`);
          continue;
        }
        
        // Simplified analysis (using basic data since we can't fetch all historical data in backtest)
        // In a real scenario, you'd fetch team stats, form, etc.
        const analysis = analyzeFixture(
          1.5, // Placeholder home goals avg
          1.3, // Placeholder away goals avg
          10,  // Placeholder home form
          8,   // Placeholder away form
          3,   // Placeholder H2H home wins
          2,   // Placeholder H2H draws
          2,   // Placeholder H2H away wins
          odds
        );
        
        processedFixtures++;
        
        // Skip if below thresholds
        if (analysis.confidence < minConfidence || analysis.valuePercent < minValue) {
          continue;
        }
        
        // Determine if hit
        const hit = checkHit(analysis.recommendation, homeGoals, awayGoals);
        const roiUnit = calculateRoi(hit, analysis.selectedOdds);
        
        results.push({
          fixtureId,
          leagueId,
          leagueName,
          season,
          matchDate,
          homeTeam,
          awayTeam,
          homeTeamId,
          awayTeamId,
          recommendationType: analysis.recommendation,
          confidenceScore: analysis.confidence,
          valuePercentage: analysis.valuePercent,
          oddsUsed: odds,
          actualOutcome: determineOutcome(homeGoals, awayGoals),
          actualHomeGoals: homeGoals,
          actualAwayGoals: awayGoals,
          hit,
          roiUnit,
        });
        
      } catch (err) {
        console.error(`Error processing fixture: ${err}`);
      }
    }
    
    // Delay between leagues
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Calculate summary
  const breakdownByType: Record<string, { hits: number; total: number; roi: number }> = {};
  const breakdownByLeague: Record<string, { hits: number; total: number; roi: number }> = {};
  
  for (const result of results) {
    // By type
    if (!breakdownByType[result.recommendationType]) {
      breakdownByType[result.recommendationType] = { hits: 0, total: 0, roi: 0 };
    }
    breakdownByType[result.recommendationType].total++;
    if (result.hit) breakdownByType[result.recommendationType].hits++;
    breakdownByType[result.recommendationType].roi += result.roiUnit;
    
    // By league
    if (!breakdownByLeague[result.leagueName]) {
      breakdownByLeague[result.leagueName] = { hits: 0, total: 0, roi: 0 };
    }
    breakdownByLeague[result.leagueName].total++;
    if (result.hit) breakdownByLeague[result.leagueName].hits++;
    breakdownByLeague[result.leagueName].roi += result.roiUnit;
  }
  
  const totalHits = results.filter(r => r.hit).length;
  const totalMisses = results.length - totalHits;
  const totalRoi = results.reduce((sum, r) => sum + r.roiUnit, 0);
  
  // Find best/worst bet type
  let bestBetType = '';
  let worstBetType = '';
  let bestRoi = -Infinity;
  let worstRoi = Infinity;
  
  for (const [type, data] of Object.entries(breakdownByType)) {
    if (data.roi > bestRoi) {
      bestRoi = data.roi;
      bestBetType = type;
    }
    if (data.roi < worstRoi) {
      worstRoi = data.roi;
      worstBetType = type;
    }
  }
  
  return {
    results,
    summary: {
      totalFixtures,
      totalRecommendations: results.length,
      totalSkips: processedFixtures - results.length,
      totalHits,
      totalMisses,
      hitRate: results.length > 0 ? (totalHits / results.length) * 100 : 0,
      totalRoi,
      yieldPerBet: results.length > 0 ? totalRoi / results.length : 0,
      breakdownByType,
      breakdownByLeague,
      bestBetType,
      worstBetType,
    },
  };
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação necessário' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas administradores podem executar backtests.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { action, dateFrom, dateTo, leagueIds, minConfidence, minValue } = body;

    if (action === 'run') {
      // Validate parameters
      if (!dateFrom || !dateTo) {
        return new Response(
          JSON.stringify({ error: 'dateFrom e dateTo são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Admin ${user.email} iniciou backtest: ${dateFrom} to ${dateTo}`);

      // Run backtest
      const { results, summary } = await runBacktest({
        dateFrom,
        dateTo,
        leagueIds,
        minConfidence,
        minValue,
      });

      // Save results to database
      // First, save individual recommendations
      for (const result of results) {
        await supabase.from('historical_recommendations').upsert({
          fixture_id: result.fixtureId,
          league_id: result.leagueId,
          league_name: result.leagueName,
          season: result.season,
          match_date: result.matchDate,
          home_team: result.homeTeam,
          away_team: result.awayTeam,
          home_team_id: result.homeTeamId,
          away_team_id: result.awayTeamId,
          recommendation_type: result.recommendationType,
          confidence_score: result.confidenceScore,
          value_percentage: result.valuePercentage,
          odds_home: result.oddsUsed.home,
          odds_draw: result.oddsUsed.draw,
          odds_away: result.oddsUsed.away,
          actual_outcome: result.actualOutcome,
          actual_home_goals: result.actualHomeGoals,
          actual_away_goals: result.actualAwayGoals,
          hit: result.hit,
          roi_unit: result.roiUnit,
          is_simulated: true,
        }, { onConflict: 'fixture_id' });
      }

      // Save summary to backtest_results
      const { error: summaryError } = await supabase.from('backtest_results').insert({
        date_from: dateFrom,
        date_to: dateTo,
        league_ids: leagueIds || [],
        min_confidence: minConfidence || MIN_CONFIDENCE_THRESHOLD,
        min_value_percentage: minValue || MIN_VALUE_THRESHOLD,
        total_fixtures: summary.totalFixtures,
        total_recommendations: summary.totalRecommendations,
        total_skips: summary.totalSkips,
        total_hits: summary.totalHits,
        total_misses: summary.totalMisses,
        hit_rate: summary.hitRate,
        total_roi: summary.totalRoi,
        yield_per_bet: summary.yieldPerBet,
        breakdown_by_type: summary.breakdownByType,
        breakdown_by_league: summary.breakdownByLeague,
        best_bet_type: summary.bestBetType,
        worst_bet_type: summary.worstBetType,
        executed_by: user.id,
      });

      if (summaryError) {
        console.error('Error saving backtest summary:', summaryError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          summary,
          resultsCount: results.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'history') {
      // Get backtest history
      const { data: history, error: historyError } = await supabase
        .from('backtest_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) {
        throw historyError;
      }

      return new Response(
        JSON.stringify({ history }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ação inválida. Use "run" ou "history".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Backtest error:', error);
    const message = error instanceof Error ? error.message : 'Erro interno';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
