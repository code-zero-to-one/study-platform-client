import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleArchiveBookmark } from '@/features/study/one-to-one/archive/api/toggle-bookmark';
import { ArchiveResponse } from '@/types/archive';
import { ARCHIVE_QUERY_KEY } from './use-archive-query';

export const useToggleArchiveBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleArchiveBookmark,
    onMutate: async (id) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ARCHIVE_QUERY_KEY.all });

      // 이전 데이터 스냅샷
      const previousData = queryClient.getQueriesData<ArchiveResponse>({
        queryKey: ARCHIVE_QUERY_KEY.all,
      });

      // 낙관적 업데이트
      queryClient.setQueriesData<ArchiveResponse>(
        { queryKey: ARCHIVE_QUERY_KEY.all },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            content: oldData.content.map((item) =>
              item.id === id
                ? { ...item, isBookmarked: !item.isBookmarked }
                : item,
            ),
          };
        },
      );

      return { previousData };
    },
    onError: (err, id, context) => {
      // 에러 시 롤백
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // 완료 후 리프레시
      queryClient
        .invalidateQueries({ queryKey: ARCHIVE_QUERY_KEY.all })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
    },
  });
};
