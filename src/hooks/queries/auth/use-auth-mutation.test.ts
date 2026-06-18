import { describe, expect, it, vi } from 'vitest';
import { AUTH_ROUTE_PATHS } from '@/features/auth/model/auth-route';
import { clearClientAuthStateAndRedirect } from '@/features/auth/model/client-auth-cleanup';

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn((options: unknown) => options),
}));

vi.mock('@/api/endpoints/auth/auth', () => ({
  logout: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock('@/api/client/axios', () => ({
  axiosInstanceForMultipart: { put: vi.fn() },
}));

vi.mock('@/features/auth/model/client-auth-cleanup', () => ({
  clearClientAuthStateAndRedirect: vi.fn(),
}));

vi.mock('@/features/auth/model/use-auth', () => ({
  useAuthReady: vi.fn(() => ({
    memberId: 123,
  })),
}));

vi.mock('@next/third-parties/google', () => ({
  sendGTMEvent: vi.fn(),
}));

vi.mock('@/utils/hash', () => ({
  hashValue: vi.fn((value: string) => `hashed:${value}`),
}));

describe('useLogoutMutation', () => {
  it('reuses the shared cleanup path on logout success and failure', async () => {
    const authMutation = await import('./use-auth-mutation');
    const logoutMutation = authMutation.useLogoutMutation() as {
      onSuccess?: () => void;
      onError?: () => void;
    };

    logoutMutation.onSuccess?.();
    logoutMutation.onError?.();

    expect(clearClientAuthStateAndRedirect).toHaveBeenNthCalledWith(
      1,
      AUTH_ROUTE_PATHS.LANDING,
    );
    expect(clearClientAuthStateAndRedirect).toHaveBeenNthCalledWith(
      2,
      AUTH_ROUTE_PATHS.LANDING,
    );
  });
});
