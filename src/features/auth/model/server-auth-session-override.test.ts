import { describe, expect, it } from 'vitest';
import {
  clearServerAuthSessionOverride,
  SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES,
  SERVER_AUTH_SESSION_OVERRIDE_STATES,
  readServerAuthSessionOverride,
  writeServerAuthSessionOverride,
} from './server-auth-session-override';

describe('server auth session override headers', () => {
  it('round-trips an authenticated override for same-request SSR', () => {
    const headers = new Headers();

    writeServerAuthSessionOverride({
      headers,
      override: {
        state: SERVER_AUTH_SESSION_OVERRIDE_STATES.AUTHENTICATED,
        accessToken: 'renewed-token',
        memberId: '123',
      },
    });

    expect(readServerAuthSessionOverride(headers)).toEqual({
      state: SERVER_AUTH_SESSION_OVERRIDE_STATES.AUTHENTICATED,
      accessToken: 'renewed-token',
      memberId: '123',
    });
  });

  it('stores pending-signup override without leaking a memberId header', () => {
    const headers = new Headers();

    writeServerAuthSessionOverride({
      headers,
      override: {
        state: SERVER_AUTH_SESSION_OVERRIDE_STATES.PENDING_SIGNUP,
        accessToken: 'guest-token',
      },
    });

    expect(
      headers.get(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID),
    ).toBe(null);
    expect(readServerAuthSessionOverride(headers)).toEqual({
      state: SERVER_AUTH_SESSION_OVERRIDE_STATES.PENDING_SIGNUP,
      accessToken: 'guest-token',
    });
  });

  it('clears access-token and memberId headers for anonymous override', () => {
    const headers = new Headers();
    headers.set(
      SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN,
      'token',
    );
    headers.set(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID, '321');

    writeServerAuthSessionOverride({
      headers,
      override: {
        state: SERVER_AUTH_SESSION_OVERRIDE_STATES.ANONYMOUS,
      },
    });

    expect(
      headers.get(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN),
    ).toBe(null);
    expect(
      headers.get(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID),
    ).toBe(null);
    expect(readServerAuthSessionOverride(headers)).toEqual({
      state: SERVER_AUTH_SESSION_OVERRIDE_STATES.ANONYMOUS,
    });
  });

  it('can clear every internal override header before middleware writes a new one', () => {
    const headers = new Headers();
    headers.set(
      SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.STATE,
      SERVER_AUTH_SESSION_OVERRIDE_STATES.AUTHENTICATED,
    );
    headers.set(
      SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN,
      'token',
    );
    headers.set(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID, '123');

    clearServerAuthSessionOverride(headers);

    expect(headers.get(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.STATE)).toBe(
      null,
    );
    expect(
      headers.get(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.ACCESS_TOKEN),
    ).toBe(null);
    expect(
      headers.get(SERVER_AUTH_SESSION_OVERRIDE_HEADER_NAMES.MEMBER_ID),
    ).toBe(null);
  });
});
