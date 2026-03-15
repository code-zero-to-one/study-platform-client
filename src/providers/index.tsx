'use client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useLayoutEffect } from 'react';
import {
  AuthHydrationProvider,
  type AuthHydrationSession,
} from '@/features/auth/model/auth-hydration-context';
import { useAuthReady } from '@/features/auth/model/use-auth';
import QueryProvider from '@/providers/query-provider';
import { useUserStore } from '@/stores/useUserStore';

interface ProviderProps {
  children: React.ReactNode;
  initialSession?: AuthHydrationSession;
}

function UserInitializer({ children }: ProviderProps) {
  const { memberId: authMemberId, isAuthReady, isHydrated } = useAuthReady();
  const { memberId, fetchAndSetUser, reset } = useUserStore();

  useLayoutEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthReady) {
      reset();
    }
  }, [isAuthReady, isHydrated, reset]);

  useEffect(() => {
    // [보안 마이그레이션] sessionStorage 전환 이후 localStorage의 잔여 민감 데이터 정리.
    // 기존 사용자 브라우저에 남아있는 user-info-storage를 삭제하여 XSS 노출 경로 제거.
    localStorage.removeItem('user-info-storage');
  }, []);

  useLayoutEffect(() => {
    if (!isAuthReady || !authMemberId) {
      return;
    }

    if (memberId !== authMemberId) {
      // eslint-disable-next-line no-void
      void fetchAndSetUser(authMemberId);
    }
  }, [isAuthReady, authMemberId, memberId, fetchAndSetUser]);

  return <>{children}</>;
}

function MainProvider({ children, initialSession }: ProviderProps) {
  return (
    <AuthHydrationProvider initialSession={initialSession}>
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
