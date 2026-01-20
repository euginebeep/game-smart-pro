-- Create table to store password reset OTP codes
CREATE TABLE public.password_reset_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_otp ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for OTP validation (no auth required for password reset)
CREATE POLICY "Allow anonymous OTP operations"
ON public.password_reset_otp
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_password_reset_otp_email ON public.password_reset_otp(email);
CREATE INDEX idx_password_reset_otp_code ON public.password_reset_otp(otp_code);

-- Create function to cleanup expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_otp WHERE expires_at < now();
END;
$$;