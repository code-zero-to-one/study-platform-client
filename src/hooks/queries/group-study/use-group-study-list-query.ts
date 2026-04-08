import { useInfiniteQuery } from '@tanstack/react-query';
import { getGroupStudyList } from '@/api/endpoints/group-study/get-group-study-list';

export const useGroupStudyListQuery = () => {
  return useInfiniteQuery({
    queryKey: ['groupStudies'],
    queryFn: async ({ pageParam }) => {
      const response = await getGroupStudyList({
        page: pageParam,
        size: 20,
        status: 'RECRUITING',
        classification: 'GROUP_STUDY',
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
