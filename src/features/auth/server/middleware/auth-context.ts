import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAMES } from '@/features/auth/model/auth-cookie';
import {
  getAuthSessionState,
  normalizeMemberId,
} from '@/features/auth/model/auth-session';
import { AUTH_ROLE_IDS, type AuthSessionState } from '@/types/auth/domain';
import { decodeJwt } from '@/utils/jwt';

export interface AuthContext {
  accessToken: string | undefined;
  memberId: string | undefined;
  decodedMemberId: string | undefined;
  isGuestToken: boolean;
  sessionState: AuthSessionState;
}

export function getAuthContext(request: NextRequest): AuthContext {
  const accessToken = request.cookies.get(
    AUTH_COOKIE_NAMES.ACCESS_TOKEN,
  )?.value;
  const memberId = normalizeMemberId(
    request.cookies.get(AUTH_COOKIE_NAMES.MEMBER_ID)?.value,
  );
  const decoded = accessToken ? decodeJwt(accessToken) : null;
  const decodedMemberId = normalizeMemberId(decoded?.memberId);
  const isGuestToken = Array.isArray(decoded?.roleIds)
    ? decoded.roleIds.includes(AUTH_ROLE_IDS.GUEST)
    : false;

  return {
    accessToken,
    memberId,
    decodedMemberId,
    isGuestToken,
    sessionState: getAuthSessionState({ accessToken, memberId }),
  };
}
