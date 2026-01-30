import { useCallback } from 'react';
import { useToggleArchiveBookmarkMutation } from '@/features/study/one-to-one/archive/model/use-bookmark-mutation';
import { useToggleArchiveLikeMutation } from '@/features/study/one-to-one/archive/model/use-like-mutation';
import { useRecordArchiveViewMutation } from '@/features/study/one-to-one/archive/model/use-view-mutation';
interface ArchiveViewTarget {
  id: number;
  link: string;
}

export const useArchiveActions = () => {
  const { mutate: toggleBookmark } = useToggleArchiveBookmarkMutation();
  const { mutate: toggleLike } = useToggleArchiveLikeMutation();
  const { mutate: recordView } = useRecordArchiveViewMutation();

  const handleToggleBookmark = useCallback(
    (id: number) => {
      toggleBookmark(id);
    },
    [toggleBookmark],
  );

  const handleToggleLike = useCallback(
    (id: number) => {
      toggleLike(id);
    },
    [toggleLike],
  );

  const openAndRecordView = useCallback(
    (target: ArchiveViewTarget) => {
      window.open(target.link, '_blank');
      recordView(target.id);
    },
    [recordView],
  );

  return {
    toggleBookmark: handleToggleBookmark,
    toggleLike: handleToggleLike,
    openAndRecordView,
  };
};
