import {
  AUTH_ROUTE_PATHS,
  AUTH_ROUTE_PREFIXES,
} from '@/features/auth/model/auth-route';
import { AUTH_ROLE_IDS } from '@/types/auth/domain';
import {
  clearAndNextRouteAction,
  clearAndRedirectRouteAction,
  nextRouteAction,
  redirectRouteAction,
  type RouteAction,
} from './route-actions';
import {
  AUTH_COOKIE_CLEAR_REASONS,
  isTransientAccessTokenSessionFailureReason,
  LOGIN_ROUTE_CLEAR_REASON_BY_FAILURE,
  PROTECTED_ROUTE_CLEAR_REASON_BY_FAILURE,
  PUBLIC_ROUTE_CLEAR_REASON_BY_FAILURE,
  SIGN_UP_ROUTE_CLEAR_REASON_BY_FAILURE,
} from './route-reasons';
import {
  ROUTE_SESSION_KINDS,
  type ResolvedRouteSession,
} from './route-session';

const isAdminPath = (pathname: string): boolean =>
  pathname.startsWith(AUTH_ROUTE_PREFIXES.ADMIN);

export const decideSignUpRoute = (
  session: ResolvedRouteSession,
): RouteAction => {
  switch (session.kind) {
    case ROUTE_SESSION_KINDS.ANONYMOUS:
      return redirectRouteAction(AUTH_ROUTE_PATHS.LANDING);
    case ROUTE_SESSION_KINDS.PENDING_SIGNUP:
      return nextRouteAction();
    case ROUTE_SESSION_KINDS.AUTHENTICATED:
      return redirectRouteAction(AUTH_ROUTE_PATHS.HOME);
    case ROUTE_SESSION_KINDS.INVALID:
      if (isTransientAccessTokenSessionFailureReason(session.reason)) {
        // sign-up/login/public 경로는 transient auth failure에서 즉시 clear하지 않는다.
        // 여기서 공격적으로 지우면 false logout과 signup bootstrap 붕괴가 다시 생긴다.
        return nextRouteAction();
      }

      return clearAndRedirectRouteAction({
        to: AUTH_ROUTE_PATHS.LANDING,
        reason: SIGN_UP_ROUTE_CLEAR_REASON_BY_FAILURE[session.reason],
      });
  }
};

export const decidePublicSessionRoute = (
  session: ResolvedRouteSession,
): RouteAction => {
  switch (session.kind) {
    case ROUTE_SESSION_KINDS.ANONYMOUS:
      return session.hasIdentityCookie
        ? clearAndNextRouteAction(
            AUTH_COOKIE_CLEAR_REASONS.IDENTITY_COOKIE_WITHOUT_ACCESS_TOKEN,
          )
        : nextRouteAction();
    case ROUTE_SESSION_KINDS.PENDING_SIGNUP:
      return nextRouteAction();
    case ROUTE_SESSION_KINDS.AUTHENTICATED:
      return nextRouteAction();
    case ROUTE_SESSION_KINDS.INVALID:
      if (isTransientAccessTokenSessionFailureReason(session.reason)) {
        // 공개 경로는 degraded auth를 가능한 한 보수적으로 유지한다.
        // 요청 자체 실패만으로 쿠키를 지우면 "갑자기 로그아웃됨" 체감이 커진다.
        return nextRouteAction();
      }

      return clearAndNextRouteAction(
        PUBLIC_ROUTE_CLEAR_REASON_BY_FAILURE[session.reason] ??
          AUTH_COOKIE_CLEAR_REASONS.PUBLIC_ROUTE_TOKEN_VERIFY_FAILED,
      );
  }
};

export const decideLoginRoute = (
  session: ResolvedRouteSession,
): RouteAction => {
  if (session.kind === ROUTE_SESSION_KINDS.PENDING_SIGNUP) {
    return redirectRouteAction(AUTH_ROUTE_PATHS.SIGN_UP);
  }

  if (session.kind === ROUTE_SESSION_KINDS.AUTHENTICATED) {
    return redirectRouteAction(AUTH_ROUTE_PATHS.LANDING);
  }

  if (session.kind === ROUTE_SESSION_KINDS.INVALID) {
    if (isTransientAccessTokenSessionFailureReason(session.reason)) {
      // 로그인 진입점도 transient failure에서는 세션 정리보다 복구 여지를 우선한다.
      return nextRouteAction();
    }

    return clearAndNextRouteAction(
      LOGIN_ROUTE_CLEAR_REASON_BY_FAILURE[session.reason],
    );
  }

  return nextRouteAction();
};

export const decideProtectedRoute = (
  session: ResolvedRouteSession,
  pathname: string,
  options?: {
    transientRetryTo?: string;
    recoveredRedirectTo?: string;
  },
): RouteAction => {
  switch (session.kind) {
    case ROUTE_SESSION_KINDS.ANONYMOUS:
      return redirectRouteAction(AUTH_ROUTE_PATHS.LANDING);
    case ROUTE_SESSION_KINDS.PENDING_SIGNUP:
      return session.isGuestToken
        ? redirectRouteAction(AUTH_ROUTE_PATHS.SIGN_UP)
        : clearAndRedirectRouteAction({
            to: AUTH_ROUTE_PATHS.LANDING,
            reason: AUTH_COOKIE_CLEAR_REASONS.PROTECTED_ROUTE_MISSING_MEMBER_ID,
          });
    case ROUTE_SESSION_KINDS.INVALID:
      if (isTransientAccessTokenSessionFailureReason(session.reason)) {
        // 보호 경로는 현재 요청은 막더라도, transient failure만으로 쿠키를 지우지는 않는다.
        // 보안 fallback과 false logout 완화를 함께 만족시키는 현재 팀 정책이다.
        if (options?.transientRetryTo) {
          return redirectRouteAction(options.transientRetryTo);
        }

        return redirectRouteAction(AUTH_ROUTE_PATHS.LANDING);
      }

      return clearAndRedirectRouteAction({
        to: AUTH_ROUTE_PATHS.LANDING,
        reason: PROTECTED_ROUTE_CLEAR_REASON_BY_FAILURE[session.reason],
      });
    case ROUTE_SESSION_KINDS.AUTHENTICATED: {
      const isUnauthorizedAdminRequest =
        isAdminPath(pathname) && !session.roleIds.includes(AUTH_ROLE_IDS.ADMIN);

      if (isUnauthorizedAdminRequest) {
        return redirectRouteAction(AUTH_ROUTE_PATHS.HOME);
      }

      if (options?.recoveredRedirectTo) {
        return redirectRouteAction(options.recoveredRedirectTo);
      }

      return nextRouteAction();
    }
  }
};
