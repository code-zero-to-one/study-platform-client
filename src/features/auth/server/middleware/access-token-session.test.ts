import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACCESS_TOKEN_SESSION_STATES,
  REFRESH_ACCESS_TOKEN_RESULT_STATES,
  refreshAccessToken,
  resolveAccessTokenSession,
} from './access-token-session';
import { ACCESS_TOKEN_SESSION_FAILURE_REASONS } from './route-reasons';

const createRequest = ({
  accessToken,
  refreshToken,
  memberId,
  pathname = '/home',
  protocol = 'https:',
}: {
  accessToken?: string;
  refreshToken?: string;
  memberId?: string;
  pathname?: string;
  protocol?: string;
} = {}): NextRequest =>
  ({
    nextUrl: {
      pathname,
      protocol,
    },
    headers: {
      get: (): string | null => null,
    },
    cookies: {
      get(name: string) {
        const cookieValues = {
          accessToken,
          refresh_token: refreshToken,
          memberId,
        } as const;

        const value = cookieValues[name as keyof typeof cookieValues];

        return value ? { value } : undefined;
      },
    },
  }) as unknown as NextRequest;

const createDeferred = <T>() => {
  let resolveDeferred!: (value: T) => void;
  let rejectDeferred!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolve, reject) => {
    resolveDeferred = resolve;
    rejectDeferred = reject;
  });

  return {
    promise,
    resolve: resolveDeferred,
    reject: rejectDeferred,
  };
};

describe('access token session resolution', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('deduplicates concurrent refresh requests inside middleware by refresh token', async () => {
    const deferredRefreshResponse = createDeferred<{
      ok: boolean;
      json: () => Promise<{ content: { accessToken: string } }>;
      headers: { get: (name: string) => string | null };
    }>();

    vi.mocked(fetch).mockReturnValue(
      deferredRefreshResponse.promise as ReturnType<typeof fetch>,
    );

    const request = createRequest({
      refreshToken: 'refresh-token',
    });

    const firstRefreshPromise = refreshAccessToken(request);
    const secondRefreshPromise = refreshAccessToken(request);

    expect(fetch).toHaveBeenCalledTimes(1);

    deferredRefreshResponse.resolve({
      ok: true,
      json: async () => ({
        content: {
          accessToken: 'renewed-access-token',
        },
      }),
      headers: {
        get: () => null,
      },
    });

    await expect(
      Promise.all([firstRefreshPromise, secondRefreshPromise]),
    ).resolves.toEqual([
      {
        state: REFRESH_ACCESS_TOKEN_RESULT_STATES.SUCCESS,
        accessToken: 'renewed-access-token',
        refreshTokenSetCookieHeader: undefined,
      },
      {
        state: REFRESH_ACCESS_TOKEN_RESULT_STATES.SUCCESS,
        accessToken: 'renewed-access-token',
        refreshTokenSetCookieHeader: undefined,
      },
    ]);
  });

  it('tries a refresh fallback when /auth/me is unstable but refresh can recover the session', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('proxy returned HTML');
        },
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: {
            accessToken: 'renewed-access-token',
          },
        }),
        headers: {
          get: (): string | null => null,
        },
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async (): Promise<{
          content: {
            memberId: number;
            roleId: string;
          };
        }> => ({
          content: {
            memberId: 321,
            roleId: 'ROLE_MEMBER',
          },
        }),
      } as unknown as Response);

    const request = createRequest({
      accessToken: 'expired-access-token',
      refreshToken: 'refresh-token',
      memberId: '321',
      pathname: '/payment',
    });

    const resolvedSession = await resolveAccessTokenSession(
      request,
      'expired-access-token',
    );

    expect(resolvedSession).toMatchObject({
      state: ACCESS_TOKEN_SESSION_STATES.VALID,
      accessToken: 'renewed-access-token',
      memberId: '321',
    });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('keeps verify-request-failed as transient when the verify endpoint is unstable and refresh is invalid', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('proxy returned HTML');
        },
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          statusCode: 401,
          errorCode: 'AUTH004',
          errorName: 'INVALID_REFRESH_TOKEN',
          message: '리프레시 토큰이 유효하지 않습니다.',
        }),
      } as unknown as Response);

    const request = createRequest({
      accessToken: 'stale-access-token',
      refreshToken: 'refresh-token',
      memberId: '321',
      pathname: '/payment',
    });

    const resolvedSession = await resolveAccessTokenSession(
      request,
      'stale-access-token',
    );

    expect(resolvedSession).toEqual({
      state: ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR,
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.VERIFY_REQUEST_FAILED,
      response: resolvedSession.response,
    });
  });
});
