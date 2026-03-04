import { axiosInstance } from '@/api/client/axios';
import type {
  GetUserProfileResponse,
  PatchAutoMatchingParams,
} from '@/types/api/user.types';

export const getUserProfile = async (
  memberId: number,
): Promise<GetUserProfileResponse> => {
  const res = await axiosInstance.get(`/members/${memberId}/profile`);

  return res.data.content;
};

export const patchAutoMatching = async ({
  memberId,
  autoMatching,
}: PatchAutoMatchingParams): Promise<void> => {
  await axiosInstance.patch(`/members/${memberId}/auto-matching`, undefined, {
    params: { 'auto-matching': autoMatching },
  });
};
