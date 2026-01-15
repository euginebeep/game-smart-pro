-- Atualizar função para limites de busca por tier
-- Basic: 1/dia, Advanced: 3/dia, Premium: 6/dia, Trial: 3/dia (premium features)
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
BEGIN
  -- Get user profile info
  SELECT 
    (trial_end_date >= now() AND (subscription_status IS NULL OR subscription_status != 'active')) as is_trial,
    (subscription_status = 'active') as is_subscribed,
    COALESCE(subscription_tier, 'free') as tier
  INTO v_is_trial, v_is_subscribed, v_tier
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Determine max searches based on tier
  -- Subscribed users have limits per tier
  -- Trial users get 3 searches/day with premium features
  IF v_is_subscribed THEN
    CASE v_tier
      WHEN 'basic' THEN v_max_searches := 1;
      WHEN 'advanced' THEN v_max_searches := 3;
      WHEN 'premium' THEN v_max_searches := 6;
      ELSE v_max_searches := 1;
    END CASE;
  ELSIF v_is_trial THEN
    v_max_searches := 3;
    v_tier := 'premium'; -- Trial gets premium features
  ELSE
    -- No trial, no subscription = blocked
    RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'is_trial', false, 'tier', 'free');
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
    'max_searches', v_max_searches
  );
END;
$function$;

-- Atualizar função para verificar buscas restantes
CREATE OR REPLACE FUNCTION public.get_remaining_searches(p_user_id uuid)
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
BEGIN
  -- Get user profile info
  SELECT 
    (trial_end_date >= now() AND (subscription_status IS NULL OR subscription_status != 'active')) as is_trial,
    (subscription_status = 'active') as is_subscribed,
    COALESCE(subscription_tier, 'free') as tier
  INTO v_is_trial, v_is_subscribed, v_tier
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Determine max searches based on tier
  IF v_is_subscribed THEN
    CASE v_tier
      WHEN 'basic' THEN v_max_searches := 1;
      WHEN 'advanced' THEN v_max_searches := 3;
      WHEN 'premium' THEN v_max_searches := 6;
      ELSE v_max_searches := 1;
    END CASE;
  ELSIF v_is_trial THEN
    v_max_searches := 3;
    v_tier := 'premium';
  ELSE
    RETURN jsonb_build_object('remaining', 0, 'is_trial', false, 'tier', 'free', 'max_searches', 0);
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
    'is_trial', v_is_trial,
    'tier', v_tier,
    'max_searches', v_max_searches
  );
END;
$function$;