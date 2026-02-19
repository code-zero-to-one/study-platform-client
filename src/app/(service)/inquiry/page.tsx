'use client';

import { LockIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import QuestionModal from '@/components/modals/question-modal';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { useGetQuestions } from '@/hooks/queries/question-api';
import { useToastStore } from '@/stores/use-toast-store';

const CATEGORY_LABEL: Record<string, string> = {
  PAYMENT: '결제',
  STUDY_COMMON: '스터디 일반',
  LEADER: '리더',
  BUG: '버그',
  CONCERN: '고민',
};

function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

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
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    if (!groupStudyId) {
      router.replace('/group-study');
    }
  }, [groupStudyId, router]);

  const { data, isLoading } = useGetQuestions({
    groupStudyId: groupStudyId ?? 0,
    page,
    pageSize: 15,
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
          <thead className="bg-background-neutral-subtle font-designer-13r text-text-subtle px-100 py-200 text-center align-middle leading-250">
            <tr className="border-border-default border-b">
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-center">
                번호
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-center">
                분류
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-left">
                제목
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-center">
                작성자
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-center">
                작성일시
              </th>
              <th className="font-designer-14b text-text-subtle px-400 py-300 text-center">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-text-subtle py-800 text-center">
                  로딩 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-text-subtle py-800 text-center">
                  등록된 문의가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.questionId}
                  className="border-border-default hover:bg-fill-neutral-subtle cursor-pointer border-b last:border-b-0"
                  onClick={() => {
                    if (!item.accessible) {
                      showToast('작성자만 확인할 수 있는 문의입니다.', 'error');

                      return;
                    }
                    router.push(
                      `/inquiry/${item.questionId}?groupStudyId=${groupStudyId}&studyType=${studyType}`,
                    );
                  }}
                >
                  <td className="font-designer-14r text-text-default px-400 py-300 text-center">
                    {item.questionId}
                  </td>
                  <td className="font-designer-14r text-text-default px-400 py-300 text-center">
                    {item.category
                      ? (CATEGORY_LABEL[item.category] ?? item.category)
                      : '-'}
                  </td>
                  <td className="font-designer-14r text-text-default px-400 py-300">
                    {item.accessible ? (
                      item.title
                    ) : (
                      <span className="text-text-subtle flex items-center gap-100">
                        <LockIcon size={14} />
                        비공개 문의입니다
                      </span>
                    )}
                  </td>
                  <td className="font-designer-14r text-text-default px-400 py-300 text-center">
                    {item.accessible ? item.authorNickname : '***'}
                  </td>
                  <td className="font-designer-14r text-text-default px-400 py-300 text-center">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-400 py-300 text-center">
                    {item.status === 'ANSWER_COMPLETED' ? (
                      <Badge color="blue" size="small">
                        답변 완료
                      </Badge>
                    ) : (
                      <Badge color="gray" size="small">
                        접수
                      </Badge>
                    )}
                  </td>
                </tr>
              ))
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
