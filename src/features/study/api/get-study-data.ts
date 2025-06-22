import type {
  DailyStudy,
  GetDailyStudiesParams,
  GetDailyStudiesResponse,
  GetDailyStudyDetailParams,
  GetMonthlyCalendarParams,
  MonthlyCalendarResponse,
} from '@/features/study/api/types';
import { axiosInstance } from '@/shared/tanstack-query/axios';

export const getDailyStudyDetail = async (
  params: GetDailyStudyDetailParams,
): Promise<DailyStudy> => {
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
