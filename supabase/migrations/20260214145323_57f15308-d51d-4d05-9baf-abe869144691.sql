-- Tabela para tracking de resultados
CREATE TABLE IF NOT EXISTS public.bet_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Dados do jogo
  fixture_id TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  league TEXT NOT NULL,
  match_date DATE NOT NULL,
  
  -- Aposta sugerida
  bet_type TEXT NOT NULL,
  bet_label TEXT NOT NULL,
  odd DECIMAL NOT NULL,
  
  -- Probabilidades
  implied_probability DECIMAL NOT NULL,
  estimated_probability DECIMAL NOT NULL,
  value_edge DECIMAL NOT NULL,
  confidence INTEGER NOT NULL,
  
  -- Resultado
  result TEXT DEFAULT 'pending',
  actual_score TEXT,
  checked_at TIMESTAMPTZ,
  
  -- Controle
  was_skip BOOLEAN DEFAULT false,
  
  CONSTRAINT valid_bet_result CHECK (result IN ('won', 'lost', 'void', 'pending'))
);

-- Índices
CREATE INDEX idx_bet_tracking_date ON public.bet_tracking(match_date);
CREATE INDEX idx_bet_tracking_type ON public.bet_tracking(bet_type);
CREATE INDEX idx_bet_tracking_result ON public.bet_tracking(result);
CREATE INDEX idx_bet_tracking_fixture ON public.bet_tracking(fixture_id);

-- Unique constraint for upsert
CREATE UNIQUE INDEX idx_bet_tracking_fixture_unique ON public.bet_tracking(fixture_id);

-- RLS
ALTER TABLE public.bet_tracking ENABLE ROW LEVEL SECURITY;

-- Todos podem ler (transparência pública)
CREATE POLICY "Public read access" ON public.bet_tracking
  FOR SELECT USING (true);

-- Admins can insert and update
CREATE POLICY "Admin insert" ON public.bet_tracking
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update" ON public.bet_tracking
  FOR UPDATE USING (true);

-- View pública de estatísticas por mercado
CREATE OR REPLACE VIEW public.bet_stats AS
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

-- View de últimas 30 sugestões com resultado
CREATE OR REPLACE VIEW public.recent_results AS
SELECT 
  id, match_date, home_team, away_team, league,
  bet_type, bet_label, odd, 
  implied_probability, estimated_probability, value_edge,
  result, actual_score
FROM public.bet_tracking
WHERE result IN ('won', 'lost')
ORDER BY match_date DESC
LIMIT 30;