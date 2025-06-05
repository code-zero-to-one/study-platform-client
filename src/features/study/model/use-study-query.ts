import { useQuery } from '@tanstack/react-query';
import {
  getDailyStudies,
  getDailyStudyDetail,
} from '@/features/study/api/get-study-data';
import { GetDailyStudiesParams } from '../api/types';

export const useDailyStudyDetailQuery = (dailyId: number) => {
  return useQuery({
    queryKey: ['dailyStudyDetail', dailyId],
    queryFn: () => getDailyStudyDetail(dailyId),
    enabled: !!dailyId,
    staleTime: 60 * 1000,
  });
};

export const useDailyStudiesQuery = (params?: GetDailyStudiesParams) => {
  return useQuery({
    queryKey: ['dailyStudies', params],
    queryFn: () => getDailyStudies(params),
    staleTime: 60 * 1000,
  });
};
