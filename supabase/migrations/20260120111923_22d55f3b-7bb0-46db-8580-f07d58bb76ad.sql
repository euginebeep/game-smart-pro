-- Update handle_new_user function to capture registration_source
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, phone, country_code, timezone, city, state, birth_date, registration_source)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'country_code', 'BR'),
    COALESCE(NEW.raw_user_meta_data ->> 'timezone', 'America/Sao_Paulo'),
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'state',
    (NEW.raw_user_meta_data ->> 'birth_date')::date,
    COALESCE(NEW.raw_user_meta_data ->> 'registration_source', 'organic')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;