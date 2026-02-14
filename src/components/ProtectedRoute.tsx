import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Check if there's likely a stored session in localStorage
const hasStoredSession = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const value = localStorage.getItem(key);
        if (value) return true;
      }
    }
  } catch {
    // Ignore errors
  }
  return false;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [waitingForAuth, setWaitingForAuth] = useState(true);

  // On Android PWA, auth can take a few seconds to initialize
  // If there's a stored session, wait up to 5s before redirecting
  useEffect(() => {
    if (!loading && user) {
      setWaitingForAuth(false);
      return;
    }

    if (!loading && !user) {
      // Auth resolved with no user - but if there's a stored session, wait a bit more
      if (hasStoredSession()) {
        const timer = setTimeout(() => setWaitingForAuth(false), 3000);
        return () => clearTimeout(timer);
      }
      setWaitingForAuth(false);
      return;
    }
  }, [loading, user]);

  if (loading || (waitingForAuth && !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
