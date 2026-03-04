import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeStudy,
  getDailyStudyDetail,
  putStudyDaily,
} from '@/api/endpoints/interview/get-interview';
import {
  CompleteStudyRequest,
  PrepareStudyRequest,
} from '@/types/api/interview.types';

// 스터디 상세 조회 query
export const useDailyStudyDetailQuery = (params: string) => {
  return useQuery({
    queryKey: ['dailyStudyDetail', params],
    queryFn: () => getDailyStudyDetail(params),
    staleTime: 60 * 1000,
    enabled: !!params,
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
