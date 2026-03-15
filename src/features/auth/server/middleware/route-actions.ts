import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_ROUTE_PATHS,
  getSafeInternalRedirectPath,
} from '@/features/auth/model/auth-route';
import {
  clearAuthCookies,
  copyResponseCookies,
  syncMemberIdCookie,
} from './auth-cookies';
import type { AuthCookieClearReason } from './route-reasons';
import {
  isAuthenticatedRouteSession,
  isPendingSignupRouteSession,
  type ResolvedRouteSession,
} from './route-session';

export interface RouteNextAction {
  type: 'next';
  syncPendingSignupIdentity?: boolean;
}

export interface RouteRedirectAction {
  type: 'redirect';
  to: string;
}

export interface RouteClearAndNextAction {
  type: 'clear-and-next';
  reason: AuthCookieClearReason;
}

export interface RouteClearAndRedirectAction {
  type: 'clear-and-redirect';
  to: string;
  reason: AuthCookieClearReason;
}

export type RouteAction =
  | RouteNextAction
  | RouteRedirectAction
  | RouteClearAndNextAction
  | RouteClearAndRedirectAction;

export const nextRouteAction = (
  options?: Pick<RouteNextAction, 'syncPendingSignupIdentity'>,
): RouteNextAction => ({
  type: 'next',
  ...options,
});

export const redirectRouteAction = (to: string): RouteRedirectAction => ({
  type: 'redirect',
  to,
});

export const clearAndNextRouteAction = (
  reason: AuthCookieClearReason,
): RouteClearAndNextAction => ({
  type: 'clear-and-next',
  reason,
});

export const clearAndRedirectRouteAction = ({
  to,
  reason,
}: Pick<
  RouteClearAndRedirectAction,
  'to' | 'reason'
>): RouteClearAndRedirectAction => ({
  type: 'clear-and-redirect',
  to,
  reason,
});

const isClearRouteAction = (
  action: RouteAction,
): action is RouteClearAndNextAction | RouteClearAndRedirectAction =>
  action.type === 'clear-and-next' || action.type === 'clear-and-redirect';

const createActionResponse = (
  request: NextRequest,
  action: RouteAction,
): NextResponse => {
  switch (action.type) {
    case 'next':
    case 'clear-and-next':
      return NextResponse.next();
    case 'redirect':
    case 'clear-and-redirect': {
      const safePath = getSafeInternalRedirectPath(
        action.to,
        AUTH_ROUTE_PATHS.LANDING,
      );

      return NextResponse.redirect(new URL(safePath, request.url));
    }
  }
};

const applyResolvedSession = (
  response: NextResponse,
  action: RouteAction,
  session: ResolvedRouteSession | undefined,
): void => {
  if (!session) {
    return;
  }

  if (isAuthenticatedRouteSession(session)) {
    copyResponseCookies(session.response, response);
    syncMemberIdCookie(response, session.currentMemberId, session.memberId);

    return;
  }

  const shouldSyncPendingSignupIdentity =
    isPendingSignupRouteSession(session) &&
    action.type === 'next' &&
    action.syncPendingSignupIdentity &&
    !session.isGuestToken &&
    Boolean(session.decodedMemberId);

  if (!shouldSyncPendingSignupIdentity) {
    return;
  }

  const nextMemberId = session.decodedMemberId;

  if (!nextMemberId) {
    return;
  }

  syncMemberIdCookie(response, session.currentMemberId, nextMemberId);
};

export const applyRouteAction = ({
  request,
  action,
  session,
}: {
  request: NextRequest;
  action: RouteAction;
  session?: ResolvedRouteSession;
}): NextResponse => {
  const response = createActionResponse(request, action);

  applyResolvedSession(response, action, session);

  if (isClearRouteAction(action)) {
    clearAuthCookies(
      request,
      response,
      action.reason,
      request.nextUrl.pathname,
    );
  }

  return response;
};
