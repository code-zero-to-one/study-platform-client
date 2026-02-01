import { useCallback } from 'react';
import { useToggleArchiveBookmarkMutation } from '@/features/study/one-to-one/archive/model/use-bookmark-mutation';
import { useToggleArchiveLikeMutation } from '@/features/study/one-to-one/archive/model/use-like-mutation';
import { useRecordArchiveViewMutation } from '@/features/study/one-to-one/archive/model/use-view-mutation';
import { useAuth } from '@/hooks/common/use-auth';
interface ArchiveViewTarget {
  id: number;
  link: string;
}

export const useArchiveActions = () => {
  const { isAuthenticated } = useAuth();
  const { mutate: toggleBookmark } = useToggleArchiveBookmarkMutation();
  const { mutate: toggleLike } = useToggleArchiveLikeMutation();
  const { mutate: recordView } = useRecordArchiveViewMutation();

  const handleToggleBookmark = useCallback(
    (id: number) => {
      if (!isAuthenticated) return;
      toggleBookmark(id);
    },
    [isAuthenticated, toggleBookmark],
  );

  const handleToggleLike = useCallback(
    (id: number) => {
      if (!isAuthenticated) return;
      toggleLike(id);
    },
    [isAuthenticated, toggleLike],
  );

  const openAndRecordView = useCallback(
    (target: ArchiveViewTarget) => {
      window.open(target.link, '_blank');
      if (!isAuthenticated) return;
      recordView(target.id);
    },
    [isAuthenticated, recordView],
  );

  return {
    toggleBookmark: handleToggleBookmark,
    toggleLike: handleToggleLike,
    openAndRecordView,
    isAuthenticated,
  };
};
