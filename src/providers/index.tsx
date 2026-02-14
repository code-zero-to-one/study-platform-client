'use client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { getCookie } from '@/api/client/cookie';
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
  const { memberId, fetchAndSetUser, reset } = useUserStore();

  useEffect(() => {
    if (!isAuthReady || !authMemberId) {
      return;
    }

    const cookieMemberId = Number(getCookie('memberId'));
    const hasValidCookieMemberId =
      Number.isInteger(cookieMemberId) && cookieMemberId > 0;

    if (!hasValidCookieMemberId || cookieMemberId !== authMemberId) {
      reset();

      return;
    }

    if (memberId !== authMemberId) {
      // eslint-disable-next-line no-void
      void fetchAndSetUser(authMemberId);
    }
  }, [isAuthReady, authMemberId, memberId, fetchAndSetUser, reset]);

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
