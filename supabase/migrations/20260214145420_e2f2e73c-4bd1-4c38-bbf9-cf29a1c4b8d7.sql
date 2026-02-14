-- Fix views to use SECURITY INVOKER instead of default SECURITY DEFINER
CREATE OR REPLACE VIEW public.bet_stats
WITH (security_invoker = true)
AS
SELECT 
  bet_type,
  COUNT(*)::integer as total_bets,
  COUNT(*) FILTER (WHERE result = 'won')::integer as wins,
  COUNT(*) FILTER (WHERE result = 'lost')::integer as losses,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'won')::DECIMAL / 
    NULLIF(COUNT(*) FILTER (WHERE result IN ('won', 'lost')), 0) * 100, 
    1
  ) as hit_rate,
  ROUND(AVG(value_edge), 1) as avg_edge,
  ROUND(AVG(implied_probability), 1) as avg_implied_prob,
  ROUND(AVG(estimated_probability), 1) as avg_estimated_prob,
  ROUND(AVG(odd), 2) as avg_odd,
  ROUND(AVG(confidence), 0)::integer as avg_confidence
FROM public.bet_tracking
WHERE result IN ('won', 'lost') AND was_skip = false
GROUP BY bet_type
ORDER BY hit_rate DESC;

CREATE OR REPLACE VIEW public.recent_results
WITH (security_invoker = true)
AS
SELECT 
  id, match_date, home_team, away_team, league,
  bet_type, bet_label, odd, 
  implied_probability, estimated_probability, value_edge,
  result, actual_score
FROM public.bet_tracking
WHERE result IN ('won', 'lost')
ORDER BY match_date DESC
LIMIT 30;

-- Tighten INSERT/UPDATE to service role only (edge functions use service role)
DROP POLICY IF EXISTS "Admin insert" ON public.bet_tracking;
DROP POLICY IF EXISTS "Admin update" ON public.bet_tracking;

CREATE POLICY "Service role insert" ON public.bet_tracking
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update" ON public.bet_tracking
  FOR UPDATE TO service_role USING (true);