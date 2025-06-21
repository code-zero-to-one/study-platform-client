import type {
  DailyStudy,
  GetDailyStudiesParams,
  GetDailyStudiesResponse,
  GetDailyStudyDetailParams,
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
