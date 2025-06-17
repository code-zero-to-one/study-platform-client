import type { GetUserProfileResponse } from '@/entities/user/api/types';
import { axiosInstance } from '@/shared/tanstack-query/axios';

export const getUserProfile = async (
  memberId: number,
): Promise<GetUserProfileResponse> => {
  const res = await axiosInstance.get(`/members/${memberId}/profile`);

  return res.data.content;
};
