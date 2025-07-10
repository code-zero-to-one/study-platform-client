import type {
  GetUserProfileResponse,
  PatchAutoMatchingParams,
  StudyDashboardResponse,
} from '@/entities/user/api/types';
import { axiosInstance } from '@/shared/tanstack-query/axios';

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

export const getStudyDashboard = async (
  memberId: number,
): Promise<StudyDashboardResponse> => {
  const res = await axiosInstance.get(`/study/dashboard/${memberId}`);
  console.log('errrrpr' + res.data.content);

  return res.data.content;
};
