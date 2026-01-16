-- Update the handle_new_user function to include country_code and timezone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, phone, country_code, timezone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'country_code', 'BR'),
    COALESCE(NEW.raw_user_meta_data ->> 'timezone', 'America/Sao_Paulo')
  );
  RETURN NEW;
END;
$function$;