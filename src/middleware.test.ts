import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getAuthContextMock, resolveRoutePolicyMock } = vi.hoisted(() => ({
  getAuthContextMock: vi.fn(),
  resolveRoutePolicyMock: vi.fn(),
}));

vi.mock('@/features/auth/server/middleware/auth-context', () => ({
  getAuthContext: getAuthContextMock,
}));

vi.mock('@/features/auth/server/middleware/route-policy', () => ({
  ROUTE_POLICY_KINDS: {
    BYPASS: 'bypass',
    LOGIN: 'login',
    PUBLIC_SESSION: 'public-session',
    SIGN_UP: 'sign-up',
  },
  resolveRoutePolicy: resolveRoutePolicyMock,
}));

describe('middleware BYPASS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthContextMock.mockReturnValue({});
    resolveRoutePolicyMock.mockReturnValue('bypass');
  });

  it('strips spoofed internal auth override headers before SSR reads request headers', async () => {
    const request = {
      url: 'https://zeroone.it.kr/redirection',
      nextUrl: {
        pathname: '/redirection',
      },
      headers: new Headers({
        'x-custom-header': 'keep-me',
        'x-zeroone-auth-session-state': 'authenticated',
        'x-zeroone-auth-access-token': 'spoofed-token',
        'x-zeroone-auth-member-id': '999',
      }),
    } as unknown as NextRequest;

    const { middleware } = await import('./middleware');
    const response = await middleware(request);

    expect(response.headers.get('x-middleware-request-x-custom-header')).toBe(
      'keep-me',
    );
    expect(
      response.headers.get('x-middleware-request-x-zeroone-auth-session-state'),
    ).toBe(null);
    expect(
      response.headers.get('x-middleware-request-x-zeroone-auth-access-token'),
    ).toBe(null);
    expect(
      response.headers.get('x-middleware-request-x-zeroone-auth-member-id'),
    ).toBe(null);
  });
});
