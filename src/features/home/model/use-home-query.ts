import { useQuery } from '@tanstack/react-query';
import { getDailyStudies } from '@/features/home/api/get-home-data';
import { GetDailyStudiesParams } from '../api/types';

export const useDailyStudiesQuery = (params?: GetDailyStudiesParams) => {
  return useQuery({
    queryKey: ['dailyStudies', params],
    queryFn: () => getDailyStudies(params),
    staleTime: 60 * 1000,
  });
};
