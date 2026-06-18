import {
  AUTH_ROLE_IDS,
  AUTH_SESSION_STATES,
  type AuthSessionState,
} from '@/types/auth/domain';

const MEMBER_ID_PATTERN = /^[1-9]\d*$/;
const ACCESS_TOKEN_EXPIRY_CLOCK_SKEW_MS = 30_000;

export interface TokenBackedDecodedLike {
  roleIds?: string[];
  exp?: number;
  memberId?: number | string | null;
}

export interface ResolvedTokenBackedSession {
  sessionState: AuthSessionState;
  resolvedMemberId?: string;
  cookieMemberId?: string;
  decodedMemberId?: string;
  isGuestToken: boolean;
  isExpiredToken: boolean;
}

const hasAccessToken = (
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

export const isAnonymousSessionState = (
  sessionState: AuthSessionState,
): boolean => sessionState === AUTH_SESSION_STATES.ANONYMOUS;

export const isPendingSignupSessionState = (
  sessionState: AuthSessionState,
): boolean => sessionState === AUTH_SESSION_STATES.PENDING_SIGNUP;

export const isAuthenticatedMemberSessionState = (
  sessionState: AuthSessionState,
): boolean => sessionState === AUTH_SESSION_STATES.AUTHENTICATED_MEMBER;

export const toNumberMemberId = (
  memberId: number | string | null | undefined,
): number | undefined => {
  const normalized = normalizeMemberId(memberId);

  return normalized ? Number(normalized) : undefined;
};

const isExpiredDecodedToken = (
  decodedToken: TokenBackedDecodedLike | null | undefined,
): boolean =>
  typeof decodedToken?.exp !== 'number' ||
  decodedToken.exp * 1000 + ACCESS_TOKEN_EXPIRY_CLOCK_SKEW_MS <= Date.now();

export const resolveTokenBackedSession = ({
  accessToken,
  memberId,
  decodedToken,
  allowExpiredTokenRecovery = false,
}: {
  accessToken?: string | null;
  memberId?: number | string | null;
  decodedToken?: TokenBackedDecodedLike | null;
  allowExpiredTokenRecovery?: boolean;
}): ResolvedTokenBackedSession => {
  const cookieMemberId = normalizeMemberId(memberId);
  const decodedMemberId = normalizeMemberId(decodedToken?.memberId);
  const isGuestToken = Array.isArray(decodedToken?.roleIds)
    ? decodedToken.roleIds.includes(AUTH_ROLE_IDS.GUEST)
    : false;
  const isExpiredToken = isExpiredDecodedToken(decodedToken);

  if (!hasAccessToken(accessToken)) {
    return {
      sessionState: AUTH_SESSION_STATES.ANONYMOUS,
      resolvedMemberId: undefined,
      cookieMemberId,
      decodedMemberId,
      isGuestToken,
      isExpiredToken,
    };
  }

  if (isExpiredToken && !allowExpiredTokenRecovery) {
    return {
      sessionState: AUTH_SESSION_STATES.ANONYMOUS,
      resolvedMemberId: undefined,
      cookieMemberId,
      decodedMemberId,
      isGuestToken,
      isExpiredToken,
    };
  }

  if (isGuestToken) {
    // guest token은 깨진 세션이 아니라 가입 진행 상태다.
    // expired recovery 중에도 authenticated나 anonymous로 성급히 확정하지 않는다.
    return {
      sessionState: AUTH_SESSION_STATES.PENDING_SIGNUP,
      resolvedMemberId: undefined,
      cookieMemberId,
      decodedMemberId,
      isGuestToken,
      isExpiredToken,
    };
  }

  if (decodedMemberId) {
    return {
      sessionState: AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
      resolvedMemberId: decodedMemberId,
      cookieMemberId,
      decodedMemberId,
      isGuestToken,
      isExpiredToken,
    };
  }

  return {
    sessionState: AUTH_SESSION_STATES.ANONYMOUS,
    resolvedMemberId: undefined,
    cookieMemberId,
    decodedMemberId,
    isGuestToken,
    isExpiredToken,
  };
};
