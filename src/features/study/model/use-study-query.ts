import { useQuery } from '@tanstack/react-query';
import {
  getDailyStudies,
  getDailyStudyDetail,
} from '@/features/study/api/get-study-data';
import { GetDailyStudiesParams, GetDailyStudyDetailParams } from '../api/types';

export const useDailyStudyDetailQuery = (params: GetDailyStudyDetailParams) => {
  return useQuery({
    queryKey: ['dailyStudyDetail', params],
    queryFn: () => getDailyStudyDetail(params),
    staleTime: 60 * 1000,
    enabled: !!params,
  });
};

export const useDailyStudiesQuery = (params?: GetDailyStudiesParams) => {
  return useQuery({
    queryKey: ['dailyStudies', params],
    queryFn: () => getDailyStudies(params),
    staleTime: 60 * 1000,
  });
};
