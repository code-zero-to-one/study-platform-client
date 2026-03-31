'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmDeleteModal from '@/components/common/modals/confirm-delete-modal';
import MoreMenu from '@/components/common/ui/dropdown/more-menu';
import { getCommunityErrorMessage } from '@/features/community/api/community-api';
import {
  buildCommunityEditHref,
  buildCommunityListHref,
} from '@/features/community/model/community-route';
import { useDeleteCommunityPostMutation } from '@/features/community/model/use-community-mutation';
import { useCommunityPostDetailQuery } from '@/features/community/model/use-community-query';
import { useToastStore } from '@/stores/use-toast-store';
import type { CommunityPost } from '@/types/community/domain';

interface CommunityPostOwnerActionsProps {
  currentPage?: number;
  post: CommunityPost;
}

interface CommunityPostOwnerMenuOption {
  label: string;
  onMenuClick: () => void;
  value: string;
}

export default function CommunityPostOwnerActions({
  currentPage,
  post,
}: CommunityPostOwnerActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const showToast = useToastStore((state) => state.showToast);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deletePostMutation = useDeleteCommunityPostMutation();
  const postDetailQuery = useCommunityPostDetailQuery(post.id, !post.revision);

  if (!post.canEdit && !post.canDelete) {
    return null;
  }

  const listHref = buildCommunityListHref(currentPage);

  const handleDelete = async () => {
    try {
      const revision = post.revision ?? postDetailQuery.data?.revision;

      if (!revision) {
        return;
      }

      await deletePostMutation.mutateAsync({
        postId: post.id,
        revision,
      });
      setIsDeleteModalOpen(false);
      showToast('글을 삭제했습니다.');

      if (!pathname.startsWith('/community/')) {
        return;
      }

      router.push(listHref);
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '글 삭제에 실패했습니다.'),
        'error',
      );
    }
  };

  const options: CommunityPostOwnerMenuOption[] = [];

  if (post.canEdit) {
    options.push({
      label: '수정',
      value: 'edit',
      onMenuClick: () =>
        router.push(buildCommunityEditHref(post.id, currentPage)),
    });
  }

  if (post.canDelete) {
    options.push({
      label: '삭제',
      value: 'delete',
      onMenuClick: () => setIsDeleteModalOpen(true),
    });
  }

  return (
    <>
      <MoreMenu iconSize={20} options={options} />

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={() => setIsDeleteModalOpen(false)}
        title="이 글을 삭제할까요?"
        content="삭제된 글은 목록에서 더 이상 보이지 않습니다."
        confirmText="삭제"
        onConfirm={handleDelete}
      />
    </>
  );
}
