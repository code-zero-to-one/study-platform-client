import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getDailyStudies,
  getDailyStudyDetail,
  getMonthlyStudyCalendar,
  getWeeklyParticipation,
  postJoinStudy,
} from '@/features/study/api/get-study-data';
import {
  GetDailyStudiesParams,
  GetDailyStudyDetailParams,
  GetDailyStudyDetailParams2,
  GetMonthlyCalendarParams,
  JoinStudyRequest,
  MonthlyCalendarResponse,
} from '../api/types';

export const useWeeklyParticipation = (params: GetDailyStudyDetailParams2) => {
  return useQuery({
    queryKey: ['weeklyParticipation', params],
    queryFn: () => getWeeklyParticipation(params),
    staleTime: 60 * 1000,
  });
};

export const useDailyStudyDetailQuery = (
  params: GetDailyStudyDetailParams,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['dailyStudyDetail', params],
    queryFn: () => getDailyStudyDetail(params),
    staleTime: 60 * 1000,
    enabled: enabled && !!params,
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

export const useJoinStudyMutation = () => {
  return useMutation({
    mutationFn: (payload: JoinStudyRequest) => postJoinStudy(payload),
  });
};
