import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  phone: string | null;
  trial_start_date: string;
  trial_end_date: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  trialDaysRemaining: number;
  isTrialExpired: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    trialDaysRemaining: 0,
    isTrialExpired: false,
  });

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

    const now = new Date();
    const trialEnd = new Date(profile.trial_end_date);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      trialDaysRemaining: Math.max(0, diffDays),
      isTrialExpired: diffDays <= 0,
    };
  };

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
              }));
            });
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            trialDaysRemaining: 0,
            isTrialExpired: false,
            loading: false,
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
          }));
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signOut,
  };
}