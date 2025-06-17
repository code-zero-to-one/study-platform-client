import type {
  DailyStudy,
  GetDailyStudiesParams,
  GetDailyStudiesResponse,
} from '@/features/study/api/types';
import { axiosInstance } from '@/shared/tanstack-query/axios';

export const getDailyStudyDetail = async (): Promise<DailyStudy> => {
  const res = await axiosInstance.get(`/study/daily/today`);

  return res.data.content;
};

export const getDailyStudies = async (
  params?: GetDailyStudiesParams,
): Promise<GetDailyStudiesResponse> => {
  const res = await axiosInstance.get('/study/daily', { params });

  return res.data.content;
};
