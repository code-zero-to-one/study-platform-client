import { requestUserProfileInServer } from '@/api/endpoints/user/get-user-profile.server';
import type { GetUserProfileResponse } from '@/types/api/user.types';
import { analyzeError, ErrorType } from '@/utils/error-handler';

export const SERVER_USER_PROFILE_RESULT_KINDS = {
  SUCCESS: 'success',
  AUTH_ERROR: 'auth-error',
  MISSING_PROFILE: 'missing-profile',
  REQUEST_FAILED: 'request-failed',
} as const;

export type ServerUserProfileResult =
  | {
      kind: typeof SERVER_USER_PROFILE_RESULT_KINDS.SUCCESS;
      profile: GetUserProfileResponse;
    }
  | {
      kind: typeof SERVER_USER_PROFILE_RESULT_KINDS.AUTH_ERROR;
      status: 401 | 403;
      error: unknown;
    }
  | {
      kind: typeof SERVER_USER_PROFILE_RESULT_KINDS.MISSING_PROFILE;
      status?: 404;
      error: unknown;
    }
  | {
      kind: typeof SERVER_USER_PROFILE_RESULT_KINDS.REQUEST_FAILED;
      status?: number;
      error: unknown;
    };

const classifyServerUserProfileError = (
  error: unknown,
): Exclude<
  ServerUserProfileResult,
  { kind: typeof SERVER_USER_PROFILE_RESULT_KINDS.SUCCESS }
> => {
  const errorInfo = analyzeError(error, { isServerSide: true });
  const status = errorInfo.statusCode;

  if (errorInfo.type === ErrorType.AUTH && (status === 401 || status === 403)) {
    return {
      kind: SERVER_USER_PROFILE_RESULT_KINDS.AUTH_ERROR,
      status,
      error,
    };
  }

  if (errorInfo.type === ErrorType.NOT_FOUND) {
    return {
      kind: SERVER_USER_PROFILE_RESULT_KINDS.MISSING_PROFILE,
      status: status === 404 ? status : undefined,
      error,
    };
  }

  return {
    kind: SERVER_USER_PROFILE_RESULT_KINDS.REQUEST_FAILED,
    status,
    error,
  };
};

export const tryGetUserProfileInServer = async (
  memberId: number,
): Promise<ServerUserProfileResult> => {
  try {
    const profile = await requestUserProfileInServer(memberId);

    return {
      kind: SERVER_USER_PROFILE_RESULT_KINDS.SUCCESS,
      profile,
    };
  } catch (error) {
    return classifyServerUserProfileError(error);
  }
};
