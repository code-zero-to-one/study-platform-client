import { InternalAxiosRequestConfig, isAxiosError } from 'axios';
import { AUTH_COOKIE_NAMES } from '@/features/auth/model/auth-cookie';
import { normalizeMemberId } from '@/features/auth/model/auth-session';
import { decodeJwt } from '@/utils/jwt';
import { ApiError, isApiError } from './api-error';
import { requestDocumentAuthRecovery } from './auth-session-recovery';
import { getCookie } from './cookie';

const hasRequestAuthorization = (
  requestConfig?: InternalAxiosRequestConfig,
): boolean => {
  const authorizationHeader = requestConfig?.headers?.Authorization;
  if (Array.isArray(authorizationHeader)) {
    return authorizationHeader.length > 0;
  }

  return Boolean(authorizationHeader);
};

const setAuthorizationHeader = (
  requestConfig: InternalAxiosRequestConfig,
  accessToken: string,
): void => {
  requestConfig.headers =
    requestConfig.headers ?? ({} as InternalAxiosRequestConfig['headers']);
  requestConfig.headers.Authorization = `Bearer ${accessToken}`;
};

const getAuthorizationAccessToken = (
  requestConfig?: InternalAxiosRequestConfig,
): string | undefined => {
  const authorizationHeader = requestConfig?.headers?.Authorization;

  if (Array.isArray(authorizationHeader)) {
    return undefined;
  }

  if (typeof authorizationHeader !== 'string') {
    return undefined;
  }

  const bearerPrefix = 'Bearer ';

  return authorizationHeader.startsWith(bearerPrefix)
    ? authorizationHeader.slice(bearerPrefix.length)
    : undefined;
};

const getAccessTokenMemberId = (
  accessToken: string | undefined,
): string | undefined => {
  if (!accessToken) {
    return undefined;
  }

  const decodedToken = decodeJwt(accessToken) as { memberId?: unknown } | null;
  const rawMemberId = decodedToken?.memberId;

  if (typeof rawMemberId === 'string' || typeof rawMemberId === 'number') {
    return normalizeMemberId(rawMemberId);
  }

  return undefined;
};

export const attachAccessTokenToRequest = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const accessToken = getCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN);

  if (accessToken) {
    setAuthorizationHeader(config, accessToken);
  }

  return config;
};

export const createClientAuthResponseRejectedHandler = (
  retryRequest: (requestConfig: InternalAxiosRequestConfig) => Promise<unknown>,
) => {
  return async (error: unknown) => {
    if (
      isAxiosError(error) &&
      error.response &&
      isApiError(error.response.data)
    ) {
      const errorResponseBody = error.response.data;
      const originalRequest = error.config;

      if (errorResponseBody.errorCode === 'AUTH001') {
        if (!hasRequestAuthorization(originalRequest)) {
          return Promise.reject(new ApiError(errorResponseBody));
        }

        const latestAccessToken = getCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN);
        const requestAccessToken = getAuthorizationAccessToken(originalRequest);
        const latestTokenMemberId = getAccessTokenMemberId(latestAccessToken);
        const requestTokenMemberId = getAccessTokenMemberId(requestAccessToken);

        if (
          originalRequest &&
          latestAccessToken &&
          requestAccessToken &&
          latestAccessToken !== requestAccessToken &&
          latestTokenMemberId &&
          requestTokenMemberId &&
          latestTokenMemberId === requestTokenMemberId
        ) {
          setAuthorizationHeader(originalRequest, latestAccessToken);

          return retryRequest(originalRequest);
        }

        requestDocumentAuthRecovery();

        return Promise.reject(new ApiError(errorResponseBody));
      }

      return Promise.reject(new ApiError(errorResponseBody));
    }

    return Promise.reject(error);
  };
};
