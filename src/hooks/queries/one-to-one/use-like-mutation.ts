import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleArchiveLike } from '@/api/endpoints/archive/toggle-like';
import { ARCHIVE_QUERY_KEYS } from '@/hooks/queries/one-to-one/archive-keys';
import { ArchiveResponse } from '@/types/one-to-one-study/archive';

export const useToggleArchiveLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleArchiveLike,
    onMutate: async (id) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ARCHIVE_QUERY_KEYS.all });

      // 이전 데이터 스냅샷
      const previousData = queryClient.getQueriesData<ArchiveResponse>({
        queryKey: ARCHIVE_QUERY_KEYS.all,
      });

      // 낙관적 업데이트
      queryClient.setQueriesData<ArchiveResponse>(
        { queryKey: ARCHIVE_QUERY_KEYS.all },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            content: oldData.content.map((item) =>
              item.id === id
                ? {
                    ...item,
                    isLiked: !item.isLiked,
                    likes: item.isLiked ? item.likes - 1 : item.likes + 1,
                  }
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
        .invalidateQueries({ queryKey: ARCHIVE_QUERY_KEYS.all })
        .catch(() => {
          // 쿼리 무효화 실패 시 무시
        });
    },
  });
};
