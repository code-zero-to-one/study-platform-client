import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateGreetingRequest } from '../api/group-study-types';
import { updateMemberGreeting } from '../api/write-greeting';

export const useUpdateGreetingMutation = (groupStudyId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content }: Pick<UpdateGreetingRequest, 'content'>) =>
      updateMemberGreeting({ groupStudyId, content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['groupStudyMemberList', groupStudyId],
      });
    },
  });
};
