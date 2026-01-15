-- Change default trial period from 10 days to 7 days
ALTER TABLE public.profiles 
ALTER COLUMN trial_end_date SET DEFAULT (now() + '7 days'::interval);

-- Create table to track daily search usage
CREATE TABLE public.daily_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_date date NOT NULL DEFAULT CURRENT_DATE,
  search_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, search_date)
);

-- Enable RLS
ALTER TABLE public.daily_searches ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_searches
CREATE POLICY "Users can view their own search count"
ON public.daily_searches
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search record"
ON public.daily_searches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search count"
ON public.daily_searches
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to increment search count and check limit
CREATE OR REPLACE FUNCTION public.increment_search_count(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count integer;
  v_is_trial boolean;
  v_max_searches integer := 3;
BEGIN
  -- Check if user is on trial (not subscribed)
  SELECT (trial_end_date >= now()) INTO v_is_trial
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- If not on trial or no profile found, allow unlimited searches
  IF v_is_trial IS NULL OR v_is_trial = false THEN
    RETURN jsonb_build_object('allowed', true, 'remaining', -1, 'is_trial', false);
  END IF;
  
  -- Get or create today's search record
  INSERT INTO public.daily_searches (user_id, search_date, search_count)
  VALUES (p_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, search_date) DO NOTHING;
  
  -- Get current count
  SELECT search_count INTO v_current_count
  FROM public.daily_searches
  WHERE user_id = p_user_id AND search_date = CURRENT_DATE;
  
  -- Check if limit reached
  IF v_current_count >= v_max_searches THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'remaining', 0, 
      'is_trial', true,
      'message', 'Daily search limit reached'
    );
  END IF;
  
  -- Increment count
  UPDATE public.daily_searches
  SET search_count = search_count + 1, updated_at = now()
  WHERE user_id = p_user_id AND search_date = CURRENT_DATE;
  
  RETURN jsonb_build_object(
    'allowed', true, 
    'remaining', v_max_searches - v_current_count - 1, 
    'is_trial', true
  );
END;
$$;

-- Function to get remaining searches for today
CREATE OR REPLACE FUNCTION public.get_remaining_searches(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count integer;
  v_is_trial boolean;
  v_max_searches integer := 3;
BEGIN
  -- Check if user is on trial
  SELECT (trial_end_date >= now()) INTO v_is_trial
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  IF v_is_trial IS NULL OR v_is_trial = false THEN
    RETURN jsonb_build_object('remaining', -1, 'is_trial', false, 'max_searches', v_max_searches);
  END IF;
  
  -- Get current count for today
  SELECT COALESCE(search_count, 0) INTO v_current_count
  FROM public.daily_searches
  WHERE user_id = p_user_id AND search_date = CURRENT_DATE;
  
  IF v_current_count IS NULL THEN
    v_current_count := 0;
  END IF;
  
  RETURN jsonb_build_object(
    'remaining', v_max_searches - v_current_count, 
    'is_trial', true,
    'max_searches', v_max_searches
  );
END;
$$;