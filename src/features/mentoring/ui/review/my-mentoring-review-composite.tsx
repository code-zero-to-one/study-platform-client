'use client';

import MyMentoringReviewPanel from '@/features/mentoring/ui/review/my-mentoring-review-panel';
import type { MyReviewItem } from '@/entities/review/api/review-types';

interface MentoringReviewKeywordStat {
  id: number;
  content: string;
  count: number;
}

interface MyMentoringReviewCompositeProps {
  positiveKeywords: MentoringReviewKeywordStat[];
  negativeKeywords: MentoringReviewKeywordStat[];
  allPositiveKeywords: MentoringReviewKeywordStat[];
  allNegativeKeywords: MentoringReviewKeywordStat[];
  positiveKeywordsCount: number;
  negativeKeywordsCount: number;
  reviews: MyReviewItem[];
  reviewTotalCount: number;
  hasNextPage: boolean;
  onLoadMore: () => void;
}

export default function MyMentoringReviewComposite({
  positiveKeywords,
  negativeKeywords,
  allPositiveKeywords,
  allNegativeKeywords,
  positiveKeywordsCount,
  negativeKeywordsCount,
  reviews,
  reviewTotalCount,
  hasNextPage,
  onLoadMore,
}: MyMentoringReviewCompositeProps) {
  return (
    <>
      <MyMentoringReviewPanel />

      <MyMentoringReviewKeywordPanels
        positiveKeywords={positiveKeywords}
        negativeKeywords={negativeKeywords}
        allPositiveKeywords={allPositiveKeywords}
        allNegativeKeywords={allNegativeKeywords}
        positiveKeywordsCount={positiveKeywordsCount}
        negativeKeywordsCount={negativeKeywordsCount}
      />

      <MyMentoringReviewListSection
        reviews={reviews}
        reviewTotalCount={reviewTotalCount}
        hasNextPage={hasNextPage}
        onLoadMore={onLoadMore}
      />
    </>
  );
}

interface MyMentoringReviewKeywordPanelsProps {
  positiveKeywords: MentoringReviewKeywordStat[];
  negativeKeywords: MentoringReviewKeywordStat[];
  allPositiveKeywords: MentoringReviewKeywordStat[];
  allNegativeKeywords: MentoringReviewKeywordStat[];
  positiveKeywordsCount: number;
  negativeKeywordsCount: number;
}

function MyMentoringReviewKeywordPanels({
  positiveKeywords,
  negativeKeywords,
  allPositiveKeywords,
  allNegativeKeywords,
  positiveKeywordsCount,
  negativeKeywordsCount,
}: MyMentoringReviewKeywordPanelsProps) {
  const totalKeywordsCount = positiveKeywordsCount + negativeKeywordsCount;

  return (
    <section className="mt-300">
      <div className="mb-200">
        <div className="flex items-center gap-100">
          <div className="font-designer-20b text-text-default">
            Received keywords
          </div>
          <div className="font-designer-20b text-text-default">
            {totalKeywordsCount}
          </div>
        </div>

        <span className="font-designer-14r text-text-subtle">
          Visible only to you.
        </span>
      </div>

      <div className="mb-400 grid grid-cols-2 gap-300">
        <KeywordPanel
          title="Positive"
          previewKeywords={positiveKeywords}
          totalCount={positiveKeywordsCount}
          allKeywords={allPositiveKeywords}
          emptyMessage="No positive keywords yet."
        />
        <KeywordPanel
          title="Needs improvement"
          previewKeywords={negativeKeywords}
          totalCount={negativeKeywordsCount}
          allKeywords={allNegativeKeywords}
          emptyMessage="No negative keywords yet."
        />
      </div>
    </section>
  );
}

function KeywordPanel({
  title,
  previewKeywords,
  totalCount,
  allKeywords,
  emptyMessage,
}: {
  title: string;
  previewKeywords: MentoringReviewKeywordStat[];
  totalCount: number;
  allKeywords: MentoringReviewKeywordStat[];
  emptyMessage: string;
}) {
  const keywordsToRender =
    previewKeywords.length > 0 ? previewKeywords : allKeywords;

  return (
    <div className="rounded-100 border-border-subtle min-h-[280px] border p-200">
      <div className="mb-200 flex justify-between">
        <h3 className="font-designer-16b text-text-default">{title}</h3>
        <span className="font-designer-12m text-text-subtlest">
          {totalCount}
        </span>
      </div>

      <ul className="flex flex-col gap-50">
        {keywordsToRender.length > 0 ? (
          keywordsToRender.map((keyword) => (
            <li
              key={keyword.id}
              className="bg-background-accent-gray-default text-text-default rounded-50 flex justify-between px-200 py-100"
            >
              <span className="font-designer-14r">{keyword.content}</span>
              <span className="font-designer-14b">{keyword.count}</span>
            </li>
          ))
        ) : (
          <span className="text-text-subtle font-designer-14r text-center">
            {emptyMessage}
          </span>
        )}
      </ul>
    </div>
  );
}

interface MyMentoringReviewListSectionProps {
  reviews: MyReviewItem[];
  reviewTotalCount: number;
  hasNextPage: boolean;
  onLoadMore: () => void;
}

function MyMentoringReviewListSection({
  reviews,
  reviewTotalCount,
  hasNextPage,
  onLoadMore,
}: MyMentoringReviewListSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-100">
        <div className="font-designer-20b text-text-default">Reviews</div>
        <div className="font-designer-20b text-text-default">
          {reviewTotalCount}
        </div>
      </div>

      <span className="font-designer-14r text-text-subtle">
        Visible only to you.
      </span>

      <ul>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <li
              key={review.id}
              className="border-b-border-subtle flex flex-col gap-150 border-b py-250"
            >
              <div>
                <span className="font-designer-14b text-text-default mr-50">
                  {review.writer.memberName}
                </span>
                <span className="font-designer-14r text-text-subtle">
                  {review.reviewedAt}
                </span>
              </div>
              <p className="text-text-default font-designer-15r">
                {review.content}
              </p>
            </li>
          ))
        ) : (
          <div className="text-text-subtle font-designer-14r flex h-[200px] items-center justify-center text-center">
            No reviews yet.
          </div>
        )}

        {hasNextPage && (
          <button
            className="font-designer-14m text-text-subtle hover:bg-background-accent-gray-default rounded-50 flex w-full cursor-pointer items-center justify-center py-200"
            onClick={onLoadMore}
          >
            Load more
          </button>
        )}
      </ul>
    </section>
  );
}
