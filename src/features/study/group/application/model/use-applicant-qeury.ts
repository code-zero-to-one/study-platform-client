import { useInfiniteQuery } from '@tanstack/react-query';
import { getApplicantsByStatus } from '../api/get-applicants-by-status';
import { ApplyStatus } from '../api/type';

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
