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
  const profileFetchedRef = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
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
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  const calculateTrialStatus = (profile: Profile | null) => {
    if (!profile) return { trialDaysRemaining: 0, isTrialExpired: true };

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

  // Load profile in background WITHOUT blocking the loading state
  const loadProfileInBackground = useCallback(async (userId: string) => {
    const profile = await fetchProfile(userId);
    if (profile) {
      profileFetchedRef.current = true;
      const trialStatus = calculateTrialStatus(profile);
      setAuthState(prev => ({
        ...prev,
        profile,
        ...trialStatus,
        subscription: {
          tier: profile.subscription_tier || 'free',
          isSubscribed: profile.subscription_status === 'active',
          subscriptionEnd: profile.subscription_end_date || null,
          isLoading: false,
        },
      }));
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setAuthState(prev => {
        const newTier = data.tier || 'free';
        const newIsSubscribed = data.subscribed || false;
        const newSubscriptionEnd = data.subscription_end || null;
        
        if (
          prev.subscription.tier === newTier &&
          prev.subscription.isSubscribed === newIsSubscribed &&
          prev.subscription.subscriptionEnd === newSubscriptionEnd
        ) {
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

      if (session.user) {
        await loadProfileInBackground(session.user.id);
      }
    } catch (err) {
      console.error('Error in checkSubscription:', err);
    }
  }, [loadProfileInBackground]);

  const createCheckout = async (tier: 'basic' | 'advanced' | 'premium', language?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier, language: language || 'pt' },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
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
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error creating Day Use checkout:', err);
      throw err;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error opening customer portal:', err);
      throw err;
    }
  };

  const registerSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    try {
      const sessionToken = getSessionToken();
      const deviceInfo = getDeviceInfo();
      const { data, error } = await supabase.functions.invoke('validate-session', {
        body: { action: 'register', sessionToken, deviceInfo },
      });
      if (error) console.error('Error registering session:', error);
      else console.log('Session registered:', data);
    } catch (err) {
      console.error('Error in registerSession:', err);
    }
  }, []);

  const validateSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    try {
      const sessionToken = getSessionToken();
      const { data, error } = await supabase.functions.invoke('validate-session', {
        body: { action: 'validate', sessionToken },
      });

      if (error) {
        console.error('Error validating session:', error);
        return;
      }

      if (data && !data.valid) {
        setAuthState(prev => ({ ...prev, sessionInvalid: true }));
        toast({
          title: '⚠️ Sessão Encerrada',
          description: `Sua conta foi acessada em outro dispositivo (${data.activeDevice || 'desconhecido'}). Você será desconectado.`,
          variant: 'destructive',
          duration: 8000,
        });
        setTimeout(() => supabase.auth.signOut(), 3000);
      }
    } catch (err) {
      console.error('Error in validateSession:', err);
    }
  }, []);

  // MAIN AUTH INITIALIZATION
  // Key principle: set loading=false as soon as we know if user exists or not.
  // Profile loads in background - don't block the UI for it.
  useEffect(() => {
    let mounted = true;

    // 1. Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('[useAuth] onAuthStateChange:', event, !!session);
        
        // IMMEDIATELY set user and loading=false
        // This unblocks ProtectedRoute right away
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));

        // Load profile in background (non-blocking)
        if (session?.user) {
          loadProfileInBackground(session.user.id);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            trialDaysRemaining: 0,
            isTrialExpired: false,
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

    // 2. Also check current session (in case onAuthStateChange is slow)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('[useAuth] getSession result:', !!session);
      
      // Set user and stop loading
      setAuthState(prev => ({
        ...prev,
        session: session ?? prev.session,
        user: session?.user ?? prev.user,
        loading: false,
      }));

      if (session?.user) {
        loadProfileInBackground(session.user.id);
      }
    }).catch(err => {
      console.error('[useAuth] getSession error:', err);
      if (mounted) {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    // 3. Safety timeout - absolute fallback for Android PWA edge cases
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setAuthState(prev => {
          if (!prev.loading) return prev;
          console.warn('[useAuth] Safety timeout: forcing loading=false');
          return { ...prev, loading: false };
        });
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [loadProfileInBackground]);

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
          
          const hasRelevantChanges = 
            oldProfile.subscription_tier !== newProfile.subscription_tier ||
            oldProfile.subscription_status !== newProfile.subscription_status ||
            oldProfile.subscription_end_date !== newProfile.subscription_end_date;
          
          if (!hasRelevantChanges) return;
          
          console.log('[REALTIME] Profile updated:', newProfile);

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

  // Auto-check subscription periodically (only after profile loaded)
  useEffect(() => {
    if (authState.session?.access_token && authState.profile) {
      const timer = setTimeout(checkSubscription, 2000);
      const interval = setInterval(checkSubscription, 60000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [authState.session?.access_token, authState.profile, checkSubscription]);

  // Register session after profile loaded
  useEffect(() => {
    if (authState.session?.access_token && authState.profile) {
      const timer = setTimeout(registerSession, 1500);
      return () => clearTimeout(timer);
    }
  }, [authState.session?.access_token, authState.profile, registerSession]);

  // Validate session periodically (anti-multilogin)
  useEffect(() => {
    if (authState.session?.access_token && !authState.sessionInvalid && authState.profile) {
      const initialTimer = setTimeout(validateSession, 3000);
      const interval = setInterval(validateSession, 30000);
      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }
  }, [authState.session?.access_token, authState.sessionInvalid, authState.profile, validateSession]);

  // Check URL for subscription success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(checkSubscription, 2000);
    }
  }, [checkSubscription]);

  const signOut = async () => {
    try {
      await supabase.functions.invoke('validate-session', {
        body: { action: 'logout' },
      });
    } catch (err) {
      console.error('Error logging out session:', err);
    }
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
