-- Fix: Replace overly permissive INSERT policy with user-scoped one
DROP POLICY IF EXISTS "Authenticated users can insert tracking" ON public.accumulator_tracking;

CREATE POLICY "Users can insert own tracking" ON public.accumulator_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix: Make the stats view use SECURITY INVOKER (default, safer)
DROP VIEW IF EXISTS public.accumulator_stats;
CREATE VIEW public.accumulator_stats 
WITH (security_invoker = true) AS
SELECT 
  accumulator_type,
  risk_level,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE result = 'won') as wins,
  COUNT(*) FILTER (WHERE result = 'lost') as losses,
  ROUND(
    COUNT(*) FILTER (WHERE result = 'won')::DECIMAL / 
    NULLIF(COUNT(*) FILTER (WHERE result IN ('won', 'lost')), 0) * 100, 
    1
  ) as hit_rate_percent,
  ROUND(AVG(shown_chance), 1) as avg_shown_chance,
  ROUND(AVG(calculated_chance), 1) as avg_calculated_chance,
  ROUND(AVG(total_odd), 2) as avg_total_odd
FROM public.accumulator_tracking
WHERE result IN ('won', 'lost')
GROUP BY accumulator_type, risk_level
ORDER BY accumulator_type, risk_level;