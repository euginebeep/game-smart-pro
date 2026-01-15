-- Adicionar coluna de tier de assinatura na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'advanced', 'premium'));

-- Adicionar colunas para gerenciamento de assinatura Stripe
ALTER TABLE public.profiles
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'canceled', 'past_due')),
ADD COLUMN subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Índice para busca por customer_id do Stripe
CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Criar tabela para produtos/planos
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'advanced', 'premium')),
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'brl',
  stripe_price_id TEXT,
  features JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública dos planos
CREATE POLICY "Anyone can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

-- Inserir os 3 planos
INSERT INTO public.subscription_plans (name, tier, price_cents, currency, features) VALUES
('Basic', 'basic', 2990, 'brl', '["Odds em tempo real", "Recomendação simples", "5 buscas/dia"]'),
('Advanced', 'advanced', 4990, 'brl', '["Tudo do Basic", "Histórico H2H", "Forma recente", "Posição na tabela", "Buscas ilimitadas"]'),
('Premium', 'premium', 7990, 'brl', '["Tudo do Advanced", "Lesões e desfalques", "Estatísticas completas", "Previsões da API", "Suporte prioritário"]');