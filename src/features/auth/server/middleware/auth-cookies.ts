import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAMES,
  CLIENT_AUTH_COOKIE_NAMES,
} from '@/features/auth/model/auth-cookie';
import { normalizeMemberId } from '@/features/auth/model/auth-session';
import { decodeJwt } from '@/utils/jwt';
import type { AuthCookieClearReason } from './route-reasons';

const isDebugLoggingEnabled = process.env.NODE_ENV !== 'production';

const getAccessTokenCookieOptions = (request: NextRequest) => ({
  secure:
    request.nextUrl.protocol === 'https:' ||
    request.headers.get('x-forwarded-proto') === 'https',
  sameSite: 'lax' as const,
  path: '/',
});

const ZEROONE_COOKIE_DOMAIN = 'zeroone.it.kr';

const isStrictServerCookiePolicy = (request: NextRequest): boolean =>
  request.nextUrl.hostname === ZEROONE_COOKIE_DOMAIN ||
  request.nextUrl.hostname.endsWith(`.${ZEROONE_COOKIE_DOMAIN}`);

const getRefreshTokenCookieOptions = (request: NextRequest) => {
  if (!isStrictServerCookiePolicy(request)) {
    return {
      path: '/',
      httpOnly: true,
    };
  }

  return {
    domain: ZEROONE_COOKIE_DOMAIN,
    httpOnly: true,
    path: '/',
    sameSite: 'none' as const,
    secure: true,
  };
};

export function clearServerAuthCookies(
  request: NextRequest,
  response: NextResponse,
): void {
  CLIENT_AUTH_COOKIE_NAMES.forEach((cookieName) => {
    response.cookies.delete({
      name: cookieName,
      path: '/',
    });
  });

  response.cookies.delete({
    name: AUTH_COOKIE_NAMES.REFRESH_TOKEN,
    ...getRefreshTokenCookieOptions(request),
  });
}

export function setMemberIdCookie(
  response: NextResponse,
  memberId: string,
): void {
  response.cookies.set(AUTH_COOKIE_NAMES.MEMBER_ID, memberId, { path: '/' });
}

export function clearMemberIdCookie(response: NextResponse): void {
  response.cookies.delete({
    name: AUTH_COOKIE_NAMES.MEMBER_ID,
    path: '/',
  });
}

const decodeAccessTokenSafely = (
  accessToken: string,
): ReturnType<typeof decodeJwt> => {
  try {
    return decodeJwt(accessToken);
  } catch {
    return null;
  }
};

export function syncMemberIdCookie(
  response: NextResponse,
  currentMemberId: string | undefined,
  nextMemberId: string,
): void {
  if (currentMemberId !== nextMemberId) {
    setMemberIdCookie(response, nextMemberId);
  }
}

export function applyAccessTokenCookie(
  request: NextRequest,
  response: NextResponse,
  accessToken: string,
): string | undefined {
  response.cookies.set(
    AUTH_COOKIE_NAMES.ACCESS_TOKEN,
    accessToken,
    getAccessTokenCookieOptions(request),
  );

  const decoded = decodeAccessTokenSafely(accessToken);
  const decodedMemberId = normalizeMemberId(decoded?.memberId);

  if (decodedMemberId) {
    setMemberIdCookie(response, decodedMemberId);

    return decodedMemberId;
  }

  clearMemberIdCookie(response);

  return undefined;
}

export function copyResponseCookies(
  source: NextResponse,
  target: NextResponse,
): void {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
}

export function clearAuthCookies(
  request: NextRequest,
  response: NextResponse,
  reason: AuthCookieClearReason,
  pathname: string,
): void {
  if (isDebugLoggingEnabled) {
    console.warn('[미들웨어] 인증 쿠키를 정리합니다.', {
      pathname,
      reason,
    });
  }

  clearServerAuthCookies(request, response);
}
