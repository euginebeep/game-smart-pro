import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  language?: string;
}

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getEmailContent = (otp: string, lang: string) => {
  const content: Record<string, { subject: string; body: string }> = {
    pt: {
      subject: "🔐 Código de Recuperação de Senha - EUGINE",
      body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;">
    
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 800;">
        🔐 Recuperação de Senha
      </h1>
    </div>
    
    <div style="padding: 40px 30px; text-align: center;">
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
        Você solicitou a recuperação de senha. Use o código abaixo:
      </p>
      
      <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2)); border: 2px dashed #06b6d4; border-radius: 16px; padding: 30px; margin: 30px 0;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 2px;">Seu Código</p>
        <p style="color: #06b6d4; font-size: 48px; font-weight: 800; margin: 0; letter-spacing: 8px; font-family: monospace;">
          ${otp}
        </p>
      </div>
      
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 30px 0;">
        <p style="color: #ef4444; font-size: 14px; margin: 0; font-weight: 600;">
          ⚠️ Este código expira em 2 MINUTOS!
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0;">
          Se você não solicitou esta recuperação, ignore este email.
        </p>
      </div>
    </div>
    
    <div style="background: #0f172a; padding: 25px; text-align: center; border-top: 1px solid rgba(100, 116, 139, 0.2);">
      <p style="color: #06b6d4; font-size: 16px; margin: 0 0 5px; font-weight: 700;">Equipe EUGINE</p>
      <p style="color: #64748b; font-size: 12px; margin: 0;">GS ITALYINVESTMENTS</p>
    </div>
  </div>
</body>
</html>
      `,
    },
    en: {
      subject: "🔐 Password Recovery Code - EUGINE",
      body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 800;">🔐 Password Recovery</h1>
    </div>
    <div style="padding: 40px 30px; text-align: center;">
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
        You requested a password recovery. Use the code below:
      </p>
      <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2)); border: 2px dashed #06b6d4; border-radius: 16px; padding: 30px; margin: 30px 0;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 2px;">Your Code</p>
        <p style="color: #06b6d4; font-size: 48px; font-weight: 800; margin: 0; letter-spacing: 8px; font-family: monospace;">${otp}</p>
      </div>
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 30px 0;">
        <p style="color: #ef4444; font-size: 14px; margin: 0; font-weight: 600;">⚠️ This code expires in 2 MINUTES!</p>
        <p style="color: #94a3b8; font-size: 12px; margin: 10px 0 0;">If you didn't request this recovery, please ignore this email.</p>
      </div>
    </div>
    <div style="background: #0f172a; padding: 25px; text-align: center; border-top: 1px solid rgba(100, 116, 139, 0.2);">
      <p style="color: #06b6d4; font-size: 16px; margin: 0 0 5px; font-weight: 700;">EUGINE Team</p>
      <p style="color: #64748b; font-size: 12px; margin: 0;">GS ITALYINVESTMENTS</p>
    </div>
  </div>
</body>
</html>
      `,
    },
    es: {
      subject: "🔐 Código de Recuperación de Contraseña - EUGINE",
      body: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; font-size: 28px; margin: 0;">🔐 Recuperación de Contraseña</h1>
    </div>
    <div style="padding: 40px 30px; text-align: center;">
      <p style="color: #94a3b8; font-size: 16px;">Usa el código a continuación:</p>
      <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2)); border: 2px dashed #06b6d4; border-radius: 16px; padding: 30px; margin: 30px 0;">
        <p style="color: #06b6d4; font-size: 48px; font-weight: 800; margin: 0; letter-spacing: 8px; font-family: monospace;">${otp}</p>
      </div>
      <p style="color: #ef4444; font-size: 14px;">⚠️ ¡Este código expira en 2 MINUTOS!</p>
    </div>
    <div style="background: #0f172a; padding: 25px; text-align: center;">
      <p style="color: #06b6d4; font-size: 16px; margin: 0; font-weight: 700;">Equipo EUGINE</p>
    </div>
  </div>
</body>
</html>
      `,
    },
    it: {
      subject: "🔐 Codice di Recupero Password - EUGINE",
      body: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; font-size: 28px; margin: 0;">🔐 Recupero Password</h1>
    </div>
    <div style="padding: 40px 30px; text-align: center;">
      <p style="color: #94a3b8; font-size: 16px;">Usa il codice qui sotto:</p>
      <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2)); border: 2px dashed #06b6d4; border-radius: 16px; padding: 30px; margin: 30px 0;">
        <p style="color: #06b6d4; font-size: 48px; font-weight: 800; margin: 0; letter-spacing: 8px; font-family: monospace;">${otp}</p>
      </div>
      <p style="color: #ef4444; font-size: 14px;">⚠️ Questo codice scade in 2 MINUTI!</p>
    </div>
    <div style="background: #0f172a; padding: 25px; text-align: center;">
      <p style="color: #06b6d4; font-size: 16px; margin: 0; font-weight: 700;">Team EUGINE</p>
    </div>
  </div>
</body>
</html>
      `,
    },
  };
  
  return content[lang] || content['en'];
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email, language = 'pt' }: OTPRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (!profile) {
      // Don't reveal if email exists or not for security
      return new Response(JSON.stringify({ success: true, message: "If the email exists, a code was sent" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cleanup old OTPs for this email
    await supabaseAdmin
      .from('password_reset_otp')
      .delete()
      .eq('email', email.toLowerCase().trim());

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Store OTP
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_otp')
      .insert({
        email: email.toLowerCase().trim(),
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      throw new Error("Failed to generate recovery code");
    }

    // Send email
    const { subject, body } = getEmailContent(otp, language);

    const emailResponse = await resend.emails.send({
      from: "EUGINE <noreply@eugineai.com>",
      to: [email],
      subject,
      html: body,
    });

    console.log("OTP email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Code sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);