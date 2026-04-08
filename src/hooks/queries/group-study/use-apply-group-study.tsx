import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyGroupStudy } from '@/api/endpoints/group-study/apply-group-study';
import { ApplyGroupStudyRequest } from '@/types/api/group-study.types';

// 그룹 스터디 신청 훅
export const useApplyGroupStudyMutation = (
  groupStudyId: ApplyGroupStudyRequest['groupStudyId'],
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyGroupStudy,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['groupStudyMyStatus', groupStudyId],
      });
    },
  });
};
