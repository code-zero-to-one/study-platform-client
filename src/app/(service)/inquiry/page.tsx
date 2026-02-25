'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import InquiryListTable from '@/components/lists/inquiry-list-table';
import QuestionModal from '@/components/modals/question-modal';
import Button from '@/components/ui/button';
import { useGetQuestions } from '@/hooks/queries/question-api';

const PAGE_SIZE = 15;

export default function InquiryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupStudyIdStr = searchParams.get('groupStudyId');
  const groupStudyId = groupStudyIdStr ? Number(groupStudyIdStr) : null;
  const studyType = (searchParams.get('studyType') ?? 'group') as
    | 'group'
    | 'premium';
  const isPremium = studyType === 'premium';

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!groupStudyId) {
      router.replace('/group-study');
    }
  }, [groupStudyId, router]);

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
      <QuestionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        studyId={groupStudyId}
        studyType={studyType}
      />
    </div>
  );
}
