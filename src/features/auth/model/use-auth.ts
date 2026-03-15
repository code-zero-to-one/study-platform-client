'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getCookie } from '@/api/client/cookie';
import { getMemberId } from '@/api/endpoints/auth/auth';
import {
  AUTH_SESSION_STATES,
  AUTH_VENDORS,
  type AuthSessionState,
  type AuthRoleId,
  type AuthVendor,
} from '@/types/auth/domain';
import { decodeJwt } from '@/utils/jwt';
import { AUTH_COOKIE_NAMES } from './auth-cookie';
import { useAuthHydration } from './auth-hydration-context';
import { resolveTokenBackedSession } from './auth-session';
import {
  isAuthSessionStorageEvent,
  subscribeAuthSessionChange,
} from './client-auth-sync';

export const useMemberId = () => {
  const { isAuthenticated, memberId } = useAuth();

  return useQuery<{ memberId: string }>({
    queryKey: ['member', memberId ?? 'me'],
    queryFn: getMemberId,
    enabled: isAuthenticated,
  });
};

export interface DecodedToken {
  roleIds: AuthRoleId[];
  authVendor: AuthVendor;
  memberId?: number | null;
  sub: string;
  iat: number;
  exp: number;
}

interface UseAuthReturn {
  accessToken: string | undefined;
  data: DecodedToken | undefined;
  isAuthenticated: boolean;
  isHydrated: boolean;
  memberId?: number;
  sessionState: AuthSessionState;
}

function isDecodedToken(value: unknown): value is DecodedToken {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (!Array.isArray(obj.roleIds)) {
    return false;
  }

  const validVendors = Object.values(AUTH_VENDORS);
  if (!validVendors.includes(obj.authVendor as AuthVendor)) return false;

  if (
    typeof obj.memberId !== 'number' &&
    obj.memberId !== null &&
    obj.memberId !== undefined
  ) {
    return false;
  }

  if (typeof obj.sub !== 'string') {
    return false;
  }

  if (typeof obj.iat !== 'number' || typeof obj.exp !== 'number') {
    return false;
  }

  return true;
}

const hasDecodedMemberId = (token: DecodedToken | undefined): boolean =>
  typeof token?.memberId === 'number';

interface ClientAuthSnapshot {
  accessToken: string | undefined;
  data: DecodedToken | undefined;
  isAuthenticated: boolean;
  memberId?: number;
  sessionState: AuthSessionState;
}

const createAnonymousSnapshot = (): ClientAuthSnapshot => ({
  accessToken: undefined,
  data: undefined,
  isAuthenticated: false,
  memberId: undefined,
  sessionState: AUTH_SESSION_STATES.ANONYMOUS,
});

const decodeClientToken = (
  accessToken: string | undefined,
): DecodedToken | undefined => {
  if (!accessToken) {
    return undefined;
  }

  try {
    const decoded = decodeJwt(accessToken);

    if (!decoded || !isDecodedToken(decoded)) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('JWT 구조가 예상과 다릅니다.', decoded);
      }

      return undefined;
    }

    return decoded;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('JWT 디코딩에 실패했습니다.', error);
    }

    return undefined;
  }
};

const createClientAuthSnapshot = ({
  accessToken,
  memberId,
}: {
  accessToken?: string;
  memberId?: string;
}): ClientAuthSnapshot => {
  const decodedToken = decodeClientToken(accessToken);
  const resolvedSession = resolveTokenBackedSession({
    accessToken,
    memberId,
    decodedToken,
  });

  if (resolvedSession.sessionState === AUTH_SESSION_STATES.ANONYMOUS) {
    return createAnonymousSnapshot();
  }

  const authenticatedMemberId =
    resolvedSession.sessionState === AUTH_SESSION_STATES.AUTHENTICATED_MEMBER &&
    hasDecodedMemberId(decodedToken)
      ? decodedToken.memberId
      : undefined;

  return {
    accessToken,
    data: decodedToken,
    isAuthenticated:
      resolvedSession.sessionState === AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
    memberId: authenticatedMemberId,
    sessionState: resolvedSession.sessionState,
  };
};

function getCurrentClientAuthSnapshot(): ClientAuthSnapshot {
  return createClientAuthSnapshot({
    accessToken: getCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN),
    memberId: getCookie(AUTH_COOKIE_NAMES.MEMBER_ID),
  });
}

const isSameSnapshot = (
  currentSnapshot: ClientAuthSnapshot,
  nextSnapshot: ClientAuthSnapshot,
): boolean =>
  currentSnapshot.accessToken === nextSnapshot.accessToken &&
  currentSnapshot.memberId === nextSnapshot.memberId &&
  currentSnapshot.isAuthenticated === nextSnapshot.isAuthenticated &&
  currentSnapshot.sessionState === nextSnapshot.sessionState;

export function useAuth(): UseAuthReturn {
  const { initialSession } = useAuthHydration();
  const [isHydrated, setIsHydrated] = useState(false);
  const [snapshot, setSnapshot] = useState<ClientAuthSnapshot>(() =>
    createClientAuthSnapshot(initialSession ?? {}),
  );

  useEffect(() => {
    setIsHydrated(true);
    setSnapshot((currentSnapshot) => {
      const nextSnapshot = getCurrentClientAuthSnapshot();

      return isSameSnapshot(currentSnapshot, nextSnapshot)
        ? currentSnapshot
        : nextSnapshot;
    });
  }, []);

  useEffect(() => {
    return subscribeAuthSessionChange(() => {
      setSnapshot((currentSnapshot) => {
        const nextSnapshot = getCurrentClientAuthSnapshot();

        return isSameSnapshot(currentSnapshot, nextSnapshot)
          ? currentSnapshot
          : nextSnapshot;
      });
    });
  }, []);

  useEffect(() => {
    const syncSnapshot = (): void => {
      setSnapshot((currentSnapshot) => {
        const nextSnapshot = getCurrentClientAuthSnapshot();

        return isSameSnapshot(currentSnapshot, nextSnapshot)
          ? currentSnapshot
          : nextSnapshot;
      });
    };

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        syncSnapshot();
      }
    };
    const handleStorage = (event: StorageEvent): void => {
      if (isAuthSessionStorageEvent(event)) {
        syncSnapshot();
      }
    };

    // 같은 탭으로 다시 돌아왔을 때 서버/쿠키에서 바뀐 인증 상태를 다시 읽는다.
    window.addEventListener('focus', syncSnapshot);
    window.addEventListener('pageshow', syncSnapshot);
    // 다른 탭에서 로그인/로그아웃이 일어나면 storage 이벤트로 현재 탭 auth 상태를 맞춘다.
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', syncSnapshot);
      window.removeEventListener('pageshow', syncSnapshot);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    accessToken: snapshot.accessToken,
    data: snapshot.data,
    isAuthenticated: snapshot.isAuthenticated,
    isHydrated,
    memberId: snapshot.memberId,
    sessionState: snapshot.sessionState,
  };
}

export interface UseAuthReadyReturn {
  isHydrated: boolean;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  memberId?: number;
  data?: DecodedToken;
  accessToken?: string;
  sessionState: AuthSessionState;
}

export function useAuthReady(): UseAuthReadyReturn {
  const {
    accessToken,
    data,
    isAuthenticated,
    isHydrated,
    memberId,
    sessionState,
  } = useAuth();
  const isAuthReady = isHydrated && isAuthenticated;

  return {
    accessToken,
    data,
    isAuthenticated,
    isHydrated,
    isAuthReady,
    memberId,
    sessionState,
  };
}
