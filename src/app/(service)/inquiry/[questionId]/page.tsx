'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useGetQuestion } from '@/hooks/queries/question-api';

const CATEGORY_LABEL: Record<string, string> = {
  PAYMENT: '결제',
  STUDY_COMMON: '스터디 일반',
  LEADER: '리더',
  BUG: '버그',
  CONCERN: '고민',
};

function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hour}:${minute}`;
}

export default function InquiryDetailPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId: questionIdStr } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupStudyIdStr = searchParams.get('groupStudyId');
  const groupStudyId = groupStudyIdStr ? Number(groupStudyIdStr) : 0;
  const studyType = searchParams.get('studyType') ?? 'group';
  const questionId = Number(questionIdStr);

  const { data, isLoading } = useGetQuestion({ groupStudyId, questionId });

  const handleBack = () => {
    router.push(`/inquiry?groupStudyId=${groupStudyId}&studyType=${studyType}`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-400 py-600">
        <div className="text-text-subtle py-800 text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-400 py-600">
      <div className="mb-400">
        <Button color="secondary" onClick={handleBack}>
          목록으로
        </Button>
      </div>

      {data && (
        <div className="border-border-default rounded-100 border">
          {/* 문의 헤더 */}
          <div className="px-600 py-400">
            {data.category && (
              <Badge
                color="gray"
                shape="rectangle"
                size="small"
                className="mb-200 p-150 font-bold"
              >
                {CATEGORY_LABEL[data.category] ?? data.category}
              </Badge>
            )}

            <h1 className="font-designer-20b text-text-strong mb-300">
              {data.title}
            </h1>

            <div className="font-designer-13r text-text-subtle grid grid-cols-2 gap-y-100">
              <div className="flex gap-200">
                <span className="text-text-subtle w-[60px]">작성자</span>
                <span className="text-text-default">{data.authorNickname}</span>
              </div>
              <div className="flex gap-200">
                <span className="text-text-subtle w-500">작성일</span>
                <span className="text-text-default">
                  {formatDateTime(data.createdAt)}
                </span>
              </div>
              <div className="flex gap-200">
                <span className="text-text-subtle w-[60px]">문의 상태</span>
                {data.status === 'ANSWER_COMPLETED' ? (
                  <Badge color="blue" size="small">
                    답변 완료
                  </Badge>
                ) : (
                  <Badge color="gray" size="small">
                    접수
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="px-600">
            <hr className="border-border-default" />
          </div>

          {/* 문의 내용 */}
          <div className="px-600 py-400">
            <p className="font-designer-16r text-text-default whitespace-pre-wrap">
              {data.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
