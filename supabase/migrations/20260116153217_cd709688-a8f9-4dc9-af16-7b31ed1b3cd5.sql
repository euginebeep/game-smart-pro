-- Deny anonymous access to sensitive tables
-- This prevents any bypass attempts by unauthenticated users

CREATE POLICY "Deny anonymous access" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access" 
ON public.active_sessions 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access" 
ON public.api_usage 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access" 
ON public.daily_searches 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny anonymous access" 
ON public.user_roles 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);