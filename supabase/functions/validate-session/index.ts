import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-SESSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'validate';
    const sessionToken = body.sessionToken;
    const deviceInfo = body.deviceInfo || 'Unknown Device';
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

    logStep("Request info", { action, userId: userId.substring(0, 8) + '...' });

    if (action === 'register') {
      // Registrar nova sessão usando upsert para evitar race conditions
      if (!sessionToken) {
        throw new Error("Session token is required for registration");
      }

      // Usar upsert para atualizar ou inserir sessão
      const { error: upsertError } = await supabaseAdmin
        .from('active_sessions')
        .upsert({
          user_id: userId,
          session_token: sessionToken,
          device_info: deviceInfo,
          ip_address: ipAddress,
          last_active_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        logStep("Error upserting session", { error: upsertError.message });
        throw new Error("Failed to register session");
      }

      logStep("Session registered", { userId: userId.substring(0, 8) + '...' });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Session registered" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === 'validate') {
      // Validar se a sessão atual é a sessão ativa
      if (!sessionToken) {
        throw new Error("Session token is required for validation");
      }

      const { data: sessionData, error: sessionError } = await supabaseAdmin
        .from('active_sessions')
        .select('session_token, device_info, last_active_at')
        .eq('user_id', userId)
        .single();

      if (sessionError || !sessionData) {
        // Nenhuma sessão registrada, permitir
        return new Response(JSON.stringify({ 
          valid: true, 
          message: "No session registered" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const isValid = sessionData.session_token === sessionToken;

      if (isValid) {
        // Atualizar last_active_at
        await supabaseAdmin
          .from('active_sessions')
          .update({ last_active_at: new Date().toISOString() })
          .eq('user_id', userId);
      }

      logStep("Session validated", { 
        valid: isValid, 
        userId: userId.substring(0, 8) + '...',
        currentDevice: isValid ? 'match' : 'different'
      });

      return new Response(JSON.stringify({ 
        valid: isValid,
        message: isValid ? "Session is valid" : "Session invalidated - another device logged in",
        activeDevice: !isValid ? sessionData.device_info : undefined
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === 'logout') {
      // Remover sessão
      await supabaseAdmin
        .from('active_sessions')
        .delete()
        .eq('user_id', userId);

      logStep("Session removed", { userId: userId.substring(0, 8) + '...' });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Session logged out" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Invalid action");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
