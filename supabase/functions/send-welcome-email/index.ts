import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  password: string;
  language?: string;
}

const getMotivationalQuote = (lang: string): string => {
  const quotes: Record<string, string[]> = {
    pt: [
      "O sucesso é a soma de pequenos esforços repetidos dia após dia. – Robert Collier",
      "A sorte favorece a mente preparada. – Louis Pasteur",
      "Grandes coisas nunca vieram de zonas de conforto. – Ben Francia",
      "O único lugar onde o sucesso vem antes do trabalho é no dicionário. – Vidal Sassoon",
    ],
    en: [
      "Success is the sum of small efforts repeated day in and day out. – Robert Collier",
      "Fortune favors the prepared mind. – Louis Pasteur",
      "Great things never came from comfort zones. – Ben Francia",
      "The only place where success comes before work is in the dictionary. – Vidal Sassoon",
    ],
    es: [
      "El éxito es la suma de pequeños esfuerzos repetidos día tras día. – Robert Collier",
      "La suerte favorece a la mente preparada. – Louis Pasteur",
      "Las grandes cosas nunca vinieron de las zonas de confort. – Ben Francia",
      "El único lugar donde el éxito viene antes del trabajo es en el diccionario. – Vidal Sassoon",
    ],
    it: [
      "Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno. – Robert Collier",
      "La fortuna aiuta le menti preparate. – Louis Pasteur",
      "Le grandi cose non sono mai venute dalle zone di comfort. – Ben Francia",
      "L'unico posto dove il successo viene prima del lavoro è nel dizionario. – Vidal Sassoon",
    ],
  };
  
  const langQuotes = quotes[lang] || quotes['en'];
  return langQuotes[Math.floor(Math.random() * langQuotes.length)];
};

