import type {
  GetDailyStudiesParams,
  GetMonthlyCalendarParams,
} from '@/features/study/one-to-one/schedule/api/schedule-types';

export const scheduleQueryKeys = {
  all: ['schedule'] as const,
  weeklyParticipations: () =>
    [...scheduleQueryKeys.all, 'weekly-participation'] as const,
  weeklyParticipation: (studyDate: string) =>
    [...scheduleQueryKeys.weeklyParticipations(), studyDate] as const,
  dailyStudies: (studyDate?: string) =>
    [...scheduleQueryKeys.all, 'daily-studies', studyDate ?? 'all'] as const,
  dailyStudiesList: (params?: GetDailyStudiesParams) =>
    [
      ...scheduleQueryKeys.dailyStudies(params?.studyDate),
      'list',
      params ?? {},
    ] as const,
  monthlyCalendars: () =>
    [...scheduleQueryKeys.all, 'monthly-calendar'] as const,
  monthlyCalendar: (params: GetMonthlyCalendarParams) =>
    [...scheduleQueryKeys.monthlyCalendars(), params] as const,
  studyStatus: () => [...scheduleQueryKeys.all, 'study-status'] as const,
};
