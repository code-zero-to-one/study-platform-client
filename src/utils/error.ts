import { isAxiosError } from 'axios';
import { ApiError } from '@/api/client/api-error';

/**
 * 에러 객체에서 errorCode와 message를 추출합니다.
 * ApiError 인스턴스 또는 AxiosError의 response.data에서 추출합니다.
 */
export const extractErrorCode = (
  error: unknown,
): { errorCode?: string; message?: string } => {
  if (error instanceof ApiError) {
    return { errorCode: error.errorCode, message: error.message };
  }

  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data as { errorCode?: string; message?: string };
    return { errorCode: data.errorCode, message: data.message };
  }

  return {};
};

