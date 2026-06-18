import type { NextRequest } from 'next/server';
import {
  getAuthRecoveryCleanPath,
  getProtectedTransientRetryPath,
  hasDocumentAuthRecoveryParam,
  hasProtectedTransientRetryParam,
} from '@/features/auth/model/auth-route';
import type { AuthContext } from './auth-context';
import {
  applyRouteAction,
  clearAndRedirectRouteAction,
  redirectRouteAction,
  type RouteAction,
} from './route-actions';
import {
  decideLoginRoute,
  decideProtectedRoute,
  decidePublicSessionRoute,
  decideSignUpRoute,
} from './route-decisions';
import { isTransientAccessTokenSessionFailureReason } from './route-reasons';
import {
  ROUTE_SESSION_KINDS,
  type ResolvedRouteSession,
} from './route-session';
import { resolveRouteSession } from './route-session';

const shouldKeepDocumentRecoveryMarker = (
  session: ResolvedRouteSession,
): boolean =>
  session.kind === ROUTE_SESSION_KINDS.INVALID &&
  isTransientAccessTokenSessionFailureReason(session.reason);

const getDocumentRecoveryAwareAction = ({
  request,
  action,
  session,
}: {
  request: NextRequest;
  action: RouteAction;
  session: ResolvedRouteSession;
}): RouteAction => {
  const hasDocumentRecoveryMarker = hasDocumentAuthRecoveryParam(
    request.nextUrl.search,
  );

  if (!hasDocumentRecoveryMarker) {
    return action;
  }

  if (action.type === 'redirect' || action.type === 'clear-and-redirect') {
    return action;
  }

  if (shouldKeepDocumentRecoveryMarker(session)) {
    return action;
  }

  const cleanPath = getAuthRecoveryCleanPath({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  });

  if (action.type === 'next') {
    return redirectRouteAction(cleanPath);
  }

  return clearAndRedirectRouteAction({
    to: cleanPath,
    reason: action.reason,
  });
};

export async function handleSignUp(request: NextRequest, ctx: AuthContext) {
  const session = await resolveRouteSession(request, ctx);
  const action = getDocumentRecoveryAwareAction({
    request,
    action: decideSignUpRoute(session),
    session,
  });

  return applyRouteAction({
    request,
    action,
    session,
  });
}

export async function handlePublicSessionRoute(
  request: NextRequest,
  ctx: AuthContext,
) {
  const session = await resolveRouteSession(request, ctx);
  const action = getDocumentRecoveryAwareAction({
    request,
    action: decidePublicSessionRoute(session),
    session,
  });

  return applyRouteAction({
    request,
    action,
    session,
  });
}

export async function handleLogin(request: NextRequest, ctx: AuthContext) {
  const session = await resolveRouteSession(request, ctx);
  const action = getDocumentRecoveryAwareAction({
    request,
    action: decideLoginRoute(session),
    session,
  });

  return applyRouteAction({
    request,
    action,
    session,
  });
}

export async function handleProtected(request: NextRequest, ctx: AuthContext) {
  const session = await resolveRouteSession(request, ctx);
  const hasTransientRetryMarker = hasProtectedTransientRetryParam(
    request.nextUrl.search,
  );
  const hasDocumentRecoveryMarker = hasDocumentAuthRecoveryParam(
    request.nextUrl.search,
  );
  const hasAnyRecoveryMarker =
    hasTransientRetryMarker || hasDocumentRecoveryMarker;

  const transientRetryTo =
    session.kind === ROUTE_SESSION_KINDS.INVALID &&
    isTransientAccessTokenSessionFailureReason(session.reason) &&
    !hasAnyRecoveryMarker
      ? getProtectedTransientRetryPath({
          pathname: request.nextUrl.pathname,
          search: request.nextUrl.search,
        })
      : undefined;

  const recoveredRedirectTo =
    session.kind === ROUTE_SESSION_KINDS.AUTHENTICATED && hasAnyRecoveryMarker
      ? getAuthRecoveryCleanPath({
          pathname: request.nextUrl.pathname,
          search: request.nextUrl.search,
        })
      : undefined;

  return applyRouteAction({
    request,
    action: decideProtectedRoute(session, request.nextUrl.pathname, {
      transientRetryTo,
      recoveredRedirectTo,
    }),
    session,
  });
}
