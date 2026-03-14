import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { getApplicantsByStatus } from '@/api/endpoints/group-study-application/get-applicants-by-status';
import { updateApplicantByStatus } from '@/api/endpoints/group-study-application/update-applicant-by-status';
import {
  ApplyStatus,
  UpdateApplicantByStatusRequest,
} from '@/types/api/group-study-application.types';

export const useApplicantsByStatusQuery = ({
  groupStudyId,
  status,
}: {
  groupStudyId: number;
  status: ApplyStatus;
}) => {
  return useInfiniteQuery({
    queryKey: ['entryList', groupStudyId, status],
    queryFn: ({ pageParam = 0 }) =>
      getApplicantsByStatus({
        groupStudyId,
        page: pageParam,
        size: 20,
        status,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    maxPages: 3,
    enabled: !!groupStudyId,
  });
};

export const useUpdateApplicantByStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateApplicantByStatusRequest) =>
      updateApplicantByStatus(params),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['groupStudyMemberList', variables.groupStudyId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['entryList', variables.groupStudyId],
      });
    },
  });
};
