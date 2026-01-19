-- Adicionar campos de IP de cadastro, bloqueio e data de nascimento na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS registration_ip text,
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS blocked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS blocked_reason text,
ADD COLUMN IF NOT EXISTS birth_date date;

-- Criar índice para busca por IP
CREATE INDEX IF NOT EXISTS idx_profiles_registration_ip ON public.profiles(registration_ip);

-- Criar índice para filtrar usuários bloqueados
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked);

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.registration_ip IS 'IP address captured during user registration';
COMMENT ON COLUMN public.profiles.is_blocked IS 'Whether the user is blocked from accessing the system';
COMMENT ON COLUMN public.profiles.blocked_at IS 'Timestamp when the user was blocked';
COMMENT ON COLUMN public.profiles.blocked_reason IS 'Reason for blocking the user';
COMMENT ON COLUMN public.profiles.birth_date IS 'User date of birth for age verification (18+)';