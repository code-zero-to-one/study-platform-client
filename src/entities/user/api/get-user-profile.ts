import type {
  GetUserProfileResponse,
  PatchAutoMatchingParams,
} from '@/entities/user/api/types';
import { axiosClientInstance } from '@/shared/tanstack-query/axios.client';

export const getUserProfile = async (
  memberId: number,
): Promise<GetUserProfileResponse> => {
  const res = await axiosClientInstance.get(`/members/${memberId}/profile`);

  return res.data.content;
};

export const patchAutoMatching = async ({
  memberId,
  autoMatching,
}: PatchAutoMatchingParams): Promise<void> => {
  await axiosClientInstance.patch(
    `/members/${memberId}/auto-matching`,
    undefined,
    {
      params: { 'auto-matching': autoMatching },
    },
  );
};
