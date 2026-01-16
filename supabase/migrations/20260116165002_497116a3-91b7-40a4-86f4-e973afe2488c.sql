-- ============================================
-- HISTORICAL RECOMMENDATIONS TABLE FOR BACKTESTING
-- ============================================

-- Tabela para armazenar recomendações históricas e resultados para backtesting
CREATE TABLE public.historical_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados do jogo
  fixture_id INTEGER NOT NULL,
  league_id INTEGER NOT NULL,
  league_name TEXT NOT NULL,
  season INTEGER NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_team_id INTEGER,
  away_team_id INTEGER,
  
  -- Odds usadas na recomendação
  odds_home DECIMAL(5,2) NOT NULL,
  odds_draw DECIMAL(5,2) NOT NULL,
  odds_away DECIMAL(5,2) NOT NULL,
  odds_over DECIMAL(5,2),
  odds_under DECIMAL(5,2),
  
  -- Recomendação gerada
  recommendation_type TEXT NOT NULL, -- home, away, draw, over25, under25, btts, skip
  confidence_score INTEGER NOT NULL, -- 0-100
  value_percentage DECIMAL(5,2), -- Value % calculado
  implied_probability DECIMAL(5,2), -- Probabilidade implícita da odd
  estimated_probability DECIMAL(5,2), -- Probabilidade estimada pelo motor
  
  -- Pesos dinâmicos usados (JSON para auditoria)
  weights_used JSONB,
  factors_used JSONB,
  
  -- Resultado real (preenchido após o jogo)
  actual_home_goals INTEGER,
  actual_away_goals INTEGER,
  actual_outcome TEXT, -- home, away, draw
  actual_over25 BOOLEAN,
  actual_btts BOOLEAN,
  
  -- Métricas de resultado
  hit BOOLEAN, -- Se a recomendação acertou
  roi_unit DECIMAL(5,2), -- ROI considerando stake = 1 unidade
  
  -- Metadados
  is_simulated BOOLEAN NOT NULL DEFAULT false, -- true = backtest simulado
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraint para evitar duplicatas
  CONSTRAINT unique_fixture_recommendation UNIQUE (fixture_id, recommendation_type, is_simulated)
);

-- Índices para queries de backtest
CREATE INDEX idx_historical_rec_league ON public.historical_recommendations(league_id);
CREATE INDEX idx_historical_rec_date ON public.historical_recommendations(match_date);
CREATE INDEX idx_historical_rec_type ON public.historical_recommendations(recommendation_type);
CREATE INDEX idx_historical_rec_hit ON public.historical_recommendations(hit) WHERE hit IS NOT NULL;
CREATE INDEX idx_historical_rec_simulated ON public.historical_recommendations(is_simulated);

-- Enable RLS
ALTER TABLE public.historical_recommendations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Apenas admins podem gerenciar, todos autenticados podem ler
CREATE POLICY "Admins can manage historical recommendations"
ON public.historical_recommendations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view historical recommendations"
ON public.historical_recommendations
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Trigger para updated_at
CREATE TRIGGER update_historical_recommendations_updated_at
BEFORE UPDATE ON public.historical_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- BACKTEST RESULTS TABLE (summary/cache)
-- ============================================

CREATE TABLE public.backtest_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Parâmetros do backtest
  league_ids INTEGER[], -- null = todas as ligas
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  min_confidence INTEGER NOT NULL DEFAULT 65,
  min_value_percentage DECIMAL(5,2) DEFAULT 5.0,
  
  -- Resultados agregados
  total_fixtures INTEGER NOT NULL,
  total_recommendations INTEGER NOT NULL,
  total_skips INTEGER NOT NULL,
  total_hits INTEGER NOT NULL,
  total_misses INTEGER NOT NULL,
  
  -- Métricas
  hit_rate DECIMAL(5,2) NOT NULL, -- % de acertos
  total_roi DECIMAL(8,2) NOT NULL, -- ROI total em %
  yield_per_bet DECIMAL(5,2) NOT NULL, -- Yield médio por aposta
  best_bet_type TEXT, -- Tipo de aposta com melhor performance
  worst_bet_type TEXT,
  
  -- Breakdown por tipo de aposta
  breakdown_by_type JSONB,
  breakdown_by_league JSONB,
  
  -- Metadados
  executed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backtest_results ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver/gerenciar resultados de backtest
CREATE POLICY "Admins can manage backtest results"
ON public.backtest_results
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));