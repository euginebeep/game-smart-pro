-- Criar tabela para cache de odds
CREATE TABLE public.odds_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Criar índice para busca rápida por chave e expiração
CREATE INDEX idx_odds_cache_key ON public.odds_cache(cache_key);
CREATE INDEX idx_odds_cache_expires ON public.odds_cache(expires_at);

-- Habilitar RLS
ALTER TABLE public.odds_cache ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura/escrita pela edge function (via service role)
-- O cache é público de leitura para usuários autenticados
CREATE POLICY "Authenticated users can read cache" 
ON public.odds_cache 
FOR SELECT 
TO authenticated
USING (true);

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.odds_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;