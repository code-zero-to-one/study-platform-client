'use client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import { useAuth } from '@/hooks/use-auth';
import QueryProvider from '@/providers/query-provider';

interface ProviderProps {
  children: React.ReactNode;
}

function UserInitializer({ children }: ProviderProps) {
  const { data: authData, isAuthenticated } = useAuth();
  const { memberId, fetchAndSetUser } = useUserStore();

  useEffect(() => {
    if (isAuthenticated && authData?.memberId && !memberId) {
      fetchAndSetUser(authData.memberId);
    }
  }, [isAuthenticated, authData?.memberId, memberId, fetchAndSetUser]);

  return <>{children}</>;
}

function MainProvider({ children }: ProviderProps) {
  return (
    <QueryProvider>
      <UserInitializer>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </UserInitializer>
    </QueryProvider>
  );
}

export default MainProvider;
