import { describe, expect, it, vi } from 'vitest';
import {
  clearClientSession,
  writeExistingMemberSession,
} from './client-auth-session';

const { deleteCookie, setCookie, notifyAuthSessionChanged, decodeJwt } =
  vi.hoisted(() => ({
    deleteCookie: vi.fn(),
    setCookie: vi.fn(),
    notifyAuthSessionChanged: vi.fn(),
    decodeJwt: vi.fn(),
  }));

vi.mock('@/api/client/cookie', () => ({
  deleteCookie,
  setCookie,
}));

vi.mock('./client-auth-sync', () => ({
  notifyAuthSessionChanged,
}));

vi.mock('@/utils/jwt', () => ({
  decodeJwt,
}));

describe('writeExistingMemberSession', () => {
  it('returns false and clears the partial client session when token/member mismatch happens', () => {
    decodeJwt.mockReturnValue({
      memberId: 999,
    });

    expect(
      writeExistingMemberSession({
        accessToken: 'token',
        memberId: '123',
      }),
    ).toBe(false);

    expect(deleteCookie).toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('returns true only after writing token-backed cookies for a valid member session', () => {
    decodeJwt.mockReturnValue({
      memberId: 123,
    });

    expect(
      writeExistingMemberSession({
        accessToken: 'token',
        memberId: '123',
      }),
    ).toBe(true);

    expect(setCookie).toHaveBeenCalledTimes(2);
    expect(notifyAuthSessionChanged).toHaveBeenCalledTimes(1);
  });
});

describe('clearClientSession', () => {
  it('removes auth cookies and notifies auth sync listeners', () => {
    clearClientSession();

    expect(deleteCookie).toHaveBeenCalledTimes(3);
    expect(notifyAuthSessionChanged).toHaveBeenCalledTimes(1);
  });
});
