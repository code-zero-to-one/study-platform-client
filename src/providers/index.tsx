'use client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useLayoutEffect } from 'react';
import {
  AuthHydrationProvider,
  type AuthHydrationSession,
} from '@/features/auth/model/auth-hydration-context';
import { PROTOTYPE_USER } from '@/mocks/prototype-mock';
import QueryProvider from '@/providers/query-provider';
import { useUserStore } from '@/stores/useUserStore';

interface ProviderProps {
  children: React.ReactNode;
  initialSession?: AuthHydrationSession;
}

function UserInitializer({ children }: ProviderProps) {
  const { setUserInfo } = useUserStore();

  // [프로토타입 브랜치] 항상 목업 유저 정보를 주입. API 호출 없음.
  useLayoutEffect(() => {
    setUserInfo(PROTOTYPE_USER);
  }, [setUserInfo]);

  useEffect(() => {
    // [보안 마이그레이션] sessionStorage 전환 이후 localStorage의 잔여 민감 데이터 정리.
    localStorage.removeItem('user-info-storage');
  }, []);

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
