import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Session token helpers
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

export interface Profile {
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

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  trialDaysRemaining: number;
  isTrialExpired: boolean;
  subscription: SubscriptionState;
  sessionInvalid: boolean;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  createCheckout: (tier: 'basic' | 'advanced' | 'premium', language?: string) => Promise<void>;
  createDayUseCheckout: (language?: string) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const tierLabels: Record<string, string> = {
  free: 'Gratuito',
  basic: 'Basic',
  advanced: 'Advanced',
  premium: 'Premium',
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionState>({
    tier: 'free', isSubscribed: false, subscriptionEnd: null, isLoading: false,
  });
  const [sessionInvalid, setSessionInvalid] = useState(false);

  const initialResolvedRef = useRef(false);
  const profileFetchedRef = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) { console.error('Error fetching profile:', error); return null; }
      return data as Profile;
    } catch (err) { console.error('Error in fetchProfile:', err); return null; }
  };

  const applyProfile = useCallback((p: Profile) => {
    profileFetchedRef.current = true;
    const ts = calculateTrialStatus(p);
    setProfile(p);
    setTrialDaysRemaining(ts.trialDaysRemaining);
    setIsTrialExpired(ts.isTrialExpired);
    setSubscription({
      tier: (p.subscription_tier as any) || 'free',
      isSubscribed: p.subscription_status === 'active',
      subscriptionEnd: p.subscription_end_date || null,
      isLoading: false,
    });
  }, []);

  const loadProfileInBackground = useCallback(async (userId: string) => {
    const p = await fetchProfile(userId);
    if (p) applyProfile(p);
  }, [applyProfile]);

  const clearAuthState = useCallback(() => {
    setProfile(null);
    setTrialDaysRemaining(0);
    setIsTrialExpired(false);
    setSubscription({ tier: 'free', isSubscribed: false, subscriptionEnd: null, isLoading: false });
  }, []);

  const resolveSession = useCallback((s: Session | null) => {
    setSession(s);
    setUser(s?.user ?? null);
    setLoading(false);
    if (s?.user) {
      loadProfileInBackground(s.user.id);
    } else {
      clearAuthState();
    }
  }, [loadProfileInBackground, clearAuthState]);

  // MAIN AUTH INITIALIZATION - single instance for the whole app
  useEffect(() => {
    let mounted = true;

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        if (!mounted) return;
        console.log('[AuthContext] onAuthStateChange:', event, !!s);

        if (!initialResolvedRef.current) {
          if (s?.user) {
            initialResolvedRef.current = true;
            resolveSession(s);
          }
          // Ignore null session before getSession resolves (Android PWA race)
          return;
        }

        // After initial resolution, update normally
        resolveSession(s);
      }
    );

    // getSession is the DEFINITIVE authority
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      console.log('[AuthContext] getSession result:', !!s);
      initialResolvedRef.current = true;
      resolveSession(s);
    }).catch(err => {
      console.error('[AuthContext] getSession error:', err);
      if (mounted) { initialResolvedRef.current = true; setLoading(false); }
    });

    // Safety fallback for very slow Android PWA
    const safetyTimer = setTimeout(() => {
      if (mounted && !initialResolvedRef.current) {
        console.warn('[AuthContext] Safety timeout');
        initialResolvedRef.current = true;
        supabase.auth.getSession().then(({ data: { session: s } }) => {
          if (mounted) resolveSession(s);
        }).catch(() => { if (mounted) setLoading(false); });
      }
    }, 8000);

    return () => { mounted = false; clearTimeout(safetyTimer); authSub.unsubscribe(); };
  }, [resolveSession]);

  // Real-time profile listener
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('profile-subscription-changes')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'profiles',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
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
            toast({ title: '🎉 Assinatura Atualizada!', description: `Seu plano foi alterado de ${oldTierLabel} para ${newTierLabel}. Aproveite os novos recursos!`, duration: 6000 });
          } else if (newProfile.subscription_tier === 'free' && oldProfile.subscription_tier !== 'free') {
            toast({ title: 'Assinatura Cancelada', description: `Seu plano ${oldTierLabel} foi cancelado.`, variant: 'destructive', duration: 6000 });
          }
        }
        if (oldProfile.subscription_status !== newProfile.subscription_status) {
          if (newProfile.subscription_status === 'active' && oldProfile.subscription_status !== 'active') {
            toast({ title: '✅ Pagamento Confirmado!', description: 'Sua assinatura está ativa.', duration: 5000 });
          } else if (newProfile.subscription_status === 'past_due') {
            toast({ title: '⚠️ Pagamento Pendente', description: 'Atualize seus dados de cobrança.', variant: 'destructive', duration: 8000 });
          } else if (newProfile.subscription_status === 'canceled') {
            toast({ title: 'Assinatura Cancelada', description: 'Ativa até o fim do período atual.', duration: 6000 });
          }
        }
        applyProfile(newProfile);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, applyProfile]);

  // Check subscription
  const checkSubscription = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s?.access_token) return;
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) { console.error('Error checking subscription:', error); return; }
      setSubscription(prev => {
        const newTier = data.tier || 'free';
        const newSub = data.subscribed || false;
        const newEnd = data.subscription_end || null;
        if (prev.tier === newTier && prev.isSubscribed === newSub && prev.subscriptionEnd === newEnd) return prev;
        return { tier: newTier, isSubscribed: newSub, subscriptionEnd: newEnd, isLoading: false };
      });
      if (s.user) await loadProfileInBackground(s.user.id);
    } catch (err) { console.error('Error in checkSubscription:', err); }
  }, [loadProfileInBackground]);

  // Auto-check subscription
  useEffect(() => {
    if (session?.access_token && profile) {
      const timer = setTimeout(checkSubscription, 2000);
      const interval = setInterval(checkSubscription, 60000);
      return () => { clearTimeout(timer); clearInterval(interval); };
    }
  }, [session?.access_token, profile, checkSubscription]);

  // Register session
  const registerSession = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s?.access_token) return;
    try {
      const sessionToken = getSessionToken();
      const deviceInfo = getDeviceInfo();
      await supabase.functions.invoke('validate-session', {
        body: { action: 'register', sessionToken, deviceInfo },
      });
    } catch (err) { console.error('Error in registerSession:', err); }
  }, []);

  useEffect(() => {
    if (session?.access_token && profile) {
      const timer = setTimeout(registerSession, 1500);
      return () => clearTimeout(timer);
    }
  }, [session?.access_token, profile, registerSession]);

  // Validate session (anti-multilogin)
  const validateSession = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s?.access_token) return;
    try {
      const sessionToken = getSessionToken();
      const { data, error } = await supabase.functions.invoke('validate-session', {
        body: { action: 'validate', sessionToken },
      });
      if (error) return;
      if (data && !data.valid) {
        setSessionInvalid(true);
        toast({
          title: '⚠️ Sessão Encerrada',
          description: `Sua conta foi acessada em outro dispositivo (${data.activeDevice || 'desconhecido'}).`,
          variant: 'destructive', duration: 8000,
        });
        setTimeout(() => supabase.auth.signOut(), 3000);
      }
    } catch (err) { console.error('Error in validateSession:', err); }
  }, []);

  useEffect(() => {
    if (session?.access_token && !sessionInvalid && profile) {
      const initialTimer = setTimeout(validateSession, 3000);
      const interval = setInterval(validateSession, 30000);
      return () => { clearTimeout(initialTimer); clearInterval(interval); };
    }
  }, [session?.access_token, sessionInvalid, profile, validateSession]);

  // URL subscription success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(checkSubscription, 2000);
    }
  }, [checkSubscription]);

  const signOut = async () => {
    try {
      await supabase.functions.invoke('validate-session', { body: { action: 'logout' } });
    } catch (err) { console.error('Error logging out session:', err); }
    sessionStorage.removeItem('eugine_session_token');
    await supabase.auth.signOut();
  };

  const createCheckout = async (tier: 'basic' | 'advanced' | 'premium', language?: string) => {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { tier, language: language || 'pt' },
    });
    if (error) throw error;
    if (data?.url) window.open(data.url, '_blank');
  };

  const createDayUseCheckout = async (language?: string) => {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { tier: 'dayuse', language: language || 'pt' },
    });
    if (error) throw error;
    if (data?.url) window.open(data.url, '_blank');
  };

  const openCustomerPortal = async () => {
    const { data, error } = await supabase.functions.invoke('customer-portal');
    if (error) throw error;
    if (data?.url) window.open(data.url, '_blank');
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading, trialDaysRemaining, isTrialExpired,
      subscription, sessionInvalid, signOut, checkSubscription,
      createCheckout, createDayUseCheckout, openCustomerPortal,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