const getEmailContent = (email: string, password: string, lang: string) => {
  const quote = getMotivationalQuote(lang);
  
  const content: Record<string, { subject: string; body: string }> = {
    pt: {
      subject: "🎉 Bem-vindo ao EUGINE - Sua Inteligência em Apostas!",
      body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; font-size: 32px; margin: 0; font-weight: 800; letter-spacing: -1px;">
        EUGINE<span style="font-size: 14px; vertical-align: super;">®</span>
      </h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0;">Inteligência Artificial em Apostas Esportivas</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #06b6d4; font-size: 24px; margin: 0 0 20px; font-weight: 700;">
        🎉 Parabéns! Sua conta foi criada com sucesso!
      </h2>
      
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
        Estamos muito felizes em tê-lo conosco! Você agora tem acesso à mais avançada plataforma de análise de apostas esportivas do mercado.
      </p>
      
      <!-- Credentials Box -->
      <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #06b6d4; font-size: 16px; margin: 0 0 15px; font-weight: 600;">
          📧 Suas Credenciais de Acesso:
        </h3>
        <div style="background: #1e293b; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
          <p style="color: #f1f5f9; font-size: 16px; margin: 0; font-weight: 600;">${email}</p>
        </div>
        <div style="background: #1e293b; border-radius: 8px; padding: 15px;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Senha</p>
          <p style="color: #f1f5f9; font-size: 16px; margin: 0; font-weight: 600; font-family: monospace; letter-spacing: 2px;">${password}</p>
        </div>
        <p style="color: #ef4444; font-size: 12px; margin: 15px 0 0; font-style: italic;">
          ⚠️ Por segurança, recomendamos alterar sua senha no primeiro acesso.
        </p>
      </div>
      
      <!-- Quote -->
      <div style="border-left: 4px solid #8b5cf6; padding-left: 20px; margin: 30px 0;">
        <p style="color: #a78bfa; font-size: 16px; font-style: italic; line-height: 1.6; margin: 0;">
          "${quote}"
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://www.eugineai.com/auth" 
           style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);">
          🚀 Acessar Minha Conta
        </a>
      </div>
      
      <!-- Features -->
      <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #a78bfa; font-size: 16px; margin: 0 0 15px;">O que você pode fazer agora:</h3>
        <ul style="color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>📊 Analisar jogos com inteligência artificial</li>
          <li>🎯 Receber recomendações com alta taxa de acerto</li>
          <li>📈 Acompanhar estatísticas detalhadas</li>
          <li>🦓 Descobrir as melhores zebras do dia</li>
        </ul>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #0f172a; padding: 30px; text-align: center; border-top: 1px solid rgba(100, 116, 139, 0.2);">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 10px;">
        Com os melhores cumprimentos,
      </p>
      <p style="color: #06b6d4; font-size: 18px; margin: 0 0 5px; font-weight: 700;">
        Equipe EUGINE
      </p>
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        GS ITALYINVESTMENTS
      </p>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(100, 116, 139, 0.2);">
        <p style="color: #475569; font-size: 11px; margin: 0;">
          Este email foi enviado automaticamente. Por favor, não responda.
        </p>
      </div>
    </div>
    
  </div>
</body>
</html>
      `,
    },
    en: {
      subject: "🎉 Welcome to EUGINE - Your Betting Intelligence!",
      body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; font-size: 32px; margin: 0; font-weight: 800; letter-spacing: -1px;">
        EUGINE<span style="font-size: 14px; vertical-align: super;">®</span>
      </h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0;">Artificial Intelligence for Sports Betting</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #06b6d4; font-size: 24px; margin: 0 0 20px; font-weight: 700;">
        🎉 Congratulations! Your account was successfully created!
      </h2>
      
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
        We're thrilled to have you with us! You now have access to the most advanced sports betting analysis platform on the market.
      </p>
      
      <!-- Credentials Box -->
      <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #06b6d4; font-size: 16px; margin: 0 0 15px; font-weight: 600;">
          📧 Your Login Credentials:
        </h3>
        <div style="background: #1e293b; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
          <p style="color: #f1f5f9; font-size: 16px; margin: 0; font-weight: 600;">${email}</p>
        </div>
        <div style="background: #1e293b; border-radius: 8px; padding: 15px;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">Password</p>
          <p style="color: #f1f5f9; font-size: 16px; margin: 0; font-weight: 600; font-family: monospace; letter-spacing: 2px;">${password}</p>
        </div>
        <p style="color: #ef4444; font-size: 12px; margin: 15px 0 0; font-style: italic;">
          ⚠️ For security, we recommend changing your password on first login.
        </p>
      </div>
      
      <!-- Quote -->
      <div style="border-left: 4px solid #8b5cf6; padding-left: 20px; margin: 30px 0;">
        <p style="color: #a78bfa; font-size: 16px; font-style: italic; line-height: 1.6; margin: 0;">
          "${quote}"
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://www.eugineai.com/auth" 
           style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);">
          🚀 Access My Account
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #0f172a; padding: 30px; text-align: center; border-top: 1px solid rgba(100, 116, 139, 0.2);">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 10px;">
        Best regards,
      </p>
      <p style="color: #06b6d4; font-size: 18px; margin: 0 0 5px; font-weight: 700;">
        EUGINE Team
      </p>
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        GS ITALYINVESTMENTS
      </p>
    </div>
    
  </div>
</body>
</html>
      `,
    },
    es: {
      subject: "🎉 ¡Bienvenido a EUGINE - Tu Inteligencia en Apuestas!",
      body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; font-size: 32px; margin: 0; font-weight: 800;">EUGINE<span style="font-size: 14px; vertical-align: super;">®</span></h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #06b6d4; font-size: 24px; margin: 0 0 20px;">🎉 ¡Felicidades! ¡Tu cuenta fue creada con éxito!</h2>
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">Estamos muy felices de tenerte con nosotros.</p>
      <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #06b6d4; font-size: 16px; margin: 0 0 15px;">📧 Tus Credenciales:</h3>
        <div style="background: #1e293b; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 5px;">EMAIL</p>
          <p style="color: #f1f5f9; font-size: 16px; margin: 0; font-weight: 600;">${email}</p>
        </div>
        <div style="background: #1e293b; border-radius: 8px; padding: 15px;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 5px;">CONTRASEÑA</p>
          <p style="color: #f1f5f9; font-size: 16px; margin: 0; font-weight: 600; font-family: monospace;">${password}</p>
        </div>
      </div>
      <div style="border-left: 4px solid #8b5cf6; padding-left: 20px; margin: 30px 0;">
        <p style="color: #a78bfa; font-size: 16px; font-style: italic;">"${quote}"</p>
      </div>
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://www.eugineai.com/auth" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700;">🚀 Acceder a Mi Cuenta</a>
      </div>
    </div>
    <div style="background: #0f172a; padding: 30px; text-align: center; border-top: 1px solid rgba(100, 116, 139, 0.2);">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 10px;">Saludos cordiales,</p>
      <p style="color: #06b6d4; font-size: 18px; margin: 0 0 5px; font-weight: 700;">Equipo EUGINE</p>
      <p style="color: #64748b; font-size: 12px; margin: 0;">GS ITALYINVESTMENTS</p>
    </div>
  </div>
</body>
</html>
      `,
    },
    it: {
      subject: "🎉 Benvenuto in EUGINE - La Tua Intelligenza nelle Scommesse!",
      body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; font-size: 32px; margin: 0; font-weight: 800;">EUGINE<span style="font-size: 14px; vertical-align: super;">®</span></h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #06b6d4; font-size: 24px; margin: 0 0 20px;">🎉 Congratulazioni! Il tuo account è stato creato con successo!</h2>
      <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">Siamo felicissimi di averti con noi.</p>
      <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #06b6d4; font-size: 16px; margin: 0 0 15px;">📧 Le Tue Credenziali:</h3>
        <div style="background: #1e293b; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 5px;">EMAIL</p>
          <p style="color: #f1f5f9; font-size: 16px; margin: 0; font-weight: 600;">${email}</p>
        </div>
        <div style="background: #1e293b; border-radius: 8px; padding: 15px;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 5px;">PASSWORD</p>
          <p style="color: #f1f5f9; font-size: 16px; margin: 0; font-weight: 600; font-family: monospace;">${password}</p>
        </div>
      </div>
      <div style="border-left: 4px solid #8b5cf6; padding-left: 20px; margin: 30px 0;">
        <p style="color: #a78bfa; font-size: 16px; font-style: italic;">"${quote}"</p>
      </div>
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://www.eugineai.com/auth" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700;">🚀 Accedi al Mio Account</a>
      </div>
    </div>
    <div style="background: #0f172a; padding: 30px; text-align: center; border-top: 1px solid rgba(100, 116, 139, 0.2);">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 10px;">Cordiali saluti,</p>
      <p style="color: #06b6d4; font-size: 18px; margin: 0 0 5px; font-weight: 700;">Team EUGINE</p>
      <p style="color: #64748b; font-size: 12px; margin: 0;">GS ITALYINVESTMENTS</p>
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
    const { email, password, language = 'pt' }: WelcomeEmailRequest = await req.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, body } = getEmailContent(email, password, language);

    const emailResponse = await resend.emails.send({
      from: "EUGINE <noreply@eugineai.com>",
      to: [email],
      subject,
      html: body,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);