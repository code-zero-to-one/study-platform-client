'use client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { z } from 'zod';
import {
  AuthHydrationProvider,
  type AuthHydrationSession,
} from '@/features/auth/model/auth-hydration-context';
import { resetClientDerivedAuthState } from '@/features/auth/model/client-auth-cleanup';
import { useAuthReady } from '@/features/auth/model/use-auth';
import QueryProvider from '@/providers/query-provider';
import { useUserStore } from '@/stores/useUserStore';
import { AUTH_SESSION_STATES } from '@/types/auth/domain';

// Zod v4 객체 JIT는 브라우저에서 Function(...) 경로를 사용하므로 CSP와 충돌한다.
z.config({ jitless: true });

interface ProviderProps {
  children: React.ReactNode;
  initialSession?: AuthHydrationSession;
}

function UserInitializer({ children }: ProviderProps) {
  const { memberId: authMemberId, isHydrated, sessionState } = useAuthReady();
  const { memberId, fetchAndSetUser } = useUserStore();
  const isAuthenticatedMemberSession =
    sessionState === AUTH_SESSION_STATES.AUTHENTICATED_MEMBER;
  const previousAuthenticatedMemberIdRef = useRef<number | undefined>(
    undefined,
  );
  const hasInitializedRef = useRef(false);

  useLayoutEffect(() => {
    if (!isHydrated) {
      return;
    }

    const nextAuthenticatedMemberId =
      isAuthenticatedMemberSession && authMemberId ? authMemberId : undefined;
    const previousAuthenticatedMemberId =
      previousAuthenticatedMemberIdRef.current;

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      previousAuthenticatedMemberIdRef.current = nextAuthenticatedMemberId;

      if (!nextAuthenticatedMemberId) {
        resetClientDerivedAuthState();
      }

      return;
    }

    if (
      previousAuthenticatedMemberId !== undefined &&
      previousAuthenticatedMemberId !== nextAuthenticatedMemberId
    ) {
      resetClientDerivedAuthState();
      previousAuthenticatedMemberIdRef.current = nextAuthenticatedMemberId;

      return;
    }

    if (!nextAuthenticatedMemberId) {
      resetClientDerivedAuthState();
    }

    previousAuthenticatedMemberIdRef.current = nextAuthenticatedMemberId;
  }, [authMemberId, isAuthenticatedMemberSession, isHydrated]);

  useEffect(() => {
    // [보안 마이그레이션] sessionStorage 전환 이후 localStorage의 잔여 민감 데이터 정리.
    // 기존 사용자 브라우저에 남아있는 user-info-storage를 삭제하여 XSS 노출 경로 제거.
    localStorage.removeItem('user-info-storage');
  }, []);

  useLayoutEffect(() => {
    if (!isAuthenticatedMemberSession || !authMemberId) {
      return;
    }

    if (memberId !== authMemberId) {
      // eslint-disable-next-line no-void
      void fetchAndSetUser(authMemberId);
    }
  }, [isAuthenticatedMemberSession, authMemberId, memberId, fetchAndSetUser]);

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
