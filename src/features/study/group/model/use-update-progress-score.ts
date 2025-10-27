import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateProgressScoreRequest } from '../api/group-study-types';
import { updateProgressScore } from '../api/update-progress-score';

export const useUpdateProgressScoreMutation = (groupStudyId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProgressScoreRequest) =>
      updateProgressScore({ groupStudyId, ...data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['groupStudyMemberList', groupStudyId],
      });
    },
  });
};
