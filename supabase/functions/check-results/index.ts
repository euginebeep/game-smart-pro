import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const API_FOOTBALL_KEY = Deno.env.get('API_FOOTBALL_KEY') || '';
const API_BASE_URL = 'https://v3.football.api-sports.io';

interface PendingBet {
  id: string;
  fixture_id: string;
  home_team: string;
  away_team: string;
  bet_type: string;
  bet_label: string;
  match_date: string;
}

// Determine if bet won based on score and bet type
function evaluateBet(betType: string, homeGoals: number, awayGoals: number): 'win' | 'loss' {
  const totalGoals = homeGoals + awayGoals;
  const bothScored = homeGoals > 0 && awayGoals > 0;

  // Normalize bet type for comparison
  const normalized = betType.toUpperCase().trim();

  if (normalized.includes('VITÓRIA CASA') || normalized === 'HOME WIN') {
    return homeGoals > awayGoals ? 'win' : 'loss';
  }
  if (normalized.includes('VITÓRIA FORA') || normalized === 'AWAY WIN') {
    return awayGoals > homeGoals ? 'win' : 'loss';
  }
  if (normalized.includes('EMPATE') || normalized === 'DRAW') {
    return homeGoals === awayGoals ? 'win' : 'loss';
  }
  if (normalized.includes('MAIS DE 2.5') || normalized === 'OVER 2.5') {
    return totalGoals > 2.5 ? 'win' : 'loss';
  }
  if (normalized.includes('MENOS DE 2.5') || normalized === 'UNDER 2.5') {
    return totalGoals < 2.5 ? 'win' : 'loss';
  }
  if (normalized.includes('MAIS DE 1.5') || normalized === 'OVER 1.5') {
    return totalGoals > 1.5 ? 'win' : 'loss';
  }
  if (normalized.includes('MENOS DE 1.5') || normalized === 'UNDER 1.5') {
    return totalGoals < 1.5 ? 'win' : 'loss';
  }
  if (normalized.includes('MAIS DE 3.5') || normalized === 'OVER 3.5') {
    return totalGoals > 3.5 ? 'win' : 'loss';
  }
  if (normalized.includes('MENOS DE 3.5') || normalized === 'UNDER 3.5') {
    return totalGoals < 3.5 ? 'win' : 'loss';
  }
  if (normalized.includes('AMBAS MARCAM SIM') || normalized === 'BTTS YES') {
    return bothScored ? 'win' : 'loss';
  }
  if (normalized.includes('AMBAS MARCAM NÃO') || normalized === 'BTTS NO') {
    return !bothScored ? 'win' : 'loss';
  }
  if (normalized.includes('DUPLA CHANCE 1X')) {
    return homeGoals >= awayGoals ? 'win' : 'loss';
  }
  if (normalized.includes('DUPLA CHANCE X2')) {
    return awayGoals >= homeGoals ? 'win' : 'loss';
  }
  if (normalized.includes('DUPLA CHANCE 12')) {
    return homeGoals !== awayGoals ? 'win' : 'loss';
  }

  // Default: can't evaluate
  console.warn(`Unknown bet type: ${betType}`);
  return 'loss';
}

// Fetch fixture result from API-Football
async function getFixtureResult(fixtureId: string): Promise<{ homeGoals: number; awayGoals: number; status: string } | null> {
  try {
    const url = `${API_BASE_URL}/fixtures?id=${fixtureId}`;
    const response = await fetch(url, {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY },
    });

    if (!response.ok) {
      console.error(`API error for fixture ${fixtureId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const fixture = data.response?.[0];
    if (!fixture) return null;

    const status = fixture.fixture?.status?.short;
    // Only process finished matches
    if (status !== 'FT' && status !== 'AET' && status !== 'PEN') {
      return null;
    }

    return {
      homeGoals: fixture.goals?.home ?? 0,
      awayGoals: fixture.goals?.away ?? 0,
      status,
    };
  } catch (err) {
    console.error(`Error fetching fixture ${fixtureId}:`, err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!API_FOOTBALL_KEY) {
      return new Response(
        JSON.stringify({ error: 'API_FOOTBALL_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all pending bets
    const { data: pendingBets, error: fetchError } = await supabase
      .from('bet_tracking')
      .select('id, fixture_id, home_team, away_team, bet_type, bet_label, match_date')
      .eq('result', 'pending');

    if (fetchError) throw fetchError;

    if (!pendingBets || pendingBets.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending bets to check', checked: 0, updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking ${pendingBets.length} pending bets...`);

    let checked = 0;
    let updated = 0;
    let errors = 0;
    const results: Array<{ id: string; match: string; result: string; score: string }> = [];

    for (const bet of pendingBets) {
      try {
        // Rate limit: 200ms between requests
        if (checked > 0) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }

        const fixtureResult = await getFixtureResult(bet.fixture_id);
        checked++;

        if (!fixtureResult) {
          // Match not finished yet
          continue;
        }

        const { homeGoals, awayGoals } = fixtureResult;
        const score = `${homeGoals}-${awayGoals}`;
        const betResult = evaluateBet(bet.bet_type, homeGoals, awayGoals);

        // Update bet in database
        const { error: updateError } = await supabase
          .from('bet_tracking')
          .update({
            result: betResult,
            actual_score: score,
            checked_at: new Date().toISOString(),
          })
          .eq('id', bet.id);

        if (updateError) {
          console.error(`Error updating bet ${bet.id}:`, updateError);
          errors++;
          continue;
        }

        updated++;
        results.push({
          id: bet.id,
          match: `${bet.home_team} vs ${bet.away_team}`,
          result: betResult,
          score,
        });

        console.log(`✅ ${bet.home_team} vs ${bet.away_team}: ${score} → ${betResult} (${bet.bet_label})`);
      } catch (err) {
        console.error(`Error processing bet ${bet.id}:`, err);
        errors++;
      }
    }

    const summary = {
      total_pending: pendingBets.length,
      checked,
      updated,
      errors,
      still_pending: pendingBets.length - updated,
      results,
    };

    console.log(`Check complete: ${updated}/${checked} updated, ${errors} errors`);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Check results error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
