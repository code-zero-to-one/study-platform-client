import type {
  AvailableStudyTimeResponse,
  StudyDashboardResponse,
  StudySubjectResponse,
  TechStackResponse,
  UpdateUserProfileInfoRequest,
  UpdateUserProfileInfoResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
} from '@/features/my-page/api/types';
import { axiosClientInstance } from '@/shared/tanstack-query/axios.client';

export const updateUserProfile = async (
  memberId: number,
  body: UpdateUserProfileRequest,
): Promise<UpdateUserProfileResponse> => {
  const res = await axiosClientInstance.patch(
    `/members/${memberId}/profile`,
    body,
  );

  return res.data.content;
};

export const updateUserProfileInfo = async (
  memberId: number,
  body: UpdateUserProfileInfoRequest,
): Promise<UpdateUserProfileInfoResponse> => {
  const res = await axiosClientInstance.patch(
    `/members/${memberId}/profile/info`,
    body,
  );

  return res.data.content;
};

export const getAvailableStudyTimes = async (): Promise<
  AvailableStudyTimeResponse[]
> => {
  const res = await axiosClientInstance.get('/available-study-times');

  return res.data.content;
};

export const getStudySubjects = async (): Promise<StudySubjectResponse[]> => {
  const res = await axiosClientInstance.get('/study-subjects');

  return res.data.content;
};

export const getTechStacks = async (): Promise<TechStackResponse[]> => {
  const res = await axiosClientInstance.get('/tech-stacks');

  return res.data.content;
};

export const getStudyDashboard = async (): Promise<StudyDashboardResponse> => {
  const res = await axiosClientInstance.get('/study/dashboard');

  return res.data.content;
};
