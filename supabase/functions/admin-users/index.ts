import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-USERS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify admin using user's token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    logStep("User authenticated", { userId: user.id.substring(0, 8) });

    // Check if user is admin using service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      logStep("Access denied - not admin", { userId: user.id.substring(0, 8) });
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep("Admin verified");

    const { action, ...params } = await req.json();
    logStep("Action requested", { action });

    switch (action) {
      case 'list_users': {
        const { data: profiles, error } = await adminClient
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get today's search counts
        const { data: searches } = await adminClient
          .from('daily_searches')
          .select('user_id, search_count')
          .eq('search_date', new Date().toISOString().split('T')[0]);

        const searchMap = new Map(searches?.map(s => [s.user_id, s.search_count]) || []);

        const users = profiles?.map(p => ({
          ...p,
          today_searches: searchMap.get(p.user_id) || 0
        }));

        return new Response(
          JSON.stringify({ users }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_user': {
        const { userId, updates } = params;
        
        if (!userId || !updates) {
          throw new Error('userId and updates are required');
        }

        logStep("Updating user", { userId: userId.substring(0, 8), updates });

        const { error } = await adminClient
          .from('profiles')
          .update({
            subscription_tier: updates.subscription_tier,
            subscription_status: updates.subscription_status,
            subscription_end_date: updates.subscription_end_date,
            is_active: updates.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reset_searches': {
        const { userId } = params;
        
        if (!userId) {
          throw new Error('userId is required');
        }

        logStep("Resetting searches", { userId: userId.substring(0, 8) });

        const { error } = await adminClient
          .from('daily_searches')
          .delete()
          .eq('user_id', userId)
          .eq('search_date', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'set_searches': {
        const { userId, count } = params;
        
        if (!userId || count === undefined) {
          throw new Error('userId and count are required');
        }

        logStep("Setting search count", { userId: userId.substring(0, 8), count });

        const today = new Date().toISOString().split('T')[0];

        const { error } = await adminClient
          .from('daily_searches')
          .upsert({
            user_id: userId,
            search_date: today,
            search_count: count,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,search_date'
          });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error: any) {
    logStep("Error", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
