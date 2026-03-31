import type { InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { decodeJwt } from '@/utils/jwt';
import { ApiError } from './api-error';
import { createClientAuthResponseRejectedHandler } from './auth-response-interceptor';
import { requestDocumentAuthRecovery } from './auth-session-recovery';
import { getCookie } from './cookie';

vi.mock('./cookie', () => ({
  getCookie: vi.fn(),
}));

vi.mock('@/utils/jwt', () => ({
  decodeJwt: vi.fn(),
}));

vi.mock('./auth-session-recovery', () => ({
  requestDocumentAuthRecovery: vi.fn(),
}));

const createAuthExpiredAxiosError = (
  requestConfig: InternalAxiosRequestConfig,
) => ({
  isAxiosError: true,
  response: {
    data: {
      statusCode: 401,
      errorCode: 'AUTH001',
      errorName: 'ACCESS_TOKEN_EXPIRED',
      message: '액세스 토큰이 만료되었습니다.',
    },
  },
  config: requestConfig,
});

describe('createClientAuthResponseRejectedHandler', () => {
  it('retries the original request with the latest cookie token when middleware already refreshed it', async () => {
    vi.mocked(getCookie).mockReturnValue('renewed-token');
    vi.mocked(decodeJwt)
      .mockReturnValueOnce({
        memberId: 15,
      })
      .mockReturnValueOnce({
        memberId: 15,
      });

    const retryRequest = vi.fn().mockResolvedValue({ ok: true });
    const requestConfig = {
      headers: {
        Authorization: 'Bearer expired-token',
      },
    } as InternalAxiosRequestConfig;
    const handler = createClientAuthResponseRejectedHandler(retryRequest);

    await expect(
      handler(createAuthExpiredAxiosError(requestConfig)),
    ).resolves.toEqual({ ok: true });

    expect(retryRequest).toHaveBeenCalledTimes(1);
    expect(requestConfig.headers.Authorization).toBe('Bearer renewed-token');
    expect(requestDocumentAuthRecovery).not.toHaveBeenCalled();
  });

  it('requests document auth recovery when there is no fresher cookie token', async () => {
    vi.mocked(getCookie).mockReturnValue('expired-token');
    vi.mocked(requestDocumentAuthRecovery).mockReturnValue(true);

    const retryRequest = vi.fn();
    const requestConfig = {
      headers: {
        Authorization: 'Bearer expired-token',
      },
    } as InternalAxiosRequestConfig;
    const handler = createClientAuthResponseRejectedHandler(retryRequest);

    await expect(
      handler(createAuthExpiredAxiosError(requestConfig)),
    ).rejects.toBeInstanceOf(ApiError);

    expect(requestDocumentAuthRecovery).toHaveBeenCalledTimes(1);
    expect(retryRequest).not.toHaveBeenCalled();
  });

  it('does not retry when the latest cookie token belongs to another member', async () => {
    vi.mocked(getCookie).mockReturnValue('other-member-token');
    vi.mocked(decodeJwt)
      .mockReturnValueOnce({
        memberId: 999,
      })
      .mockReturnValueOnce({
        memberId: 15,
      });
    vi.mocked(requestDocumentAuthRecovery).mockReturnValue(true);

    const retryRequest = vi.fn();
    const requestConfig = {
      headers: {
        Authorization: 'Bearer expired-token',
      },
    } as InternalAxiosRequestConfig;
    const handler = createClientAuthResponseRejectedHandler(retryRequest);

    await expect(
      handler(createAuthExpiredAxiosError(requestConfig)),
    ).rejects.toBeInstanceOf(ApiError);

    expect(retryRequest).not.toHaveBeenCalled();
    expect(requestDocumentAuthRecovery).toHaveBeenCalledTimes(1);
  });

  it('rejects as ApiError without recovery when there is no auth token to recover', async () => {
    const retryRequest = vi.fn();
    const requestConfig = {
      headers: {},
    } as InternalAxiosRequestConfig;
    const handler = createClientAuthResponseRejectedHandler(retryRequest);

    await expect(
      handler(createAuthExpiredAxiosError(requestConfig)),
    ).rejects.toBeInstanceOf(ApiError);

    expect(requestDocumentAuthRecovery).not.toHaveBeenCalled();
    expect(retryRequest).not.toHaveBeenCalled();
  });
});
