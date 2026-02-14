-- Tabela para tracking de resultados das acumuladas
CREATE TABLE IF NOT EXISTS public.accumulator_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Tipo da acumulada
  accumulator_type TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  
  -- Detalhes das apostas
  bets JSONB NOT NULL,
  total_odd DECIMAL NOT NULL,
  shown_chance DECIMAL NOT NULL,
  calculated_chance DECIMAL,
  suggested_stake DECIMAL,
  
  -- Resultado
  result TEXT DEFAULT 'pending',
  actual_return DECIMAL DEFAULT 0,
  
  -- Metadata
  date_of_matches DATE NOT NULL,
  checked_at TIMESTAMPTZ,
  user_id UUID
);

-- Índices para performance
CREATE INDEX idx_acc_tracking_date ON public.accumulator_tracking(date_of_matches);
CREATE INDEX idx_acc_tracking_type ON public.accumulator_tracking(accumulator_type);
CREATE INDEX idx_acc_tracking_result ON public.accumulator_tracking(result);

-- RLS
ALTER TABLE public.accumulator_tracking ENABLE ROW LEVEL SECURITY;

-- Admins podem ver tudo
CREATE POLICY "Admins can view all tracking" ON public.accumulator_tracking
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own tracking" ON public.accumulator_tracking
  FOR SELECT USING (user_id = auth.uid());

-- Authenticated users can insert tracking
CREATE POLICY "Authenticated users can insert tracking" ON public.accumulator_tracking
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can manage all tracking
CREATE POLICY "Admins can manage tracking" ON public.accumulator_tracking
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- View para estatísticas de hit rate
CREATE OR REPLACE VIEW public.accumulator_stats AS
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