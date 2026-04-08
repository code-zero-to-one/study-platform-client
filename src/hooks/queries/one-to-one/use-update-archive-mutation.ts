import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateArchive,
  type UpdateArchiveRequest,
} from '@/api/endpoints/archive/update-archive';
import { ARCHIVE_QUERY_KEYS } from '@/hooks/queries/one-to-one/archive-keys';
import { ArchiveResponse } from '@/types/one-to-one-study/archive';

export const useUpdateArchiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: UpdateArchiveRequest;
    }) => updateArchive(id, request),
    onMutate: async ({ id, request }) => {
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
              item.id === id ? { ...item, ...request } : item,
            ),
          };
        },
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
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
