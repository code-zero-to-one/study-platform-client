import type {
  DailyStudyDetail,
  GetDailyStudiesParams,
  GetDailyStudiesResponse,
  GetDailyStudyDetailParams,
  GetMonthlyCalendarParams,
  JoinStudyRequest,
  MonthlyCalendarResponse,
  PostDailyRetrospectRequest,
  PostStudyDailyRequest,
  WeeklyParticipationResponse,
} from '@/features/study/api/types';
import { axiosInstance } from '@/shared/tanstack-query/axios';

export const getDailyStudyDetail = async (
  params: GetDailyStudyDetailParams,
): Promise<DailyStudyDetail> => {
  const res = await axiosInstance.get(`/study/daily/today`, { params });

  return res.data.content;
};

export const getDailyStudies = async (
  params?: GetDailyStudiesParams,
): Promise<GetDailyStudiesResponse> => {
  const res = await axiosInstance.get('/study/daily', { params });

  return res.data.content;
};

export const getMonthlyStudyCalendar = async (
  params: GetMonthlyCalendarParams,
): Promise<MonthlyCalendarResponse> => {
  const res = await axiosInstance.get('/study/daily/month', { params });

  return res.data.content;
};

export const postDailyRetrospect = async (body: PostDailyRetrospectRequest) => {
  const res = await axiosInstance.post('/study/daily/retrospect', body);

  return res.data;
};

export const postStudyDaily = async (body: PostStudyDailyRequest) => {
  const res = await axiosInstance.post('/study/daily', body);

  return res.data;
};

export const postJoinStudy = async (payload: JoinStudyRequest) => {
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );

  const res = await axiosInstance.post('/matching/apply', cleanPayload);

  return res.data;
};

export const getWeeklyParticipation = async (
  params: GetDailyStudyDetailParams,
): Promise<WeeklyParticipationResponse> => {
  const res = await axiosInstance.get('/study/week/participation', {
    params,
  });

  return res.data.content;
};
