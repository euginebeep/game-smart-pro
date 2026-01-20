-- Update increment_search_count to handle FREE users (registration_source = 'free')
-- Free users get only 1 search per day (no trial access)
CREATE OR REPLACE FUNCTION public.increment_search_count(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_count integer;
  v_is_trial boolean;
  v_is_subscribed boolean;
  v_tier text;
  v_max_searches integer;
  v_registration_source text;
BEGIN
  -- Get user profile info including registration_source
  SELECT 
    (trial_end_date >= now() AND (subscription_status IS NULL OR subscription_status != 'active')) as is_trial,
    (subscription_status = 'active') as is_subscribed,
    COALESCE(subscription_tier, 'free') as tier,
    COALESCE(registration_source, 'organic') as reg_source
  INTO v_is_trial, v_is_subscribed, v_tier, v_registration_source
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Handle FREE registration source users (from "Receber Análise Grátis" button)
  -- They get 1 search/day, no trial benefits
  IF v_registration_source = 'free' AND NOT v_is_subscribed THEN
    v_max_searches := 1;
    v_tier := 'free';
    v_is_trial := false;
  -- Subscribed users have limits per tier
  ELSIF v_is_subscribed THEN
    CASE v_tier
      WHEN 'basic' THEN v_max_searches := 1;
      WHEN 'advanced' THEN v_max_searches := 3;
      WHEN 'premium' THEN v_max_searches := 6;
      ELSE v_max_searches := 1;
    END CASE;
  -- Trial users (organic) get 3 searches/day with premium features
  ELSIF v_is_trial THEN
    v_max_searches := 3;
    v_tier := 'premium';
  ELSE
    -- No trial, no subscription = blocked
    RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'is_trial', false, 'tier', 'free', 'registration_source', v_registration_source);
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
      'is_trial', v_is_trial,
      'tier', v_tier,
      'max_searches', v_max_searches,
      'registration_source', v_registration_source,
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
    'is_trial', v_is_trial,
    'tier', v_tier,
    'max_searches', v_max_searches,
    'registration_source', v_registration_source
  );
END;
$function$;