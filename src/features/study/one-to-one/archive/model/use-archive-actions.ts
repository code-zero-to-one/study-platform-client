import { useCallback } from 'react';
import type { UpdateArchiveRequest } from '@/features/study/one-to-one/archive/api/update-archive';
import { useToggleArchiveBookmarkMutation } from '@/features/study/one-to-one/archive/model/use-bookmark-mutation';
import { useToggleArchiveLikeMutation } from '@/features/study/one-to-one/archive/model/use-like-mutation';
import { useUpdateArchiveMutation } from '@/features/study/one-to-one/archive/model/use-update-archive-mutation';
import { useRecordArchiveViewMutation } from '@/features/study/one-to-one/archive/model/use-view-mutation';
import { useToggleArchiveVisibilityMutation } from '@/features/study/one-to-one/archive/model/use-visibility-mutation';
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
  const { mutate: toggleVisibility } = useToggleArchiveVisibilityMutation();
  const { mutate: updateArchive } = useUpdateArchiveMutation();

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

  const handleToggleVisibility = useCallback(
    (id: number, isPrivate: boolean) => {
      if (!isAuthenticated) return;
      toggleVisibility({ id, isPrivate });
    },
    [isAuthenticated, toggleVisibility],
  );

  const handleUpdateArchive = useCallback(
    (id: number, request: UpdateArchiveRequest) => {
      if (!isAuthenticated) return;
      updateArchive({ id, request });
    },
    [isAuthenticated, updateArchive],
  );

  return {
    toggleBookmark: handleToggleBookmark,
    toggleLike: handleToggleLike,
    toggleVisibility: handleToggleVisibility,
    updateArchive: handleUpdateArchive,
    openAndRecordView,
    isAuthenticated,
  };
};
