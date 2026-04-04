'use client';

import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageContainer from '@/components/common/ui/page-container';
import { buildCommunityListHref } from '@/features/community/model/community-route';
import { useCommunityDetailController } from '@/features/community/model/use-community-detail-controller';
import { useIntersectionObserver } from '@/hooks/common/use-intersection-observer';
import { useUserStore } from '@/stores/useUserStore';
import CommunityAuthorProfileCard from '../community-author-profile-card';
import CommunityCommentSection from '../community-comment-section';
import CommunityDetailFeedSection from '../community-detail-feed-section';
import CommunityMarkdownContent from '../community-markdown-content';
import { CommunityBoardBadge } from '../community-meta-badge';
import CommunityPostOwnerActions from '../community-post-owner-actions';
import CommunityReactionButton from '../community-reaction-button';
import CommunitySectionShell from '../community-section-shell';

interface CommunityDetailPageClientProps {
  postId: number;
  returnPage?: number;
}

export default function CommunityDetailPageClient({
  postId,
  returnPage,
}: CommunityDetailPageClientProps) {
  const { state, actions, viewModel } = useCommunityDetailController({
    postId,
  });
  const viewerImage = useUserStore((store) => store.profileImageUrl);
  const [isFeedVisible, setIsFeedVisible] = useState(false);
  const backHref = buildCommunityListHref(returnPage);
  const feedTriggerRef = useIntersectionObserver(
    () => {
      setIsFeedVisible(true);
    },
    {
      enabled: !isFeedVisible,
      rootMargin: '320px 0px',
      threshold: 0,
    },
  );

  useEffect(() => {
    setIsFeedVisible(false);
  }, [postId]);

  if (!state.isResolved) {
    return (
      <PageContainer className="flex flex-col gap-500 xl:gap-600">
        <CommunitySectionShell className="gap-250">
          <p className="font-designer-16r text-text-subtle">
            글을 불러오는 중입니다.
          </p>
        </CommunitySectionShell>
      </PageContainer>
    );
  }

  if (state.errorMessage) {
    return (
      <PageContainer className="flex flex-col gap-500 xl:gap-600">
        <CommunitySectionShell className="gap-250">
          <Link
            href={backHref}
            className="inline-flex items-center gap-75 font-designer-14m text-text-subtle transition-colors hover:text-text-default"
          >
            <ChevronLeft className="h-16 w-16" />
            커뮤니티로 돌아가기
          </Link>
          <div className="rounded-200 border border-border-default bg-background-default p-300">
            <p className="font-designer-20b text-text-strong">
              글을 불러오지 못했습니다.
            </p>
            <p className="mt-100 font-designer-14r text-text-subtle">
              {state.errorMessage}
            </p>
          </div>
        </CommunitySectionShell>
      </PageContainer>
    );
  }

  if (!state.post) {
    return (
      <PageContainer className="flex flex-col gap-500 xl:gap-600">
        <CommunitySectionShell className="gap-250">
          <Link
            href={backHref}
            className="inline-flex items-center gap-75 font-designer-14m text-text-subtle transition-colors hover:text-text-default"
          >
            <ChevronLeft className="h-16 w-16" />
            커뮤니티로 돌아가기
          </Link>
          <div className="rounded-200 border border-border-default bg-background-default p-300">
            <p className="font-designer-20b text-text-strong">
              글을 찾을 수 없어요.
            </p>
            <p className="mt-100 font-designer-14r text-text-subtle">
              목록으로 돌아가 다른 글을 확인해 주세요.
            </p>
          </div>
        </CommunitySectionShell>
      </PageContainer>
    );
  }

  const hasRichContent = Boolean(state.post.contentHtml?.trim());

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
          <CommunityBoardBadge board={state.post.board} />
          <span className="font-designer-14r text-text-subtlest">
            {state.post.createdAt}
          </span>
        </div>

        <div className="flex flex-col gap-200">
          <div className="flex items-start justify-between gap-150">
            <h1 className="min-w-0 flex-1 font-designer-28b text-text-strong">
              {state.post.title}
            </h1>
            <CommunityPostOwnerActions
              currentPage={returnPage}
              post={state.post}
            />
          </div>

          <CommunityAuthorProfileCard post={state.post} />

          <div className="flex flex-wrap items-center gap-150">
            <span className="font-designer-14r text-text-subtle">
              조회 {state.post.viewCount}
            </span>
            <span className="font-designer-14r text-text-subtle">
              댓글 {viewModel.commentCount}
            </span>
            <CommunityReactionButton
              isActive={viewModel.isLikedByViewer}
              count={viewModel.reactionCount}
              onClick={actions.handleToggleLike}
              disabled={!viewModel.isPostReactionEnabled}
              ariaLabel={viewModel.isLikedByViewer ? '좋아요 취소' : '좋아요'}
            />
          </div>
        </div>
      </CommunitySectionShell>

      <CommunitySectionShell className="gap-300">
        {!hasRichContent && state.post.previewImage ? (
          <div className="overflow-hidden rounded-200 border border-border-default bg-background-alternative">
            <Image
              src={state.post.previewImage}
              alt={state.post.previewImageAlt ?? state.post.title}
              width={1200}
              height={800}
              className="h-auto w-full"
              unoptimized
            />
          </div>
        ) : null}

        {hasRichContent ? (
          <CommunityMarkdownContent content={state.post.contentHtml ?? ''} />
        ) : (
          <div className="flex flex-col gap-250">
            {state.post.content.map((paragraph, index) => (
              <p
                key={`${state.post.id}-${index}`}
                className="font-designer-16r leading-300 text-text-default"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </CommunitySectionShell>

      <CommunityCommentSection
        comments={viewModel.comments}
        commentCount={viewModel.commentCount}
        commentPlaceholder={
          state.isAuthenticated
            ? '댓글을 남겨보세요.'
            : '로그인 후 댓글을 남길 수 있습니다.'
        }
        currentPage={viewModel.currentCommentsPage}
        errorMessage={state.commentsErrorMessage}
        isLoading={state.isCommentsLoading}
        isCommentDisabled={!state.isAuthenticated}
        showPagination={viewModel.showCommentPagination}
        totalPages={viewModel.totalCommentPages}
        viewerImage={viewerImage ?? '/profile-default.svg'}
        commentDraft={state.commentDraft}
        editingCommentId={state.editingCommentId}
        editingDraft={state.editingDraft}
        replyDraft={state.replyDraft}
        replyTargetId={state.replyTargetId}
        onCancelEditing={actions.handleCancelEditingComment}
        onCloseReply={actions.handleCloseReply}
        onCommentDraftChange={actions.handleCommentDraftChange}
        onDeleteComment={actions.handleDeleteComment}
        onEditingDraftChange={actions.handleEditingDraftChange}
        onOpenReply={actions.handleOpenReply}
        onReplyDraftChange={actions.handleReplyDraftChange}
        onStartEditing={actions.handleStartEditingComment}
        onSubmitComment={actions.handleSubmitComment}
        onSubmitEditedComment={actions.handleSubmitEditedComment}
        onSubmitReply={actions.handleSubmitReply}
        onChangePage={actions.handleCommentPageChange}
        onToggleCommentReaction={actions.handleToggleCommentReaction}
      />

      <div
        ref={(node) => {
          feedTriggerRef.current = node;
        }}
        aria-hidden="true"
        className="h-px w-full"
      />

      <CommunityDetailFeedSection
        currentPostId={state.post.id}
        isVisible={isFeedVisible}
      />
    </PageContainer>
  );
}
