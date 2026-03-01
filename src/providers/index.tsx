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

  // 로컬 로그인의 경우 localStorage에 담은 유저정보를 로그아웃시 초기화하는 로직 (QA, Live 환경에선 사용하지 않음)
  useEffect(() => {
    if (isAuthReady) {
      const isAccessToken = getCookie('accessToken');

      if (!isAccessToken) {
        reset();
      }
    }
  }, [isAuthReady, memberId, reset]);

  useEffect(() => {
    // [보안 마이그레이션] sessionStorage 전환 이후 localStorage의 잔여 민감 데이터 정리.
    // 기존 사용자 브라우저에 남아있는 user-info-storage를 삭제하여 XSS 노출 경로 제거.
    localStorage.removeItem('user-info-storage');
  }, []);

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
