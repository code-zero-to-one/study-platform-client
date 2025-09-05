import { axiosServerInstance } from '@/shared/tanstack-query/axios.server';
import { GetUserProfileResponse } from './types';

export const getUserProfileInServer = async (
  memberId: number,
): Promise<GetUserProfileResponse> => {
  const res = await axiosServerInstance.get(`/members/${memberId}/profile`);

  return res.data.content;
};
