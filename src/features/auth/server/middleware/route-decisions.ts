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
      return nextRouteAction({ syncPendingSignupIdentity: true });
    case ROUTE_SESSION_KINDS.AUTHENTICATED:
      return nextRouteAction();
    case ROUTE_SESSION_KINDS.INVALID:
      return clearAndNextRouteAction(
        PUBLIC_ROUTE_CLEAR_REASON_BY_FAILURE[session.reason],
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
    return redirectRouteAction(AUTH_ROUTE_PATHS.HOME);
  }

  if (session.kind === ROUTE_SESSION_KINDS.INVALID) {
    return clearAndNextRouteAction(
      LOGIN_ROUTE_CLEAR_REASON_BY_FAILURE[session.reason],
    );
  }

  return nextRouteAction();
};

export const decideProtectedRoute = (
  session: ResolvedRouteSession,
  pathname: string,
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

      return nextRouteAction();
    }
  }
};
