import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isApiError } from '@/api/client/api-error';
import { AUTH_COOKIE_NAMES } from '@/features/auth/model/auth-cookie';
import {
  AUTH_EVENT_LEVELS,
  logAuthEvent,
} from '@/features/auth/model/auth-debug-log';
import {
  applyAccessTokenCookie,
  applyRefreshTokenCookie,
} from './auth-cookies';
import {
  ACCESS_TOKEN_SESSION_FAILURE_REASONS,
  type AccessTokenSessionFailureReason,
} from './route-reasons';

const AUTH_API_PATHS = {
  VERIFY_ME: '/api/v1/auth/me',
  REFRESH_ACCESS_TOKEN: '/api/v1/auth/access-token/refresh',
} as const;

const AUTH_API_ERROR_CODES = {
  INVALID_ACCESS_TOKEN: 'AUTH001',
  INVALID_REFRESH_TOKEN: 'AUTH004',
} as const;

/**
 * 액세스 토큰 검증과 세션 해석에서 공통으로 사용하는 상태값이다.
 * - VALID: 토큰이 유효하고 memberId를 신뢰할 수 있음
 * - INVALID: 토큰이 만료되었거나 검증 실패가 확정됨
 * - UNKNOWN_ERROR: 네트워크/응답 파싱 등으로 검증 자체를 완료하지 못함
 */
export const ACCESS_TOKEN_SESSION_STATES = {
  VALID: 'valid',
  INVALID: 'invalid',
  UNKNOWN_ERROR: 'unknown-error',
} as const;

type VerifyAccessTokenResult =
  | { state: typeof ACCESS_TOKEN_SESSION_STATES.VALID; memberId: number }
  | { state: typeof ACCESS_TOKEN_SESSION_STATES.INVALID }
  | { state: typeof ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR };

export const REFRESH_ACCESS_TOKEN_RESULT_STATES = {
  SUCCESS: 'success',
  INVALID: 'invalid',
  REQUEST_FAILED: 'request-failed',
} as const;

type RefreshAccessTokenResult =
  | {
      state: typeof REFRESH_ACCESS_TOKEN_RESULT_STATES.SUCCESS;
      accessToken: string;
      refreshTokenSetCookieHeader?: string;
    }
  | { state: typeof REFRESH_ACCESS_TOKEN_RESULT_STATES.INVALID }
  | { state: typeof REFRESH_ACCESS_TOKEN_RESULT_STATES.REQUEST_FAILED };

export interface ValidAccessTokenSessionResolution {
  state: typeof ACCESS_TOKEN_SESSION_STATES.VALID;
  accessToken: string;
  memberId: string;
  response: NextResponse;
}

export interface FailedAccessTokenSessionResolution {
  state:
    | typeof ACCESS_TOKEN_SESSION_STATES.INVALID
    | typeof ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR;
  reason: AccessTokenSessionFailureReason;
  response: NextResponse;
}

export type AccessTokenSessionResolution =
  | ValidAccessTokenSessionResolution
  | FailedAccessTokenSessionResolution;

const inFlightRefreshRequests = new Map<
  string,
  Promise<RefreshAccessTokenResult>
>();

const createValidVerifyResult = (
  memberId: number,
): VerifyAccessTokenResult => ({
  state: ACCESS_TOKEN_SESSION_STATES.VALID,
  memberId,
});

const createInvalidVerifyResult = (): VerifyAccessTokenResult => ({
  state: ACCESS_TOKEN_SESSION_STATES.INVALID,
});

const createUnknownErrorVerifyResult = (): VerifyAccessTokenResult => ({
  state: ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR,
});

const createValidSessionResolution = ({
  accessToken,
  memberId,
  response,
}: {
  accessToken: string;
  memberId: number | string;
  response: NextResponse;
}): ValidAccessTokenSessionResolution => ({
  state: ACCESS_TOKEN_SESSION_STATES.VALID,
  accessToken,
  memberId: String(memberId),
  response,
});

