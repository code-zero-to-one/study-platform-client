import { getQueryClient } from '@/config/query-client';
import { usePhoneVerificationStore } from '@/stores/use-phone-verification-store';
import { useLeaderStore } from '@/stores/useLeaderStore';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import { useMentorOperationStore } from '@/stores/useMentorOperationStore';
import { useMentorScreeningStore } from '@/stores/useMentorScreeningStore';
import { useUserStore } from '@/stores/useUserStore';
import { AUTH_ROUTE_PATHS, getClearSessionRedirectUrl } from './auth-route';
import { clearClientSession } from './client-auth-session';

let pendingRedirectPath: string | undefined;
const AUTH_REDIRECT_DEDUPE_STORAGE_KEY = 'zeroone-auth-redirect';
const AUTH_REDIRECT_DEDUPE_WINDOW_MS = 5_000;

const authDerivedStateResetters = [
  () => useUserStore.getState().reset(),
  () => usePhoneVerificationStore.getState().reset(),
  () => useLeaderStore.getState().reset(),
  () => useMentorDirectoryStore.getState().reset(),
  () => useMentoringManagementStore.getState().reset(),
  () => useMentorScreeningStore.getState().reset(),
  () => useMentorOperationStore.getState().reset(),
] as const;

export const resetClientDerivedAuthState = (): void => {
  authDerivedStateResetters.forEach((reset) => {
    reset();
  });
};

export const resetClientDerivedAuthStateWithQueryCache = (): void => {
  resetClientDerivedAuthState();
  getQueryClient().clear();
};

export const clearClientAuthState = (): void => {
  clearClientSession();
  resetClientDerivedAuthStateWithQueryCache();
};

const shouldDeduplicateCrossTabRedirect = (redirectPath: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const rawValue = window.localStorage.getItem(
      AUTH_REDIRECT_DEDUPE_STORAGE_KEY,
    );

    if (!rawValue) {
      return false;
    }

    const parsedValue = JSON.parse(rawValue) as {
      path?: unknown;
      at?: unknown;
    };

    return (
      parsedValue.path === redirectPath &&
      typeof parsedValue.at === 'number' &&
      Date.now() - parsedValue.at < AUTH_REDIRECT_DEDUPE_WINDOW_MS
    );
  } catch {
    return false;
  }
};

const markCrossTabRedirect = (redirectPath: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      AUTH_REDIRECT_DEDUPE_STORAGE_KEY,
      JSON.stringify({
        path: redirectPath,
        at: Date.now(),
      }),
    );
  } catch {
    // storage 접근이 막힌 환경에서는 같은 탭 dedupe만 사용한다.
  }
};

export const clearClientAuthStateAndRedirect = (redirectPath: string): void => {
  clearClientAuthState();

  if (typeof window === 'undefined') {
    return;
  }

  if (pendingRedirectPath === redirectPath) {
    return;
  }

  if (shouldDeduplicateCrossTabRedirect(redirectPath)) {
    return;
  }

  pendingRedirectPath = redirectPath;
  markCrossTabRedirect(redirectPath);
  window.location.replace(getClearSessionRedirectUrl(redirectPath));
};

export const redirectToClearedLoginState = (): void => {
  clearClientAuthStateAndRedirect(AUTH_ROUTE_PATHS.LOGIN);
};
