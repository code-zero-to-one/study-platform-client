'use client';

import { useQuery } from '@tanstack/react-query';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { requestDocumentAuthRecovery } from '@/api/client/auth-session-recovery';
import {
  CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES,
  refreshClientAuthSession,
} from '@/api/client/auth-session-refresh';
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
import { resolveTokenBackedSession, toNumberMemberId } from './auth-session';
import { clearClientAuthState } from './client-auth-cleanup';
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
  // eslint-disable-next-line @rushstack/no-new-null
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

const CLIENT_AUTH_SESSION_RECOVERY_LEAD_MS = 10_000;

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
}: {
  accessToken?: string;
}): ClientAuthSnapshot => {
  const decodedToken = decodeClientToken(accessToken);
  const resolvedSession = resolveTokenBackedSession({
    accessToken,
    decodedToken,
    allowExpiredTokenRecovery: true,
  });

  if (resolvedSession.sessionState === AUTH_SESSION_STATES.ANONYMOUS) {
    return createAnonymousSnapshot();
  }

  const authenticatedMemberId =
    resolvedSession.sessionState === AUTH_SESSION_STATES.AUTHENTICATED_MEMBER &&
    hasDecodedMemberId(decodedToken)
      ? toNumberMemberId(resolvedSession.resolvedMemberId)
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

const getSnapshotTokenExpiryAt = (
  snapshot: ClientAuthSnapshot,
): number | undefined =>
  typeof snapshot.data?.exp === 'number' ? snapshot.data.exp * 1000 : undefined;

const shouldRecoverExpiringSession = (
  snapshot: ClientAuthSnapshot,
  now: number = Date.now(),
): boolean => {
  if (snapshot.sessionState === AUTH_SESSION_STATES.ANONYMOUS) {
    return false;
  }

  const tokenExpiryAt = getSnapshotTokenExpiryAt(snapshot);

  return (
    typeof tokenExpiryAt === 'number' &&
    tokenExpiryAt - now <= CLIENT_AUTH_SESSION_RECOVERY_LEAD_MS
  );
};

// 하이드레이션 완료 플래그 스토어 — SSR/첫 렌더 false, 마운트 후 true.
// useState+effect(setIsHydrated) 대신 외부 스토어 구독으로 파생 상태/연쇄 setState 제거(동작 동일).
const subscribeHydrated = () => () => {};

function getHydratedSnapshot() {
  return true;
}

function getHydratedServerSnapshot() {
  return false;
}

export function useAuth(): UseAuthReturn {
  const { initialSession } = useAuthHydration();
  const isHydrated = useSyncExternalStore(
    subscribeHydrated,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );
  const [snapshot, setSnapshot] = useState<ClientAuthSnapshot>(() =>
    createClientAuthSnapshot(initialSession ?? {}),
  );
  const snapshotRef = useRef(snapshot);
  const sessionRecoveryTimerRef = useRef<number | undefined>(undefined);

  const syncSnapshot = useCallback((): void => {
    setSnapshot((currentSnapshot) => {
      const nextSnapshot = getCurrentClientAuthSnapshot();

      return isSameSnapshot(currentSnapshot, nextSnapshot)
        ? currentSnapshot
        : nextSnapshot;
    });
  }, []);

  const recoverClientSessionIfNeeded = useCallback(
    async ({
      allowWhenDocumentHidden = false,
    }: {
      allowWhenDocumentHidden?: boolean;
    } = {}): Promise<void> => {
      const currentSnapshot = snapshotRef.current;

      if (!shouldRecoverExpiringSession(currentSnapshot)) {
        syncSnapshot();

        return;
      }

      if (
        !allowWhenDocumentHidden &&
        typeof document !== 'undefined' &&
        document.visibilityState !== 'visible'
      ) {
        return;
      }

      const refreshResult = await refreshClientAuthSession();

      if (
        refreshResult.state ===
        CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.SUCCESS
      ) {
        return;
      }

      if (
        refreshResult.state ===
        CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.INVALID
      ) {
        clearClientAuthState();
        requestDocumentAuthRecovery();
      }
    },
    [syncSnapshot],
  );

  const queueClientSessionRecovery = useCallback((): void => {
    recoverClientSessionIfNeeded().catch((_error: unknown): void => {});
  }, [recoverClientSessionIfNeeded]);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    queueClientSessionRecovery();
  }, [queueClientSessionRecovery]);

  useEffect(() => {
    return subscribeAuthSessionChange(() => {
      syncSnapshot();
    });
  }, [syncSnapshot]);

  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        queueClientSessionRecovery();
      }
    };
    const handleWindowFocus = (): void => {
      queueClientSessionRecovery();
    };
    const handleStorage = (event: StorageEvent): void => {
      if (isAuthSessionStorageEvent(event)) {
        syncSnapshot();
      }
    };

    // 같은 탭으로 다시 돌아왔을 때 서버/쿠키에서 바뀐 인증 상태를 다시 읽는다.
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pageshow', handleWindowFocus);
    // 다른 탭에서 로그인/로그아웃이 일어나면 storage 이벤트로 현재 탭 auth 상태를 맞춘다.
    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pageshow', handleWindowFocus);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queueClientSessionRecovery, syncSnapshot]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const currentSnapshot = snapshotRef.current;
    const tokenExpiryAt = getSnapshotTokenExpiryAt(currentSnapshot);

    if (
      currentSnapshot.sessionState === AUTH_SESSION_STATES.ANONYMOUS ||
      typeof tokenExpiryAt !== 'number'
    ) {
      if (sessionRecoveryTimerRef.current) {
        window.clearTimeout(sessionRecoveryTimerRef.current);
        sessionRecoveryTimerRef.current = undefined;
      }

      return;
    }

    const recoveryDelay = Math.max(
      tokenExpiryAt - Date.now() - CLIENT_AUTH_SESSION_RECOVERY_LEAD_MS,
      0,
    );

    if (sessionRecoveryTimerRef.current) {
      window.clearTimeout(sessionRecoveryTimerRef.current);
    }

    sessionRecoveryTimerRef.current = window.setTimeout(() => {
      queueClientSessionRecovery();
    }, recoveryDelay);

    return () => {
      if (sessionRecoveryTimerRef.current) {
        window.clearTimeout(sessionRecoveryTimerRef.current);
        sessionRecoveryTimerRef.current = undefined;
      }
    };
  }, [queueClientSessionRecovery, snapshot]);

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
