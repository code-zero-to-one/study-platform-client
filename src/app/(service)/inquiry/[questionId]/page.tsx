'use client';

import { ArrowLeft, Eye } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import InquiryStatusBadge from '@/components/common/ui/badge/inquiry-status-badge';
import MoreMenu from '@/components/common/ui/dropdown/more-menu';
import { useGetQuestion } from '@/hooks/queries/question-api';
import { useToastStore } from '@/stores/use-toast-store';
import { CATEGORY_LABEL } from '@/types/schemas/question.schema';
import { formatDateTimeDot } from '@/utils/time';

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
  const showToast = useToastStore((state) => state.showToast);

  const { data, isLoading, isError } = useGetQuestion({
    groupStudyId,
    questionId,
  });

  const handleBack = () => {
    router.push(`/inquiry?groupStudyId=${groupStudyId}&studyType=${studyType}`);
  };

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

  if (!groupStudyId) {
    return (
      <div className="mx-auto w-full max-w-7xl px-400 py-600">
        <div className="text-text-subtle py-800 text-center">
          잘못된 접근입니다. 스터디 문의 목록에서 다시 접근해주세요.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-400 py-600">
        <div className="text-text-subtle py-800 text-center">로딩 중...</div>
      </div>
    );
  }

  if (isError || (!isLoading && !data)) {
    return (
      <div className="mx-auto w-full max-w-7xl px-400 py-600">
        <div className="text-text-subtle py-800 text-center">
          문의를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-400 py-600">
      <div className="mb-400">
        <button
          type="button"
          onClick={handleBack}
          className="text-text-subtle hover:text-text-default font-designer-14r flex items-center gap-100 transition-colors"
        >
          <ArrowLeft size={16} />
          목록으로
        </button>
      </div>

      {data && (
        <div className="border-border-default rounded-100 border">
          {/* 문의 헤더 */}
          <div className="px-600 py-400">
            <div className="mb-200 flex items-start justify-between">
              <div className="flex flex-col gap-200">
                {data.category && (
                  <span className="bg-background-accent-gray-subtle text-background-accent-gray-strong font-designer-12m rounded-50 inline-flex w-fit px-100 py-50">
                    {CATEGORY_LABEL[data.category] ?? data.category}
                  </span>
                )}
                <h1 className="font-designer-24b text-text-strong">
                  {data.title}
                </h1>
              </div>
              <MoreMenu options={moreMenuOptions} iconSize={20} />
            </div>

            <div className="font-designer-13r text-text-subtle border-border-default grid grid-cols-2 gap-y-100 border-b pb-300">
              <div className="flex gap-200">
                <span className="text-text-subtle w-[60px]">작성자</span>
                <span className="text-text-default">{data.authorNickname}</span>
              </div>
              <div className="flex items-center gap-200">
                <Eye size={14} className="text-text-subtle" />
                <span className="text-text-default">{data.viewCount}</span>
              </div>
              <div className="flex gap-200">
                <span className="text-text-subtle w-[60px]">작성일</span>
                <span className="text-text-default">
                  {formatDateTimeDot(data.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-200">
                <InquiryStatusBadge status={data.status} />
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

          {/* 구분선 */}
          <div className="px-600">
            <hr className="border-border-default" />
          </div>

          {/* 답변 섹션 */}
          <div className="px-600 py-400">
            <h2 className="font-designer-16b text-text-strong mb-300">답변</h2>
            {data.answer ? (
              <div className="flex flex-col gap-200">
                <div className="font-designer-13r text-text-subtle flex items-center gap-200">
                  <span>{data.answererNickname}</span>
                  <span>{formatDateTimeDot(data.answeredAt ?? '')}</span>
                </div>
                <p className="font-designer-14r text-text-default whitespace-pre-wrap">
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
        </div>
      )}
    </div>
  );
}
