-- Fix api_usage INSERT policy to only allow authenticated users inserting their own records
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.api_usage;
CREATE POLICY "Users can insert their own usage" 
ON public.api_usage 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy for daily_searches (GDPR compliance)
CREATE POLICY "Users can delete their own searches"
ON public.daily_searches
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add DELETE policy for api_usage (GDPR compliance)
CREATE POLICY "Users can delete their own usage"
ON public.api_usage
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);