const createFailedSessionResolution = ({
  state,
  reason,
  response,
}: {
  state:
    | typeof ACCESS_TOKEN_SESSION_STATES.INVALID
    | typeof ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR;
  reason: AccessTokenSessionFailureReason;
  response: NextResponse;
}): FailedAccessTokenSessionResolution => ({
  state,
  reason,
  response,
});

const isValidVerifyResult = (
  result: VerifyAccessTokenResult,
): result is Extract<
  VerifyAccessTokenResult,
  { state: typeof ACCESS_TOKEN_SESSION_STATES.VALID }
> => result.state === ACCESS_TOKEN_SESSION_STATES.VALID;

const isUnknownErrorVerifyResult = (result: VerifyAccessTokenResult): boolean =>
  result.state === ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR;

const getRefreshTokenFromRequest = (request: NextRequest): string | undefined =>
  request.cookies.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN)?.value;

const runSingleFlightRefreshRequest = (
  refreshToken: string,
  refreshTask: () => Promise<RefreshAccessTokenResult>,
): Promise<RefreshAccessTokenResult> => {
  const existingRequest = inFlightRefreshRequests.get(refreshToken);

  if (existingRequest) {
    return existingRequest;
  }

  const refreshPromise = refreshTask().finally(() => {
    inFlightRefreshRequests.delete(refreshToken);
  });

  inFlightRefreshRequests.set(refreshToken, refreshPromise);

  return refreshPromise;
};

const logAccessTokenSessionFailure = ({
  request,
  message,
  reason,
  verifyState,
  refreshState,
}: {
  request: NextRequest;
  message: string;
  reason: AccessTokenSessionFailureReason;
  verifyState?: string;
  refreshState?: string;
}): void => {
  logAuthEvent({
    level: AUTH_EVENT_LEVELS.WARN,
    layer: 'middleware-access-token-session',
    message,
    route: request.nextUrl.pathname,
    reason,
    verifyState,
    refreshState,
    hasAccessToken: Boolean(
      request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value,
    ),
    hasRefreshToken: Boolean(getRefreshTokenFromRequest(request)),
    hasIdentityCookie: Boolean(
      request.cookies.get(AUTH_COOKIE_NAMES.MEMBER_ID)?.value,
    ),
  });
};

export const getFailureReasonByVerifyState = (
  state:
    | typeof ACCESS_TOKEN_SESSION_STATES.INVALID
    | typeof ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR,
): AccessTokenSessionFailureReason =>
  state === ACCESS_TOKEN_SESSION_STATES.INVALID
    ? ACCESS_TOKEN_SESSION_FAILURE_REASONS.TOKEN_VERIFY_FAILED
    : ACCESS_TOKEN_SESSION_FAILURE_REASONS.VERIFY_REQUEST_FAILED;

export const verifyAccessToken = async (
  accessToken: string,
): Promise<VerifyAccessTokenResult> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${AUTH_API_PATHS.VERIFY_ME}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      try {
        const errorData = await response.json();

        if (
          isApiError(errorData) &&
          errorData.errorCode === AUTH_API_ERROR_CODES.INVALID_ACCESS_TOKEN
        ) {
          return createInvalidVerifyResult();
        }

        return createUnknownErrorVerifyResult();
      } catch {
        return createUnknownErrorVerifyResult();
      }
    }

    const data: { content: { memberId: number; roleId: string } } =
      await response.json();

    return createValidVerifyResult(data.content.memberId);
  } catch {
    return createUnknownErrorVerifyResult();
  }
};

