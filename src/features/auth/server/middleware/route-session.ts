import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isPendingSignupSessionState,
  resolveTokenBackedSession,
} from '@/features/auth/model/auth-session';
import {
  AUTH_ROLE_IDS,
  AUTH_SESSION_STATES,
  type AuthRoleId,
} from '@/types/auth/domain';
import { decodeJwt } from '@/utils/jwt';
import {
  ACCESS_TOKEN_SESSION_STATES,
  REFRESH_ACCESS_TOKEN_RESULT_STATES,
  getFailureReasonByVerifyState,
  refreshAccessToken,
  resolveAccessTokenSession,
  verifyAccessToken,
  type AccessTokenSessionResolution,
} from './access-token-session';
import type { AuthContext } from './auth-context';
import {
  applyAccessTokenCookie,
  applyRefreshTokenCookie,
} from './auth-cookies';
import {
  ACCESS_TOKEN_SESSION_FAILURE_REASONS,
  type AccessTokenSessionFailureReason,
} from './route-reasons';

/**
 * 미들웨어가 현재 요청을 해석한 결과 세션 종류다.
 * - ANONYMOUS: 액세스 토큰이 없는 익명 상태
 * - PENDING_SIGNUP: 액세스 토큰은 있지만 회원가입 완료 전 상태
 * - AUTHENTICATED: 검증된 회원 세션
 * - INVALID: 토큰 검증/재발급 실패로 세션을 신뢰할 수 없는 상태
 */
export const ROUTE_SESSION_KINDS = {
  ANONYMOUS: 'anonymous',
  PENDING_SIGNUP: 'pending-signup',
  AUTHENTICATED: 'authenticated',
  INVALID: 'invalid-session',
} as const;

export interface AnonymousRouteSession {
  kind: typeof ROUTE_SESSION_KINDS.ANONYMOUS;
  hasIdentityCookie: boolean;
}

/**
 * 소셜 로그인은 끝났지만 회원가입 절차가 완료되지 않아
 * 아직 정식 회원 세션으로 볼 수 없는 상태다.
 */
export interface PendingSignupRouteSession {
  kind: typeof ROUTE_SESSION_KINDS.PENDING_SIGNUP;
  accessToken: string;
  isGuestToken: boolean;
  response: AccessTokenSessionResolution['response'];
}

export interface AuthenticatedRouteSession {
  kind: typeof ROUTE_SESSION_KINDS.AUTHENTICATED;
  accessToken: string;
  memberId: string;
  currentMemberId?: string;
  roleIds: AuthRoleId[];
  response: AccessTokenSessionResolution['response'];
}

/**
 * 액세스 토큰 검증 또는 재발급에 실패해
 * 현재 요청의 세션을 신뢰할 수 없는 상태다.
 */
export interface InvalidRouteSession {
  kind: typeof ROUTE_SESSION_KINDS.INVALID;
  reason: AccessTokenSessionFailureReason;
  response: AccessTokenSessionResolution['response'];
}

export type ResolvedRouteSession =
  | AnonymousRouteSession
  | PendingSignupRouteSession
  | AuthenticatedRouteSession
  | InvalidRouteSession;

export const isAuthenticatedRouteSession = (
  session: ResolvedRouteSession | undefined,
): session is AuthenticatedRouteSession =>
  session?.kind === ROUTE_SESSION_KINDS.AUTHENTICATED;

export const isPendingSignupRouteSession = (
  session: ResolvedRouteSession | undefined,
): session is PendingSignupRouteSession =>
  session?.kind === ROUTE_SESSION_KINDS.PENDING_SIGNUP;

const createAnonymousRouteSession = (
  hasIdentityCookie: boolean,
): AnonymousRouteSession => ({
  kind: ROUTE_SESSION_KINDS.ANONYMOUS,
  hasIdentityCookie,
});

const createPendingSignupRouteSession = ({
  accessToken,
  isGuestToken,
  response = NextResponse.next(),
}: {
  accessToken: string;
  isGuestToken: boolean;
  response?: AccessTokenSessionResolution['response'];
}): PendingSignupRouteSession => ({
  kind: ROUTE_SESSION_KINDS.PENDING_SIGNUP,
  accessToken,
  isGuestToken,
  response,
});

const createInvalidRouteSession = ({
  reason,
  response,
}: {
  reason: AccessTokenSessionFailureReason;
  response: AccessTokenSessionResolution['response'];
}): InvalidRouteSession => ({
  kind: ROUTE_SESSION_KINDS.INVALID,
  reason,
  response,
});

const createNonGuestMissingMemberIdRouteSession = (): InvalidRouteSession =>
  createInvalidRouteSession({
    reason:
      ACCESS_TOKEN_SESSION_FAILURE_REASONS.MISSING_MEMBER_ID_FOR_NON_GUEST,
    response: NextResponse.next(),
  });

const createMissingRoleIdsRouteSession = ({
  response,
}: {
  response: AccessTokenSessionResolution['response'];
}): InvalidRouteSession =>
  createInvalidRouteSession({
    reason:
      ACCESS_TOKEN_SESSION_FAILURE_REASONS.MISSING_ROLE_IDS_FOR_AUTHENTICATED_TOKEN,
    response,
  });

const decodeAccessTokenSafely = (
  accessToken: string,
): ReturnType<typeof decodeJwt> => {
  try {
    return decodeJwt(accessToken);
  } catch {
    return null;
  }
};

const AUTH_ROLE_ID_SET = new Set<AuthRoleId>(Object.values(AUTH_ROLE_IDS));

const isRecognizedAuthRoleId = (roleId: string): roleId is AuthRoleId =>
  AUTH_ROLE_ID_SET.has(roleId as AuthRoleId);

