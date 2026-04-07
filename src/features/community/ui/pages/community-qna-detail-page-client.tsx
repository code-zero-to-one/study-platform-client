'use client';

import { ChevronLeft, Eye, MessageCircle, Share } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@/components/common/ui/avatar';
import PageContainer from '@/components/common/ui/page-container';
import Pagination from '@/components/common/ui/pagination';
import { buildCommunityListHref } from '@/features/community/model/community-route';
import { useCommunityQnaDetailController } from '@/features/community/model/use-community-qna-detail-controller';
import { useUserStore } from '@/stores/useUserStore';
import { COMMUNITY_BOARD, type CommunityBoard } from '@/types/community/domain';
import { ErrorType } from '@/utils/error-handler';
import CommunityAuthorNameTrigger from '../community-author-name-trigger';
import CommunityMarkdownContent from '../community-markdown-content';
import {
  CommunityBoardBadge,
  CommunityMemberRoleBadge,
} from '../community-meta-badge';
import CommunityQnaAnswerAcceptanceActions from '../community-qna-answer-acceptance-actions';
import CommunityQnaAnswerCommentsSection from '../community-qna-answer-comments-section';
import CommunityQnaAnswerComposeSection from '../community-qna-answer-compose-section';
import CommunityQnaAnswerItem from '../community-qna-answer-item';
import CommunityQnaQuestionCommentsSection from '../community-qna-question-comments-section';
import CommunityQnaQuestionOwnerActions from '../community-qna-question-owner-actions';
import {
  CommunityQnaNotFoundState,
  CommunityQnaRouteErrorState,
  CommunityQnaRouteLoading,
} from '../community-qna-route-fallback';
import CommunityReactionButton from '../community-reaction-button';
import CommunitySectionShell from '../community-section-shell';

interface CommunityQnaDetailPageClientProps {
  questionId: number;
  returnBoard?: CommunityBoard;
  returnPage?: number;
  initialAnswerPage?: number;
  initialCommentPage?: number;
}

