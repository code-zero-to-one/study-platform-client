import { useCallback } from 'react';
import { useRecordArchiveView } from '@/features/archive/model/use-view-mutation';
import { useToggleArchiveBookmark } from '@/features/archive/model/use-bookmark-mutation';
import { useToggleArchiveLike } from '@/features/archive/model/use-like-mutation';
type ArchiveViewTarget = {
  id: number;
  link: string;
};

export const useArchiveActions = () => {
  const { mutate: toggleBookmark } = useToggleArchiveBookmark();
  const { mutate: toggleLike } = useToggleArchiveLike();
  const { mutate: recordView } = useRecordArchiveView();

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
