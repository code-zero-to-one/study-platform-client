import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordArchiveView } from '@/features/archive/api/record-view';
import { ARCHIVE_QUERY_KEY } from './use-archive-query';
import { ArchiveResponse } from '@/types/archive';

export const useRecordArchiveView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordArchiveView,
    onMutate: async (id) => {
      // 낙관적 업데이트: 조회수 즉시 +1
      queryClient.setQueriesData<ArchiveResponse>(
        { queryKey: ARCHIVE_QUERY_KEY.all },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            content: oldData.content.map((item) =>
              item.id === id 
                ? { ...item, views: item.views + 1 } 
                : item
            ),
          };
        }
      );
    },
    // 에러 발생해도 무시 (Fire-and-forget)
    onError: () => {
      // 조용히 실패 처리
    },
  });
};
