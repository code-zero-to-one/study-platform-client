import {
  CLIENT_AUTH_COOKIE_NAMES,
  type AuthCookieName,
} from '@/features/auth/model/auth-cookie';

interface CookieOptions {
  path?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  httpOnly?: boolean;
}

export const AUTH_COOKIE_SYNC_EVENT = 'zeroone-auth-cookie-sync';

const dispatchAuthCookieSyncEvent = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(AUTH_COOKIE_SYNC_EVENT));
};

const resolveSecureOption = (secure: boolean | undefined): boolean => {
  if (secure !== undefined) {
    return secure;
  }

  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production';
  }

  return window.location.protocol === 'https:';
};

export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {},
): void => {
  const {
    path = '/',
    secure,
    sameSite = 'Lax',
    maxAge = 86400,
    httpOnly = false,
  } = options;
  const shouldUseSecure = resolveSecureOption(secure);

  const cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `path=${path}`,
    `max-age=${maxAge}`,
    shouldUseSecure ? 'secure' : '',
    `samesite=${sameSite}`,
    httpOnly ? 'httponly' : '',
  ]
    .filter(Boolean)
    .join('; ');

  document.cookie = cookie;
  dispatchAuthCookieSyncEvent();
};

export const getCookie = (name: string): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }

  return undefined;
};

export const deleteCookie = (name: string, path = '/'): void => {
  setCookie(name, '', {
    path,
    maxAge: -1,
  });
};

export const clearUserSession = (): void => {
  CLIENT_AUTH_COOKIE_NAMES.forEach((cookieName: AuthCookieName) => {
    deleteCookie(cookieName);
  });
};
