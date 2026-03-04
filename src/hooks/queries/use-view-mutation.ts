import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordArchiveView } from '@/api/endpoints/archive/record-view';
import { ARCHIVE_QUERY_KEYS } from '@/hooks/queries/archive-keys';
import { ArchiveResponse } from '@/types/one-to-one-study/archive';

const VIEWED_ARCHIVES_KEY = 'viewed_archives';

// localStorage에서 조회한 아카이브 목록 가져오기
const getViewedArchives = (): Record<number, number> => {
  try {
    const stored = localStorage.getItem(VIEWED_ARCHIVES_KEY);

    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// localStorage에 조회 기록 저장
const setViewedArchive = (id: number) => {
  try {
    const viewed = getViewedArchives();
    viewed[id] = Date.now();
    localStorage.setItem(VIEWED_ARCHIVES_KEY, JSON.stringify(viewed));
  } catch (error) {
    console.error('Failed to save view record:', error);
  }
};

// 이미 조회했는지 확인
const hasViewed = (id: number): boolean => {
  const viewed = getViewedArchives();

  return !!viewed[id];
};

export const useRecordArchiveViewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // 이미 조회한 아카이브인지 확인
      if (hasViewed(id)) {
        console.log(`Archive ${id} already viewed, skipping API call`);

        return; // API 호출하지 않음
      }

      // API 호출
      await recordArchiveView(id);

      // localStorage에 기록
      setViewedArchive(id);
    },
    onMutate: async (id) => {
      // 이미 조회한 경우 낙관적 업데이트도 스킵
      if (hasViewed(id)) {
        return;
      }

      // 낙관적 업데이트: 조회수 즉시 +1
      queryClient.setQueriesData<ArchiveResponse>(
        { queryKey: ARCHIVE_QUERY_KEYS.all },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            content: oldData.content.map((item) =>
              item.id === id ? { ...item, views: item.views + 1 } : item,
            ),
          };
        },
      );
    },
    // 에러 발생해도 무시 (Fire-and-forget)
    onError: () => {
      // 조용히 실패 처리
    },
  });
};
