import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EugineChat } from './EugineChat';

export function PremiumChatWrapper() {
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setShowChat(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, trial_end_date')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) {
        setShowChat(false);
        return;
      }

      // Show for premium subscribers or active trial users
      const isPremium = profile.subscription_status === 'active' && profile.subscription_tier === 'premium';
      const isInTrial = new Date(profile.trial_end_date) > new Date() && profile.subscription_status !== 'active';
      
      setShowChat(isPremium || isInTrial);
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAccess();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!showChat) return null;
  return <EugineChat />;
}
