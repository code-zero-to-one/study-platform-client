import type {
  AvailableStudyTimeResponse,
  UpdateUserProfileInfoRequest,
  UpdateUserProfileInfoResponse,
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

export const updateUserProfileInfo = async (
  memberId: number,
  body: UpdateUserProfileInfoRequest,
): Promise<UpdateUserProfileInfoResponse> => {
  const res = await axiosInstance.patch(
    `/members/${memberId}/profile/info`,
    body,
  );

  return res.data.content;
};

export const getAvailableStudyTimes = async (): Promise<
  AvailableStudyTimeResponse[]
> => {
  const res = await axiosInstance.get('/available-study-times');

  return res.data.content;
};
