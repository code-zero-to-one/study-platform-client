import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_ROLE_IDS, AUTH_SESSION_STATES } from '@/types/auth/domain';
import { resolveTokenBackedSession } from './auth-session';

describe('resolveTokenBackedSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('treats an expired access token as anonymous by default', () => {
    const session = resolveTokenBackedSession({
      accessToken: 'expired-token',
      memberId: '777',
      decodedToken: {
        exp: Math.floor((Date.now() - 40_000) / 1000),
        memberId: 123,
        roleIds: [AUTH_ROLE_IDS.MEMBER],
      },
    });

    expect(session).toMatchObject({
      sessionState: AUTH_SESSION_STATES.ANONYMOUS,
      resolvedMemberId: undefined,
      cookieMemberId: '777',
      decodedMemberId: '123',
      isGuestToken: false,
      isExpiredToken: true,
    });
  });

  it('keeps expired-but-recoverable member tokens in authenticated-member state', () => {
    const session = resolveTokenBackedSession({
      accessToken: 'expired-token',
      memberId: '999',
      decodedToken: {
        exp: Math.floor((Date.now() - 40_000) / 1000),
        memberId: 123,
        roleIds: [AUTH_ROLE_IDS.MEMBER],
      },
      allowExpiredTokenRecovery: true,
    });

    expect(session).toMatchObject({
      sessionState: AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
      resolvedMemberId: '123',
      cookieMemberId: '999',
      decodedMemberId: '123',
      isGuestToken: false,
      isExpiredToken: true,
    });
  });

  it('keeps guest tokens in pending-signup state even during expired-token recovery', () => {
    const session = resolveTokenBackedSession({
      accessToken: 'guest-token',
      decodedToken: {
        exp: Math.floor((Date.now() - 40_000) / 1000),
        roleIds: [AUTH_ROLE_IDS.GUEST],
      },
      allowExpiredTokenRecovery: true,
    });

    expect(session).toMatchObject({
      sessionState: AUTH_SESSION_STATES.PENDING_SIGNUP,
      resolvedMemberId: undefined,
      isGuestToken: true,
      isExpiredToken: true,
    });
  });

  it('keeps tokens inside the clock-skew buffer out of immediate expiry', () => {
    const session = resolveTokenBackedSession({
      accessToken: 'near-expiry-token',
      decodedToken: {
        exp: Math.floor((Date.now() - 20_000) / 1000),
        memberId: 456,
        roleIds: [AUTH_ROLE_IDS.MEMBER],
      },
      allowExpiredTokenRecovery: true,
    });

    expect(session).toMatchObject({
      sessionState: AUTH_SESSION_STATES.AUTHENTICATED_MEMBER,
      resolvedMemberId: '456',
      isExpiredToken: false,
    });
  });
});
