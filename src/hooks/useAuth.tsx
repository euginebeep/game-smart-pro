import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Gerar ID único para esta sessão do navegador
const getSessionToken = () => {
  let token = sessionStorage.getItem('eugine_session_token');
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem('eugine_session_token', token);
  }
  return token;
};

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
  const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)/)?.[0] || 'Unknown';
  return `${isMobile ? 'Mobile' : 'Desktop'} - ${browser}`;
};
interface Profile {
  id: string;
  user_id: string;
  email: string;
  phone: string | null;
  trial_start_date: string;
  trial_end_date: string;
  is_active: boolean;
  subscription_tier: 'free' | 'basic' | 'advanced' | 'premium';
  subscription_status: 'inactive' | 'active' | 'canceled' | 'past_due' | null;
  subscription_end_date: string | null;
  country_code: string | null;
  timezone: string | null;
  city: string | null;
  state: string | null;
}

interface SubscriptionState {
  tier: 'free' | 'basic' | 'advanced' | 'premium';
  isSubscribed: boolean;
  subscriptionEnd: string | null;
  isLoading: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  trialDaysRemaining: number;
  isTrialExpired: boolean;
  subscription: SubscriptionState;
  sessionInvalid: boolean;
}

const tierLabels: Record<string, string> = {
  free: 'Gratuito',
  basic: 'Basic',
  advanced: 'Advanced',
  premium: 'Premium',
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    trialDaysRemaining: 0,
    isTrialExpired: false,
    subscription: {
      tier: 'free',
      isSubscribed: false,
      subscriptionEnd: null,
      isLoading: false,
    },
    sessionInvalid: false,
  });

  const previousTierRef = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  };

  const calculateTrialStatus = (profile: Profile | null) => {
    if (!profile) return { trialDaysRemaining: 0, isTrialExpired: true };

    // Se tem assinatura ativa, não precisa de trial
    if (profile.subscription_status === 'active') {
      return { trialDaysRemaining: 0, isTrialExpired: false };
    }

    const now = new Date();
    const trialEnd = new Date(profile.trial_end_date);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      trialDaysRemaining: Math.max(0, diffDays),
      isTrialExpired: diffDays <= 0,
    };
  };

  const checkSubscription = useCallback(async () => {
    // Ensure we have a valid session with access token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.log('[checkSubscription] No valid session, skipping');
      return;
    }

    // Don't set loading state to avoid UI flickering
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      // Only update state if values actually changed
      setAuthState(prev => {
        const newTier = data.tier || 'free';
        const newIsSubscribed = data.subscribed || false;
        const newSubscriptionEnd = data.subscription_end || null;
        
        // Check if anything actually changed
        if (
          prev.subscription.tier === newTier &&
          prev.subscription.isSubscribed === newIsSubscribed &&
          prev.subscription.subscriptionEnd === newSubscriptionEnd
        ) {
          // No changes, don't update state
          return prev;
        }
        
        return {
          ...prev,
          subscription: {
            tier: newTier,
            isSubscribed: newIsSubscribed,
            subscriptionEnd: newSubscriptionEnd,
            isLoading: false,
          },
        };
      });

      // Atualizar profile local only if needed
      if (session.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          const trialStatus = calculateTrialStatus(profile);
          setAuthState(prev => {
            // Check if profile data actually changed
            if (
              prev.profile?.subscription_tier === profile.subscription_tier &&
              prev.profile?.subscription_status === profile.subscription_status &&
              prev.trialDaysRemaining === trialStatus.trialDaysRemaining
            ) {
              return prev;
            }
            return {
              ...prev,
              profile,
              ...trialStatus,
            };
          });
        }
      }
    } catch (err) {
      console.error('Error in checkSubscription:', err);
    }
  }, []);

  const createCheckout = async (tier: 'basic' | 'advanced' | 'premium', language?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier, language: language || 'pt' },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      throw err;
    }
  };

  const createDayUseCheckout = async (language?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier: 'dayuse', language: language || 'pt' },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error creating Day Use checkout:', err);
      throw err;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      throw err;
    }
  };

  // Registrar sessão no servidor para controle anti-multilogin
  const registerSession = useCallback(async () => {
    // Ensure we have a valid session with access token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.log('[registerSession] No valid session, skipping');
      return;
    }

    try {
      const sessionToken = getSessionToken();
      const deviceInfo = getDeviceInfo();
      
      const { data, error } = await supabase.functions.invoke('validate-session', {
        body: { 
          action: 'register', 
          sessionToken, 
          deviceInfo 
        },
      });

      if (error) {
        console.error('Error registering session:', error);
      } else {
        console.log('Session registered:', data);
      }
    } catch (err) {
      console.error('Error in registerSession:', err);
    }
  }, []);

  // Validar se a sessão atual ainda é válida
  const validateSession = useCallback(async () => {
    // Ensure we have a valid session with access token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.log('[validateSession] No valid session, skipping');
      return;
    }

    try {
      const sessionToken = getSessionToken();
      
      const { data, error } = await supabase.functions.invoke('validate-session', {
        body: { 
          action: 'validate', 
          sessionToken 
        },
      });

      if (error) {
        console.error('Error validating session:', error);
        return;
      }

      if (data && !data.valid) {
        // Sessão invalidada - outro dispositivo logou
        setAuthState(prev => ({ ...prev, sessionInvalid: true }));
        
        toast({
          title: '⚠️ Sessão Encerrada',
          description: `Sua conta foi acessada em outro dispositivo (${data.activeDevice || 'desconhecido'}). Você será desconectado.`,
          variant: 'destructive',
          duration: 8000,
        });

        // Fazer logout após mostrar a mensagem
        setTimeout(() => {
          supabase.auth.signOut();
        }, 3000);
      }
    } catch (err) {
      console.error('Error in validateSession:', err);
    }
  }, []);

  // Safety timeout: force loading=false after 10s, but try to recover session first
  useEffect(() => {
    const safetyTimer = setTimeout(async () => {
      setAuthState(prev => {
        if (!prev.loading) return prev; // Already resolved, do nothing
        return prev; // Keep as-is, we'll update below
      });
      
      // Check if still loading
      setAuthState(prev => {
        if (!prev.loading) return prev;
        
        // Try to get session one more time
        supabase.auth.getSession().then(({ data: { session } }) => {
          setAuthState(innerPrev => {
            if (!innerPrev.loading) return innerPrev;
            console.warn('[useAuth] Safety timeout: forcing loading=false after 10s, session:', !!session);
            if (session?.user) {
              // We have a session, set user and stop loading
              return {
                ...innerPrev,
                session,
                user: session.user,
                loading: false,
              };
            }
            return { ...innerPrev, loading: false };
          });
        }).catch(() => {
          setAuthState(innerPrev => {
            if (!innerPrev.loading) return innerPrev;
            console.warn('[useAuth] Safety timeout: getSession failed, forcing loading=false');
            return { ...innerPrev, loading: false };
          });
        });
        
        return prev;
      });
    }, 10000);
    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(profile => {
              const trialStatus = calculateTrialStatus(profile);
              setAuthState(prev => ({
                ...prev,
                profile,
                ...trialStatus,
                loading: false,
                subscription: {
                  tier: profile?.subscription_tier || 'free',
                  isSubscribed: profile?.subscription_status === 'active',
                  subscriptionEnd: profile?.subscription_end_date || null,
                  isLoading: false,
                },
              }));
            }).catch(err => {
              console.error('Error in onAuthStateChange fetchProfile:', err);
              setAuthState(prev => ({ ...prev, loading: false }));
            });
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            trialDaysRemaining: 0,
            isTrialExpired: false,
            loading: false,
            subscription: {
              tier: 'free',
              isSubscribed: false,
              subscriptionEnd: null,
              isLoading: false,
            },
          }));
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          const trialStatus = calculateTrialStatus(profile);
          setAuthState(prev => ({
            ...prev,
            profile,
            ...trialStatus,
            loading: false,
            subscription: {
              tier: profile?.subscription_tier || 'free',
              isSubscribed: profile?.subscription_status === 'active',
              subscriptionEnd: profile?.subscription_end_date || null,
              isLoading: false,
            },
          }));
        }).catch(err => {
          console.error('Error in getSession fetchProfile:', err);
          setAuthState(prev => ({ ...prev, loading: false }));
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time subscription status listener
  useEffect(() => {
    if (!authState.user) return;

    const channel = supabase
      .channel('profile-subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${authState.user.id}`,
        },
        (payload) => {
          const newProfile = payload.new as Profile;
          const oldProfile = payload.old as Partial<Profile>;
          
          // Only process if there are actual changes that matter
          const hasRelevantChanges = 
            oldProfile.subscription_tier !== newProfile.subscription_tier ||
            oldProfile.subscription_status !== newProfile.subscription_status ||
            oldProfile.subscription_end_date !== newProfile.subscription_end_date;
          
          if (!hasRelevantChanges) {
            console.log('[REALTIME] No relevant profile changes, skipping update');
            return;
          }
          
          console.log('[REALTIME] Profile updated:', newProfile);

          // Check for subscription tier change
          if (oldProfile.subscription_tier !== newProfile.subscription_tier) {
            const newTierLabel = tierLabels[newProfile.subscription_tier] || newProfile.subscription_tier;
            const oldTierLabel = tierLabels[oldProfile.subscription_tier || 'free'] || oldProfile.subscription_tier;
            
            if (newProfile.subscription_status === 'active') {
              toast({
                title: '🎉 Assinatura Atualizada!',
                description: `Seu plano foi alterado de ${oldTierLabel} para ${newTierLabel}. Aproveite os novos recursos!`,
                duration: 6000,
              });
            } else if (newProfile.subscription_tier === 'free' && oldProfile.subscription_tier !== 'free') {
              toast({
                title: 'Assinatura Cancelada',
                description: `Seu plano ${oldTierLabel} foi cancelado. Você pode reativar a qualquer momento.`,
                variant: 'destructive',
                duration: 6000,
              });
            }
          }

          // Check for subscription status change
          if (oldProfile.subscription_status !== newProfile.subscription_status) {
            if (newProfile.subscription_status === 'active' && oldProfile.subscription_status !== 'active') {
              toast({
                title: '✅ Pagamento Confirmado!',
                description: 'Sua assinatura está ativa. Obrigado por assinar!',
                duration: 5000,
              });
            } else if (newProfile.subscription_status === 'past_due') {
              toast({
                title: '⚠️ Pagamento Pendente',
                description: 'Houve um problema com seu pagamento. Por favor, atualize seus dados de cobrança.',
                variant: 'destructive',
                duration: 8000,
              });
            } else if (newProfile.subscription_status === 'canceled') {
              toast({
                title: 'Assinatura Cancelada',
                description: 'Sua assinatura foi cancelada e permanecerá ativa até o fim do período atual.',
                duration: 6000,
              });
            }
          }

          // Update local state
          const trialStatus = calculateTrialStatus(newProfile);
          setAuthState(prev => ({
            ...prev,
            profile: newProfile,
            ...trialStatus,
            subscription: {
              tier: newProfile.subscription_tier || 'free',
              isSubscribed: newProfile.subscription_status === 'active',
              subscriptionEnd: newProfile.subscription_end_date || null,
              isLoading: false,
            },
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authState.user]);

  // Auto-check subscription on page load and periodically
  // Only run after profile is loaded to ensure auth is fully initialized
  useEffect(() => {
    if (authState.session?.access_token && !authState.loading && authState.profile) {
      // Check on initial load with delay to ensure auth is propagated
      const timer = setTimeout(checkSubscription, 1000);
      
      // Check every 60 seconds
      const interval = setInterval(checkSubscription, 60000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [authState.session?.access_token, authState.loading, authState.profile, checkSubscription]);

  // Registrar sessão ao fazer login
  // Only run after profile is loaded to ensure auth is fully initialized
  useEffect(() => {
    if (authState.session?.access_token && !authState.loading && authState.profile) {
      // Delay to ensure auth state is fully propagated
      const timer = setTimeout(() => {
        registerSession();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [authState.session?.access_token, authState.loading, authState.profile, registerSession]);

  // Validar sessão periodicamente (anti-multilogin)
  // Only validate after profile is loaded to ensure auth is fully ready
  useEffect(() => {
    if (authState.session?.access_token && !authState.loading && !authState.sessionInvalid && authState.profile) {
      // Initial validation with longer delay to ensure auth is fully propagated
      const initialTimer = setTimeout(validateSession, 3000);
      // Validar a cada 30 segundos
      const interval = setInterval(validateSession, 30000);
      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }
  }, [authState.session?.access_token, authState.loading, authState.sessionInvalid, authState.profile, validateSession]);

  // Check URL for subscription success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      // Limpar URL
      window.history.replaceState({}, '', window.location.pathname);
      // Re-check subscription após sucesso
      setTimeout(checkSubscription, 2000);
    }
  }, [checkSubscription]);

  const signOut = async () => {
    // Limpar sessão no servidor
    try {
      await supabase.functions.invoke('validate-session', {
        body: { action: 'logout' },
      });
    } catch (err) {
      console.error('Error logging out session:', err);
    }
    
    // Limpar token local
    sessionStorage.removeItem('eugine_session_token');
    
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signOut,
    checkSubscription,
    createCheckout,
    createDayUseCheckout,
    openCustomerPortal,
  };
}
