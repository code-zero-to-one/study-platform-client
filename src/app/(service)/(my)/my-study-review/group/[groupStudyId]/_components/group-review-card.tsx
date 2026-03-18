'use client';

import Avatar from '@/components/common/ui/avatar';
import type { GroupStudyExperienceReviewListItem } from '@/hooks/queries/group-study-review-api';
import { formatDateTimeDot } from '@/utils/time';
import { useExpandableContent } from '../../../_components/use-expandable-content';

export default function GroupReviewCard({
  review,
}: {
  review: GroupStudyExperienceReviewListItem;
}) {
  const { contentRef, expanded, setExpanded, showButton } =
    useExpandableContent(review.content);

  return (
    <li className="border-b-border-subtle flex flex-col gap-150 border-b py-250">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-100">
          <Avatar image={review.writerProfileImageUrl} size={32} />
          <span className="font-designer-14b text-text-default">
            {review.writerName ?? '익명'}
          </span>
        </div>

        {review.createdAt && (
          <span className="font-designer-13r text-text-subtle">
            {formatDateTimeDot(review.createdAt)}
          </span>
        )}
      </div>

      {review.content && (
        <div>
          <p
            ref={contentRef}
            className={`font-designer-15r text-text-default ${
              expanded ? 'line-clamp-none' : 'line-clamp-3'
            }`}
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
