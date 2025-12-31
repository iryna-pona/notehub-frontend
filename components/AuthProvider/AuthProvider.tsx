'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { checkSession } from '@/lib/api/clientApi';

type Props = {
  children: ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const setUser = useAuthStore(state => state.setUser);
  const clearIsAuthenticated = useAuthStore(state => state.clearIsAuthenticated);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await checkSession();
        if (user) {
          setUser(user);
        } else {
          clearIsAuthenticated();
        }
      } catch {
        clearIsAuthenticated();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, clearIsAuthenticated]);

  if (loading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2rem',
          fontSize: '1.2rem',
        }}
      >
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}

