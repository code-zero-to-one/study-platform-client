'use client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { AuthHydrationProvider } from '@/hooks/common/auth-hydration-context';
import { useAuthReady } from '@/hooks/common/use-auth';
import QueryProvider from '@/providers/query-provider';
import { useUserStore } from '@/stores/useUserStore';

interface ProviderProps {
  children: React.ReactNode;
  initialAccessToken?: string;
}

function UserInitializer({ children }: ProviderProps) {
  const { memberId: authMemberId, isAuthReady } = useAuthReady();
  const { memberId, fetchAndSetUser } = useUserStore();

  useEffect(() => {
    if (isAuthReady && authMemberId && !memberId) {
      fetchAndSetUser(authMemberId).catch(console.error);
    }
  }, [isAuthReady, authMemberId, memberId, fetchAndSetUser]);

  return <>{children}</>;
}

function MainProvider({ children, initialAccessToken }: ProviderProps) {
  return (
    <AuthHydrationProvider initialAccessToken={initialAccessToken}>
      <QueryProvider>
        <UserInitializer>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </UserInitializer>
      </QueryProvider>
    </AuthHydrationProvider>
  );
}

export default MainProvider;
