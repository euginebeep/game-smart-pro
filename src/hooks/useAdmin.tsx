import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  phone: string | null;
  subscription_tier: string;
  subscription_status: string | null;
  subscription_end_date: string | null;
  stripe_subscription_id: string | null;
  trial_start_date: string;
  trial_end_date: string;
  is_active: boolean;
  is_blocked: boolean;
  blocked_at: string | null;
  blocked_reason: string | null;
  registration_ip: string | null;
  registration_source: string | null;
  birth_date: string | null;
  created_at: string;
  today_searches: number;
  city: string | null;
  state: string | null;
  country_code: string | null;
}

interface SalesData {
  date: string;
  plan: string;
  type: 'recurring' | 'day_use';
  amount: number;
  customer_email: string;
}

interface ApiUsageData {
  apiFootballUsed: number;
  apiFootballLimit: number;
  apiFootballPercentage: number;
  apiFootballRemaining: number;
  apiFootballPlan: string;
  apiFootballError: string | null;
  oddsApiUsed: number;
  lastReset: string;
}

interface AdminAnalytics {
  totalApiCalls: number;
  todayApiCalls: number;
  topCities: { city: string; count: number }[];
  topStates: { state: string; count: number }[];
  topCountries: { country: string; count: number }[];
  todaySales: SalesData[];
  totalRevenueToday: number;
  recurringCount: number;
  dayUseCount: number;
  planBreakdown: { plan: string; count: number; revenue: number }[];
  apiUsage: ApiUsageData;
}

interface EmailFilters {
  city?: string;
  state?: string;
  country_code?: string;
  subscription_tier?: string;
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!roleData);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'list_users' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    } finally {
      setUsersLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<AdminUser>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'update_user', userId, updates }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const resetSearches = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'reset_searches', userId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error resetting searches:', error);
      throw error;
    }
  };

  const setSearchCount = async (userId: string, count: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'set_searches', userId, count }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error setting search count:', error);
      throw error;
    }
  };

  const blockUser = async (userId: string, blocked: boolean, reason?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'block_user', userId, blocked, reason }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'get_analytics' }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const sendMassEmail = async (filters: EmailFilters, subject: string, htmlContent: string, selectedUserIds?: string[]) => {
    setEmailLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'send_mass_email', filters, subject, htmlContent, selectedUserIds }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    } catch (error) {
      console.error('Error sending mass email:', error);
      throw error;
    } finally {
      setEmailLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'delete_user', userId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const getFilteredUserCount = async (filters: EmailFilters) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'get_filtered_users_count', filters }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data.count || 0;
    } catch (error) {
      console.error('Error getting filtered user count:', error);
      return 0;
    }
  };

  return {
    isAdmin,
    loading,
    users,
    usersLoading,
    analytics,
    emailLoading,
    fetchUsers,
    fetchAnalytics,
    updateUser,
    resetSearches,
    setSearchCount,
    blockUser,
    sendMassEmail,
    getFilteredUserCount,
    deleteUser
  };
}
