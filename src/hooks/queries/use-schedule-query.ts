import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getDailyStudies,
  getMonthlyStudyCalendar,
  getStudyStatus,
  getWeeklyParticipation,
} from '@/api/endpoints/archive/get-study-schedule';
import {
  GetDailyStudiesParams,
  GetMonthlyCalendarParams,
  MonthlyCalendarResponse,
  StudyStatus,
} from '@/types/api/schedule.types';
import { scheduleQueryKeys } from '@/types/schedule/query';

// 스터디 주간 참여 유무 확인 query
export const useWeeklyParticipationQuery = (params: string, enabled = true) => {
  return useQuery({
    queryKey: scheduleQueryKeys.weeklyParticipation(params),
    queryFn: () => getWeeklyParticipation(params),
    staleTime: 60 * 1000,
    enabled: !!params && enabled,
  });
};

// 스터디 매칭 결과 조회 query
export const useDailyStudiesQuery = (params?: GetDailyStudiesParams) => {
  return useQuery({
    queryKey: scheduleQueryKeys.dailyStudiesList(params),
    queryFn: () => getDailyStudies(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

// 스터디 캘린더 조회 query
export const useMonthlyStudyCalendarQuery = (
  params: GetMonthlyCalendarParams,
) => {
  return useQuery<MonthlyCalendarResponse>({
    queryKey: scheduleQueryKeys.monthlyCalendar(params),
    queryFn: () => getMonthlyStudyCalendar(params),
    staleTime: 60 * 1000,
    enabled: !!params?.year && !!params?.month,
  });
};

export const useStudyStatusQuery = () => {
  return useQuery<StudyStatus>({
    queryKey: scheduleQueryKeys.studyStatus(),
    queryFn: getStudyStatus,
    staleTime: 60 * 1000,
  });
};
