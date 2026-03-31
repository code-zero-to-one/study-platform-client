import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_COOKIE_NAMES,
  CLIENT_AUTH_COOKIE_NAMES,
  TOKEN_BACKED_AUTH_COOKIE_MAX_AGE_SECONDS,
} from '@/features/auth/model/auth-cookie';
import {
  AUTH_EVENT_LEVELS,
  logAuthEvent,
} from '@/features/auth/model/auth-debug-log';
import { normalizeMemberId } from '@/features/auth/model/auth-session';
import { decodeJwt } from '@/utils/jwt';
import type { AuthCookieClearReason } from './route-reasons';

const getAccessTokenCookieOptions = (request: NextRequest) => ({
  secure:
    request.nextUrl.protocol === 'https:' ||
    request.headers.get('x-forwarded-proto') === 'https',
  maxAge: TOKEN_BACKED_AUTH_COOKIE_MAX_AGE_SECONDS,
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

const parseSetCookieHeader = (
  setCookieHeader: string,
):
  | {
      name: string;
      value: string;
      maxAge?: number;
    }
  | undefined => {
  const segments = setCookieHeader
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean);
  const [cookiePair, ...attributes] = segments;

  if (!cookiePair) {
    return undefined;
  }

  const separatorIndex = cookiePair.indexOf('=');

  if (separatorIndex <= 0) {
    return undefined;
  }

  const parsedCookie: {
    name: string;
    value: string;
    maxAge?: number;
  } = {
    name: cookiePair.slice(0, separatorIndex),
    value: cookiePair.slice(separatorIndex + 1),
  };

  attributes.forEach((attribute) => {
    const [rawKey, ...rawValueParts] = attribute.split('=');
    const key = rawKey?.trim().toLowerCase();

    if (key !== 'max-age') {
      return;
    }

    const parsedMaxAge = Number(rawValueParts.join('=').trim());

    if (Number.isFinite(parsedMaxAge)) {
      parsedCookie.maxAge = parsedMaxAge;
    }
  });

  return parsedCookie;
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
  request: NextRequest,
  response: NextResponse,
  memberId: string,
): void {
  response.cookies.set(
    AUTH_COOKIE_NAMES.MEMBER_ID,
    memberId,
    getAccessTokenCookieOptions(request),
  );
}

export function clearMemberIdCookie(response: NextResponse): void {
  response.cookies.delete({
    name: AUTH_COOKIE_NAMES.MEMBER_ID,
    path: '/',
  });
}

export function applyRefreshTokenCookie(
  request: NextRequest,
  response: NextResponse,
  setCookieHeader: string,
): void {
  const parsedCookie = parseSetCookieHeader(setCookieHeader);

  if (!parsedCookie || parsedCookie.name !== AUTH_COOKIE_NAMES.REFRESH_TOKEN) {
    return;
  }

  response.cookies.set(AUTH_COOKIE_NAMES.REFRESH_TOKEN, parsedCookie.value, {
    ...getRefreshTokenCookieOptions(request),
    ...(parsedCookie.maxAge !== undefined
      ? { maxAge: parsedCookie.maxAge }
      : {}),
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
  request: NextRequest,
  response: NextResponse,
  currentMemberId: string | undefined,
  nextMemberId: string,
): void {
  if (currentMemberId !== nextMemberId) {
    setMemberIdCookie(request, response, nextMemberId);
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
    setMemberIdCookie(request, response, decodedMemberId);

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
  logAuthEvent({
    level: AUTH_EVENT_LEVELS.WARN,
    layer: 'middleware-auth-cookies',
    message: '미들웨어가 인증 쿠키를 정리합니다.',
    route: pathname,
    reason,
    hasAccessToken: Boolean(
      request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value,
    ),
    hasRefreshToken: Boolean(
      request.cookies.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value,
    ),
    hasIdentityCookie: Boolean(
      request.cookies.get(AUTH_COOKIE_NAMES.MEMBER_ID)?.value,
    ),
  });

  clearServerAuthCookies(request, response);
}
