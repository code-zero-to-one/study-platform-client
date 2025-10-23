import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGroupStudyMember } from '../api/delete-group-study-member';
import { DeleteGroupStudyMemberRequest } from '../api/group-study-types';

export const useDeleteGroupStudyMemberMutation = (groupStudyId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reason,
      targetMemberId,
    }: Omit<DeleteGroupStudyMemberRequest, 'groupStudyId'>) =>
      deleteGroupStudyMember({ groupStudyId, reason, targetMemberId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['groupStudyMemberList', groupStudyId],
      });
    },
  });
};
