import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAMES } from '@/features/auth/model/auth-cookie';
import {
  normalizeMemberId,
  resolveTokenBackedSession,
} from '@/features/auth/model/auth-session';
import { decodeJwt } from '@/utils/jwt';

export interface AuthContext {
  accessToken: string | undefined;
  hasRefreshToken: boolean;
  cookieMemberId: string | undefined;
  isGuestToken: boolean;
  sessionState: ReturnType<typeof resolveTokenBackedSession>['sessionState'];
}

export function getAuthContext(request: NextRequest): AuthContext {
  const accessToken = request.cookies.get(
    AUTH_COOKIE_NAMES.ACCESS_TOKEN,
  )?.value;
  const hasRefreshToken = Boolean(
    request.cookies.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value,
  );
  const cookieMemberId = normalizeMemberId(
    request.cookies.get(AUTH_COOKIE_NAMES.MEMBER_ID)?.value,
  );
  const decoded = accessToken ? decodeJwt(accessToken) : null;
  const resolvedSession = resolveTokenBackedSession({
    accessToken,
    memberId: cookieMemberId,
    decodedToken: decoded,
    allowExpiredTokenRecovery: true,
  });

  return {
    accessToken,
    hasRefreshToken,
    cookieMemberId,
    isGuestToken: resolvedSession.isGuestToken,
    sessionState: resolvedSession.sessionState,
  };
}
