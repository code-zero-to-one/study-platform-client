'use client';

import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import ConfirmDeleteModal from '@/components/common/modals/confirm-delete-modal';
import InquiryStatusBadge from '@/components/common/ui/badge/inquiry-status-badge';
import Button from '@/components/common/ui/button';
import MoreMenu from '@/components/common/ui/dropdown/more-menu';
import InquiryListTable from '@/components/home/lists/inquiry-list-table';
import { useAuthReady } from '@/features/auth/model/use-auth';
import {
  useCreateAnswer,
  useDeleteQuestion,
  useGetQuestion,
  useGetQuestions,
} from '@/hooks/queries/group-study/question-queries';
import { useToastStore } from '@/stores/use-toast-store';
import { CATEGORY_LABEL } from '@/types/schemas/question.schema';
import { formatDateTimeDot } from '@/utils/time';

const EditQuestionModal = dynamic(
  () => import('@/components/group-study/modals/edit-question-modal'),
  { ssr: false },
);

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
  { ssr: false },
);

const PAGE_SIZE = 15;

interface InquirySectionProps {
  groupStudyId: number;
  isPremium?: boolean;
  isLeader?: boolean;
  isAdmin?: boolean;
}

export default function InquirySection({
  groupStudyId,
  isPremium = false,
  isLeader = false,
  isAdmin = false,
}: InquirySectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionIdParam = searchParams.get('questionId');
  const parsedQuestionId = Number(questionIdParam);
  const hasValidQuestionId =
    Number.isInteger(parsedQuestionId) && parsedQuestionId > 0;

  const [page, setPage] = useState(1);

  const handleSelectQuestion = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('questionId', String(id));
    router.push(`?${params.toString()}`);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('questionId');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-400 py-600">
      {!hasValidQuestionId ? (
        <ListView
          groupStudyId={groupStudyId}
          isPremium={isPremium}
          page={page}
          onPageChange={setPage}
          onSelectQuestion={handleSelectQuestion}
        />
      ) : (
        <DetailView
          groupStudyId={groupStudyId}
          questionId={parsedQuestionId}
          onBack={handleBack}
          isPremium={isPremium}
          isLeader={isLeader}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

interface ListViewProps {
  groupStudyId: number;
  isPremium: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onSelectQuestion: (id: number) => void;
}

function ListView({
  groupStudyId,
  isPremium,
  page,
  onPageChange,
  onSelectQuestion,
}: ListViewProps) {
  const { isHydrated, isAuthReady, memberId } = useAuthReady();

  const { data, isLoading } = useGetQuestions({
    groupStudyId,
    page,
    pageSize: PAGE_SIZE,
    enabled: isAuthReady && typeof memberId === 'number',
  });

  if (!isHydrated) {
    return null;
  }

  if (!isAuthReady || typeof memberId !== 'number') {
    return (
      <div className="py-800 text-center">
        <p className="font-designer-14r text-text-subtle mb-300">
          로그인 후 문의를 확인할 수 있습니다.
        </p>
        <LoginModal
          openTrigger={
            <button
              type="button"
              className="font-designer-14m text-text-brand underline"
            >
              로그인하기
            </button>
          }
        />
      </div>
    );
  }

  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  return (
    <>
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
      </div>

      {/* 표 */}
      <InquiryListTable
        items={items}
        totalElements={totalElements}
        totalPages={totalPages}
        page={page}
        isLoading={isLoading}
        onPageChange={onPageChange}
        onItemClick={(item) => onSelectQuestion(item.questionId)}
      />
    </>
  );
}

interface DetailViewProps {
  groupStudyId: number;
  questionId: number;
  onBack: () => void;
  isPremium?: boolean;
  isLeader?: boolean;
  isAdmin?: boolean;
}

function DetailView({
  groupStudyId,
  questionId,
  onBack,
  isPremium = false,
  isLeader = false,
  isAdmin = false,
}: DetailViewProps) {
  const { memberId } = useAuthReady();
  const showToast = useToastStore((state) => state.showToast);
  const { data, isLoading } = useGetQuestion({ groupStudyId, questionId });
  const { mutate: deleteQuestion, isPending: isDeletePending } =
    useDeleteQuestion();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isQuestionAuthor = memberId === data?.authorId;

  const handleEditQuestion = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteQuestion = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!isQuestionAuthor) {
      showToast('문의 삭제 권한이 없습니다.', 'error');
      setIsDeleteModalOpen(false);
      return;
    }
    deleteQuestion(
      { groupStudyId, questionId },
      {
        onSuccess: () => {
          showToast('문의가 삭제되었습니다.', 'success');
          setIsDeleteModalOpen(false);
          onBack();
        },
        onError: () => {
          showToast('문의 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
        },
      },
    );
  };

  const moreMenuOptions: {
    label: string;
    value: string;
    onMenuClick: () => void;
  }[] = [];

  if (isQuestionAuthor) {
    moreMenuOptions.push({
      label: '수정하기',
      value: 'edit',
      onMenuClick: handleEditQuestion,
    });
    if (!data?.answer) {
      moreMenuOptions.push({
        label: '삭제하기',
        value: 'delete',
        onMenuClick: handleDeleteQuestion,
      });
    }
  }

  if (isLoading) {
    return (
      <div className="text-text-subtle py-800 text-center">로딩 중...</div>
    );
  }

  return (
    <>
      <div className="mb-400">
        <button
          type="button"
          onClick={onBack}
          className="text-text-subtle hover:text-text-default font-designer-14r flex items-center gap-100 transition-colors"
        >
          <ArrowLeft size={16} />
          목록으로
        </button>
      </div>

      {data && (
        <div className="flex flex-col gap-400">
          {/* 카드 1: 질문 */}
          <div className="border-border-default rounded-200 border bg-white p-500">
            <div className="mb-300 flex items-center justify-between">
              {data.category && (
                <span className="bg-background-accent-gray-subtle text-background-accent-gray-strong font-designer-12m rounded-50 inline-flex w-fit px-100 py-50">
                  {CATEGORY_LABEL[data.category] ?? data.category}
                </span>
              )}
              {moreMenuOptions.length > 0 && (
                <MoreMenu options={moreMenuOptions} iconSize={20} />
              )}
            </div>

            <h1 className="font-designer-24b text-text-default mb-300">
              {data.title}
            </h1>

            <div className="border-border-default mb-400 grid grid-cols-2 gap-x-400 gap-y-200 border-b pb-300">
              <div className="flex items-center gap-200">
                <span className="font-designer-14m text-text-subtle">
                  작성자
                </span>
                <span className="font-designer-14m text-text-default">
                  {data.authorNickname}
                </span>
              </div>
              <div className="flex items-center gap-200">
                <span className="font-designer-14m text-text-subtle">
                  작성일
                </span>
                <span className="font-designer-14m text-text-default">
                  {formatDateTimeDot(data.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-200">
                <span className="font-designer-14m text-text-subtle">
                  조회수
                </span>
                <span className="font-designer-14m text-text-default">
                  {data.viewCount}
                </span>
              </div>
              <div className="flex items-center gap-200">
                <span className="font-designer-14m text-text-subtle">상태</span>
                <InquiryStatusBadge status={data.status} />
              </div>
            </div>

            <p className="font-designer-16r text-text-default whitespace-pre-line">
              {data.content}
            </p>
            {data.questionImage?.resizedImages?.[0]?.resizedImageUrl && (
              <Image
                src={data.questionImage.resizedImages[0].resizedImageUrl}
                alt="문의 이미지"
                width={800}
                height={600}
                className="mt-400 w-full object-contain"
                style={{ height: 'auto' }}
              />
            )}
          </div>

          {/* 카드 2: 답변 */}
          {data.answer ? (
            <div className="border-border-default rounded-200 border bg-white p-500">
              <div className="mb-300 flex items-center justify-between">
                <h1 className="font-designer-24b text-text-default">
                  {isAdmin ? '운영자' : isPremium ? '멘토' : '리더'}의 답변
                </h1>
                <MoreMenu
                  options={[
                    {
                      label: '수정하기',
                      value: 'edit',
                      onMenuClick: () =>
                        showToast('준비 중인 기능입니다.', 'info'),
                    },
                    {
                      label: '삭제하기',
                      value: 'delete',
                      onMenuClick: () =>
                        showToast('준비 중인 기능입니다.', 'info'),
                    },
                  ]}
                  iconSize={20}
                />
              </div>

              <div className="border-border-default mb-400 grid grid-cols-2 gap-x-400 gap-y-200 border-b pb-300">
                <div className="flex items-center gap-200">
                  <span className="font-designer-14m text-text-subtle">
                    작성자
                  </span>
                  <span className="font-designer-14m text-text-default">
                    {data.answererNickname}
                  </span>
                </div>
                <div className="flex items-center gap-200">
                  <span className="font-designer-14m text-text-subtle">
                    작성일
                  </span>
                  <span className="font-designer-14m text-text-default">
                    {formatDateTimeDot(data.answeredAt ?? '')}
                  </span>
                </div>
              </div>

              <p className="font-designer-16r text-text-default whitespace-pre-line">
                {data.answer}
              </p>
            </div>
          ) : (
            <div className="border-border-default rounded-200 border bg-white p-500">
              {isLeader || isAdmin ? (
                <AnswerForm
                  groupStudyId={groupStudyId}
                  questionId={questionId}
                />
              ) : (
                <div className="flex items-center justify-center py-300">
                  <p className="font-designer-14r text-text-subtle">
                    아직 답변이 등록되지 않았습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="문의를 삭제하시겠습니까?"
        content="삭제한 문의는 다시 복구할 수 없습니다."
        confirmText="삭제하기"
        onConfirm={handleDeleteConfirm}
        isPending={isDeletePending}
      />

      {data && (
        <EditQuestionModal
          open={isEditModalOpen && isQuestionAuthor}
          onOpenChange={setIsEditModalOpen}
          groupStudyId={groupStudyId}
          question={data}
        />
      )}
    </>
  );
}

interface AnswerFormProps {
  groupStudyId: number;
  questionId: number;
}

function AnswerForm({ groupStudyId, questionId }: AnswerFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const { mutate: createAnswer, isPending } = useCreateAnswer();

  const showToast = useToastStore((state) => state.showToast);

  const handleSubmit = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      showToast('답변 내용을 입력해주세요.', 'info');

      return;
    }

    if (!content.trim()) return;
    createAnswer(
      { groupStudyId, questionId, content },
      {
        onError: () => {
          showToast('답변 등록에 실패했습니다. 다시 시도해주세요.', 'error');
        },
      },
    );
  };

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center gap-300 py-300">
        <p className="font-designer-14r text-text-subtle">
          아직 답변이 등록되지 않았습니다.
        </p>
        <Button onClick={() => setIsOpen(true)}>답변하기</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-300">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="답변을 입력해주세요."
        className="font-designer-14r border-border-default rounded-100 min-h-[120px] w-full resize-none border p-200 focus:outline-none"
      />
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isPending || !content.trim()}>
          답변하기
        </Button>
      </div>
    </div>
  );
}
