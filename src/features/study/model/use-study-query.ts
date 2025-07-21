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

// 스터디 주간 참여 유무 확인 query
export const useWeeklyParticipation = (params: GetDailyStudyDetailParams2) => {
  return useQuery({
    queryKey: ['weeklyParticipation', params],
    queryFn: () => getWeeklyParticipation(params),
    staleTime: 60 * 1000,
  });
};

// 스터디 상세 조회 query
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

// 스터디 전체 조회 query
export const useDailyStudiesQuery = (params?: GetDailyStudiesParams) => {
  return useQuery({
    queryKey: ['dailyStudies', params],
    queryFn: () => getDailyStudies(params),
    staleTime: 60 * 1000,
  });
};

// 스터디 캘린더 조회 query
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

// 스터디 신청 mutation
export const useJoinStudyMutation = () => {
  return useMutation({
    mutationFn: (payload: JoinStudyRequest) => postJoinStudy(payload),
  });
};
