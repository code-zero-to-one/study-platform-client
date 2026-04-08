'use client';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@/components/common/ui/button';
import InquiryListTable from '@/components/lists/inquiry-list-table';
import { useAuthReady } from '@/features/auth/model/use-auth';
import {
  useGetQuestion,
  useGetQuestions,
} from '@/hooks/queries/group-study/question-api';
import { useToastStore } from '@/stores/use-toast-store';

const PAGE_SIZE = 15;

const CreateQuestionModal = dynamic(
  () => import('@/components/common/modals/create-question-modal'),
  { ssr: false },
);

const EditQuestionModal = dynamic(
  () => import('@/components/common/modals/edit-question-modal'),
  { ssr: false },
);

export default function InquiryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);
  const { isHydrated, memberId } = useAuthReady();
  const groupStudyIdStr = searchParams.get('groupStudyId');
  const groupStudyId = groupStudyIdStr ? Number(groupStudyIdStr) : null;
  const studyType = (searchParams.get('studyType') ?? 'group') as
    | 'group'
    | 'premium';
  const editQuestionIdStr = searchParams.get('editQuestionId');
  const editQuestionId = editQuestionIdStr ? Number(editQuestionIdStr) : null;
  const isPremium = studyType === 'premium';
  const hasValidEditQuestionId =
    Number.isInteger(editQuestionId) && (editQuestionId ?? 0) > 0;

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const blockedEditQuestionIdRef = useRef<number | null>(null);

  const closeEditModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('editQuestionId');

    const queryString = params.toString();
    router.replace(queryString ? `/inquiry?${queryString}` : '/inquiry');
  }, [router, searchParams]);

  useEffect(() => {
    if (!groupStudyId) {
      router.replace('/group-study');
    }
  }, [groupStudyId, router]);

  const {
    data: editQuestion,
    isLoading: isEditQuestionLoading,
    isError: isEditQuestionError,
  } = useGetQuestion({
    groupStudyId: groupStudyId ?? 0,
    questionId: editQuestionId ?? 0,
    enabled: !!groupStudyId && hasValidEditQuestionId,
  });

  useEffect(() => {
    if (!hasValidEditQuestionId || !isEditQuestionError) {
      return;
    }

    showToast('수정할 문의 정보를 불러오지 못했습니다.', 'error');
    closeEditModal();
  }, [closeEditModal, hasValidEditQuestionId, isEditQuestionError, showToast]);

  const canEditQuestion =
    typeof memberId === 'number' && editQuestion?.authorId === memberId;

  useEffect(() => {
    if (!hasValidEditQuestionId || !editQuestion || !isHydrated) {
      blockedEditQuestionIdRef.current = null;

      return;
    }

    if (canEditQuestion) {
      blockedEditQuestionIdRef.current = null;

      return;
    }

    if (blockedEditQuestionIdRef.current === editQuestion.questionId) {
      return;
    }

    blockedEditQuestionIdRef.current = editQuestion.questionId;
    showToast('본인이 작성한 문의만 수정할 수 있습니다.', 'error');
    closeEditModal();
  }, [
    canEditQuestion,
    closeEditModal,
    editQuestion,
    hasValidEditQuestionId,
    isHydrated,
    showToast,
  ]);

  const handleItemClick = (questionId: number) => {
    router.push(
      `/inquiry/${questionId}?groupStudyId=${groupStudyId}&studyType=${studyType}`,
    );
  };

  const { data, isLoading } = useGetQuestions({
    groupStudyId: groupStudyId ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });

  if (!groupStudyId) return null;

  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-400 py-600">
      {/* 헤더 */}
      <div className="mb-400 flex items-start justify-between">
        <div className="flex flex-col gap-75">
          <h1 className="font-designer-24b text-text-strong">
            문의 게시판{' '}
            <span className="font-designer-20b text-text-subtle">
              {totalElements}개
            </span>
          </h1>
          <p className="font-designer-14r text-text-subtle">
            스터디 관련 문의사항을 남겨주세요
          </p>
          <p className="font-designer-14r text-text-subtle">
            비공개 문의는 작성자, {isPremium ? '멘토' : '리더'}, 관리자만 확인할
            수 있어요.
          </p>
        </div>
        <Button color="primary" onClick={() => setIsModalOpen(true)}>
          문의하기
        </Button>
      </div>

      {/* 표 */}
      <InquiryListTable
        items={items}
        totalElements={totalElements}
        totalPages={totalPages}
        page={page}
        isLoading={isLoading}
        onPageChange={setPage}
        onItemClick={(item) => handleItemClick(item.questionId)}
      />

      {/* 문의하기 모달 */}
      <CreateQuestionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        groupStudyId={groupStudyId}
        studyType={studyType}
      />

      {editQuestion && (
        <EditQuestionModal
          open={hasValidEditQuestionId && canEditQuestion}
          onOpenChange={(open) => {
            if (!open) {
              closeEditModal();
            }
          }}
          groupStudyId={groupStudyId}
          question={editQuestion}
          onSuccess={closeEditModal}
        />
      )}

      {hasValidEditQuestionId && isEditQuestionLoading && (
        <p className="font-designer-14r text-text-subtle mt-300 text-right">
          수정할 문의를 불러오는 중입니다.
        </p>
      )}
    </div>
  );
}
