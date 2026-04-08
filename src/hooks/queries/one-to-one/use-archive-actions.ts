import { useCallback } from 'react';
import type { UpdateArchiveRequest } from '@/api/endpoints/archive/update-archive';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useToggleArchiveBookmarkMutation } from '@/hooks/queries/one-to-one/use-bookmark-mutation';
import { useToggleArchiveLikeMutation } from '@/hooks/queries/one-to-one/use-like-mutation';
import { useUpdateArchiveMutation } from '@/hooks/queries/one-to-one/use-update-archive-mutation';
import { useRecordArchiveViewMutation } from '@/hooks/queries/one-to-one/use-view-mutation';
import { useToggleArchiveVisibilityMutation } from '@/hooks/queries/one-to-one/use-visibility-mutation';
interface ArchiveViewTarget {
  id: number;
  link: string;
}

export const useArchiveActions = () => {
  const { isAuthReady } = useAuthReady();
  const { mutate: toggleBookmark } = useToggleArchiveBookmarkMutation();
  const { mutate: toggleLike } = useToggleArchiveLikeMutation();
  const { mutate: recordView } = useRecordArchiveViewMutation();
  const { mutate: toggleVisibility } = useToggleArchiveVisibilityMutation();
  const { mutate: updateArchive } = useUpdateArchiveMutation();

  const handleToggleBookmark = useCallback(
    (id: number) => {
      if (!isAuthReady) return;
      toggleBookmark(id);
    },
    [isAuthReady, toggleBookmark],
  );

  const handleToggleLike = useCallback(
    (id: number) => {
      if (!isAuthReady) return;
      toggleLike(id);
    },
    [isAuthReady, toggleLike],
  );

  const openAndRecordView = useCallback(
    (target: ArchiveViewTarget) => {
      window.open(target.link, '_blank');
      if (!isAuthReady) return;
      recordView(target.id);
    },
    [isAuthReady, recordView],
  );

  const handleToggleVisibility = useCallback(
    (id: number, isPrivate: boolean) => {
      if (!isAuthReady) return;
      toggleVisibility({ id, isPrivate });
    },
    [isAuthReady, toggleVisibility],
  );

  const handleUpdateArchive = useCallback(
    (id: number, request: UpdateArchiveRequest) => {
      if (!isAuthReady) return;
      updateArchive({ id, request });
    },
    [isAuthReady, updateArchive],
  );

  return {
    toggleBookmark: handleToggleBookmark,
    toggleLike: handleToggleLike,
    toggleVisibility: handleToggleVisibility,
    updateArchive: handleUpdateArchive,
    openAndRecordView,
    isAuthenticated: isAuthReady,
  };
};
