'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  createCommunityIdempotencyKey,
  getCommunityErrorMessage,
  isCommunityNotFoundError,
} from '@/features/community/api/community-api';
import {
  useAssignCommunityCommentReactionMutation,
  useAssignCommunityPostReactionMutation,
  useCreateCommunityCommentMutation,
  useCreateCommunityReplyMutation,
  useDeleteCommunityCommentMutation,
  useRecordCommunityPostViewMutation,
  useUpdateCommunityCommentMutation,
} from '@/features/community/model/use-community-mutation';
import {
  useCommunityCommentsQuery,
  useCommunityPostDetailQuery,
} from '@/features/community/model/use-community-query';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  CommunityComment,
  CommunityCommentReactionSelection,
} from '@/types/community/domain';

interface UseCommunityDetailControllerParams {
  postId: number;
}

const COMMUNITY_COMMENTS_PAGE = 1;
const COMMUNITY_COMMENTS_PAGE_SIZE = 20;
const EMPTY_COMMENTS: readonly CommunityComment[] = [];

const findCommentById = (
  comments: readonly CommunityComment[],
  commentId: number,
): CommunityComment | undefined => {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }

    const nestedComment = findCommentById(comment.replies, commentId);

    if (nestedComment) {
      return nestedComment;
    }
  }

  return undefined;
};

