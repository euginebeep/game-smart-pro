import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-USERS] ${step}${detailsStr}`);
};

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
  'BR': 'Brasil',
  'PT': 'Portugal',
  'US': 'Estados Unidos',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colômbia',
  'MX': 'México',
  'ES': 'Espanha',
  'UK': 'Reino Unido',
  'DE': 'Alemanha',
  'FR': 'França',
  'IT': 'Itália',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify user using getClaims (signing-keys compatible)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    logStep("User authenticated", { userId: userId.substring(0, 8) });

    // Check if user is admin using service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      logStep("Access denied - not admin", { userId: userId.substring(0, 8) });
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
        const { userId: targetUserId, updates } = params;
        
        if (!targetUserId || !updates) {
          throw new Error('userId and updates are required');
        }

        logStep("Updating user", { userId: targetUserId.substring(0, 8), updates });

        const updateData: any = {
          updated_at: new Date().toISOString()
        };

        // Only include fields that are explicitly provided
        if (updates.subscription_tier !== undefined) updateData.subscription_tier = updates.subscription_tier;
        if (updates.subscription_status !== undefined) updateData.subscription_status = updates.subscription_status;
        if (updates.subscription_end_date !== undefined) updateData.subscription_end_date = updates.subscription_end_date;
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
        if (updates.phone !== undefined) updateData.phone = updates.phone;
        if (updates.is_blocked !== undefined) {
          updateData.is_blocked = updates.is_blocked;
          if (updates.is_blocked) {
            updateData.blocked_at = new Date().toISOString();
            updateData.blocked_reason = updates.blocked_reason || 'Blocked by admin';
          } else {
            updateData.blocked_at = null;
            updateData.blocked_reason = null;
          }
        }

        const { error } = await adminClient
          .from('profiles')
          .update(updateData)
          .eq('user_id', targetUserId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'block_user': {
        const { userId: targetUserId, blocked, reason } = params;
        
        if (!targetUserId) {
          throw new Error('userId is required');
        }

        logStep("Blocking/unblocking user", { userId: targetUserId.substring(0, 8), blocked });

        const { error } = await adminClient
          .from('profiles')
          .update({
            is_blocked: blocked,
            blocked_at: blocked ? new Date().toISOString() : null,
            blocked_reason: blocked ? (reason || 'Blocked by admin') : null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', targetUserId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reset_searches': {
        const { userId: targetUserId } = params;
        
        if (!targetUserId) {
          throw new Error('userId is required');
        }

        logStep("Resetting searches", { userId: targetUserId.substring(0, 8) });

        const { error } = await adminClient
          .from('daily_searches')
          .delete()
          .eq('user_id', targetUserId)
          .eq('search_date', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'set_searches': {
        const { userId: targetUserId, count } = params;
        
        if (!targetUserId || count === undefined) {
          throw new Error('userId and count are required');
        }

        logStep("Setting search count", { userId: targetUserId.substring(0, 8), count });

        const today = new Date().toISOString().split('T')[0];

        const { error } = await adminClient
          .from('daily_searches')
          .upsert({
            user_id: targetUserId,
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

      case 'get_analytics': {
        logStep("Fetching analytics");

        // Get total daily searches (as proxy for API usage)
        const { data: allSearches } = await adminClient
          .from('daily_searches')
          .select('search_count');
        
        const totalApiCalls = allSearches?.reduce((sum, s) => sum + (s.search_count || 0), 0) || 0;

        // Get today's searches
        const today = new Date().toISOString().split('T')[0];
        const { data: todaySearches } = await adminClient
          .from('daily_searches')
          .select('search_count')
          .eq('search_date', today);
        
        const todayApiCalls = todaySearches?.reduce((sum, s) => sum + (s.search_count || 0), 0) || 0;

        // Get profiles for geographic analytics
        const { data: profiles } = await adminClient
          .from('profiles')
          .select('city, state, country_code, subscription_tier, subscription_status, stripe_subscription_id, created_at');

        const cityCount: Record<string, number> = {};
        const stateCount: Record<string, number> = {};
        const countryCount: Record<string, number> = {};

        profiles?.forEach(p => {
          if (p.city) {
            const cityKey = p.city.trim().toLowerCase();
            cityCount[cityKey] = (cityCount[cityKey] || 0) + 1;
          }
          if (p.state) {
            stateCount[p.state] = (stateCount[p.state] || 0) + 1;
          }
          if (p.country_code) {
            countryCount[p.country_code] = (countryCount[p.country_code] || 0) + 1;
          }
        });

        const topCities = Object.entries(cityCount)
          .map(([city, count]) => ({ city: city.charAt(0).toUpperCase() + city.slice(1), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        const topStates = Object.entries(stateCount)
          .map(([state, count]) => ({ state, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        const topCountries = Object.entries(countryCount)
          .map(([country, count]) => ({ 
            country: COUNTRY_NAMES[country] || country, 
            code: country,
            count 
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Get Stripe sales data for today
        let todaySales: any[] = [];
        let totalRevenueToday = 0;
        let recurringCount = 0;
        let dayUseCount = 0;
        const planBreakdown: Record<string, { count: number; revenue: number }> = {};

        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (stripeKey) {
          try {
            const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
            
            // Get today's start and end in Unix timestamp
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            // Get recent payment intents
            const paymentIntents = await stripe.paymentIntents.list({
              created: {
                gte: Math.floor(todayStart.getTime() / 1000),
                lte: Math.floor(todayEnd.getTime() / 1000)
              },
              limit: 100
            });

            // Get recent subscriptions
            const subscriptions = await stripe.subscriptions.list({
              created: {
                gte: Math.floor(todayStart.getTime() / 1000),
                lte: Math.floor(todayEnd.getTime() / 1000)
              },
              limit: 100
            });

            // Process payment intents (includes one-time payments like Day Use)
            for (const pi of paymentIntents.data) {
              if (pi.status === 'succeeded') {
                const amount = pi.amount / 100; // Convert from cents
                totalRevenueToday += amount;
                
                // Check if it's a subscription or one-time
                const isRecurring = pi.invoice !== null;
                if (isRecurring) {
                  recurringCount++;
                } else {
                  dayUseCount++;
                }

                // Determine plan from metadata or amount
                let planName = 'day_use';
                if (pi.metadata?.tier) {
                  planName = pi.metadata.tier;
                } else if (amount >= 79) {
                  planName = 'premium';
                } else if (amount >= 49) {
                  planName = 'advanced';
                } else if (amount >= 29) {
                  planName = 'basic';
                }

                if (!planBreakdown[planName]) {
                  planBreakdown[planName] = { count: 0, revenue: 0 };
                }
                planBreakdown[planName].count++;
                planBreakdown[planName].revenue += amount;

                todaySales.push({
                  date: new Date(pi.created * 1000).toISOString(),
                  plan: planName,
                  type: isRecurring ? 'recurring' : 'day_use',
                  amount,
                  customer_email: pi.receipt_email || 'N/A'
                });
              }
            }

            // Also check for new subscriptions
            for (const sub of subscriptions.data) {
              if (sub.status === 'active' || sub.status === 'trialing') {
                recurringCount++;
              }
            }

          } catch (stripeError: unknown) {
            const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error';
            logStep("Stripe error (non-fatal)", { error: errorMessage });
          }
        }

        // Get REAL API-Football usage from their status endpoint
        let apiFootballUsed = 0;
        let apiFootballLimit = 100;
        let apiFootballPercentage = 0;
        let apiFootballPlan = 'Free';
        let apiFootballRemaining = 0;
        let apiFootballError: string | null = null;

        const apiFootballKey = Deno.env.get('API_FOOTBALL_KEY');
        if (apiFootballKey) {
          try {
            logStep("Fetching API-Football status");
            const statusResponse = await fetch('https://v3.football.api-sports.io/status', {
              headers: {
                'x-apisports-key': apiFootballKey
              }
            });

            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              logStep("API-Football status received", statusData);

              if (statusData.response) {
                const account = statusData.response.account;
                const subscription = statusData.response.subscription;
                const requests = statusData.response.requests;

                apiFootballPlan = subscription?.plan || 'Unknown';
                apiFootballLimit = requests?.limit_day || 100;
                apiFootballUsed = requests?.current || 0;
                apiFootballRemaining = apiFootballLimit - apiFootballUsed;
                apiFootballPercentage = apiFootballLimit > 0 
                  ? Math.min(100, (apiFootballUsed / apiFootballLimit) * 100) 
                  : 0;
              }
            } else {
              apiFootballError = `Status ${statusResponse.status}`;
              logStep("API-Football status error", { status: statusResponse.status });
            }
          } catch (apiError: unknown) {
            const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
            apiFootballError = errorMessage;
            logStep("API-Football fetch error", { error: errorMessage });
          }
        } else {
          apiFootballError = 'API_FOOTBALL_KEY not configured';
        }

        // Get Odds API usage from api_usage table
        const { data: oddsApiUsage } = await adminClient
          .from('api_usage')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        
        const oddsApiUsed = oddsApiUsage?.length || 0;

        return new Response(
          JSON.stringify({ 
            analytics: {
              totalApiCalls,
              todayApiCalls,
              topCities,
              topStates,
              topCountries,
              todaySales,
              totalRevenueToday,
              recurringCount,
              dayUseCount,
              planBreakdown: Object.entries(planBreakdown).map(([plan, data]) => ({
                plan,
                count: data.count,
                revenue: data.revenue
              })),
              apiUsage: {
                apiFootballUsed,
                apiFootballLimit,
                apiFootballPercentage,
                apiFootballRemaining,
                apiFootballPlan,
                apiFootballError,
                oddsApiUsed,
                lastReset: new Date().toISOString().split('T')[0]
              }
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_filtered_users_count': {
        const { filters } = params;
        logStep("Getting filtered users count", { filters });

        let query = adminClient.from('profiles').select('id', { count: 'exact' });

        if (filters?.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }
        if (filters?.state) {
          query = query.eq('state', filters.state);
        }
        if (filters?.country_code) {
          query = query.eq('country_code', filters.country_code);
        }
        if (filters?.subscription_tier) {
          query = query.eq('subscription_tier', filters.subscription_tier);
        }

        const { count, error } = await query;

        if (error) throw error;

        return new Response(
          JSON.stringify({ count: count || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'send_mass_email': {
        const { filters, subject, htmlContent, selectedUserIds } = params;
        logStep("Sending mass email", { filters, subject: subject?.substring(0, 30), selectedCount: selectedUserIds?.length });

        const resendKey = Deno.env.get('RESEND_API_KEY');
        if (!resendKey) {
          throw new Error('RESEND_API_KEY not configured');
        }

        const resend = new Resend(resendKey);

        let users: any[] = [];

        // If specific users are selected, use those
        if (selectedUserIds && selectedUserIds.length > 0) {
          const { data, error } = await adminClient
            .from('profiles')
            .select('email, city, state, country_code, subscription_tier')
            .in('user_id', selectedUserIds);
          
          if (error) throw error;
          users = data || [];
        } else {
          // Build query with filters
          let query = adminClient.from('profiles').select('email, city, state, country_code, subscription_tier');

          if (filters?.city) {
            query = query.ilike('city', `%${filters.city}%`);
          }
          if (filters?.state) {
            query = query.eq('state', filters.state);
          }
          if (filters?.country_code) {
            query = query.eq('country_code', filters.country_code);
          }
          if (filters?.subscription_tier) {
            query = query.eq('subscription_tier', filters.subscription_tier);
          }

          const { data, error } = await query;
          if (error) throw error;
          users = data || [];
        }

        if (!users || users.length === 0) {
          return new Response(
            JSON.stringify({ success: false, message: 'No users match the filters', sent: 0 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Send emails in batches
        const batchSize = 50;
        let sentCount = 0;
        let failedCount = 0;

        for (let i = 0; i < users.length; i += batchSize) {
          const batch = users.slice(i, i + batchSize);
          
          for (const user of batch) {
            try {
              await resend.emails.send({
                from: 'Eugine <noreply@resend.dev>',
                to: [user.email],
                subject: subject,
                html: htmlContent
              });
              sentCount++;
            } catch (emailError: unknown) {
              const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
              logStep("Email send error", { email: user.email, error: errorMessage });
              failedCount++;
            }
          }

          // Small delay between batches to avoid rate limits
          if (i + batchSize < users.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        logStep("Mass email complete", { sent: sentCount, failed: failedCount });

        return new Response(
          JSON.stringify({ 
            success: true, 
            sent: sentCount, 
            failed: failedCount,
            total: users.length 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete_user': {
        const { userId: targetUserId } = params;
        
        if (!targetUserId) {
          throw new Error('userId is required');
        }

        logStep("Deleting user", { userId: targetUserId.substring(0, 8) });

        // Delete related data first
        await adminClient.from('daily_searches').delete().eq('user_id', targetUserId);
        await adminClient.from('api_usage').delete().eq('user_id', targetUserId);
        await adminClient.from('active_sessions').delete().eq('user_id', targetUserId);
        await adminClient.from('user_roles').delete().eq('user_id', targetUserId);
        
        // Delete profile
        const { error: profileError } = await adminClient
          .from('profiles')
          .delete()
          .eq('user_id', targetUserId);

        if (profileError) throw profileError;

        // Delete auth user using admin API
        const { error: authError } = await adminClient.auth.admin.deleteUser(targetUserId);
        
        if (authError) {
          logStep("Warning: Could not delete auth user", { error: authError.message });
        }

        logStep("User deleted successfully", { userId: targetUserId.substring(0, 8) });

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
