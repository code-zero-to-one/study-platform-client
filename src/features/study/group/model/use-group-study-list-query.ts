import { useInfiniteQuery } from '@tanstack/react-query';
import { getGroupStudyList } from '../api/get-group-study-list';

export const useGroupStudyListQuery = ({
  classification,
}: {
  classification: 'GROUP_STUDY' | 'PREMIUM_STUDY';
}) => {
  return useInfiniteQuery({
    queryKey: ['groupStudies', classification],
    queryFn: async ({ pageParam }) => {
      const response = await getGroupStudyList({
        page: pageParam,
        size: 20,
        status: 'RECRUITING',
        classification,
      });

      return response;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1;
      }

      return null;
    },
    initialPageParam: 1,
  });
};
