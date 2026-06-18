import { isAxiosError } from 'axios';
import { axiosServerInstance } from '@/api/client/axios.server';
import { GetUserProfileResponse } from '@/types/api/user.types';

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
      status: 404;
      error: unknown;
    }
  | {
      kind: typeof SERVER_USER_PROFILE_RESULT_KINDS.REQUEST_FAILED;
      status?: number;
      error: unknown;
    };

type ServerUserProfileFailureResult = Exclude<
  ServerUserProfileResult,
  { kind: typeof SERVER_USER_PROFILE_RESULT_KINDS.SUCCESS }
>;

export class ServerUserProfileRequestError extends Error {
  public readonly kind: ServerUserProfileFailureResult['kind'];
  public readonly status?: number;
  public readonly causeError: unknown;

  public constructor(result: ServerUserProfileFailureResult) {
    super(
      result.kind === SERVER_USER_PROFILE_RESULT_KINDS.AUTH_ERROR
        ? '프로필 조회 중 인증 오류가 발생했습니다.'
        : result.kind === SERVER_USER_PROFILE_RESULT_KINDS.MISSING_PROFILE
          ? '프로필 데이터를 찾을 수 없습니다.'
          : '프로필 조회 요청이 실패했습니다.',
    );
    this.name = 'ServerUserProfileRequestError';
    this.kind = result.kind;
    this.status = result.status;
    this.causeError = result.error;
  }
}

const classifyServerUserProfileError = (
  error: unknown,
): ServerUserProfileFailureResult | undefined => {
  if (!isAxiosError(error)) {
    return undefined;
  }

  const status = error.response?.status;

  if (status === 401 || status === 403) {
    return {
      kind: SERVER_USER_PROFILE_RESULT_KINDS.AUTH_ERROR,
      status,
      error,
    };
  }

  if (status === 404) {
    return {
      kind: SERVER_USER_PROFILE_RESULT_KINDS.MISSING_PROFILE,
      status,
      error,
    };
  }

  return {
    kind: SERVER_USER_PROFILE_RESULT_KINDS.REQUEST_FAILED,
    status,
    error,
  };
};

export const getUserProfileInServerResult = async (
  memberId: number,
): Promise<ServerUserProfileResult> => {
  try {
    const res = await axiosServerInstance.get(`/members/${memberId}/profile`);

    return {
      kind: SERVER_USER_PROFILE_RESULT_KINDS.SUCCESS,
      profile: res.data.content,
    };
  } catch (error) {
    const classifiedError = classifyServerUserProfileError(error);

    if (classifiedError) {
      return classifiedError;
    }

    throw error;
  }
};

export const getUserProfileInServer = async (
  memberId: number,
): Promise<GetUserProfileResponse> => {
  const result = await getUserProfileInServerResult(memberId);

  if (result.kind === SERVER_USER_PROFILE_RESULT_KINDS.SUCCESS) {
    return result.profile;
  }

  throw new ServerUserProfileRequestError(result);
};

export const tryGetUserProfileInServer = getUserProfileInServerResult;