export const useCommunityDetailController = ({
  postId,
}: UseCommunityDetailControllerParams) => {
  const { isAuthenticated } = useAuth();
  const showToast = useToastStore((state) => state.showToast);
  const recordPostViewMutation = useRecordCommunityPostViewMutation();
  const assignPostReactionMutation = useAssignCommunityPostReactionMutation();
  const createCommentMutation = useCreateCommunityCommentMutation();
  const createReplyMutation = useCreateCommunityReplyMutation();
  const updateCommentMutation = useUpdateCommunityCommentMutation();
  const deleteCommentMutation = useDeleteCommunityCommentMutation();
  const assignCommentReactionMutation =
    useAssignCommunityCommentReactionMutation();
  const viewedPostIdRef = useRef<number | undefined>(undefined);
  const [commentsPage, setCommentsPage] = useState(COMMUNITY_COMMENTS_PAGE);

  const postQuery = useCommunityPostDetailQuery(postId);
  const commentsQuery = useCommunityCommentsQuery({
    postId,
    page: commentsPage,
    size: COMMUNITY_COMMENTS_PAGE_SIZE,
    enabled: postQuery.isSuccess,
  });

  const [commentInteractionResetKey, setCommentInteractionResetKey] =
    useState(0);

  const post = postQuery.data;
  const comments = commentsQuery.data?.items ?? EMPTY_COMMENTS;
  const totalCommentPages = Math.max(
    commentsQuery.data?.totalPages ?? COMMUNITY_COMMENTS_PAGE,
    COMMUNITY_COMMENTS_PAGE,
  );
  const currentCommentsPage = commentsQuery.data?.page ?? commentsPage;
  const isNotFound = isCommunityNotFoundError(postQuery.error);
  const isResolved = isNotFound || !postQuery.isPending;
  const postErrorMessage = postQuery.isError
    ? isNotFound
      ? ''
      : getCommunityErrorMessage(
          postQuery.error,
          '커뮤니티 글을 불러오지 못했습니다.',
        )
    : '';
  const commentsErrorMessage = commentsQuery.isError
    ? getCommunityErrorMessage(
        commentsQuery.error,
        '커뮤니티 댓글을 불러오지 못했습니다.',
      )
    : '';

  const resetCommentInteraction = () => {
    setCommentInteractionResetKey((prev) => prev + 1);
  };

  useEffect(() => {
    setCommentsPage(COMMUNITY_COMMENTS_PAGE);
    resetCommentInteraction();
    viewedPostIdRef.current = undefined;
  }, [postId]);

  useEffect(() => {
    if (
      commentsPage > totalCommentPages &&
      !commentsQuery.isPending &&
      !commentsQuery.isError
    ) {
      resetCommentInteraction();
      setCommentsPage(totalCommentPages);
    }
  }, [
    commentsPage,
    commentsQuery.isError,
    commentsQuery.isPending,
    totalCommentPages,
  ]);

  useEffect(() => {
    if (!post || viewedPostIdRef.current === post.id) {
      return;
    }

    viewedPostIdRef.current = post.id;
    recordPostViewMutation.mutate(post.id);
  }, [post, recordPostViewMutation]);

  const handleToggleLike = async () => {
    if (!post) {
      return;
    }

    if (!isAuthenticated) {
      showToast('로그인 후 좋아요를 누를 수 있습니다.', 'info');

      return;
    }

    try {
      await assignPostReactionMutation.mutateAsync({
        postId: post.id,
        type: post.viewerReaction === 'like' ? 'none' : 'like',
      });
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '좋아요 처리에 실패했습니다.'),
        'error',
      );
    }
  };

  const handleSubmitComment = async (content: string) => {
    if (!post) {
      return;
    }

    if (!isAuthenticated) {
      showToast('로그인 후 댓글을 작성할 수 있습니다.', 'info');

      return;
    }

    await createCommentMutation.mutateAsync({
      postId: post.id,
      content,
      idempotencyKey: createCommunityIdempotencyKey('community-comment'),
    });

    if (commentsPage !== COMMUNITY_COMMENTS_PAGE) {
      resetCommentInteraction();
      setCommentsPage(COMMUNITY_COMMENTS_PAGE);
    }
  };

  const handleSubmitReply = async (commentId: number, content: string) => {
    if (!post) {
      return;
    }

    if (!isAuthenticated) {
      showToast('로그인 후 답글을 작성할 수 있습니다.', 'info');

      return;
    }

    await createReplyMutation.mutateAsync({
      postId: post.id,
      commentId,
      content,
      idempotencyKey: createCommunityIdempotencyKey('community-reply'),
    });
  };

  const handleSubmitEditedComment = async (
    commentId: number,
    revision: number,
    content: string,
  ) => {
    if (!post) {
      return;
    }

    await updateCommentMutation.mutateAsync({
      postId: post.id,
      commentId,
      revision,
      content,
    });
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!post) {
      return;
    }

    const targetComment = findCommentById(comments, commentId);

    if (!targetComment?.revision || !targetComment.canDelete) {
      return;
    }

    await deleteCommentMutation.mutateAsync({
      postId: post.id,
      commentId,
      revision: targetComment.revision,
    });
  };

  const handleToggleCommentReaction = async (
    commentId: number,
    nextReaction: CommunityCommentReactionSelection,
  ) => {
    if (!post) {
      return;
    }

    if (!isAuthenticated) {
      showToast('로그인 후 댓글 반응을 남길 수 있습니다.', 'info');

      return;
    }

    const targetComment = findCommentById(comments, commentId);

    if (!targetComment || targetComment.isDeleted) {
      return;
    }

    try {
      await assignCommentReactionMutation.mutateAsync({
        postId: post.id,
        commentId,
        type:
          targetComment.viewerReaction === nextReaction ? 'none' : nextReaction,
      });
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '댓글 반응 처리에 실패했습니다.'),
        'error',
      );
    }
  };

  const handleCommentPageChange = (nextPage: number) => {
    const normalizedPage = Math.max(nextPage, COMMUNITY_COMMENTS_PAGE);

    if (normalizedPage === commentsPage) {
      return;
    }

    resetCommentInteraction();
    setCommentsPage(normalizedPage);
  };

  const handleSharePost = async () => {
    const url = window.location.href;
    const title = post?.title ?? '';

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast('링크가 복사되었습니다.', 'success');
    } catch {
      showToast('링크 복사에 실패했습니다.', 'error');
    }
  };

  return {
    state: {
      commentInteractionResetKey,
      commentsErrorMessage,
      isAuthenticated,
      isCommentsLoading: commentsQuery.isPending,
      isResolved,
      errorMessage: postErrorMessage,
      post: isNotFound ? undefined : post,
    },
    actions: {
      handleCommentPageChange,
      handleDeleteComment,
      handleSharePost,
      handleSubmitComment,
      handleSubmitEditedComment,
      handleSubmitReply,
      handleToggleCommentReaction,
      handleToggleLike,
    },
    viewModel: {
      commentCount:
        commentsQuery.data?.totalCommentCount ?? post?.commentCount ?? 0,
      comments,
      currentCommentsPage,
      isLikedByViewer: post?.viewerReaction === 'like',
      reactionCount: post?.reactionCount ?? 0,
      showCommentPagination: totalCommentPages > COMMUNITY_COMMENTS_PAGE,
      totalCommentPages,
    },
  };
};
