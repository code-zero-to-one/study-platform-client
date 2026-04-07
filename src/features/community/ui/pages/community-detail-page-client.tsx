'use client';

import { ChevronLeft, Eye, MessageCircle, Share } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Avatar from '@/components/common/ui/avatar';
import PageContainer from '@/components/common/ui/page-container';
import { buildCommunityListHref } from '@/features/community/model/community-route';
import { useCommunityDetailController } from '@/features/community/model/use-community-detail-controller';
import { useIntersectionObserver } from '@/hooks/common/use-intersection-observer';
import { useUserStore } from '@/stores/useUserStore';
import CommunityAuthorNameTrigger from '../community-author-name-trigger';
import CommunityCommentSection from '../community-comment-section';
import CommunityDetailBodySection from '../community-detail-body-section';
import CommunityDetailFeedSection from '../community-detail-feed-section';
import {
  CommunityBoardBadge,
  CommunityMemberRoleBadge,
} from '../community-meta-badge';
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
    if (postId > 0) {
      setIsFeedVisible(false);
    }
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

        <div className="mt-100 self-start">
          <CommunityBoardBadge board={state.post.board} />
        </div>

        <div className="flex items-start justify-between gap-150">
          <h1 className="min-w-0 flex-1 font-designer-32b text-text-strong">
            {state.post.title}
          </h1>
          <CommunityPostOwnerActions
            currentPage={returnPage}
            post={state.post}
          />
        </div>

        <div className="flex flex-wrap items-center gap-100 font-designer-14r text-text-subtle">
          <Avatar
            image={state.post.authorImage}
            alt={state.post.authorName}
            size={24}
          />
          <CommunityAuthorNameTrigger
            memberId={state.post.authorMemberId}
            name={state.post.authorName}
            className="font-designer-14m text-text-default"
          />
          <CommunityMemberRoleBadge role={state.post.role} />
          <span className="text-text-subtlest">·</span>
          <span>{state.post.createdAt}</span>
          <span className="text-text-subtlest">·</span>
          <span className="flex items-center gap-50">
            <Eye className="h-200 w-200" />
            {state.post.viewCount}
          </span>
          <span className="text-text-subtlest">·</span>
          <span className="flex items-center gap-50">
            <MessageCircle className="h-200 w-200" />
            {viewModel.commentCount}
          </span>
        </div>
      </CommunitySectionShell>

      <CommunityDetailBodySection
        postId={state.post.id}
        title={state.post.title}
        contentHtml={state.post.contentHtml ?? undefined}
        content={state.post.content}
        previewImage={state.post.previewImage}
        previewImageAlt={state.post.previewImageAlt}
      />

      <div className="flex items-center gap-200 self-start rounded-100">
        <CommunityReactionButton
          isActive={viewModel.isLikedByViewer}
          count={viewModel.reactionCount}
          onClick={actions.handleToggleLike}
          disabled={!viewModel.isPostReactionEnabled}
          ariaLabel={viewModel.isLikedByViewer ? '좋아요 취소' : '좋아요'}
        />
        <button
          type="button"
          onClick={actions.handleSharePost}
          className="inline-flex items-center gap-75 font-designer-14m text-text-subtle transition-colors hover:text-text-default"
        >
          <Share className="h-200 w-200" />
          공유
        </button>
      </div>

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
        isAuthenticated={state.isAuthenticated}
        isLoading={state.isCommentsLoading}
        isCommentDisabled={!state.isAuthenticated}
        resetKey={state.commentInteractionResetKey}
        showPagination={viewModel.showCommentPagination}
        totalPages={viewModel.totalCommentPages}
        viewerImage={viewerImage ?? '/profile-default.svg'}
        onChangePage={actions.handleCommentPageChange}
        onDeleteComment={actions.handleDeleteComment}
        onSubmitComment={actions.handleSubmitComment}
        onSubmitEditedComment={actions.handleSubmitEditedComment}
        onSubmitReply={actions.handleSubmitReply}
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
