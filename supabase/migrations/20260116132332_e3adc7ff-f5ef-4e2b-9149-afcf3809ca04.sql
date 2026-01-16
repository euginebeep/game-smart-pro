-- Add country and timezone to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'BR',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo';

-- Create index for better performance on country lookups
CREATE INDEX IF NOT EXISTS idx_profiles_country_code ON public.profiles(country_code);