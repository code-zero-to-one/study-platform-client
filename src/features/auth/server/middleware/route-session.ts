import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isAnonymousSessionState,
  isPendingSignupSessionState,
} from '@/features/auth/model/auth-session';
import type { AuthRoleId } from '@/types/auth/domain';
import { decodeJwt } from '@/utils/jwt';
import {
  ACCESS_TOKEN_SESSION_STATES,
  resolveAccessTokenSession,
  type AccessTokenSessionResolution,
} from './access-token-session';
import type { AuthContext } from './auth-context';
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
  /** 현재 인증 컨텍스트에서 읽은 회원 식별자다. */
  currentMemberId?: string;
  /** 액세스 토큰을 decode 해서 얻은 회원 식별자다. */
  decodedMemberId?: string;
  isGuestToken: boolean;
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

const createPendingSignupRouteSession = (
  ctx: AuthContext,
): PendingSignupRouteSession => ({
  kind: ROUTE_SESSION_KINDS.PENDING_SIGNUP,
  currentMemberId: ctx.memberId,
  decodedMemberId: ctx.decodedMemberId,
  isGuestToken: ctx.isGuestToken,
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

const createAuthenticatedRouteSession = ({
  currentMemberId,
  resolvedSession,
}: {
  currentMemberId: string | undefined;
  resolvedSession: Extract<
    AccessTokenSessionResolution,
    { state: typeof ACCESS_TOKEN_SESSION_STATES.VALID }
  >;
}): AuthenticatedRouteSession => {
  const decoded = decodeJwt(resolvedSession.accessToken);
  const roleIds = Array.isArray(decoded?.roleIds) ? decoded.roleIds : [];

  return {
    kind: ROUTE_SESSION_KINDS.AUTHENTICATED,
    accessToken: resolvedSession.accessToken,
    memberId: resolvedSession.memberId,
    currentMemberId,
    roleIds,
    response: resolvedSession.response,
  };
};

/**
 * 현재 요청의 인증 컨텍스트를 바탕으로
 * 미들웨어가 사용할 라우트 세션 상태를 결정한다.
 *
 * 우선순위:
 * 1. 익명 세션
 * 2. 회원가입 대기 세션
 * 3. 액세스 토큰 누락 시 invalid
 * 4. 액세스 토큰 검증/재발급 성공 시 authenticated
 * 5. 검증/재발급 실패 시 invalid
 */
export async function resolveRouteSession(
  request: NextRequest,
  ctx: AuthContext,
): Promise<ResolvedRouteSession> {
  if (isAnonymousSessionState(ctx.sessionState)) {
    return createAnonymousRouteSession(Boolean(ctx.memberId));
  }

  if (isPendingSignupSessionState(ctx.sessionState)) {
    // 백엔드 신규 회원 계약상 guest token + memberId 없음은 정상 회원가입 대기 상태다.
    // 반대로 guest claim 없이 memberId만 비어 있으면 불완전 세션으로 간주한다.
    if (!ctx.isGuestToken) {
      return createNonGuestMissingMemberIdRouteSession();
    }

    return createPendingSignupRouteSession(ctx);
  }

  if (!ctx.accessToken) {
    return createInvalidRouteSession({
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.TOKEN_VERIFY_FAILED,
      response: NextResponse.next(),
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
    currentMemberId: ctx.memberId,
    resolvedSession,
  });
}
