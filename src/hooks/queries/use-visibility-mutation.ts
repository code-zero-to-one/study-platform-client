import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleArchiveVisibility } from '@/features/study/one-to-one/archive/api/toggle-visibility';
import { ARCHIVE_QUERY_KEYS } from '@/features/study/one-to-one/archive/model/archive-keys';
import { ArchiveResponse } from '@/types/one-to-one-study/archive';

export const useToggleArchiveVisibilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPrivate }: { id: number; isPrivate: boolean }) =>
      toggleArchiveVisibility(id, isPrivate),
    onMutate: async ({ id, isPrivate }) => {
      await queryClient.cancelQueries({ queryKey: ARCHIVE_QUERY_KEYS.all });

      const previousData = queryClient.getQueriesData<ArchiveResponse>({
        queryKey: ARCHIVE_QUERY_KEYS.all,
      });

      queryClient.setQueriesData<ArchiveResponse>(
        { queryKey: ARCHIVE_QUERY_KEYS.all },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            content: oldData.content.map((item) =>
              item.id === id ? { ...item, isPrivate } : item,
            ),
          };
        },
      );

      return { previousData };
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient
        .invalidateQueries({ queryKey: ARCHIVE_QUERY_KEYS.all })
        .catch(() => {
          // ignore
        });
    },
  });
};