const applyRefreshedCookies = ({
  request,
  response,
  accessToken,
  refreshTokenSetCookieHeader,
}: {
  request: NextRequest;
  response: NextResponse;
  accessToken: string;
  refreshTokenSetCookieHeader?: string;
}): void => {
  applyAccessTokenCookie(request, response, accessToken);

  if (refreshTokenSetCookieHeader) {
    applyRefreshTokenCookie(request, response, refreshTokenSetCookieHeader);
  }
};

const createAuthenticatedRouteSession = ({
  currentMemberId,
  accessToken,
  memberId,
  response,
}: {
  currentMemberId: string | undefined;
  accessToken: string;
  memberId: string;
  response: AccessTokenSessionResolution['response'];
}): AuthenticatedRouteSession | InvalidRouteSession => {
  const decoded = decodeAccessTokenSafely(accessToken);

  if (
    !Array.isArray(decoded?.roleIds) ||
    decoded.roleIds.some((roleId: unknown) => typeof roleId !== 'string')
  ) {
    return createMissingRoleIdsRouteSession({ response });
  }

  const roleIds = decoded.roleIds.filter(isRecognizedAuthRoleId);

  return {
    kind: ROUTE_SESSION_KINDS.AUTHENTICATED,
    accessToken,
    memberId,
    currentMemberId,
    roleIds,
    response,
  };
};

const resolveRefreshTokenOnlyRouteSession = async (
  request: NextRequest,
  ctx: AuthContext,
): Promise<ResolvedRouteSession> => {
  const refreshedTokenResult = await refreshAccessToken(request);
  const response = NextResponse.next();

  if (
    refreshedTokenResult.state === REFRESH_ACCESS_TOKEN_RESULT_STATES.INVALID
  ) {
    return createInvalidRouteSession({
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.REFRESH_FAILED,
      response,
    });
  }

  if (
    refreshedTokenResult.state ===
    REFRESH_ACCESS_TOKEN_RESULT_STATES.REQUEST_FAILED
  ) {
    return createInvalidRouteSession({
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.REFRESH_REQUEST_FAILED,
      response,
    });
  }

  const decodedToken = decodeAccessTokenSafely(
    refreshedTokenResult.accessToken,
  );
  const refreshedSession = resolveTokenBackedSession({
    accessToken: refreshedTokenResult.accessToken,
    memberId: ctx.cookieMemberId,
    decodedToken,
    allowExpiredTokenRecovery: true,
  });

  if (
    refreshedSession.sessionState === AUTH_SESSION_STATES.PENDING_SIGNUP &&
    refreshedSession.isGuestToken
  ) {
    applyRefreshedCookies({
      request,
      response,
      accessToken: refreshedTokenResult.accessToken,
      refreshTokenSetCookieHeader:
        refreshedTokenResult.refreshTokenSetCookieHeader,
    });

    return createPendingSignupRouteSession({
      accessToken: refreshedTokenResult.accessToken,
      isGuestToken: true,
      response,
    });
  }

  const verifyResult = await verifyAccessToken(
    refreshedTokenResult.accessToken,
  );

  if (verifyResult.state !== ACCESS_TOKEN_SESSION_STATES.VALID) {
    return createInvalidRouteSession({
      reason: getFailureReasonByVerifyState(verifyResult.state),
      response,
    });
  }

  const authenticatedSession = createAuthenticatedRouteSession({
    currentMemberId: ctx.cookieMemberId,
    accessToken: refreshedTokenResult.accessToken,
    memberId: String(verifyResult.memberId),
    response,
  });

  if (!isAuthenticatedRouteSession(authenticatedSession)) {
    return authenticatedSession;
  }

  applyRefreshedCookies({
    request,
    response: authenticatedSession.response,
    accessToken: refreshedTokenResult.accessToken,
    refreshTokenSetCookieHeader:
      refreshedTokenResult.refreshTokenSetCookieHeader,
  });

  return authenticatedSession;
};

/**
 * 현재 요청의 인증 컨텍스트를 바탕으로
 * 미들웨어가 사용할 라우트 세션 상태를 결정한다.
 *
 * 우선순위:
 * 1. access token이 있으면 pending-signup 또는 verify/refresh 경로로 해석
 * 2. access token은 없지만 refresh_token이 있으면 복구를 먼저 시도
 * 3. 둘 다 없을 때만 익명 세션으로 본다.
 */
export async function resolveRouteSession(
  request: NextRequest,
  ctx: AuthContext,
): Promise<ResolvedRouteSession> {
  if (ctx.accessToken) {
    if (isPendingSignupSessionState(ctx.sessionState)) {
      if (!ctx.isGuestToken) {
        return createNonGuestMissingMemberIdRouteSession();
      }

      return createPendingSignupRouteSession({
        accessToken: ctx.accessToken,
        isGuestToken: ctx.isGuestToken,
      });
    }

    const resolvedSession = await resolveAccessTokenSession(
      request,
      ctx.accessToken,
    );

    if (resolvedSession.state !== ACCESS_TOKEN_SESSION_STATES.VALID) {
      return createInvalidRouteSession({
        reason: resolvedSession.reason,
        response: resolvedSession.response,
      });
    }

    return createAuthenticatedRouteSession({
      currentMemberId: ctx.cookieMemberId,
      accessToken: resolvedSession.accessToken,
      memberId: resolvedSession.memberId,
      response: resolvedSession.response,
    });
  }

  if (ctx.hasRefreshToken) {
    return resolveRefreshTokenOnlyRouteSession(request, ctx);
  }

  return createAnonymousRouteSession(Boolean(ctx.cookieMemberId));
}
