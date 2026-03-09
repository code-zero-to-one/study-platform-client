import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeStudy,
  getDailyStudyDetail,
  putStudyDaily,
} from '@/features/study/interview/api/get-interview';
import type {
  CompleteStudyRequest,
  PrepareStudyRequest,
} from '@/features/study/interview/api/interview-types';
import { interviewQueryKeys } from '@/types/interview/query';
import { scheduleQueryKeys } from '@/types/schedule/query';

export const useDailyStudyDetailQuery = (params: string) => {
  return useQuery({
    queryKey: interviewQueryKeys.dailyStudyDetail(params),
    queryFn: () => getDailyStudyDetail(params),
    staleTime: 60 * 1000,
    enabled: !!params,
  });
};

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
        queryKey: interviewQueryKeys.dailyStudyDetail(studyDate),
        exact: true,
      });

      await queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.dailyStudies(studyDate),
      });
    },
  });
};