export const refreshAccessToken = async (
  request: NextRequest,
): Promise<RefreshAccessTokenResult> => {
  const refreshToken = getRefreshTokenFromRequest(request);

  if (!refreshToken) {
    return { state: REFRESH_ACCESS_TOKEN_RESULT_STATES.INVALID };
  }

  return runSingleFlightRefreshRequest(refreshToken, async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${AUTH_API_PATHS.REFRESH_ACCESS_TOKEN}`,
        {
          method: 'GET',
          headers: {
            cookie: `${AUTH_COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}`,
          },
        },
      );

      if (!response.ok) {
        try {
          const errorData = await response.json();

          if (
            isApiError(errorData) &&
            errorData.errorCode === AUTH_API_ERROR_CODES.INVALID_REFRESH_TOKEN
          ) {
            return { state: REFRESH_ACCESS_TOKEN_RESULT_STATES.INVALID };
          }

          return { state: REFRESH_ACCESS_TOKEN_RESULT_STATES.REQUEST_FAILED };
        } catch {
          return { state: REFRESH_ACCESS_TOKEN_RESULT_STATES.REQUEST_FAILED };
        }
      }

      const data: { content: { accessToken: string } } = await response.json();
      const accessToken = data.content.accessToken;

      if (!accessToken) {
        return { state: REFRESH_ACCESS_TOKEN_RESULT_STATES.REQUEST_FAILED };
      }

      return {
        state: REFRESH_ACCESS_TOKEN_RESULT_STATES.SUCCESS,
        accessToken,
        refreshTokenSetCookieHeader:
          response.headers.get('set-cookie') ?? undefined,
      };
    } catch {
      return { state: REFRESH_ACCESS_TOKEN_RESULT_STATES.REQUEST_FAILED };
    }
  });
};

const resolveSessionFromRefreshResult = async ({
  request,
  response,
  refreshedTokenResult,
}: {
  request: NextRequest;
  response: NextResponse;
  refreshedTokenResult: Extract<
    RefreshAccessTokenResult,
    { state: typeof REFRESH_ACCESS_TOKEN_RESULT_STATES.SUCCESS }
  >;
}): Promise<AccessTokenSessionResolution> => {
  const refreshedVerifyResult = await verifyAccessToken(
    refreshedTokenResult.accessToken,
  );

  if (!isValidVerifyResult(refreshedVerifyResult)) {
    const reason = getFailureReasonByVerifyState(refreshedVerifyResult.state);

    logAccessTokenSessionFailure({
      request,
      message: '리프레시 후 액세스 토큰 재검증에 실패했습니다.',
      reason,
      verifyState: refreshedVerifyResult.state,
      refreshState: refreshedTokenResult.state,
    });

    return createFailedSessionResolution({
      state: refreshedVerifyResult.state,
      reason,
      response,
    });
  }

  applyAccessTokenCookie(request, response, refreshedTokenResult.accessToken);

  if (refreshedTokenResult.refreshTokenSetCookieHeader) {
    applyRefreshTokenCookie(
      request,
      response,
      refreshedTokenResult.refreshTokenSetCookieHeader,
    );
  }

  return createValidSessionResolution({
    accessToken: refreshedTokenResult.accessToken,
    memberId: refreshedVerifyResult.memberId,
    response,
  });
};

const resolveAccessTokenSessionAfterRefreshAttempt = async ({
  request,
  response,
  failureStateOnInvalidRefresh,
  failureReasonOnInvalidRefresh,
  failureStateOnRefreshRequestFailed,
  failureReasonOnRefreshRequestFailed,
  failureMessageOnInvalidRefresh,
  failureMessageOnRefreshRequestFailed,
}: {
  request: NextRequest;
  response: NextResponse;
  failureStateOnInvalidRefresh:
    | typeof ACCESS_TOKEN_SESSION_STATES.INVALID
    | typeof ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR;
  failureReasonOnInvalidRefresh: AccessTokenSessionFailureReason;
  failureStateOnRefreshRequestFailed:
    | typeof ACCESS_TOKEN_SESSION_STATES.INVALID
    | typeof ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR;
  failureReasonOnRefreshRequestFailed: AccessTokenSessionFailureReason;
  failureMessageOnInvalidRefresh: string;
  failureMessageOnRefreshRequestFailed: string;
}): Promise<AccessTokenSessionResolution> => {
  const refreshedTokenResult = await refreshAccessToken(request);

  if (
    refreshedTokenResult.state === REFRESH_ACCESS_TOKEN_RESULT_STATES.INVALID
  ) {
    logAccessTokenSessionFailure({
      request,
      message: failureMessageOnInvalidRefresh,
      reason: failureReasonOnInvalidRefresh,
      refreshState: refreshedTokenResult.state,
    });

    return createFailedSessionResolution({
      state: failureStateOnInvalidRefresh,
      reason: failureReasonOnInvalidRefresh,
      response,
    });
  }

  if (
    refreshedTokenResult.state ===
    REFRESH_ACCESS_TOKEN_RESULT_STATES.REQUEST_FAILED
  ) {
    logAccessTokenSessionFailure({
      request,
      message: failureMessageOnRefreshRequestFailed,
      reason: failureReasonOnRefreshRequestFailed,
      refreshState: refreshedTokenResult.state,
    });

    return createFailedSessionResolution({
      state: failureStateOnRefreshRequestFailed,
      reason: failureReasonOnRefreshRequestFailed,
      response,
    });
  }

  return resolveSessionFromRefreshResult({
    request,
    response,
    refreshedTokenResult,
  });
};

export async function resolveAccessTokenSession(
  request: NextRequest,
  accessToken: string,
): Promise<AccessTokenSessionResolution> {
  const response = NextResponse.next();
  const verifyResult = await verifyAccessToken(accessToken);

  if (isValidVerifyResult(verifyResult)) {
    return createValidSessionResolution({
      accessToken,
      memberId: verifyResult.memberId,
      response,
    });
  }

  if (isUnknownErrorVerifyResult(verifyResult)) {
    // /auth/me 자체가 불안정한 경우에는 refresh invalid만으로 현재 access token invalid를 확정하지 않는다.
    // 이 경로를 confirmed invalid로 내리면 public route false logout이 다시 들어온다.
    return resolveAccessTokenSessionAfterRefreshAttempt({
      request,
      response,
      failureStateOnInvalidRefresh: ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR,
      failureReasonOnInvalidRefresh:
        ACCESS_TOKEN_SESSION_FAILURE_REASONS.VERIFY_REQUEST_FAILED,
      failureStateOnRefreshRequestFailed:
        ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR,
      failureReasonOnRefreshRequestFailed:
        ACCESS_TOKEN_SESSION_FAILURE_REASONS.VERIFY_REQUEST_FAILED,
      failureMessageOnInvalidRefresh:
        '/auth/me 검증이 불안정해 보조 리프레시를 시도했지만 세션을 복구하지 못했습니다.',
      failureMessageOnRefreshRequestFailed:
        '/auth/me 검증과 보조 리프레시가 모두 불안정해 세션을 확정하지 못했습니다.',
    });
  }

  return resolveAccessTokenSessionAfterRefreshAttempt({
    request,
    response,
    failureStateOnInvalidRefresh: ACCESS_TOKEN_SESSION_STATES.INVALID,
    failureReasonOnInvalidRefresh:
      ACCESS_TOKEN_SESSION_FAILURE_REASONS.REFRESH_FAILED,
    failureStateOnRefreshRequestFailed:
      ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR,
    failureReasonOnRefreshRequestFailed:
      ACCESS_TOKEN_SESSION_FAILURE_REASONS.REFRESH_REQUEST_FAILED,
    failureMessageOnInvalidRefresh:
      '액세스 토큰 검증에 실패했고 리프레시도 무효했습니다.',
    failureMessageOnRefreshRequestFailed:
      '액세스 토큰 검증 후 리프레시 요청이 실패했습니다.',
  });
}
