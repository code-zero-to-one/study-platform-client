'use client';

import { ChevronLeft, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/common/ui/avatar';
import KeywordReview from '@/components/common/cards/keyword-review';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type { MockReviewSummary } from '@/mocks/study-review-mock-data';

interface StudyReviewDetailProps {
  data: MockReviewSummary;
  backLabel: string;
  backHref: string;
}

export default function StudyReviewDetail({
  data,
  backLabel,
  backHref,
}: StudyReviewDetailProps) {
  const router = useRouter();

  const totalSatisfaction = data.goodCount + data.disappointedCount;
  const goodPercent =
    totalSatisfaction > 0
      ? Math.round((data.goodCount / totalSatisfaction) * 100)
      : 0;
  const disappointedPercent =
    totalSatisfaction > 0
      ? Math.round((data.disappointedCount / totalSatisfaction) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-400">
      {/* 뒤로가기 */}
      <button
        type="button"
        onClick={() => router.push(backHref)}
        className="text-text-subtle font-designer-14m flex cursor-pointer items-center gap-50 hover:text-text-default"
      >
        <ChevronLeft size={18} />
        {backLabel}
      </button>

      {/* 스터디명 */}
      <div className="flex flex-col gap-75">
        <h1 className="font-designer-24b text-text-strong">
          {data.studyTitle}
        </h1>
        {data.startDate && data.endDate && (
          <span className="font-designer-14r text-text-subtlest">
            {data.startDate} ~ {data.endDate}
          </span>
        )}
      </div>

      {/* 상단 요약 영역 */}
      <div className="flex gap-300">
        {/* 만족도 분포 */}
        <div className="border-border-subtle flex-1 rounded-100 border p-300">
          <h3 className="font-designer-16b text-text-default mb-200">
            만족도
          </h3>
          <div className="flex flex-col gap-150">
            <SatisfactionBar
              label="좋았어요"
              emoji="😊"
              count={data.goodCount}
              total={totalSatisfaction}
              percent={goodPercent}
              color="bg-fill-information-default-default"
            />
            <SatisfactionBar
              label="아쉬웠어요"
              emoji="😅"
              count={data.disappointedCount}
              total={totalSatisfaction}
              percent={disappointedPercent}
              color="bg-fill-danger-default-default"
            />
          </div>
        </div>

        {/* 평균 별점 */}
        <div className="border-border-subtle flex w-[200px] flex-col items-center justify-center rounded-100 border p-300">
          <h3 className="font-designer-16b text-text-default mb-100">
            평균 별점
          </h3>
          <span className="font-designer-36b text-text-strong">
            {data.averageRating.toFixed(2)}
          </span>
          <div className="mt-50 flex items-center gap-25">
            {Array.from({ length: 5 }).map((_, i) => {
              const fill =
                data.averageRating >= i + 1
                  ? 'full'
                  : data.averageRating >= i + 0.5
                    ? 'half'
                    : 'empty';
              return (
                <div key={i} className="relative">
                  <Star className="h-250 w-250 shrink-0 fill-current text-icon-disabled" />
                  {fill !== 'empty' && (
                    <div
                      className={cn(
                        'absolute inset-0 overflow-hidden',
                        fill === 'half' ? 'w-1/2' : 'w-full',
                      )}
                    >
                      <Star className="h-250 w-250 shrink-0 fill-current text-text-warning" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="font-designer-13r text-text-subtle mt-50">
            총 {data.totalRatingCount}명 참여
          </span>
        </div>
      </div>

      {/* 평가 항목 집계 영역 */}
      <div className="flex flex-col gap-200">
        <div className="flex items-center gap-100">
          <h2 className="font-designer-20b text-text-default">받은 평가</h2>
          <span className="font-designer-20b text-text-default">
            {data.totalReviewCount}
          </span>
        </div>
        <span className="font-designer-14r text-text-subtle">
          개선이 필요한 점은 나에게만 보여요
        </span>

        <div className="grid grid-cols-2 gap-300">
          <div className="rounded-100 border-border-subtle min-h-[200px] border p-200">
            <div className="mb-200 flex justify-between">
              <h3 className="font-designer-16b text-text-default">
                좋았던 점
              </h3>
              <span className="font-designer-14m text-text-subtle">
                다보기
              </span>
            </div>
            <ul className="flex flex-col gap-50">
              {data.goodItems.map((item, idx) => (
                <KeywordReview
                  key={idx}
                  content={item.label}
                  count={item.count}
                />
              ))}
            </ul>
          </div>

          <div className="rounded-100 border-border-subtle min-h-[200px] border p-200">
            <div className="mb-200">
              <h3 className="font-designer-16b text-text-default">
                개선이 필요한 점
              </h3>
            </div>
            <ul className="flex flex-col gap-50">
              {data.disappointedItems.map((item, idx) => (
                <KeywordReview
                  key={idx}
                  content={item.label}
                  count={item.count}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 개별 후기 목록 */}
      <div className="flex flex-col gap-200">
        <div className="flex items-center gap-100">
          <h2 className="font-designer-20b text-text-default">후기</h2>
          <span className="font-designer-20b text-text-default">
            {data.reviews.length}
          </span>
        </div>
        <span className="font-designer-14r text-text-subtle">
          모든 후기는 나에게만 보여요
        </span>

        <ul className="flex flex-col">
          {data.reviews.map((review) => (
            <li
              key={review.reviewId}
              className="border-b-border-subtle flex flex-col gap-150 border-b py-250"
            >
              <div className="flex items-center gap-150">
                <UserAvatar
                  size={32}
                  image={review.writerProfileImage}
                  alt={`${review.writerNickname} 프로필`}
                />
                <div className="flex items-center gap-100">
                  <span className="font-designer-14b text-text-default">
                    {review.writerNickname}
                  </span>
                  <span className="font-designer-13r text-text-subtlest">
                    {review.createdAt}
                  </span>
                </div>
              </div>
              <p className="font-designer-15r text-text-default">
                {review.content}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SatisfactionBar({
  label,
  emoji,
  count,
  total,
  percent,
  color,
}: {
  label: string;
  emoji: string;
  count: number;
  total: number;
  percent: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-200">
      <div className="flex w-[100px] items-center gap-75">
        <span className="font-designer-14m text-text-default">
          {label}
        </span>
        <span>{emoji}</span>
      </div>
      <div className="bg-fill-neutral-subtle-default h-[8px] flex-1 overflow-hidden rounded-full">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="font-designer-14m text-text-subtle w-[100px] text-right">
        {percent}% ({count}/{total})
      </span>
    </div>
  );
}
