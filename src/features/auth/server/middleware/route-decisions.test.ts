import { describe, expect, it, vi } from 'vitest';
import { AUTH_ROUTE_PATHS } from '@/features/auth/model/auth-route';
import type { AuthRoleId } from '@/types/auth/domain';
import {
  AUTH_COOKIE_CLEAR_REASONS,
  ACCESS_TOKEN_SESSION_FAILURE_REASONS,
} from './route-reasons';
import { ROUTE_SESSION_KINDS } from './route-session';

vi.mock('./route-actions', () => ({
  nextRouteAction: () => ({
    type: 'next',
  }),
  redirectRouteAction: (to: string) => ({
    type: 'redirect',
    to,
  }),
  clearAndNextRouteAction: (reason: string) => ({
    type: 'clear-and-next',
    reason,
  }),
  clearAndRedirectRouteAction: ({
    to,
    reason,
  }: {
    to: string;
    reason: string;
  }) => ({
    type: 'clear-and-redirect',
    to,
    reason,
  }),
}));

describe('route auth decisions', () => {
  it('keeps transient invalid sessions on public routes and retries protected routes once before fallback', async () => {
    const routeDecisions = await import('./route-decisions');
    const transientInvalidSession = {
      kind: ROUTE_SESSION_KINDS.INVALID,
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.VERIFY_REQUEST_FAILED,
      response: {} as never,
    };

    expect(
      routeDecisions.decidePublicSessionRoute(transientInvalidSession),
    ).toEqual({
      type: 'next',
    });
    expect(
      routeDecisions.decideProtectedRoute(
        transientInvalidSession,
        AUTH_ROUTE_PATHS.HOME,
        {
          transientRetryTo: '/payment/123?__authRetry=1',
        },
      ),
    ).toEqual({
      type: 'redirect',
      to: '/payment/123?__authRetry=1',
    });
  });

  it('removes the transient retry marker after protected route auth recovers', async () => {
    const routeDecisions = await import('./route-decisions');
    const authenticatedSession = {
      kind: ROUTE_SESSION_KINDS.AUTHENTICATED,
      accessToken: 'token',
      memberId: '123',
      currentMemberId: '123',
      roleIds: [] as AuthRoleId[],
      response: {} as never,
    };

    expect(
      routeDecisions.decideProtectedRoute(
        authenticatedSession,
        '/payment/123',
        {
          recoveredRedirectTo: '/payment/123',
        },
      ),
    ).toEqual({
      type: 'redirect',
      to: '/payment/123',
    });
  });

  it('clears invalid sessions more aggressively on protected routes than public routes', async () => {
    const routeDecisions = await import('./route-decisions');
    const invalidSession = {
      kind: ROUTE_SESSION_KINDS.INVALID,
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.REFRESH_FAILED,
      response: {} as never,
    };

    expect(routeDecisions.decidePublicSessionRoute(invalidSession)).toEqual({
      type: 'clear-and-next',
      reason: AUTH_COOKIE_CLEAR_REASONS.PUBLIC_ROUTE_REFRESH_FAILED,
    });
    expect(
      routeDecisions.decideProtectedRoute(
        invalidSession,
        AUTH_ROUTE_PATHS.HOME,
      ),
    ).toEqual({
      type: 'clear-and-redirect',
      to: AUTH_ROUTE_PATHS.LANDING,
      reason: AUTH_COOKIE_CLEAR_REASONS.PROTECTED_ROUTE_REFRESH_FAILED,
    });
  });

  it('allows pending-signup sessions on public routes but sends them to sign-up on protected routes', async () => {
    const routeDecisions = await import('./route-decisions');
    const pendingSignupSession = {
      kind: ROUTE_SESSION_KINDS.PENDING_SIGNUP,
      accessToken: 'guest-token',
      isGuestToken: true,
      response: {} as never,
    };

    expect(
      routeDecisions.decidePublicSessionRoute(pendingSignupSession),
    ).toEqual({
      type: 'next',
    });
    expect(
      routeDecisions.decideProtectedRoute(
        pendingSignupSession,
        AUTH_ROUTE_PATHS.HOME,
      ),
    ).toEqual({
      type: 'redirect',
      to: AUTH_ROUTE_PATHS.SIGN_UP,
    });
  });

  it('keeps transient invalid sessions on login and sign-up routes without clearing cookies', async () => {
    const routeDecisions = await import('./route-decisions');
    const transientInvalidSession = {
      kind: ROUTE_SESSION_KINDS.INVALID,
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.VERIFY_REQUEST_FAILED,
      response: {} as never,
    };

    expect(routeDecisions.decideLoginRoute(transientInvalidSession)).toEqual({
      type: 'next',
    });
    expect(routeDecisions.decideSignUpRoute(transientInvalidSession)).toEqual({
      type: 'next',
    });
  });

  it('clears invalid refresh on login and sign-up routes because the session is confirmed invalid', async () => {
    const routeDecisions = await import('./route-decisions');
    const invalidRefreshSession = {
      kind: ROUTE_SESSION_KINDS.INVALID,
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.REFRESH_FAILED,
      response: {} as never,
    };

    expect(routeDecisions.decideLoginRoute(invalidRefreshSession)).toEqual({
      type: 'clear-and-next',
      reason: AUTH_COOKIE_CLEAR_REASONS.LOGIN_ROUTE_REFRESH_FAILED,
    });
    expect(routeDecisions.decideSignUpRoute(invalidRefreshSession)).toEqual({
      type: 'clear-and-redirect',
      to: AUTH_ROUTE_PATHS.LANDING,
      reason: AUTH_COOKIE_CLEAR_REASONS.SIGN_UP_ROUTE_REFRESH_FAILED,
    });
  });

  it('clears stray identity cookies on public routes but redirects anonymous users off protected routes', async () => {
    const routeDecisions = await import('./route-decisions');
    const anonymousWithIdentityCookie = {
      kind: ROUTE_SESSION_KINDS.ANONYMOUS,
      hasIdentityCookie: true,
    };

    expect(
      routeDecisions.decidePublicSessionRoute(anonymousWithIdentityCookie),
    ).toEqual({
      type: 'clear-and-next',
      reason: AUTH_COOKIE_CLEAR_REASONS.IDENTITY_COOKIE_WITHOUT_ACCESS_TOKEN,
    });
    expect(
      routeDecisions.decideProtectedRoute(
        anonymousWithIdentityCookie,
        AUTH_ROUTE_PATHS.HOME,
      ),
    ).toEqual({
      type: 'redirect',
      to: AUTH_ROUTE_PATHS.LANDING,
    });
  });
});
