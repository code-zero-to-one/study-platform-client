'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import ReviewStars from './review-stars';

interface MentorDetailReviewSectionProps {
  mentor: MentorProfile;
}

const reviewMethodMap: Record<MentoringMethodType, string> = {
  note: '쪽지상담',
  simple: '간편상담',
  deep: '심층상담',
  offline: '대면상담',
};

export default function MentorDetailReviewSection({
  mentor,
}: MentorDetailReviewSectionProps) {
  return (
    <section>
      <div className="mb-75 flex items-center justify-between">
        <h2 className="font-designer-18b text-text-strong">멘토링 리뷰</h2>
        <div className="flex items-center gap-75">
          <ReviewStars rating={Math.floor(mentor.rating)} />
          <span className="font-designer-14b text-text-strong ml-50">
            {mentor.rating.toFixed(1)}
          </span>
        </div>
      </div>
      <p className="font-designer-13r text-text-subtlest mb-250">
        리뷰 {mentor.reviewCount}개
      </p>

      {mentor.reviews.length === 0 ? (
        <div className="rounded-150 bg-background-alternative px-200 py-400 text-center">
          <p className="font-designer-14r text-text-subtle">
            아직 등록된 리뷰가 없습니다.
          </p>
        </div>
      ) : (
        <div className="rounded-150 border-border-subtle overflow-hidden border">
          {mentor.reviews.map((review, idx) => (
            <article
              key={review.id}
              className={cn(
                'p-250',
                idx !== 0 && 'border-border-subtle border-t',
              )}
            >
              <div className="mb-150 flex items-start justify-between gap-100">
                <div>
                  <div className="mb-100 flex items-center gap-100">
                    <p className="font-designer-14b text-text-default">
                      {review.authorName}
                    </p>
                    <Badge color="gray" shape="round">
                      {reviewMethodMap[review.method]}
                    </Badge>
                  </div>
                  <ReviewStars rating={review.rating} />
                </div>
                <p className="font-designer-12r text-text-subtlest shrink-0">
                  {review.createdAt}
                </p>
              </div>
              <p className="font-designer-14r text-text-subtle leading-relaxed">
                {review.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
