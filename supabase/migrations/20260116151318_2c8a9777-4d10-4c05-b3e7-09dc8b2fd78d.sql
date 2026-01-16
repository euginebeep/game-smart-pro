-- Add city and state columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text;

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_country_code ON public.profiles(country_code);

-- Create table to track API usage
CREATE TABLE IF NOT EXISTS public.api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on api_usage
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Only admins can view all API usage
CREATE POLICY "Admins can view all API usage"
ON public.api_usage
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Users can insert their own usage
CREATE POLICY "System can insert API usage"
ON public.api_usage
FOR INSERT
WITH CHECK (true);

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON public.api_usage(endpoint);