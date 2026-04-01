import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACCESS_TOKEN_SESSION_FAILURE_REASONS,
  AUTH_COOKIE_CLEAR_REASONS,
} from './route-reasons';

const {
  resolveRouteSession,
  decidePublicSessionRoute,
  decideLoginRoute,
  decideSignUpRoute,
  decideProtectedRoute,
  applyRouteAction,
} = vi.hoisted(() => ({
  resolveRouteSession: vi.fn(),
  decidePublicSessionRoute: vi.fn(),
  decideLoginRoute: vi.fn(),
  decideSignUpRoute: vi.fn(),
  decideProtectedRoute: vi.fn(),
  applyRouteAction: vi.fn(),
}));

vi.mock('./route-session', () => ({
  ROUTE_SESSION_KINDS: {
    ANONYMOUS: 'anonymous',
    PENDING_SIGNUP: 'pending-signup',
    AUTHENTICATED: 'authenticated',
    INVALID: 'invalid',
  },
  resolveRouteSession,
}));

vi.mock('./route-decisions', () => ({
  decidePublicSessionRoute,
  decideLoginRoute,
  decideSignUpRoute,
  decideProtectedRoute,
}));

vi.mock('./route-actions', async () => {
  const actual =
    await vi.importActual<typeof import('./route-actions')>('./route-actions');

  return {
    ...actual,
    applyRouteAction,
  };
});

const createRequest = (url: string): NextRequest => {
  const nextUrl = new URL(url);

  return {
    url,
    nextUrl: {
      pathname: nextUrl.pathname,
      search: nextUrl.search,
    },
  } as unknown as NextRequest;
};

describe('route handlers auth recovery marker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cleans the document auth recovery marker on public routes after a stable next action', async () => {
    const request = createRequest(
      'https://zeroone.it.kr/home?tab=mentor&__authRecovery=1',
    );
    const session = {
      kind: 'authenticated',
      accessToken: 'token',
      memberId: '1',
      currentMemberId: '1',
      roleIds: [] as string[],
      response: {} as never,
    };

    resolveRouteSession.mockResolvedValue(session);
    decidePublicSessionRoute.mockReturnValue({
      type: 'next',
    });

    const { handlePublicSessionRoute } = await import('./route-handlers');

    await handlePublicSessionRoute(request, {} as never);

    expect(applyRouteAction).toHaveBeenCalledWith({
      request,
      session,
      action: {
        type: 'redirect',
        to: '/home?tab=mentor',
      },
    });
  });

  it('keeps the document auth recovery marker when a public route is still transiently invalid', async () => {
    const request = createRequest(
      'https://zeroone.it.kr/home?tab=mentor&__authRecovery=1',
    );
    const session = {
      kind: 'invalid',
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.VERIFY_REQUEST_FAILED,
      response: {} as never,
    };

    resolveRouteSession.mockResolvedValue(session);
    decidePublicSessionRoute.mockReturnValue({
      type: 'next',
    });

    const { handlePublicSessionRoute } = await import('./route-handlers');

    await handlePublicSessionRoute(request, {} as never);

    expect(applyRouteAction).toHaveBeenCalledWith({
      request,
      session,
      action: {
        type: 'next',
      },
    });
  });

  it('converts clear-and-next into clear-and-redirect when a public recovery marker should be cleaned', async () => {
    const request = createRequest(
      'https://zeroone.it.kr/home?tab=mentor&__authRecovery=1',
    );
    const session = {
      kind: 'invalid',
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.REFRESH_FAILED,
      response: {} as never,
    };

    resolveRouteSession.mockResolvedValue(session);
    decidePublicSessionRoute.mockReturnValue({
      type: 'clear-and-next',
      reason: AUTH_COOKIE_CLEAR_REASONS.PUBLIC_ROUTE_REFRESH_FAILED,
    });

    const { handlePublicSessionRoute } = await import('./route-handlers');

    await handlePublicSessionRoute(request, {} as never);

    expect(applyRouteAction).toHaveBeenCalledWith({
      request,
      session,
      action: {
        type: 'clear-and-redirect',
        to: '/home?tab=mentor',
        reason: AUTH_COOKIE_CLEAR_REASONS.PUBLIC_ROUTE_REFRESH_FAILED,
      },
    });
  });

  it('uses the document auth recovery marker itself as the protected-route one-shot retry boundary', async () => {
    const request = createRequest(
      'https://zeroone.it.kr/payment/3?tab=summary&__authRecovery=1',
    );
    const session = {
      kind: 'invalid',
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.VERIFY_REQUEST_FAILED,
      response: {} as never,
    };

    resolveRouteSession.mockResolvedValue(session);
    decideProtectedRoute.mockReturnValue({
      type: 'redirect',
      to: '/',
    });

    const { handleProtected } = await import('./route-handlers');

    await handleProtected(request, {} as never);

    expect(decideProtectedRoute).toHaveBeenCalledWith(session, '/payment/3', {
      transientRetryTo: undefined,
      recoveredRedirectTo: undefined,
    });
  });

  it('removes both auth recovery markers after a protected route recovers', async () => {
    const request = createRequest(
      'https://zeroone.it.kr/payment/3?tab=summary&__authRecovery=1&__authRetry=1',
    );
    const session = {
      kind: 'authenticated',
      accessToken: 'token',
      memberId: '1',
      currentMemberId: '1',
      roleIds: [] as string[],
      response: {} as never,
    };

    resolveRouteSession.mockResolvedValue(session);
    decideProtectedRoute.mockReturnValue({
      type: 'redirect',
      to: '/payment/3?tab=summary',
    });

    const { handleProtected } = await import('./route-handlers');

    await handleProtected(request, {} as never);

    expect(decideProtectedRoute).toHaveBeenCalledWith(session, '/payment/3', {
      transientRetryTo: undefined,
      recoveredRedirectTo: '/payment/3?tab=summary',
    });
  });
});
