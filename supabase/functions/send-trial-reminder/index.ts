import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting trial reminder check...");

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find users with trial ending in 2 days
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(23, 59, 59, 999);
    
    const twoDaysFromNowStart = new Date();
    twoDaysFromNowStart.setDate(twoDaysFromNowStart.getDate() + 2);
    twoDaysFromNowStart.setHours(0, 0, 0, 0);

    console.log(`Looking for users with trial ending between ${twoDaysFromNowStart.toISOString()} and ${twoDaysFromNow.toISOString()}`);

    const { data: usersToNotify, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email, trial_end_date')
      .eq('is_active', true)
      .gte('trial_end_date', twoDaysFromNowStart.toISOString())
      .lte('trial_end_date', twoDaysFromNow.toISOString());

    if (fetchError) {
      console.error("Error fetching users:", fetchError);
      throw new Error(`Error fetching users: ${fetchError.message}`);
    }

    console.log(`Found ${usersToNotify?.length || 0} users to notify`);

    if (!usersToNotify || usersToNotify.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No users to notify",
          notified: 0 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const user of usersToNotify) {
      try {
        console.log(`Sending reminder to: ${user.email}`);
        
        const trialEndDate = new Date(user.trial_end_date);
        const formattedDate = trialEndDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        const emailResponse = await resend.emails.send({
          from: "Eugine <onboarding@resend.dev>",
          to: [user.email],
          subject: "⚠️ Seu período de teste termina em 2 dias!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 40px; text-align: center;">
                    <h1 style="color: #f97316; font-size: 28px; margin: 0 0 20px 0;">⚽ Eugine</h1>
                    <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 20px 0;">Seu período de teste está acabando!</h2>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Olá! Estamos escrevendo para avisar que seu período de teste gratuito do <strong style="color: #f97316;">Eugine</strong> termina em <strong style="color: #ffffff;">2 dias</strong> (${formattedDate}).
                    </p>
                    <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid #f97316; border-radius: 12px; padding: 20px; margin: 20px 0;">
                      <p style="color: #f97316; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">⏰ Não perca acesso às suas análises!</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                        Após o término do trial, você não poderá mais acessar as previsões e análises de apostas.
                      </p>
                    </div>
                    <a href="https://eugine-analytics.com" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 14px 30px; border-radius: 8px; margin-top: 20px;">
                      Ver Planos de Assinatura
                    </a>
                    <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
                      Eugine - Análises inteligentes de apostas esportivas
                    </p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });

        console.log(`Email sent successfully to ${user.email}:`, emailResponse);
        results.push({ email: user.email, success: true });
      } catch (emailError: any) {
        console.error(`Error sending email to ${user.email}:`, emailError);
        results.push({ email: user.email, success: false, error: emailError.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Notification complete. Success: ${successCount}/${results.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified ${successCount} users`,
        notified: successCount,
        total: results.length,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-trial-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
