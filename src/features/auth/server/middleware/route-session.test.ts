import type { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { AUTH_ROLE_IDS, AUTH_SESSION_STATES } from '@/types/auth/domain';
import { ACCESS_TOKEN_SESSION_FAILURE_REASONS } from './route-reasons';
import { ROUTE_SESSION_KINDS, resolveRouteSession } from './route-session';

const {
  refreshAccessToken,
  resolveAccessTokenSession,
  verifyAccessToken,
  applyAccessTokenCookie,
  applyRefreshTokenCookie,
  decodeJwt,
} = vi.hoisted(() => ({
  refreshAccessToken: vi.fn(),
  resolveAccessTokenSession: vi.fn(),
  verifyAccessToken: vi.fn(),
  applyAccessTokenCookie: vi.fn(),
  applyRefreshTokenCookie: vi.fn(),
  decodeJwt: vi.fn(),
}));

vi.mock('./access-token-session', () => ({
  ACCESS_TOKEN_SESSION_STATES: {
    VALID: 'valid',
    INVALID: 'invalid',
    UNKNOWN_ERROR: 'unknown-error',
  },
  REFRESH_ACCESS_TOKEN_RESULT_STATES: {
    SUCCESS: 'success',
    INVALID: 'invalid',
    REQUEST_FAILED: 'request-failed',
  },
  getFailureReasonByVerifyState: (state: 'invalid' | 'unknown-error') =>
    state === 'invalid'
      ? ACCESS_TOKEN_SESSION_FAILURE_REASONS.TOKEN_VERIFY_FAILED
      : ACCESS_TOKEN_SESSION_FAILURE_REASONS.VERIFY_REQUEST_FAILED,
  refreshAccessToken,
  resolveAccessTokenSession,
  verifyAccessToken,
}));

vi.mock('./auth-cookies', () => ({
  applyAccessTokenCookie,
  applyRefreshTokenCookie,
}));

vi.mock('@/utils/jwt', () => ({
  decodeJwt,
}));

describe('resolveRouteSession', () => {
  it('recovers refresh-token-only member sessions before falling back to anonymous', async () => {
    refreshAccessToken.mockResolvedValue({
      state: 'success',
      accessToken: 'member-token',
      refreshTokenSetCookieHeader: 'refresh_token=renewed',
    });
    verifyAccessToken.mockResolvedValue({
      state: 'valid',
      memberId: 777,
    });
    decodeJwt.mockReturnValue({
      roleIds: [AUTH_ROLE_IDS.MEMBER],
      memberId: 777,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const session = await resolveRouteSession({} as NextRequest, {
      accessToken: undefined,
      hasRefreshToken: true,
      cookieMemberId: undefined,
      isGuestToken: false,
      sessionState: AUTH_SESSION_STATES.ANONYMOUS,
    });

    expect(session).toMatchObject({
      kind: ROUTE_SESSION_KINDS.AUTHENTICATED,
      accessToken: 'member-token',
      memberId: '777',
    });
    expect(applyAccessTokenCookie).toHaveBeenCalledTimes(1);
    expect(applyRefreshTokenCookie).toHaveBeenCalledTimes(1);
  });

  it('recovers refresh-token-only guest sessions into pending-signup without verify me', async () => {
    refreshAccessToken.mockResolvedValue({
      state: 'success',
      accessToken: 'guest-token',
      refreshTokenSetCookieHeader: undefined,
    });
    decodeJwt.mockReturnValue({
      roleIds: [AUTH_ROLE_IDS.GUEST],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const session = await resolveRouteSession({} as NextRequest, {
      accessToken: undefined,
      hasRefreshToken: true,
      cookieMemberId: undefined,
      isGuestToken: false,
      sessionState: AUTH_SESSION_STATES.ANONYMOUS,
    });

    expect(session).toMatchObject({
      kind: ROUTE_SESSION_KINDS.PENDING_SIGNUP,
      accessToken: 'guest-token',
      isGuestToken: true,
    });
    expect(applyAccessTokenCookie).toHaveBeenCalledTimes(1);
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it('verifies member tokens with accessToken present instead of treating them as anonymous', async () => {
    decodeJwt.mockReturnValue({
      roleIds: [AUTH_ROLE_IDS.MEMBER],
      memberId: 15,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    resolveAccessTokenSession.mockResolvedValue({
      state: 'valid',
      accessToken: 'expired-member-token',
      memberId: '15',
      response: {} as never,
    });

    const session = await resolveRouteSession({} as NextRequest, {
      accessToken: 'expired-member-token',
      hasRefreshToken: true,
      cookieMemberId: '15',
      isGuestToken: false,
      sessionState: AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
    });

    expect(resolveAccessTokenSession).toHaveBeenCalledWith(
      expect.anything(),
      'expired-member-token',
    );
    expect(session).toMatchObject({
      kind: ROUTE_SESSION_KINDS.AUTHENTICATED,
      accessToken: 'expired-member-token',
      memberId: '15',
    });
  });

  it('treats authenticated tokens without role claims as invalid instead of unauthorized', async () => {
    resolveAccessTokenSession.mockResolvedValue({
      state: 'valid',
      accessToken: 'member-token',
      memberId: '15',
      response: {} as never,
    });
    decodeJwt.mockReturnValue({
      memberId: 15,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const session = await resolveRouteSession({} as NextRequest, {
      accessToken: 'member-token',
      hasRefreshToken: true,
      cookieMemberId: '15',
      isGuestToken: false,
      sessionState: AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
    });

    expect(session).toMatchObject({
      kind: ROUTE_SESSION_KINDS.INVALID,
      reason:
        ACCESS_TOKEN_SESSION_FAILURE_REASONS.MISSING_ROLE_IDS_FOR_AUTHENTICATED_TOKEN,
    });
  });

  it('keeps authenticated sessions valid when unknown role strings are present', async () => {
    resolveAccessTokenSession.mockResolvedValue({
      state: 'valid',
      accessToken: 'member-token',
      memberId: '15',
      response: {} as never,
    });
    decodeJwt.mockReturnValue({
      memberId: 15,
      roleIds: [AUTH_ROLE_IDS.MEMBER, 'ROLE_FUTURE'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const session = await resolveRouteSession({} as NextRequest, {
      accessToken: 'member-token',
      hasRefreshToken: true,
      cookieMemberId: '15',
      isGuestToken: false,
      sessionState: AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
    });

    expect(session).toMatchObject({
      kind: ROUTE_SESSION_KINDS.AUTHENTICATED,
      memberId: '15',
      roleIds: [AUTH_ROLE_IDS.MEMBER],
    });
  });

  it('does not write refreshed cookies when the refreshed session is rejected as invalid', async () => {
    refreshAccessToken.mockResolvedValue({
      state: 'success',
      accessToken: 'member-token',
      refreshTokenSetCookieHeader: 'refresh_token=renewed',
    });
    verifyAccessToken.mockResolvedValue({
      state: 'valid',
      memberId: 777,
    });
    decodeJwt.mockReturnValue({
      roleIds: [1],
      memberId: 777,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const session = await resolveRouteSession({} as NextRequest, {
      accessToken: undefined,
      hasRefreshToken: true,
      cookieMemberId: undefined,
      isGuestToken: false,
      sessionState: AUTH_SESSION_STATES.ANONYMOUS,
    });

    expect(session).toMatchObject({
      kind: ROUTE_SESSION_KINDS.INVALID,
      reason:
        ACCESS_TOKEN_SESSION_FAILURE_REASONS.MISSING_ROLE_IDS_FOR_AUTHENTICATED_TOKEN,
    });
    expect(applyAccessTokenCookie).not.toHaveBeenCalled();
    expect(applyRefreshTokenCookie).not.toHaveBeenCalled();
  });
});
