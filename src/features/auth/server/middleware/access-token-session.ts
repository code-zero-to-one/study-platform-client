import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isApiError } from '@/api/client/api-error';
import { AUTH_COOKIE_NAMES } from '@/features/auth/model/auth-cookie';
import { applyAccessTokenCookie } from './auth-cookies';
import {
  ACCESS_TOKEN_SESSION_FAILURE_REASONS,
  type AccessTokenSessionFailureReason,
} from './route-reasons';

const AUTH_API_PATHS = {
  VERIFY_ME: '/api/v1/auth/me',
  REFRESH_ACCESS_TOKEN: '/api/v1/auth/access-token/refresh',
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

const getFailureReasonByVerifyState = (
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
      const errorData = await response.json();

      if (isApiError(errorData) && errorData.errorCode === 'AUTH001') {
        return createInvalidVerifyResult();
      }

      return createUnknownErrorVerifyResult();
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
): Promise<string | null> => {
  try {
    const refreshToken = request.cookies.get(
      AUTH_COOKIE_NAMES.REFRESH_TOKEN,
    )?.value;

    if (!refreshToken) {
      return null;
    }

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
      return null;
    }

    const data: { content: { accessToken: string } } = await response.json();

    return data.content.accessToken;
  } catch {
    return null;
  }
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
    return createFailedSessionResolution({
      state: ACCESS_TOKEN_SESSION_STATES.UNKNOWN_ERROR,
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.VERIFY_REQUEST_FAILED,
      response,
    });
  }

  const refreshedAccessToken = await refreshAccessToken(request);

  if (!refreshedAccessToken) {
    return createFailedSessionResolution({
      state: ACCESS_TOKEN_SESSION_STATES.INVALID,
      reason: ACCESS_TOKEN_SESSION_FAILURE_REASONS.REFRESH_FAILED,
      response,
    });
  }

  const refreshedVerifyResult = await verifyAccessToken(refreshedAccessToken);

  if (!isValidVerifyResult(refreshedVerifyResult)) {
    return createFailedSessionResolution({
      state: refreshedVerifyResult.state,
      reason: getFailureReasonByVerifyState(refreshedVerifyResult.state),
      response,
    });
  }

  applyAccessTokenCookie(request, response, refreshedAccessToken);

  return createValidSessionResolution({
    accessToken: refreshedAccessToken,
    memberId: refreshedVerifyResult.memberId,
    response,
  });
}
