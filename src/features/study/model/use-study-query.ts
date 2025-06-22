import { useQuery } from '@tanstack/react-query';
import {
  getDailyStudies,
  getDailyStudyDetail,
  getMonthlyStudyCalendar,
} from '@/features/study/api/get-study-data';
import {
  GetDailyStudiesParams,
  GetDailyStudyDetailParams,
  GetMonthlyCalendarParams,
  MonthlyCalendarResponse,
} from '../api/types';

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

export const useMonthlyStudyCalendarQuery = (
  params: GetMonthlyCalendarParams,
) => {
  return useQuery<MonthlyCalendarResponse>({
    queryKey: ['monthlyStudyCalendar', params],
    queryFn: () => getMonthlyStudyCalendar(params),
    staleTime: 60 * 1000,
    enabled: !!params?.year && !!params?.month,
  });
};
