import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getDailyStudies,
  getDailyStudyDetail,
  getMonthlyStudyCalendar,
  postJoinStudy,
} from '@/features/study/api/get-study-data';
import {
  GetDailyStudiesParams,
  GetDailyStudyDetailParams,
  GetMonthlyCalendarParams,
  JoinStudyRequest,
  MonthlyCalendarResponse,
} from '../api/types';

export const useDailyStudyDetailQuery = (params: GetDailyStudyDetailParams) => {
  // 나중에 변수 추가 시 tanstack-query를 이용해 받을 예정입니다.
  const hasParticipated = false;

  return useQuery({
    queryKey: ['dailyStudyDetail', params],
    queryFn: () => getDailyStudyDetail(params),
    staleTime: 60 * 1000,
    enabled: hasParticipated && !!params,
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
