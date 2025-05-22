import type {
  GetDailyStudiesParams,
  GetDailyStudiesResponse,
} from '@/features/home/api/types';
import { axiosInstance } from '@/shared/tanstack-query/axios';

export const getDailyStudies = async (
  params?: GetDailyStudiesParams,
): Promise<GetDailyStudiesResponse> => {
  const res = await axiosInstance.get('/study/daily', { params });

  return res.data;
};
