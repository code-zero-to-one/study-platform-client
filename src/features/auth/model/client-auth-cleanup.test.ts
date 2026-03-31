import { describe, expect, it, vi, beforeEach } from 'vitest';

const clearClientSession = vi.fn();
const queryClientClear = vi.fn();
const resetSpies = {
  user: vi.fn(),
  phoneVerification: vi.fn(),
  leader: vi.fn(),
  mentorDirectory: vi.fn(),
  mentoringManagement: vi.fn(),
  mentorScreening: vi.fn(),
  mentorOperation: vi.fn(),
};

vi.mock('@/config/query-client', () => ({
  getQueryClient: () => ({
    clear: queryClientClear,
  }),
}));

vi.mock('./client-auth-session', () => ({
  clearClientSession,
}));

vi.mock('@/stores/useUserStore', () => ({
  useUserStore: {
    getState: () => ({
      reset: resetSpies.user,
    }),
  },
}));

vi.mock('@/stores/use-phone-verification-store', () => ({
  usePhoneVerificationStore: {
    getState: () => ({
      reset: resetSpies.phoneVerification,
    }),
  },
}));

vi.mock('@/stores/useLeaderStore', () => ({
  useLeaderStore: {
    getState: () => ({
      reset: resetSpies.leader,
    }),
  },
}));

vi.mock('@/stores/useMentorDirectoryStore', () => ({
  useMentorDirectoryStore: {
    getState: () => ({
      reset: resetSpies.mentorDirectory,
    }),
  },
}));

vi.mock('@/stores/useMentoringManagementStore', () => ({
  useMentoringManagementStore: {
    getState: () => ({
      reset: resetSpies.mentoringManagement,
    }),
  },
}));

vi.mock('@/stores/useMentorScreeningStore', () => ({
  useMentorScreeningStore: {
    getState: () => ({
      reset: resetSpies.mentorScreening,
    }),
  },
}));

vi.mock('@/stores/useMentorOperationStore', () => ({
  useMentorOperationStore: {
    getState: () => ({
      reset: resetSpies.mentorOperation,
    }),
  },
}));

describe('client auth cleanup', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('clears all client auth stores and query cache in one place', async () => {
    const clientAuthCleanup = await import('./client-auth-cleanup');

    clientAuthCleanup.clearClientAuthState();

    expect(clearClientSession).toHaveBeenCalledTimes(1);
    expect(queryClientClear).toHaveBeenCalledTimes(1);
    expect(resetSpies.user).toHaveBeenCalledTimes(1);
    expect(resetSpies.phoneVerification).toHaveBeenCalledTimes(1);
    expect(resetSpies.leader).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentorDirectory).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentoringManagement).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentorScreening).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentorOperation).toHaveBeenCalledTimes(1);
  });

  it('can reset derived auth state without deleting cookies before identity switches', async () => {
    const clientAuthCleanup = await import('./client-auth-cleanup');

    clientAuthCleanup.resetClientDerivedAuthState();

    expect(clearClientSession).not.toHaveBeenCalled();
    expect(queryClientClear).not.toHaveBeenCalled();
    expect(resetSpies.user).toHaveBeenCalledTimes(1);
    expect(resetSpies.phoneVerification).toHaveBeenCalledTimes(1);
    expect(resetSpies.leader).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentorDirectory).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentoringManagement).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentorScreening).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentorOperation).toHaveBeenCalledTimes(1);
  });

  it('can reset derived auth state and query cache together when a full auth-bound reset is intended', async () => {
    const clientAuthCleanup = await import('./client-auth-cleanup');

    clientAuthCleanup.resetClientDerivedAuthStateWithQueryCache();

    expect(clearClientSession).not.toHaveBeenCalled();
    expect(queryClientClear).toHaveBeenCalledTimes(1);
    expect(resetSpies.user).toHaveBeenCalledTimes(1);
    expect(resetSpies.phoneVerification).toHaveBeenCalledTimes(1);
    expect(resetSpies.leader).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentorDirectory).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentoringManagement).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentorScreening).toHaveBeenCalledTimes(1);
    expect(resetSpies.mentorOperation).toHaveBeenCalledTimes(1);
  });

  it('uses the same cleanup before redirecting explicit logout to home', async () => {
    const replace = vi.fn();
    const localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    };

    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          replace,
        },
        localStorage,
      },
      configurable: true,
    });

    const clientAuthCleanup = await import('./client-auth-cleanup');

    clientAuthCleanup.clearClientAuthStateAndRedirect('/home');
    clientAuthCleanup.clearClientAuthStateAndRedirect('/home');

    expect(clearClientSession).toHaveBeenCalledTimes(2);
    expect(queryClientClear).toHaveBeenCalledTimes(2);
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith(
      '/api/auth/clear-session?redirect=%2Fhome',
    );
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('uses the same cleanup before redirecting forced clear to login', async () => {
    const replace = vi.fn();
    const localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    };

    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          replace,
        },
        localStorage,
      },
      configurable: true,
    });

    const clientAuthCleanup = await import('./client-auth-cleanup');

    clientAuthCleanup.redirectToClearedLoginState();

    expect(clearClientSession).toHaveBeenCalledTimes(1);
    expect(queryClientClear).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith(
      '/api/auth/clear-session?redirect=%2Flogin',
    );
  });

  it('suppresses duplicate redirect when another tab already marked the same clear-session redirect', async () => {
    vi.resetModules();
    vi.spyOn(Date, 'now').mockReturnValue(2_000);

    const replace = vi.fn();
    const localStorage = {
      getItem: vi.fn(() =>
        JSON.stringify({
          path: '/login',
          at: 1_000,
        }),
      ),
      setItem: vi.fn(),
    };

    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          replace,
        },
        localStorage,
      },
      configurable: true,
    });

    const clientAuthCleanup = await import('./client-auth-cleanup');

    clientAuthCleanup.redirectToClearedLoginState();

    expect(clearClientSession).toHaveBeenCalledTimes(1);
    expect(queryClientClear).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});
