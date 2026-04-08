'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import type { MyReviewItem } from '@/types/api/review.types';
import { formatDateTimeDot } from '@/utils/time';
import { useExpandableContent } from '@/components/group-study/review/use-expandable-content';

export default function OneToOneReviewCard({
  review,
}: {
  review: MyReviewItem;
}) {
  const { contentRef, expanded, setExpanded, showButton } =
    useExpandableContent(review.content);

  const studyPeriod =
    review.startDate && review.endDate
      ? `${review.startDate} ~ ${review.endDate}`
      : null;

  return (
    <li className="border-b-border-subtle flex flex-col gap-150 border-b py-250">
      <div className="flex items-center gap-150">
        <Avatar image={review.writer.profileImageUrl} size={32} />
        <div className="flex items-center gap-100">
          <span className="font-designer-14b text-text-default">
            {review.writer.memberName}
          </span>
          <span className="font-designer-13r text-text-subtlest">
            {formatDateTimeDot(review.reviewedAt)}
          </span>
        </div>
      </div>

      {studyPeriod && (
        <span className="font-designer-12r text-text-subtlest">
          {studyPeriod}
        </span>
      )}

      {review.studySubjects.length > 0 && (
        <div className="flex flex-wrap gap-50">
          {review.studySubjects.map((subject, index) => (
            <span
              key={`${index}-${subject}`}
              className="font-designer-12r text-text-subtle bg-surface-subtle rounded-50 px-100 py-50"
            >
              {subject}
            </span>
          ))}
        </div>
      )}

      {review.content && (
        <div>
          <p
            ref={contentRef}
            className={cn(
              'font-designer-15r text-text-default',
              expanded ? 'line-clamp-none' : 'line-clamp-3',
            )}
          >
            {review.content}
          </p>

          {showButton && (
            <button
              type="button"
              className="font-designer-14r text-text-subtlest cursor-pointer"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '접기' : '더보기'}
            </button>
          )}
        </div>
      )}
    </li>
  );
}
