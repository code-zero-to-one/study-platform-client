import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  completeStudy,
  getDailyStudies,
  getDailyStudyDetail,
  getMonthlyStudyCalendar,
  getWeeklyParticipation,
  postJoinStudy,
  putStudyDaily,
} from '@/features/study/api/get-study-data';
import { isApiError } from '@/shared/tanstack-query/api-error';
import { openToast } from '@/shared/ui/toast';
import {
  CompleteStudyRequest,
  GetDailyStudiesParams,
  GetDailyStudyDetailParams2,
  GetMonthlyCalendarParams,
  JoinStudyRequest,
  MonthlyCalendarResponse,
  PrepareStudyRequest,
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
export const useDailyStudyDetailQuery = (params: string) => {
  return useQuery({
    queryKey: ['dailyStudyDetail', params],
    queryFn: () => getDailyStudyDetail(params),
    staleTime: 60 * 1000,
    enabled: !!params,
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
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: JoinStudyRequest) => postJoinStudy(payload),
    onSuccess: () => {
      alert('스터디 신청이 완료되었습니다!');
      router.refresh();
    },
    onError: (error) => {
      if (isApiError(error)) {
        openToast({
          type: 'danger',
          text: '스터디 신청에 실패했습니다.',
        });
      }
    },
  });
};

// 스터디 상세 & 리스트 업데이트
interface UpdateDailyStudyVariables {
  dailyStudyId: number;
  studyDate: string;
  form: PrepareStudyRequest | CompleteStudyRequest;
  requestType: 'prepare' | 'complete';
}

export const useUpdateDailyStudyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, UpdateDailyStudyVariables>({
    mutationFn: async ({ dailyStudyId, form, requestType }) => {
      if (requestType === 'prepare') {
        await putStudyDaily(dailyStudyId, form as PrepareStudyRequest);
      } else {
        await completeStudy(dailyStudyId, form as CompleteStudyRequest);
      }
    },
    onSuccess: async (_data, { studyDate }) => {
      await queryClient.invalidateQueries({
        queryKey: ['dailyStudyDetail', studyDate],
        exact: true,
      });

      await queryClient.invalidateQueries({
        queryKey: ['dailyStudies', { studyDate }],
        exact: false,
      });
    },
  });
};
