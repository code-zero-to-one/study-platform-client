'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmDeleteModal from '@/components/common/modals/confirm-delete-modal';
import MoreMenu from '@/components/common/ui/dropdown/more-menu';
import { getCommunityQnaErrorMessage } from '@/features/community/api/community-qna-api';
import {
  buildCommunityListHref,
  buildCommunityQuestionEditHref,
} from '@/features/community/model/community-route';
import { useDeleteCommunityQnaQuestionMutation } from '@/features/community/model/use-community-qna-mutation';
import { useToastStore } from '@/stores/use-toast-store';

interface CommunityQnaQuestionOwnerActionsProps {
  canDelete: boolean;
  canEdit: boolean;
  currentPage?: number;
  questionId: number;
  revision?: number;
}

interface CommunityQnaQuestionOwnerMenuOption {
  label: string;
  onMenuClick: () => void;
  value: string;
}

export default function CommunityQnaQuestionOwnerActions({
  canDelete,
  canEdit,
  currentPage,
  questionId,
  revision,
}: CommunityQnaQuestionOwnerActionsProps) {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteQuestionMutation = useDeleteCommunityQnaQuestionMutation();

  if (!canEdit && !canDelete) {
    return null;
  }

  const handleDelete = async () => {
    try {
      if (!revision) {
        showToast('질문 정보를 다시 불러온 뒤 삭제해 주세요.', 'error');
        return;
      }

      await deleteQuestionMutation.mutateAsync({
        questionId,
        revision,
      });
      setIsDeleteModalOpen(false);
      showToast('질문을 삭제했습니다.');
      router.push(buildCommunityListHref(currentPage));
    } catch (error) {
      showToast(
        getCommunityQnaErrorMessage(error, '질문 삭제에 실패했습니다.'),
        'error',
      );
    }
  };

  const options: CommunityQnaQuestionOwnerMenuOption[] = [];

  if (canEdit) {
    options.push({
      label: '수정',
      value: 'edit',
      onMenuClick: () =>
        router.push(buildCommunityQuestionEditHref(questionId, currentPage)),
    });
  }

  if (canDelete && revision) {
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
        title="이 질문을 삭제할까요?"
        content="삭제된 질문은 목록에서 더 이상 보이지 않습니다."
        confirmText="삭제"
        onConfirm={handleDelete}
      />
    </>
  );
}
