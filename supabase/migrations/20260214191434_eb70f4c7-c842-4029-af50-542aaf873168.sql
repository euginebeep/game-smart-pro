
-- Tabela de preferências de notificação
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY,
  email_daily_picks BOOLEAN DEFAULT true,
  email_results BOOLEAN DEFAULT true,
  preferred_time TEXT DEFAULT '10:00',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification prefs" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Deny anonymous access
CREATE POLICY "Deny anonymous notification prefs" ON public.notification_preferences
  FOR ALL USING (false) WITH CHECK (false);

-- Inserir preferências default quando novo perfil é criado
CREATE OR REPLACE FUNCTION public.create_default_notification_prefs()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_notification_prefs
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_prefs();
