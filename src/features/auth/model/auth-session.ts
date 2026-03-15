import {
  AUTH_ROLE_IDS,
  AUTH_SESSION_STATES,
  type AuthSessionLike,
  type AuthSessionState,
} from '@/types/auth/domain';

const MEMBER_ID_PATTERN = /^[1-9]\d*$/;

export interface TokenBackedDecodedLike {
  roleIds?: string[];
  exp?: number;
  memberId?: number | string | null;
}

export interface ResolvedTokenBackedSession {
  sessionState: AuthSessionState;
  cookieMemberId?: string;
  decodedMemberId?: string;
  isGuestToken: boolean;
  isExpiredToken: boolean;
}

export const hasAccessToken = (
  accessToken: string | null | undefined,
): accessToken is string =>
  typeof accessToken === 'string' && accessToken.trim().length > 0;

export const normalizeMemberId = (
  memberId: number | string | null | undefined,
): string | undefined => {
  if (typeof memberId === 'number') {
    return Number.isInteger(memberId) && memberId > 0
      ? String(memberId)
      : undefined;
  }

  if (typeof memberId !== 'string') {
    return undefined;
  }

  const normalized = memberId.trim();

  return MEMBER_ID_PATTERN.test(normalized) ? normalized : undefined;
};

export const getAuthSessionState = ({
  accessToken,
  memberId,
}: AuthSessionLike): AuthSessionState => {
  if (!hasAccessToken(accessToken)) {
    return AUTH_SESSION_STATES.ANONYMOUS;
  }

  if (normalizeMemberId(memberId)) {
    return AUTH_SESSION_STATES.AUTHENTICATED_MEMBER;
  }

  return AUTH_SESSION_STATES.PENDING_SIGNUP;
};

export const isAnonymousSessionState = (
  sessionState: AuthSessionState,
): boolean => sessionState === AUTH_SESSION_STATES.ANONYMOUS;

export const isPendingSignupSessionState = (
  sessionState: AuthSessionState,
): boolean => sessionState === AUTH_SESSION_STATES.PENDING_SIGNUP;

export const isAuthenticatedMemberSessionState = (
  sessionState: AuthSessionState,
): boolean => sessionState === AUTH_SESSION_STATES.AUTHENTICATED_MEMBER;

export const isAuthenticatedMemberSession = (
  session: AuthSessionLike,
): boolean => isAuthenticatedMemberSessionState(getAuthSessionState(session));

export const isPendingSignupSession = (session: AuthSessionLike): boolean =>
  isPendingSignupSessionState(getAuthSessionState(session));

export const toNumberMemberId = (
  memberId: number | string | null | undefined,
): number | undefined => {
  const normalized = normalizeMemberId(memberId);

  return normalized ? Number(normalized) : undefined;
};

export const isExpiredDecodedToken = (
  decodedToken: TokenBackedDecodedLike | null | undefined,
): boolean =>
  typeof decodedToken?.exp !== 'number' ||
  decodedToken.exp * 1000 <= Date.now();

export const resolveTokenBackedSession = ({
  accessToken,
  memberId,
  decodedToken,
}: {
  accessToken?: string | null;
  memberId?: number | string | null;
  decodedToken?: TokenBackedDecodedLike | null;
}): ResolvedTokenBackedSession => {
  const cookieMemberId = normalizeMemberId(memberId);
  const decodedMemberId = normalizeMemberId(decodedToken?.memberId);
  const isGuestToken = Array.isArray(decodedToken?.roleIds)
    ? decodedToken.roleIds.includes(AUTH_ROLE_IDS.GUEST)
    : false;
  const isExpiredToken = isExpiredDecodedToken(decodedToken);

  if (!hasAccessToken(accessToken) || isExpiredToken) {
    return {
      sessionState: AUTH_SESSION_STATES.ANONYMOUS,
      cookieMemberId,
      decodedMemberId,
      isGuestToken,
      isExpiredToken,
    };
  }

  if (cookieMemberId && decodedMemberId && cookieMemberId === decodedMemberId) {
    return {
      sessionState: AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
      cookieMemberId,
      decodedMemberId,
      isGuestToken,
      isExpiredToken: false,
    };
  }

  if (isGuestToken) {
    return {
      sessionState: AUTH_SESSION_STATES.PENDING_SIGNUP,
      cookieMemberId,
      decodedMemberId,
      isGuestToken,
      isExpiredToken: false,
    };
  }

  return {
    sessionState: AUTH_SESSION_STATES.ANONYMOUS,
    cookieMemberId,
    decodedMemberId,
    isGuestToken,
    isExpiredToken: false,
  };
};
