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

  const [commentDraft, setCommentDraft] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<number | undefined>();
  const [replyDraft, setReplyDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<
    number | undefined
  >();
  const [editingDraft, setEditingDraft] = useState('');

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

  const resetReplyState = () => {
    setReplyTargetId(undefined);
    setReplyDraft('');
  };

  const resetEditingState = () => {
    setEditingCommentId(undefined);
    setEditingDraft('');
  };

  const resetPagedCommentInteractionState = () => {
    resetReplyState();
    resetEditingState();
  };

  useEffect(() => {
    setCommentsPage(COMMUNITY_COMMENTS_PAGE);
    setCommentDraft('');
    setReplyTargetId(undefined);
    setReplyDraft('');
    setEditingCommentId(undefined);
    setEditingDraft('');
    viewedPostIdRef.current = undefined;
  }, [postId]);

  useEffect(() => {
    if (
      commentsPage > totalCommentPages &&
      !commentsQuery.isPending &&
      !commentsQuery.isError
    ) {
      setReplyTargetId(undefined);
      setReplyDraft('');
      setEditingCommentId(undefined);
      setEditingDraft('');
      setCommentsPage(totalCommentPages);
    }
  }, [
    commentsPage,
    commentsQuery.isError,
    commentsQuery.isPending,
    totalCommentPages,
  ]);

  useEffect(() => {
    if (replyTargetId && !findCommentById(comments, replyTargetId)) {
      resetReplyState();
    }

    if (editingCommentId && !findCommentById(comments, editingCommentId)) {
      resetEditingState();
    }
  }, [comments, editingCommentId, replyTargetId]);

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

  const handleCommentDraftChange = (nextValue: string) => {
    setCommentDraft(nextValue);
  };

  const handleReplyDraftChange = (nextValue: string) => {
    setReplyDraft(nextValue);
  };

  const handleEditingDraftChange = (nextValue: string) => {
    setEditingDraft(nextValue);
  };

  const handleSubmitComment = async () => {
    const normalizedComment = commentDraft.trim();

    if (!post || !normalizedComment) {
      return;
    }

    if (!isAuthenticated) {
      showToast('로그인 후 댓글을 작성할 수 있습니다.', 'info');

      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        postId: post.id,
        content: normalizedComment,
        idempotencyKey: createCommunityIdempotencyKey('community-comment'),
      });
      setCommentDraft('');
      if (commentsPage !== COMMUNITY_COMMENTS_PAGE) {
        resetPagedCommentInteractionState();
        setCommentsPage(COMMUNITY_COMMENTS_PAGE);
      }
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '댓글 등록에 실패했습니다.'),
        'error',
      );
    }
  };

  const handleOpenReply = (commentId: number) => {
    const targetComment = findCommentById(comments, commentId);

    if (!targetComment?.canReply) {
      if (!isAuthenticated) {
        showToast('로그인 후 답글을 작성할 수 있습니다.', 'info');
      }

      return;
    }

    setReplyTargetId(commentId);
    setReplyDraft('');
    setEditingCommentId(undefined);
    setEditingDraft('');
  };

  const handleCloseReply = () => {
    setReplyTargetId(undefined);
    setReplyDraft('');
  };

  const handleSubmitReply = async () => {
    const normalizedReply = replyDraft.trim();

    if (!post || !replyTargetId || !normalizedReply) {
      return;
    }

    if (!isAuthenticated) {
      showToast('로그인 후 답글을 작성할 수 있습니다.', 'info');

      return;
    }

    try {
      await createReplyMutation.mutateAsync({
        postId: post.id,
        commentId: replyTargetId,
        content: normalizedReply,
        idempotencyKey: createCommunityIdempotencyKey('community-reply'),
      });
      setReplyDraft('');
      setReplyTargetId(undefined);
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '답글 등록에 실패했습니다.'),
        'error',
      );
    }
  };

  const handleStartEditingComment = (commentId: number) => {
    const targetComment = findCommentById(comments, commentId);

    if (!targetComment?.canEdit) {
      return;
    }

    setEditingCommentId(commentId);
    setEditingDraft(targetComment.content);
    setReplyTargetId(undefined);
    setReplyDraft('');
  };

  const handleCancelEditingComment = () => {
    setEditingCommentId(undefined);
    setEditingDraft('');
  };

  const handleSubmitEditedComment = async () => {
    const normalizedContent = editingDraft.trim();

    if (!post || !editingCommentId || !normalizedContent) {
      return;
    }

    const targetComment = findCommentById(comments, editingCommentId);

    if (!targetComment?.revision) {
      return;
    }

    try {
      await updateCommentMutation.mutateAsync({
        postId: post.id,
        commentId: editingCommentId,
        revision: targetComment.revision,
        content: normalizedContent,
      });
      setEditingCommentId(undefined);
      setEditingDraft('');
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '댓글 수정에 실패했습니다.'),
        'error',
      );
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!post) {
      return;
    }

    const targetComment = findCommentById(comments, commentId);

    if (!targetComment?.revision || !targetComment.canDelete) {
      return;
    }

    try {
      await deleteCommentMutation.mutateAsync({
        postId: post.id,
        commentId,
        revision: targetComment.revision,
      });

      if (editingCommentId === commentId) {
        setEditingCommentId(undefined);
        setEditingDraft('');
      }

      if (replyTargetId === commentId) {
        setReplyTargetId(undefined);
        setReplyDraft('');
      }
    } catch (error) {
      showToast(
        getCommunityErrorMessage(error, '댓글 삭제에 실패했습니다.'),
        'error',
      );
    }
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

    resetPagedCommentInteractionState();
    setCommentsPage(normalizedPage);
  };

  const handleSharePost = async () => {
    const url = window.location.href;
    const title = post?.title ?? '';

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
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
      commentDraft,
      editingCommentId,
      editingDraft,
      commentsErrorMessage,
      isAuthenticated,
      isCommentsLoading: commentsQuery.isPending,
      isResolved,
      errorMessage: postErrorMessage,
      post: isNotFound ? undefined : post,
      replyDraft,
      replyTargetId,
    },
    actions: {
      handleCancelEditingComment,
      handleCommentPageChange,
      handleCloseReply,
      handleCommentDraftChange,
      handleDeleteComment,
      handleEditingDraftChange,
      handleOpenReply,
      handleReplyDraftChange,
      handleStartEditingComment,
      handleSubmitComment,
      handleSubmitEditedComment,
      handleSubmitReply,
      handleToggleCommentReaction,
      handleToggleLike,
      handleSharePost,
    },
    viewModel: {
      commentCount:
        commentsQuery.data?.totalCommentCount ?? post?.commentCount ?? 0,
      comments,
      currentCommentsPage,
      editingSubmitEnabled: editingDraft.trim().length > 0,
      isCommentSubmitEnabled: commentDraft.trim().length > 0,
      isLikedByViewer: post?.viewerReaction === 'like',
      isPostReactionEnabled: isAuthenticated,
      isReplySubmitEnabled: replyDraft.trim().length > 0,
      reactionCount: post?.reactionCount ?? 0,
      showCommentPagination: totalCommentPages > COMMUNITY_COMMENTS_PAGE,
      totalCommentPages,
    },
  };
};
