import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getEntryList } from '../api/get-entry-list';
import { ApplyStatus } from '../api/types';

export const useEntryListInfiniteQuery = ({
  groupStudyId,
  size = 20,
  status = 'PENDING',
}: {
  groupStudyId: number;
  size?: number;
  status?: ApplyStatus;
}) => {
  return useInfiniteQuery({
    // ESLint(@tanstack/query/exhaustive-deps) 경고 방지: 모두 포함
    queryKey: ['entryList', groupStudyId, size, status],
    queryFn: ({ pageParam = 0 }) =>
      getEntryList({
        groupStudyId,
        page: pageParam,
        size,
        status,
      }),
    initialPageParam: 0,
    // 다음 페이지 번호 계산: 더 없으면 undefined로 중단
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    maxPages: 3,
    enabled: !!groupStudyId,
  });
};
