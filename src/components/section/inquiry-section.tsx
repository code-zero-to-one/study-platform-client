'use client';

import { ArrowLeft, Eye, LockIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import QuestionModal from '@/components/modals/question-modal';
import InquiryStatusBadge from '@/components/ui/badge/inquiry-status-badge';
import Button from '@/components/ui/button';
import MoreMenu from '@/components/ui/dropdown/more-menu';
import Pagination from '@/components/ui/pagination';
import { CATEGORY_LABEL } from '@/features/study/group/model/question.schema';
import {
  useGetQuestion,
  useGetQuestions,
} from '@/hooks/queries/question-api';
import { useToastStore } from '@/stores/use-toast-store';
import { formatDateDot, formatDateTimeDot } from '@/utils/time';

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
  const showToast = useToastStore((state) => state.showToast);
  const [selectedQuestionId, setSelectedQuestionId] = useState<
    number | undefined
  >(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hoveredId, setHoveredId] = useState<number | undefined>(undefined);

  return (
    <div className="mx-auto w-full max-w-7xl px-400 py-600">
      {selectedQuestionId === undefined ? (
        <ListView
          groupStudyId={groupStudyId}
          isPremium={isPremium}
          page={page}
          hoveredId={hoveredId}
          onPageChange={setPage}
          onSelectQuestion={setSelectedQuestionId}
          onHoverChange={setHoveredId}
          onOpenModal={() => setIsModalOpen(true)}
          showToast={showToast}
        />
      ) : (
        <DetailView
          groupStudyId={groupStudyId}
          questionId={selectedQuestionId}
          onBack={() => setSelectedQuestionId(undefined)}
          showToast={showToast}
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
  hoveredId: number | undefined;
  onPageChange: (page: number) => void;
  onSelectQuestion: (id: number) => void;
  onHoverChange: (id: number | undefined) => void;
  onOpenModal: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

function ListView({
  groupStudyId,
  isPremium,
  page,
  hoveredId,
  onPageChange,
  onSelectQuestion,
  onHoverChange,
  onOpenModal,
  showToast,
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
        <Button color="primary" onClick={onOpenModal}>
          문의하기
        </Button>
      </div>

      {/* 표 */}
      <div className="border-border-default rounded-100 overflow-hidden border">
        <table className="w-full">
          <thead className="bg-background-neutral-subtle font-designer-13r text-text-subtle px-100 py-200 text-left align-middle leading-250">
            <tr className="border-border-default border-b">
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                번호
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                분류
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                제목
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                작성자
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                작성일시
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                조회수
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-text-subtle py-800 text-center">
                  로딩 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-text-subtle py-800 text-center">
                  등록된 문의가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const displayNumber =
                  totalElements - (page - 1) * PAGE_SIZE - index;
                const isHovered = hoveredId === item.questionId;

                return (
                  <tr
                    key={item.questionId}
                    className={`border-border-default hover:bg-fill-neutral-subtle cursor-pointer border-b last:border-b-0 ${!item.accessible ? 'opacity-60' : ''}`}
                    onClick={() => {
                      if (!item.accessible) {
                        showToast(
                          '작성자만 확인할 수 있는 문의입니다.',
                          'error',
                        );

                        return;
                      }
                      onSelectQuestion(item.questionId);
                    }}
                    onMouseEnter={() => onHoverChange(item.questionId)}
                    onMouseLeave={() => onHoverChange(undefined)}
                  >
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      {displayNumber}
                    </td>
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      {item.category
                        ? (CATEGORY_LABEL[item.category] ?? item.category)
                        : '-'}
                    </td>
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      {item.accessible ? (
                        <span
                          className={
                            isHovered ? 'text-text-brand underline' : ''
                          }
                        >
                          {item.title}
                        </span>
                      ) : (
                        <span className="text-text-subtle flex items-center gap-100">
                          <LockIcon size={14} />
                          비공개 문의입니다
                        </span>
                      )}
                    </td>
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      {item.accessible ? item.authorNickname : '***'}
                    </td>
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      {formatDateDot(item.createdAt)}
                    </td>
                    <td className="font-designer-14r text-text-default px-400 py-300">
                      <span className="flex items-center gap-100">
                        <Eye size={14} className="text-text-subtle" />
                        {item.viewCount}
                      </span>
                    </td>
                    <td className="px-400 py-300">
                      <InquiryStatusBadge
                        status={item.status}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChangePage={onPageChange}
          className="mt-400"
        />
      )}
    </>
  );
}

interface DetailViewProps {
  groupStudyId: number;
  questionId: number;
  onBack: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  isPremium?: boolean;
  isLeader?: boolean;
  isAdmin?: boolean;
}

function DetailView({
  groupStudyId,
  questionId,
  onBack,
  showToast,
  isPremium = false,
  isLeader = false,
  isAdmin = false,
}: DetailViewProps) {
  const { data, isLoading } = useGetQuestion({ groupStudyId, questionId });

  const moreMenuOptions = [
    {
      label: '수정하기',
      value: 'edit',
      onMenuClick: () => showToast('준비 중인 기능입니다.', 'error'),
    },
    {
      label: '삭제하기',
      value: 'delete',
      onMenuClick: () => showToast('준비 중인 기능입니다.', 'error'),
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
                <InquiryStatusBadge
                  status={data.status}
                />
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
                        showToast('준비 중인 기능입니다.', 'error'),
                    },
                    {
                      label: '삭제하기',
                      value: 'delete',
                      onMenuClick: () =>
                        showToast('준비 중인 기능입니다.', 'error'),
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
