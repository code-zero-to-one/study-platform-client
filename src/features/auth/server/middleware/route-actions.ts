import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AUTH_ROUTE_PATHS,
  getSafeInternalRedirectPath,
} from '@/features/auth/model/auth-route';
import {
  createRequestHeadersWithServerAuthSessionOverride,
  SERVER_AUTH_SESSION_OVERRIDE_STATES,
} from '@/features/auth/model/server-auth-session-override';
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

export const nextRouteAction = (): RouteNextAction => ({
  type: 'next',
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

const createServerAuthSessionOverride = ({
  action,
  session,
}: {
  action: RouteAction;
  session?: ResolvedRouteSession;
}) => {
  if (action.type === 'clear-and-next') {
    return {
      state: SERVER_AUTH_SESSION_OVERRIDE_STATES.ANONYMOUS,
    } as const;
  }

  if (action.type !== 'next' || !session) {
    return undefined;
  }

  if (isAuthenticatedRouteSession(session)) {
    return {
      state: SERVER_AUTH_SESSION_OVERRIDE_STATES.AUTHENTICATED,
      accessToken: session.accessToken,
      memberId: session.memberId,
    } as const;
  }

  if (isPendingSignupRouteSession(session)) {
    return {
      state: SERVER_AUTH_SESSION_OVERRIDE_STATES.PENDING_SIGNUP,
      accessToken: session.accessToken,
    } as const;
  }

  return undefined;
};

const createRequestHeadersWithAuthSessionOverride = ({
  request,
  action,
  session,
}: {
  request: NextRequest;
  action: RouteAction;
  session?: ResolvedRouteSession;
}): Headers | undefined => {
  if (action.type !== 'next' && action.type !== 'clear-and-next') {
    return undefined;
  }

  return createRequestHeadersWithServerAuthSessionOverride({
    requestHeaders: request.headers,
    override: createServerAuthSessionOverride({ action, session }),
  });
};

const createActionResponse = ({
  request,
  action,
  session,
}: {
  request: NextRequest;
  action: RouteAction;
  session?: ResolvedRouteSession;
}): NextResponse => {
  const requestHeaders = createRequestHeadersWithAuthSessionOverride({
    request,
    action,
    session,
  });

  switch (action.type) {
    case 'next':
    case 'clear-and-next':
      return requestHeaders
        ? NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
        : NextResponse.next();
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
  request: NextRequest,
  response: NextResponse,
  session: ResolvedRouteSession | undefined,
): void => {
  if (!session) {
    return;
  }

  if (isAuthenticatedRouteSession(session)) {
    copyResponseCookies(session.response, response);
    syncMemberIdCookie(
      request,
      response,
      session.currentMemberId,
      session.memberId,
    );

    return;
  }

  if (isPendingSignupRouteSession(session)) {
    copyResponseCookies(session.response, response);
  }
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
  const response = createActionResponse({ request, action, session });

  applyResolvedSession(request, response, session);

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
