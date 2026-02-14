import { isAxiosError } from 'axios';
import { redirect } from 'next/navigation';
import { axiosServerInstance } from '@/api/client/axios.server';
import { GetUserProfileResponse } from './types';

export const getUserProfileInServer = async (
  memberId: number,
): Promise<GetUserProfileResponse> => {
  try {
    const res = await axiosServerInstance.get(`/members/${memberId}/profile`);

    return res.data.content;
  } catch (error) {
    // 회원가입 직후 프로필이 아직 생성되지 않았거나 인증 문제인 경우
    // Route Handler로 리다이렉트하여 쿠키 삭제 후 로그인 페이지로 이동
    if (isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 404 || status === 401 || status === 403) {
        redirect('/api/auth/clear-session?redirect=/login');
      }
    }

    // 예상치 못한 에러는 다시 throw
    throw error;
  }
};

export const tryGetUserProfileInServer = async (memberId: number) => {
  try {
    return await getUserProfileInServer(memberId);
  } catch (error) {
    if (isAxiosError(error) && !error.response) {
      return null;
    }

    throw error;
  }
};
