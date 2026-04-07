import { beforeEach, describe, expect, it, vi } from 'vitest';

const writeAccessTokenSession = vi.fn();

vi.mock('@/features/auth/model/client-auth-session', () => ({
  writeAccessTokenSession,
}));

const loadAuthSessionRefresh = async () => import('./auth-session-refresh');

const createJsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const createDeferred = <T>() => {
  let resolveDeferred!: (value: T | PromiseLike<T>) => void;
  let rejectDeferred!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolve, reject) => {
    resolveDeferred = resolve;
    rejectDeferred = reject;
  });

  return { promise, resolve: resolveDeferred, reject: rejectDeferred };
};

describe('refreshClientAuthSession', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    writeAccessTokenSession.mockReset();
  });

  it('writes the refreshed access token and returns a success result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          statusCode: 201,
          content: {
            accessToken: 'renewed-access-token',
          },
        },
        201,
      ),
    );

    vi.stubGlobal('fetch', fetchMock);
    writeAccessTokenSession.mockReturnValue('101');

    const {
      refreshClientAuthSession,
      CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES,
    } = await loadAuthSessionRefresh();

    await expect(refreshClientAuthSession()).resolves.toEqual({
      state: CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.SUCCESS,
      accessToken: 'renewed-access-token',
      memberId: '101',
    });
    expect(writeAccessTokenSession).toHaveBeenCalledWith(
      'renewed-access-token',
    );
  });

  it('returns invalid when the backend confirms the refresh token is no longer valid', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          statusCode: 400,
          errorCode: 'AUTH004',
          errorName: 'INVALID_REFRESH_TOKEN',
          message: '지원하지 않는 리프레시 토큰입니다.',
        },
        400,
      ),
    );

    vi.stubGlobal('fetch', fetchMock);

    const {
      refreshClientAuthSession,
      CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES,
    } = await loadAuthSessionRefresh();

    await expect(refreshClientAuthSession()).resolves.toEqual({
      state: CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.INVALID,
    });
    expect(writeAccessTokenSession).not.toHaveBeenCalled();
  });

  it('treats malformed refresh responses as request failures instead of fabricating a session', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          statusCode: 201,
          content: {},
        },
        201,
      ),
    );

    vi.stubGlobal('fetch', fetchMock);

    const {
      refreshClientAuthSession,
      CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES,
    } = await loadAuthSessionRefresh();

    await expect(refreshClientAuthSession()).resolves.toEqual({
      state: CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.REQUEST_FAILED,
    });
    expect(writeAccessTokenSession).not.toHaveBeenCalled();
  });

  it('deduplicates concurrent browser refresh attempts into one in-flight request', async () => {
    const deferredResponse = createDeferred<Response>();
    const fetchMock = vi.fn().mockReturnValue(deferredResponse.promise);

    vi.stubGlobal('fetch', fetchMock);
    writeAccessTokenSession.mockReturnValue('101');

    const {
      refreshClientAuthSession,
      CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES,
    } = await loadAuthSessionRefresh();

    const firstRequest = refreshClientAuthSession();
    const secondRequest = refreshClientAuthSession();

    deferredResponse.resolve(
      createJsonResponse(
        {
          statusCode: 201,
          content: {
            accessToken: 'renewed-access-token',
          },
        },
        201,
      ),
    );

    await expect(firstRequest).resolves.toEqual({
      state: CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.SUCCESS,
      accessToken: 'renewed-access-token',
      memberId: '101',
    });
    await expect(secondRequest).resolves.toEqual({
      state: CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.SUCCESS,
      accessToken: 'renewed-access-token',
      memberId: '101',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
