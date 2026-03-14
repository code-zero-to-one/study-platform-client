import {
  AUTH_COOKIE_SYNC_EVENT,
  getCookie,
} from '@/api/client/cookie';

export interface AuthCookieSnapshot {
  accessToken: string | undefined;
  isHydrated: boolean;
}

const AUTH_COOKIE_SYNC_INTERVAL_MS = 1000;
const authCookieListeners = new Set<() => void>();

let authCookieSnapshot: AuthCookieSnapshot = {
  accessToken: undefined,
  isHydrated: false,
};

let authCookieSyncStarted = false;

const emitAuthCookieSnapshot = () => {
  authCookieListeners.forEach((listener) => listener());
};

const syncAuthCookieSnapshot = () => {
  const nextSnapshot: AuthCookieSnapshot = {
    accessToken: getCookie('accessToken'),
    isHydrated: true,
  };

  if (
    authCookieSnapshot.accessToken === nextSnapshot.accessToken &&
    authCookieSnapshot.isHydrated === nextSnapshot.isHydrated
  ) {
    return;
  }

  authCookieSnapshot = nextSnapshot;
  emitAuthCookieSnapshot();
};

const startAuthCookieSync = () => {
  if (typeof window === 'undefined' || authCookieSyncStarted) {
    return;
  }

  authCookieSyncStarted = true;

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      syncAuthCookieSnapshot();
    }
  };

  syncAuthCookieSnapshot();
  window.addEventListener('focus', syncAuthCookieSnapshot);
  window.addEventListener('pageshow', syncAuthCookieSnapshot);
  window.addEventListener(AUTH_COOKIE_SYNC_EVENT, syncAuthCookieSnapshot);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.setInterval(() => {
    if (!document.hidden) {
      syncAuthCookieSnapshot();
    }
  }, AUTH_COOKIE_SYNC_INTERVAL_MS);
};

export const subscribeAuthCookieSnapshot = (listener: () => void) => {
  authCookieListeners.add(listener);
  startAuthCookieSync();

  return () => {
    authCookieListeners.delete(listener);
  };
};

export const getAuthCookieSnapshot = () => authCookieSnapshot;
