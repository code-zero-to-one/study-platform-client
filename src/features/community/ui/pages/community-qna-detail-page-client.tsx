'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import PageContainer from '@/components/common/ui/page-container';
import Pagination from '@/components/common/ui/pagination';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { buildCommunityListHref } from '@/features/community/model/community-route';
import { useCommunityQnaDetailController } from '@/features/community/model/use-community-qna-detail-controller';
import { COMMUNITY_BOARD } from '@/types/community/domain';
import { ErrorType } from '@/utils/error-handler';
import CommunityMarkdownContent from '../community-markdown-content';
import { CommunityBoardBadge } from '../community-meta-badge';
import CommunityQnaAnswerComposeSection from '../community-qna-answer-compose-section';
import CommunityQnaAnswerItem from '../community-qna-answer-item';
import CommunityQnaAuthorSummary from '../community-qna-author-summary';
import CommunityQnaQuestionCommentsSection from '../community-qna-question-comments-section';
import {
  CommunityQnaNotFoundState,
  CommunityQnaRouteErrorState,
  CommunityQnaRouteLoading,
} from '../community-qna-route-fallback';
import CommunitySectionShell from '../community-section-shell';

interface CommunityQnaDetailPageClientProps {
  questionId: number;
  returnPage?: number;
  initialAnswerPage?: number;
  initialCommentPage?: number;
}

export default function CommunityQnaDetailPageClient({
  questionId,
  returnPage,
  initialAnswerPage,
  initialCommentPage,
}: CommunityQnaDetailPageClientProps) {
  const { state, actions, viewModel } = useCommunityQnaDetailController({
    questionId,
    initialAnswerPage,
    initialCommentPage,
  });
  const backHref = buildCommunityListHref(returnPage);

  if (!state.isResolved) {
    return <CommunityQnaRouteLoading />;
  }

  if (state.isNotFound) {
    return <CommunityQnaNotFoundState backHref={backHref} />;
  }

  if (state.errorInfo) {
    return (
      <CommunityQnaRouteErrorState
        backHref={backHref}
        errorInfo={state.errorInfo}
        onRetry={actions.refetchQuestionDetail}
      />
    );
  }

  if (
    !state.question ||
    !state.viewer ||
    !state.questionCommentsPageData ||
    !state.answersPageData
  ) {
    return (
      <CommunityQnaRouteErrorState
        backHref={backHref}
        errorInfo={{
          type: ErrorType.CLIENT,
          userMessage: '질문 상세 응답 형식이 올바르지 않습니다.',
        }}
        onRetry={actions.refetchQuestionDetail}
      />
    );
  }

  return (
    <PageContainer className="flex flex-col gap-400 xl:gap-500">
      <CommunitySectionShell className="gap-250 border-b border-border-default pb-300">
        <Link
          href={backHref}
          className="inline-flex items-center gap-75 font-designer-14m text-text-subtle transition-colors hover:text-text-default"
        >
          <ChevronLeft className="h-16 w-16" />
          커뮤니티로 돌아가기
        </Link>

        <div className="flex flex-wrap items-center gap-100">
          <CommunityBoardBadge board={COMMUNITY_BOARD.QNA} showIcon={false} />
          {state.question.acceptedAnswerId ? (
            <span className="rounded-full bg-fill-brand-subtle-default px-100 py-50 font-designer-12b text-text-brand">
              채택 완료
            </span>
          ) : (
            <span className="rounded-full bg-fill-static-default px-100 py-50 font-designer-12b text-text-subtle">
              답변 대기
            </span>
          )}
          <span className="font-designer-14r text-text-subtlest">
            {state.question.createdAt}
          </span>
        </div>

        <div className="flex flex-col gap-200">
          <h1 className="font-designer-28b text-text-strong">
            {state.question.title}
          </h1>

          <CommunityQnaAuthorSummary author={state.question.author} />

          <div className="flex flex-wrap items-center gap-150">
            <span className="font-designer-14r text-text-subtle">
              조회 {state.question.stats.viewCount}
            </span>
            <span className="font-designer-14r text-text-subtle">
              답변 {state.question.stats.answerCount}
            </span>
            <span className="font-designer-14r text-text-subtle">
              댓글 {state.question.stats.questionCommentCount}
            </span>
          </div>
        </div>
      </CommunitySectionShell>

      <CommunitySectionShell className="gap-300">
        <CommunityMarkdownContent content={state.question.contentHtml} />

        <CommunityQnaQuestionCommentsSection
          comments={state.questionCommentsPageData.items}
          commentCount={viewModel.questionCommentCount}
          currentPage={viewModel.commentPage}
          onRefetchQuestionDetail={actions.refetchQuestionDetail}
          questionId={questionId}
          totalPages={viewModel.commentTotalPages}
          showPagination={viewModel.showCommentPagination}
          onChangePage={actions.handleCommentPageChange}
          viewer={state.viewer}
        />
      </CommunitySectionShell>

      <CommunityQnaAnswerComposeSection
        answers={state.answersPageData.items}
        onRefetchQuestionDetail={actions.refetchQuestionDetail}
        questionId={questionId}
        viewer={state.viewer}
      >
        {({ headerAction, myAnswerAction, panel }) => (
          <CommunitySectionShell className="gap-250">
            <div className="flex flex-wrap items-start justify-between gap-150 border-b border-border-default pb-200">
              <div className="flex flex-col gap-50">
                <p className="font-designer-24b text-text-strong">
                  답변
                  <span className="ml-75 font-designer-16m text-text-brand">
                    ({viewModel.answerCount})
                  </span>
                </p>
                <p className="font-designer-14r text-text-subtle">
                  {viewModel.answerCtaDescription}
                </p>
              </div>
              {headerAction}
            </div>

            {panel}

            {state.answersPageData.items.length ? (
              <div className="flex flex-col gap-150">
                {state.answersPageData.items.map((answer) => {
                  const isMyAnswer = viewModel.myAnswerId === answer.id;

                  return (
                    <CommunityQnaAnswerItem
                      key={answer.id}
                      answer={answer}
                      actionSlot={isMyAnswer ? myAnswerAction : null}
                      isMine={isMyAnswer}
                    />
                  );
                })}
              </div>
            ) : (
              <SurfacePanel radius="lg" className="p-250">
                <p className="font-designer-14r text-text-subtle">
                  아직 등록된 답변이 없습니다.
                </p>
              </SurfacePanel>
            )}

            {viewModel.showAnswerPagination ? (
              <Pagination
                page={viewModel.answerPage}
                totalPages={viewModel.answerTotalPages}
                onChangePage={actions.handleAnswerPageChange}
              />
            ) : null}
          </CommunitySectionShell>
        )}
      </CommunityQnaAnswerComposeSection>
    </PageContainer>
  );
}
