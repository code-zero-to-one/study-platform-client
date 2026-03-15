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

const resolveSecureOption = (secure: boolean | undefined): boolean => {
  if (secure !== undefined) {
    return secure;
  }

  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'production';
  }

  return window.location.protocol === 'https:';
};

// 쿠키 설정
export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {},
): void => {
  const {
    path = '/',
    secure,
    sameSite = 'Lax', // Strict에서 Lax로 변경: 외부 사이트에서 redirect 시 쿠키 전송 허용
    maxAge = 86400, // 1일
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
};

// 쿠키 조회
export const getCookie = (name: string): string | undefined => {
  // 서버 사이드에서 쿠키 조회를 할 때 발생하는 ReferenceError: document is not defined 에러방지
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

// 쿠키 삭제
export const deleteCookie = (name: string, path = '/'): void => {
  setCookie(name, '', {
    path,
    maxAge: -1,
  });
};

// 사용자 세션 초기화
export const clearUserSession = (): void => {
  CLIENT_AUTH_COOKIE_NAMES.forEach((cookieName: AuthCookieName) => {
    deleteCookie(cookieName);
  });
};
