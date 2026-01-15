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
  created_at: string;
  today_searches: number;
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

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

  return {
    isAdmin,
    loading,
    users,
    usersLoading,
    fetchUsers,
    updateUser,
    resetSearches,
    setSearchCount
  };
}
