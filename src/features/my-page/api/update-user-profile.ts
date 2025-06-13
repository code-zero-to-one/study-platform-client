import type {
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
} from '@/features/my-page/api/types';
import { axiosInstance } from '@/shared/tanstack-query/axios';

export const updateUserProfile = async (
  memberId: number,
  body: UpdateUserProfileRequest,
): Promise<UpdateUserProfileResponse> => {
  const res = await axiosInstance.patch(`/members/${memberId}/profile`, body);

  return res.data.content;
};
