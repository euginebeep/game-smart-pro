-- Remove the "System can insert API usage" policy that has WITH CHECK (true)
DROP POLICY IF EXISTS "System can insert API usage" ON public.api_usage;