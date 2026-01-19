-- Atualizar a função handle_new_user para incluir birth_date
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, phone, country_code, timezone, city, state, birth_date)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'country_code', 'BR'),
    COALESCE(NEW.raw_user_meta_data ->> 'timezone', 'America/Sao_Paulo'),
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state',
    (NEW.raw_user_meta_data ->> 'birth_date')::date
  );
  RETURN NEW;
END;
$function$;