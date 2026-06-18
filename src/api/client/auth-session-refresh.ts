import { writeAccessTokenSession } from '@/features/auth/model/client-auth-session';
import { ApiError, isApiError } from './api-error';

export const CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES = {
  SUCCESS: 'success',
  INVALID: 'invalid',
  REQUEST_FAILED: 'request-failed',
} as const;

export type ClientAuthSessionRefreshResult =
  | {
      state: typeof CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.SUCCESS;
      accessToken: string;
      memberId?: string;
    }
  | { state: typeof CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.INVALID }
  | {
      state: typeof CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.REQUEST_FAILED;
      error?: unknown;
    };

interface RefreshAccessTokenResponseBody {
  content?: {
    accessToken?: unknown;
  };
}

const INVALID_REFRESH_ERROR_CODE = 'AUTH004';
const REFRESH_ACCESS_TOKEN_PATH = '/api/v1/auth/access-token/refresh';

let inFlightClientAuthRefresh:
  | Promise<ClientAuthSessionRefreshResult>
  | undefined;

const parseApiErrorResponse = async (
  response: Response,
): Promise<ApiError | undefined> => {
  try {
    const responseBody = await response.json();

    return isApiError(responseBody) ? new ApiError(responseBody) : undefined;
  } catch {
    return undefined;
  }
};

const parseAccessToken = async (
  response: Response,
): Promise<string | undefined> => {
  try {
    const responseBody =
      (await response.json()) as RefreshAccessTokenResponseBody;
    const accessToken = responseBody.content?.accessToken;

    return typeof accessToken === 'string' && accessToken.trim().length > 0
      ? accessToken
      : undefined;
  } catch {
    return undefined;
  }
};

const createRefreshRequestUrl = (): string =>
  `${process.env.NEXT_PUBLIC_API_BASE_URL}${REFRESH_ACCESS_TOKEN_PATH}`;

const runClientAuthSessionRefresh =
  async (): Promise<ClientAuthSessionRefreshResult> => {
    try {
      const response = await fetch(createRefreshRequestUrl(), {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const apiError = await parseApiErrorResponse(response);

        if (apiError?.errorCode === INVALID_REFRESH_ERROR_CODE) {
          return {
            state: CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.INVALID,
          };
        }

        return {
          state: CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.REQUEST_FAILED,
          error: apiError,
        };
      }

      const accessToken = await parseAccessToken(response);

      if (!accessToken) {
        return {
          state: CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.REQUEST_FAILED,
        };
      }

      return {
        state: CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.SUCCESS,
        accessToken,
        memberId: writeAccessTokenSession(accessToken),
      };
    } catch (error) {
      return {
        state: CLIENT_AUTH_SESSION_REFRESH_RESULT_STATES.REQUEST_FAILED,
        error,
      };
    }
  };

export const refreshClientAuthSession =
  async (): Promise<ClientAuthSessionRefreshResult> => {
    if (inFlightClientAuthRefresh) {
      return inFlightClientAuthRefresh;
    }

    const refreshPromise = runClientAuthSessionRefresh().finally(() => {
      inFlightClientAuthRefresh = undefined;
    });

    inFlightClientAuthRefresh = refreshPromise;

    return refreshPromise;
  };
