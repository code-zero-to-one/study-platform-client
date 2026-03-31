import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_SESSION_STATES } from '@/types/auth/domain';
import { AUTH_COOKIE_NAMES } from './auth-cookie';
import {
  SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES,
  SERVER_AUTH_SESSION_OVERRIDE_STATES,
} from './server-auth-session-override';

const { headersMock, getServerCookieMock, decodeJwtMock } = vi.hoisted(() => ({
  headersMock: vi.fn(),
  getServerCookieMock: vi.fn(),
  decodeJwtMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: headersMock,
}));

vi.mock('@/utils/server-cookie', () => ({
  getServerCookie: getServerCookieMock,
}));

vi.mock('@/utils/jwt', () => ({
  decodeJwt: decodeJwtMock,
}));

describe('readServerAuthSession', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('prefers same-request override headers over stale request cookies', async () => {
    const requestHeaders = new Headers({
      [SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.STATE]:
        SERVER_AUTH_SESSION_OVERRIDE_STATES.AUTHENTICATED,
      [SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN]:
        'renewed-access-token',
      [SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID]: '123',
    });

    headersMock.mockResolvedValue(requestHeaders);
    getServerCookieMock.mockResolvedValue('stale-cookie-value');
    decodeJwtMock.mockReturnValue({
      memberId: 123,
      roleIds: ['ROLE_MEMBER'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const { readServerAuthSession } = await import('./server-auth-session');

    await expect(readServerAuthSession()).resolves.toMatchObject({
      accessToken: 'renewed-access-token',
      authenticatedMemberId: 123,
      sessionState: AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
    });
  });

  it('keeps expired cookie-backed member tokens out of anonymous fallback during SSR hydration bootstrap', async () => {
    headersMock.mockResolvedValue(new Headers());
    getServerCookieMock.mockImplementation(async (name: string) => {
      if (name === AUTH_COOKIE_NAMES.ACCESS_TOKEN) {
        return 'expired-access-token';
      }

      if (name === AUTH_COOKIE_NAMES.MEMBER_ID) {
        return '777';
      }

      return undefined;
    });
    decodeJwtMock.mockReturnValue({
      memberId: 777,
      roleIds: ['ROLE_MEMBER'],
      exp: Math.floor((Date.now() - 40_000) / 1000),
    });

    const { readServerAuthSession } = await import('./server-auth-session');

    await expect(readServerAuthSession()).resolves.toMatchObject({
      accessToken: 'expired-access-token',
      authenticatedMemberId: 777,
      sessionState: AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
    });
  });
});
