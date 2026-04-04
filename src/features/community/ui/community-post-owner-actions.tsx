'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmDeleteModal from '@/components/common/modals/confirm-delete-modal';
import MoreMenu from '@/components/common/ui/dropdown/more-menu';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { removeCommunityPostInteraction } from '@/features/community/model/community-detail-storage';
import { isCommunityPostOwnedByMember } from '@/features/community/model/community-post-ownership';
import { deleteCommunityLocalPost } from '@/features/community/model/community-post-storage';
import {
  buildCommunityEditHref,
  buildCommunityListHref,
} from '@/features/community/model/community-route';
import type { CommunityPost } from '@/types/community/domain';

interface CommunityPostOwnerActionsProps {
  currentPage?: number;
  post: CommunityPost;
}

export default function CommunityPostOwnerActions({
  currentPage,
  post,
}: CommunityPostOwnerActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthReady, memberId } = useAuthReady();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!isAuthReady || !isCommunityPostOwnedByMember(post, memberId)) {
    return null;
  }

  const listHref = buildCommunityListHref(currentPage);

  const handleDelete = () => {
    deleteCommunityLocalPost(post.id);
    removeCommunityPostInteraction(post.id);
    setIsDeleteModalOpen(false);

    if (pathname.startsWith('/community/')) {
      router.push(listHref);

      return;
    }

    router.replace(listHref, { scroll: false });
  };

  return (
    <>
      <MoreMenu
        iconSize={20}
        options={[
          {
            label: '수정',
            value: 'edit',
            onMenuClick: () =>
              router.push(buildCommunityEditHref(post.id, currentPage)),
          },
          {
            label: '삭제',
            value: 'delete',
            onMenuClick: () => setIsDeleteModalOpen(true),
          },
        ]}
      />

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={() => setIsDeleteModalOpen(false)}
        title="이 글을 삭제할까요?"
        content="글과 관련된 로컬 반응 데이터가 함께 삭제됩니다."
        confirmText="삭제"
        onConfirm={handleDelete}
      />
    </>
  );
}
