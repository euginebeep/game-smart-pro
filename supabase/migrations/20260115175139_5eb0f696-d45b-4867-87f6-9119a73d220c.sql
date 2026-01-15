-- Tabela para gerenciar sessões ativas (anti-multilogin)
CREATE TABLE public.active_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas sua própria sessão
CREATE POLICY "Users can view own session" 
ON public.active_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Usuários podem inserir sua própria sessão
CREATE POLICY "Users can insert own session" 
ON public.active_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar sua própria sessão
CREATE POLICY "Users can update own session" 
ON public.active_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Usuários podem deletar sua própria sessão
CREATE POLICY "Users can delete own session" 
ON public.active_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Index para performance
CREATE INDEX idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX idx_active_sessions_token ON public.active_sessions(session_token);