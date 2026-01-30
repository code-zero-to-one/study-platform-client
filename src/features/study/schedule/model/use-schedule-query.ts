import { useQuery } from '@tanstack/react-query';
import {
  getDailyStudies,
  getMonthlyStudyCalendar,
  getStudyStatus,
  getWeeklyParticipation,
} from '@/features/study/schedule/api/get-study-schedule';
import {
  GetDailyStudiesParams,
  GetMonthlyCalendarParams,
  MonthlyCalendarResponse,
  StudyStatus,
} from '@/features/study/schedule/api/schedule-types';

// 스터디 주간 참여 유무 확인 query
export const useWeeklyParticipation = (params: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['weeklyParticipation', params],
    queryFn: () => getWeeklyParticipation(params),
    staleTime: 60 * 1000,
    enabled: !!params && enabled,
  });
};

// 스터디 매칭 결과 조회 query
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

export const useStudyStatusQuery = () => {
  return useQuery<StudyStatus>({
    queryKey: ['studyStatus'],
    queryFn: getStudyStatus,
    staleTime: 60 * 1000,
  });
};
