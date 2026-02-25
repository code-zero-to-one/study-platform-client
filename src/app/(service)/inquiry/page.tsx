'use client';

import { Eye, LockIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import QuestionModal from '@/components/modals/question-modal';
import InquiryStatusBadge from '@/components/ui/badge/inquiry-status-badge';
import Button from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { CATEGORY_LABEL } from '@/features/study/group/model/question.schema';
import { useGetQuestions } from '@/hooks/queries/question-api';
import { useToastStore } from '@/stores/use-toast-store';
import { formatDateDot } from '@/utils/time';

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
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    if (!groupStudyId) {
      router.replace('/group-study');
    }
  }, [groupStudyId, router]);

  const PAGE_SIZE = 15;

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
                      router.push(
                        `/inquiry/${item.questionId}?groupStudyId=${groupStudyId}&studyType=${studyType}`,
                      );
                    }}
                    onMouseEnter={() => setHoveredId(item.questionId)}
                    onMouseLeave={() => setHoveredId(null)}
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
          onChangePage={setPage}
          className="mt-400"
        />
      )}

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
