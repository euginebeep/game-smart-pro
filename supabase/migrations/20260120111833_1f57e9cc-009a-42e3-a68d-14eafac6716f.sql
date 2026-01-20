-- Add registration_source column to track where users registered from
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS registration_source text DEFAULT 'organic';

-- Add comment explaining the values
COMMENT ON COLUMN public.profiles.registration_source IS 'Source of registration: organic (normal), free (from free analysis button), paid (from pricing section)';

-- Create index for filtering by source
CREATE INDEX IF NOT EXISTS idx_profiles_registration_source ON public.profiles(registration_source);