import { notFound } from 'next/navigation';
import { axiosServerInstance } from '@/api/client/axios.server';
import type { GetUserProfileResponse } from '@/types/api/user.types';
import { analyzeError, ErrorType } from '@/utils/error-handler';

export const requestUserProfileInServer = async (
  memberId: number,
): Promise<GetUserProfileResponse> => {
  const res = await axiosServerInstance.get(`/members/${memberId}/profile`);

  return res.data.content;
};

export const getUserProfileInServer = async (
  memberId: number,
): Promise<GetUserProfileResponse> => {
  try {
    return await requestUserProfileInServer(memberId);
  } catch (error) {
    const errorInfo = analyzeError(error, { isServerSide: true });

    if (errorInfo.type === ErrorType.NOT_FOUND) {
      notFound();
    }

    throw error;
  }
};
