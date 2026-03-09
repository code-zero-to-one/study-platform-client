'use client';

import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import InquiryStatusBadge from '@/components/common/ui/badge/inquiry-status-badge';
import MoreMenu from '@/components/common/ui/dropdown/more-menu';
import InquiryListTable from '@/components/lists/inquiry-list-table';
import { useGetQuestion, useGetQuestions } from '@/hooks/queries/question-api';
import { useToastStore } from '@/stores/use-toast-store';
import { CATEGORY_LABEL } from '@/types/schemas/question.schema';
import { formatDateTimeDot } from '@/utils/time';

const QuestionModal = dynamic(
  () => import('@/components/common/modals/question-modal'),
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
  const [selectedQuestionId, setSelectedQuestionId] = useState<
    number | undefined
  >(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  return (
    <div className="mx-auto w-full max-w-7xl px-400 py-600">
      {selectedQuestionId === undefined ? (
        <ListView
          groupStudyId={groupStudyId}
          isPremium={isPremium}
          page={page}
          onPageChange={setPage}
          onSelectQuestion={setSelectedQuestionId}
        />
      ) : (
        <DetailView
          groupStudyId={groupStudyId}
          questionId={selectedQuestionId}
          onBack={() => setSelectedQuestionId(undefined)}
          isPremium={isPremium}
          isLeader={isLeader}
          isAdmin={isAdmin}
        />
      )}

      <QuestionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        studyId={groupStudyId}
        studyType={isPremium ? 'premium' : 'group'}
        onAfterSubmit={() => setIsModalOpen(false)}
      />
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
  const { data, isLoading } = useGetQuestions({
    groupStudyId,
    page,
    pageSize: PAGE_SIZE,
  });

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
  const showToast = useToastStore((state) => state.showToast);
  const { data, isLoading } = useGetQuestion({ groupStudyId, questionId });

  const moreMenuOptions = [
    {
      label: '수정하기',
      value: 'edit',
      onMenuClick: () => showToast('준비 중인 기능입니다.', 'info'),
    },
    {
      label: '삭제하기',
      value: 'delete',
      onMenuClick: () => showToast('준비 중인 기능입니다.', 'info'),
    },
  ];

  if (isLoading) {
    return (
      <div className="text-text-subtle py-800 text-center">로딩 중...</div>
    );
  }

  return (
    <>
      <div className="mb-400">
        <button
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
              <MoreMenu options={moreMenuOptions} iconSize={20} />
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
            <div className="border-border-default rounded-200 flex items-center justify-center border bg-white py-500">
              <p className="font-designer-14r text-text-subtle">
                아직 답변이 등록되지 않았습니다.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
