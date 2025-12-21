import { axiosInstance } from '@/api/client/axios';
import type {
  AvailableStudyTimeResponse,
  CareerResponse,
  JobResponse,
  StudyFormatTypeResponse,
  StudyDashboardResponse,
  StudySubjectResponse,
  TechStackResponse,
  UpdateUserProfileInfoRequest,
  UpdateUserProfileInfoResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
} from '@/features/my-page/api/types';

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

export const getStudySubjects = async (): Promise<StudySubjectResponse[]> => {
  const res = await axiosInstance.get('/study-subjects');

  return res.data.content;
};

export const getTechStacks = async (): Promise<TechStackResponse[]> => {
  const res = await axiosInstance.get('/tech-stacks');

  return res.data.content;
};

export const getStudyDashboard = async (): Promise<StudyDashboardResponse> => {
  const res = await axiosInstance.get('/study/dashboard');

  return res.data.content;
};

/**
 * 회원가입시 받는 정보들 (SPRINT2 프로필개선)
 **/
export const getJobs = async (): Promise<JobResponse[]> => {
  const res = await axiosInstance.get('/jobs');

  return res.data.content;
};

export const getCareers = async (): Promise<CareerResponse[]> => {
  const res = await axiosInstance.get('/careers');

  return res.data.content;
};

export const getStudyFormatTypes = async (): Promise<
  StudyFormatTypeResponse[]
> => {
  const res = await axiosInstance.get('/study-format-types');

  return res.data.content;
};
