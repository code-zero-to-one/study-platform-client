'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import { useExpandableContent } from '@/components/group-study/review/use-expandable-content';
import type { GroupStudyExperienceReviewListItem } from '@/hooks/queries/group-study/group-study-review-api';
import { formatDateTimeDot } from '@/utils/time';

export default function GroupReviewCard({
  review,
}: {
  review: GroupStudyExperienceReviewListItem;
}) {
  const { contentRef, expanded, setExpanded, showButton } =
    useExpandableContent(review.content);

  return (
    <li className="border-b-border-subtle flex flex-col gap-150 border-b py-250">
      <div className="flex items-center gap-150">
        <Avatar image={review.writerProfileImageUrl} size={32} />
        <div className="flex items-center gap-100">
          <span className="font-designer-14b text-text-default">
            {review.writerName ?? '익명'}
          </span>
          {review.createdAt && (
            <span className="font-designer-13r text-text-subtlest">
              {formatDateTimeDot(review.createdAt)}
            </span>
          )}
        </div>
      </div>

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