export default function CommunityQnaDetailPageClient({
  questionId,
  returnBoard,
  returnPage,
  initialAnswerPage,
  initialCommentPage,
}: CommunityQnaDetailPageClientProps) {
  const { state, actions, viewModel } = useCommunityQnaDetailController({
    questionId,
    initialAnswerPage,
    initialCommentPage,
  });
  const viewerImage = useUserStore((store) => store.profileImageUrl);
  const backHref = buildCommunityListHref(returnPage, returnBoard);

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
      <CommunitySectionShell className="gap-200 border-b border-border-default pb-300">
        <Link
          href={backHref}
          className="inline-flex items-center gap-75 font-designer-14m text-text-subtle transition-colors hover:text-text-default"
        >
          <ChevronLeft className="h-16 w-16" />
          커뮤니티로 돌아가기
        </Link>

        <div className="mt-200 self-start">
          <CommunityBoardBadge board={COMMUNITY_BOARD.QNA} showIcon={false} />
        </div>

        <div className="flex items-start justify-between gap-150">
          <h1 className="min-w-0 flex-1 font-designer-32b text-text-strong">
            {state.question.title}
          </h1>
          <CommunityQnaQuestionOwnerActions
            canDelete={state.viewer.canDeleteQuestion}
            canEdit={state.viewer.canEditQuestion}
            currentPage={returnPage}
            questionId={state.question.id}
            revision={state.question.revision}
          />
        </div>

        <div className="flex flex-wrap items-center gap-100 font-designer-14r text-text-subtle">
          <Avatar
            image={state.question.author.profileImageUrl}
            alt={state.question.author.name}
            size={24}
          />
          <CommunityAuthorNameTrigger
            memberId={state.question.author.memberId}
            name={state.question.author.name}
            className="font-designer-14m text-text-default"
          />
          <CommunityMemberRoleBadge role={state.question.author.role} />
          {state.question.acceptedAnswerId ? (
            <span className="rounded-full bg-fill-brand-subtle-default px-100 py-50 font-designer-12b text-text-brand">
              채택 완료
            </span>
          ) : (
            <span className="rounded-full bg-fill-static-default px-100 py-50 font-designer-12b text-text-subtle">
              답변 대기
            </span>
          )}
          <span className="text-text-subtlest">·</span>
          <span>{state.question.createdAt}</span>
          <span className="text-text-subtlest">·</span>
          <span className="flex items-center gap-50">
            <Eye className="h-200 w-200" />
            {state.question.stats.viewCount}
          </span>
          <span className="text-text-subtlest">·</span>
          <span className="flex items-center gap-50">
            <MessageCircle className="h-200 w-200" />
            {state.question.stats.answerCount}
          </span>
        </div>
      </CommunitySectionShell>

      <CommunitySectionShell className="gap-300">
        <CommunityMarkdownContent content={state.question.contentHtml} />

        <div className="flex items-center gap-200 self-start rounded-100">
          <CommunityReactionButton
            isActive={viewModel.isQuestionLikedByViewer}
            count={viewModel.questionLikeCount}
            onClick={actions.handleToggleQuestionLike}
            disabled={viewModel.isQuestionReactionPending}
            ariaLabel={
              viewModel.isQuestionLikedByViewer ? '좋아요 취소' : '좋아요'
            }
          />
          <button
            type="button"
            onClick={actions.handleShareQuestion}
            className="inline-flex items-center gap-75 font-designer-14m text-text-subtle transition-colors hover:text-text-default"
          >
            <Share className="h-200 w-200" />
            공유
          </button>
        </div>

        <CommunityQnaQuestionCommentsSection
          comments={state.questionCommentsPageData?.items ?? []}
          commentCount={viewModel.questionCommentCount}
          currentPage={viewModel.commentPage}
          onRefetchQuestionDetail={actions.refetchQuestionDetail}
          questionId={questionId}
          totalPages={viewModel.commentTotalPages}
          showPagination={viewModel.showCommentPagination}
          onChangePage={actions.handleCommentPageChange}
          viewer={state.viewer}
          viewerImage={viewerImage ?? '/profile-default.svg'}
        />
      </CommunitySectionShell>

      <CommunityQnaAnswerComposeSection
        acceptedAnswer={state.acceptedAnswer}
        answers={state.answersPageData?.items ?? []}
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
                {viewModel.answerCtaDescription ? (
                  <p className="font-designer-14r text-text-subtle">
                    {viewModel.answerCtaDescription}
                  </p>
                ) : null}
              </div>
              {headerAction}
            </div>

            {panel}

            {state.acceptedAnswer ? (
              <CommunityQnaAnswerItem
                answer={state.acceptedAnswer}
                actionSlot={
                  viewModel.myAnswerId === state.acceptedAnswer.id ||
                  state.viewer.canAcceptAnswer ? (
                    <div className="flex flex-wrap items-center justify-end gap-75">
                      {viewModel.myAnswerId === state.acceptedAnswer.id
                        ? myAnswerAction
                        : null}
                      <CommunityQnaAnswerAcceptanceActions
                        answer={state.acceptedAnswer}
                        canAcceptAnswer={state.viewer.canAcceptAnswer}
                        currentAcceptedAnswerId={
                          state.question.acceptedAnswerId
                        }
                        currentAnswerPage={viewModel.answerPage}
                        onChangeAnswerPage={actions.handleAnswerPageChange}
                        onRefetchQuestionDetail={actions.refetchQuestionDetail}
                        questionId={questionId}
                      />
                    </div>
                  ) : null
                }
                isMine={viewModel.myAnswerId === state.acceptedAnswer.id}
                commentSection={
                  <CommunityQnaAnswerCommentsSection
                    answer={state.acceptedAnswer}
                    onRefetchQuestionDetail={actions.refetchQuestionDetail}
                    questionId={questionId}
                    viewerImage={viewerImage ?? '/profile-default.svg'}
                  />
                }
              />
            ) : null}

            {state.answersPageData?.items.length ? (
              <div className="flex flex-col gap-150">
                {state.answersPageData.items.map((answer) => {
                  const isMyAnswer = viewModel.myAnswerId === answer.id;
                  const isSelfAnswer =
                    answer.author.memberId !== undefined &&
                    answer.author.memberId === state.question.author.memberId;
                  const canAcceptThisAnswer =
                    state.viewer.canAcceptAnswer && !isSelfAnswer;

                  return (
                    <CommunityQnaAnswerItem
                      key={answer.id}
                      answer={answer}
                      reactionSlot={
                        <CommunityReactionButton
                          isActive={answer.viewer.reaction === 'like'}
                          count={answer.stats.likeCount}
                          onClick={() =>
                            actions.handleToggleAnswerLike(answer.id)
                          }
                          disabled={viewModel.isAnswerReactionPending}
                          ariaLabel={
                            answer.viewer.reaction === 'like'
                              ? '좋아요 취소'
                              : '좋아요'
                          }
                        />
                      }
                      actionSlot={
                        isMyAnswer || canAcceptThisAnswer ? (
                          <div className="flex flex-wrap items-center justify-end gap-75">
                            {isMyAnswer ? myAnswerAction : null}
                            <CommunityQnaAnswerAcceptanceActions
                              answer={answer}
                              canAcceptAnswer={canAcceptThisAnswer}
                              currentAcceptedAnswerId={
                                state.question.acceptedAnswerId
                              }
                              currentAnswerPage={viewModel.answerPage}
                              onChangeAnswerPage={
                                actions.handleAnswerPageChange
                              }
                              onRefetchQuestionDetail={
                                actions.refetchQuestionDetail
                              }
                              questionId={questionId}
                            />
                          </div>
                        ) : null
                      }
                      isMine={isMyAnswer}
                      commentSection={
                        <CommunityQnaAnswerCommentsSection
                          answer={answer}
                          onRefetchQuestionDetail={
                            actions.refetchQuestionDetail
                          }
                          questionId={questionId}
                          viewerImage={viewerImage ?? '/profile-default.svg'}
                        />
                      }
                    />
                  );
                })}
              </div>
            ) : !state.acceptedAnswer ? (
              <div className="rounded-200 border border-border-default bg-background-default p-250">
                <p className="font-designer-14r text-text-subtle">
                  아직 등록된 답변이 없습니다.
                </p>
              </div>
            ) : null}

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
