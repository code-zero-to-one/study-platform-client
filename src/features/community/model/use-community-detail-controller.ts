'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  createCommunityIdempotencyKey,
  getCommunityErrorMessage,
  isCommunityNotFoundError,
} from '@/features/community/api/community-api';
import { useToastStore } from '@/stores/use-toast-store';
import {
  COMMUNITY_COMMENT_REACTION,
  COMMUNITY_POST_ORIGIN,
  type CommunityComment,
  type CommunityCommentReaction,
  type CommunityPost,
} from '@/types/community/domain';
import {
  getCommunityPostInteraction,
  persistCommunityPostInteraction,
} from './community-detail-storage';
import {
  COMMUNITY_MOCK_AUTHOR,
  getCommunityMockCommentsByPostId,
} from './community-page-mock-data';
import { findCommunityPostById } from './community-post-storage';
import {
  useAssignCommunityCommentReactionMutation,
  useAssignCommunityPostReactionMutation,
  useCreateCommunityCommentMutation,
  useCreateCommunityReplyMutation,
  useDeleteCommunityCommentMutation,
  useRecordCommunityPostViewMutation,
  useUpdateCommunityCommentMutation,
} from './use-community-mutation';
import {
  useCommunityCommentsQuery,
  useCommunityPostDetailQuery,
} from './use-community-query';

interface UseCommunityDetailControllerParams {
  initialPost?: CommunityPost;
  postId: number;
}

const COMMUNITY_COMMENTS_PAGE = 1;
const COMMUNITY_COMMENTS_PAGE_SIZE = 20;
const EMPTY_COMMENTS: readonly CommunityComment[] = [];

const createCommentId = () => Date.now() + Math.floor(Math.random() * 1000);

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

const insertReply = (
  comments: readonly CommunityComment[],
  parentCommentId: number,
  nextReply: CommunityComment,
): readonly CommunityComment[] =>
  comments.map((comment) => {
    if (comment.id === parentCommentId) {
      return {
        ...comment,
        replies: [...comment.replies, nextReply],
      };
    }

    if (comment.replies.length === 0) {
      return comment;
    }

    return {
      ...comment,
      replies: insertReply(comment.replies, parentCommentId, nextReply),
    };
  });

const updateCommentReaction = (
  comments: readonly CommunityComment[],
  commentId: number,
  nextReaction: CommunityCommentReaction,
): readonly CommunityComment[] =>
  comments.map((comment) => {
    if (comment.id === commentId) {
      const isLikeRequest = nextReaction === COMMUNITY_COMMENT_REACTION.LIKE;
      const isDislikeRequest =
        nextReaction === COMMUNITY_COMMENT_REACTION.DISLIKE;
      const isRemovingCurrentReaction = comment.viewerReaction === nextReaction;

      return {
        ...comment,
        likeCount: isRemovingCurrentReaction
          ? Math.max(
              0,
              comment.likeCount -
                (comment.viewerReaction === COMMUNITY_COMMENT_REACTION.LIKE
                  ? 1
                  : 0),
            )
          : Math.max(
              0,
              comment.likeCount +
                (isLikeRequest ? 1 : 0) -
                (comment.viewerReaction === COMMUNITY_COMMENT_REACTION.LIKE
                  ? 1
                  : 0),
            ),
        dislikeCount: isRemovingCurrentReaction
          ? Math.max(
              0,
              comment.dislikeCount -
                (comment.viewerReaction === COMMUNITY_COMMENT_REACTION.DISLIKE
                  ? 1
                  : 0),
            )
          : Math.max(
              0,
              comment.dislikeCount +
                (isDislikeRequest ? 1 : 0) -
                (comment.viewerReaction === COMMUNITY_COMMENT_REACTION.DISLIKE
                  ? 1
                  : 0),
            ),
        viewerReaction: isRemovingCurrentReaction ? undefined : nextReaction,
      };
    }

    if (comment.replies.length === 0) {
      return comment;
    }

    return {
      ...comment,
      replies: updateCommentReaction(comment.replies, commentId, nextReaction),
    };
  });

const updateCommentContent = (
  comments: readonly CommunityComment[],
  commentId: number,
  nextContent: string,
): readonly CommunityComment[] =>
  comments.map((comment) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        content: nextContent,
        isEdited: true,
      };
    }

    if (comment.replies.length === 0) {
      return comment;
    }

    return {
      ...comment,
      replies: updateCommentContent(comment.replies, commentId, nextContent),
    };
  });

const removeComment = (
  comments: readonly CommunityComment[],
  commentId: number,
): {
  deletedCount: number;
  nextComments: readonly CommunityComment[];
} => {
  let deletedCount = 0;

  const countNestedComments = (targets: readonly CommunityComment[]): number =>
    targets.reduce(
      (accumulator, target) =>
        accumulator + 1 + countNestedComments(target.replies),
      0,
    );

  const nextComments = comments.flatMap((comment) => {
    if (comment.id === commentId) {
      deletedCount += 1 + countNestedComments(comment.replies);

      return [];
    }

    if (comment.replies.length === 0) {
      return [comment];
    }

    const nextReplies = removeComment(comment.replies, commentId);

    deletedCount += nextReplies.deletedCount;

    return [
      {
        ...comment,
        replies: nextReplies.nextComments,
      },
    ];
  });

  return {
    deletedCount,
    nextComments,
  };
};

const resolveDetailPost = (postId: number, fallbackPost?: CommunityPost) => {
  if (fallbackPost?.origin === COMMUNITY_POST_ORIGIN.API) {
    return fallbackPost;
  }

  return findCommunityPostById(postId) ?? fallbackPost;
};

const resolveDetailState = (
  postId: number,
  fallbackPost?: CommunityPost,
  useStoredInteraction = false,
): {
  comments: readonly CommunityComment[];
  commentCount: number;
  isLikedByViewer: boolean;
  post?: CommunityPost;
  reactionCount: number;
} => {
  const resolvedPost = useStoredInteraction
    ? resolveDetailPost(postId, fallbackPost)
    : fallbackPost;
  const storedInteraction = useStoredInteraction
    ? getCommunityPostInteraction(postId)
    : undefined;

  return {
    post: resolvedPost,
    comments:
      storedInteraction?.comments ?? getCommunityMockCommentsByPostId(postId),
    commentCount:
      storedInteraction?.commentCount ?? resolvedPost?.commentCount ?? 0,
    isLikedByViewer:
      storedInteraction?.isLikedByViewer ??
      resolvedPost?.viewerReaction === 'like',
    reactionCount:
      storedInteraction?.reactionCount ?? resolvedPost?.reactionCount ?? 0,
  };
};

const createViewerComment = (content: string): CommunityComment => ({
  id: createCommentId(),
  authorName: COMMUNITY_MOCK_AUTHOR.name,
  authorImage: COMMUNITY_MOCK_AUTHOR.image,
  authorRole: COMMUNITY_MOCK_AUTHOR.role,
  content,
  createdAt: '방금',
  isAuthor: true,
  likeCount: 0,
  dislikeCount: 0,
  viewerReaction: undefined,
  replies: [],
});

export const useCommunityDetailController = ({
  initialPost,
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
  const fallbackPost = useMemo(
    () => findCommunityPostById(postId) ?? initialPost,
    [initialPost, postId],
  );
  const [commentsPage, setCommentsPage] = useState(COMMUNITY_COMMENTS_PAGE);
  const shouldUseServerDetail =
    fallbackPost?.origin !== COMMUNITY_POST_ORIGIN.LOCAL;
  const postDetailQuery = useCommunityPostDetailQuery(
    postId,
    shouldUseServerDetail,
  );
  const commentsQuery = useCommunityCommentsQuery({
    postId,
    page: commentsPage,
    size: COMMUNITY_COMMENTS_PAGE_SIZE,
    enabled:
      shouldUseServerDetail &&
      (postDetailQuery.data?.origin === COMMUNITY_POST_ORIGIN.API ||
        fallbackPost?.origin === COMMUNITY_POST_ORIGIN.API),
  });
  const initialState = resolveDetailState(postId, fallbackPost);

  const [post, setPost] = useState<CommunityPost | undefined>(
    initialState.post,
  );
  const [isResolved, setIsResolved] = useState(Boolean(initialState.post));
  const [comments, setComments] = useState<readonly CommunityComment[]>(
    initialState.comments,
  );
  const [commentCount, setCommentCount] = useState(initialState.commentCount);
  const [reactionCount, setReactionCount] = useState(
    initialState.reactionCount,
  );
  const [isLikedByViewer, setIsLikedByViewer] = useState(
    initialState.isLikedByViewer,
  );
  const [commentDraft, setCommentDraft] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<number | undefined>();
  const [replyDraft, setReplyDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<
    number | undefined
  >();
  const [editingDraft, setEditingDraft] = useState('');
  const errorMessage =
    postDetailQuery.isError &&
    !fallbackPost &&
    !isCommunityNotFoundError(postDetailQuery.error)
      ? getCommunityErrorMessage(
          postDetailQuery.error,
          '글을 불러오지 못했습니다.',
        )
      : undefined;
  const isServerPost = post?.origin === COMMUNITY_POST_ORIGIN.API;
  const activeComments = isServerPost
    ? (commentsQuery.data?.items ?? EMPTY_COMMENTS)
    : comments;
  const currentCommentsPage = isServerPost
    ? (commentsQuery.data?.page ?? commentsPage)
    : COMMUNITY_COMMENTS_PAGE;
  const totalCommentPages = isServerPost
    ? Math.max(
        commentsQuery.data?.totalPages ?? COMMUNITY_COMMENTS_PAGE,
        COMMUNITY_COMMENTS_PAGE,
      )
    : COMMUNITY_COMMENTS_PAGE;
  const activeCommentCount = isServerPost
    ? (commentsQuery.data?.totalCommentCount ?? post?.commentCount ?? 0)
    : commentCount;
  const activeReactionCount = isServerPost
    ? (post?.reactionCount ?? 0)
    : reactionCount;
  const activeIsLikedByViewer = isServerPost
    ? post?.viewerReaction === 'like'
    : isLikedByViewer;
  const commentsErrorMessage =
    isServerPost && commentsQuery.isError
      ? getCommunityErrorMessage(
          commentsQuery.error,
          '댓글을 불러오지 못했습니다.',
        )
      : undefined;
  const isCommentsLoading = isServerPost && commentsQuery.isPending;
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
    if (shouldUseServerDetail && postDetailQuery.isPending && !fallbackPost) {
      setIsResolved(false);

      return;
    }

    const nextResolvedPost = postDetailQuery.data ?? fallbackPost;
    const nextState = resolveDetailState(
      postId,
      nextResolvedPost,
      nextResolvedPost?.origin !== COMMUNITY_POST_ORIGIN.API,
    );

    setPost(nextState.post);
    setComments(nextState.comments);
    setCommentCount(nextState.commentCount);
    setReactionCount(nextState.reactionCount);
    setIsLikedByViewer(nextState.isLikedByViewer);
    setCommentDraft('');
    setReplyDraft('');
    setReplyTargetId(undefined);
    setEditingCommentId(undefined);
    setEditingDraft('');
    setIsResolved(true);
  }, [
    fallbackPost,
    postDetailQuery.data,
    postDetailQuery.isPending,
    postId,
    shouldUseServerDetail,
  ]);

  useEffect(() => {
    if (!post || isServerPost) {
      return;
    }

    persistCommunityPostInteraction({
      postId: post.id,
      comments,
      commentCount,
      isLikedByViewer,
      reactionCount,
    });
  }, [
    commentCount,
    comments,
    isLikedByViewer,
    isServerPost,
    post,
    reactionCount,
  ]);

  useEffect(() => {
    setCommentsPage(COMMUNITY_COMMENTS_PAGE);
    viewedPostIdRef.current = undefined;
  }, [postId]);

  useEffect(() => {
    if (replyTargetId && !findCommentById(activeComments, replyTargetId)) {
      resetReplyState();
    }

    if (
      editingCommentId &&
      !findCommentById(activeComments, editingCommentId)
    ) {
      resetEditingState();
    }
  }, [activeComments, editingCommentId, replyTargetId]);

  useEffect(() => {
    if (!isServerPost || !post || viewedPostIdRef.current === post.id) {
      return;
    }

    viewedPostIdRef.current = post.id;
    recordPostViewMutation.mutate(post.id);
  }, [isServerPost, post, recordPostViewMutation]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      showToast('로그인 후 좋아요를 누를 수 있습니다.', 'info');

      return;
    }

    if (!post) {
      return;
    }

    if (isServerPost) {
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

      return;
    }

    const nextLikedState = !isLikedByViewer;

    setIsLikedByViewer(nextLikedState);
    setReactionCount((prevCount) =>
      nextLikedState ? prevCount + 1 : Math.max(0, prevCount - 1),
    );
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

  const handleSubmitComment = () => {
    const normalizedComment = commentDraft.trim();

    if (!normalizedComment || !isAuthenticated || !post) {
      if (!isAuthenticated) {
        showToast('로그인 후 댓글을 작성할 수 있습니다.', 'info');
      }

      return;
    }

    if (isServerPost) {
      createCommentMutation
        .mutateAsync({
          postId: post.id,
          content: normalizedComment,
          idempotencyKey: createCommunityIdempotencyKey('community-comment'),
        })
        .then(() => {
          setCommentDraft('');

          if (commentsPage !== COMMUNITY_COMMENTS_PAGE) {
            resetPagedCommentInteractionState();
            setCommentsPage(COMMUNITY_COMMENTS_PAGE);
          }
        })
        .catch((error) => {
          showToast(
            getCommunityErrorMessage(error, '댓글 등록에 실패했습니다.'),
            'error',
          );
        });

      return;
    }

    const nextComment = createViewerComment(normalizedComment);

    setComments((prevComments) => [nextComment, ...prevComments]);
    setCommentCount((prevCount) => prevCount + 1);
    setCommentDraft('');
  };

  const handleOpenReply = (commentId: number) => {
    if (!isAuthenticated) {
      showToast('로그인 후 답글을 작성할 수 있습니다.', 'info');

      return;
    }

    const targetComment = findCommentById(activeComments, commentId);

    if (isServerPost && !targetComment?.canReply) {
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

  const handleSubmitReply = () => {
    if (!replyTargetId || !post) {
      return;
    }

    const normalizedReply = replyDraft.trim();

    if (!normalizedReply || !isAuthenticated) {
      if (!isAuthenticated) {
        showToast('로그인 후 답글을 작성할 수 있습니다.', 'info');
      }

      return;
    }

    if (isServerPost) {
      createReplyMutation
        .mutateAsync({
          postId: post.id,
          commentId: replyTargetId,
          content: normalizedReply,
          idempotencyKey: createCommunityIdempotencyKey('community-reply'),
        })
        .then(() => {
          setReplyDraft('');
          setReplyTargetId(undefined);
        })
        .catch((error) => {
          showToast(
            getCommunityErrorMessage(error, '답글 등록에 실패했습니다.'),
            'error',
          );
        });

      return;
    }

    const nextReply = createViewerComment(normalizedReply);

    setComments((prevComments) =>
      insertReply(prevComments, replyTargetId, nextReply),
    );
    setCommentCount((prevCount) => prevCount + 1);
    setReplyDraft('');
    setReplyTargetId(undefined);
  };

  const handleStartEditingComment = (commentId: number) => {
    if (!isAuthenticated) {
      showToast('로그인 후 댓글을 수정할 수 있습니다.', 'info');

      return;
    }

    const targetComment = findCommentById(activeComments, commentId);

    if (!targetComment || (isServerPost && !targetComment.canEdit)) {
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

  const handleSubmitEditedComment = () => {
    if (!editingCommentId) {
      return;
    }

    const normalizedContent = editingDraft.trim();

    if (!normalizedContent) {
      return;
    }

    if (isServerPost) {
      if (!post) {
        return;
      }

      const targetComment = findCommentById(activeComments, editingCommentId);

      if (!targetComment?.revision) {
        return;
      }

      updateCommentMutation
        .mutateAsync({
          postId: post.id,
          commentId: editingCommentId,
          revision: targetComment.revision,
          content: normalizedContent,
        })
        .then(() => {
          setEditingCommentId(undefined);
          setEditingDraft('');
        })
        .catch((error) => {
          showToast(
            getCommunityErrorMessage(error, '댓글 수정에 실패했습니다.'),
            'error',
          );
        });

      return;
    }

    setComments((prevComments) =>
      updateCommentContent(prevComments, editingCommentId, normalizedContent),
    );
    setEditingCommentId(undefined);
    setEditingDraft('');
  };

  const handleDeleteComment = (commentId: number) => {
    if (!isAuthenticated) {
      showToast('로그인 후 댓글을 삭제할 수 있습니다.', 'info');

      return;
    }

    if (isServerPost) {
      if (!post) {
        return;
      }

      const targetComment = findCommentById(activeComments, commentId);

      if (!targetComment?.revision || !targetComment.canDelete) {
        return;
      }

      deleteCommentMutation
        .mutateAsync({
          postId: post.id,
          commentId,
          revision: targetComment.revision,
        })
        .then(() => {
          if (replyTargetId === commentId) {
            resetReplyState();
          }

          if (editingCommentId === commentId) {
            resetEditingState();
          }
        })
        .catch((error) => {
          showToast(
            getCommunityErrorMessage(error, '댓글 삭제에 실패했습니다.'),
            'error',
          );
        });

      return;
    }

    const nextState = removeComment(comments, commentId);

    if (nextState.deletedCount === 0) {
      return;
    }

    setComments(nextState.nextComments);
    setCommentCount((prevCount) =>
      Math.max(0, prevCount - nextState.deletedCount),
    );

    if (
      replyTargetId &&
      !findCommentById(nextState.nextComments, replyTargetId)
    ) {
      setReplyTargetId(undefined);
      setReplyDraft('');
    }

    if (
      editingCommentId &&
      !findCommentById(nextState.nextComments, editingCommentId)
    ) {
      setEditingCommentId(undefined);
      setEditingDraft('');
    }
  };

  const handleToggleCommentReaction = (
    commentId: number,
    nextReaction: CommunityCommentReaction,
  ) => {
    if (!isAuthenticated) {
      showToast('로그인 후 댓글 반응을 남길 수 있습니다.', 'info');

      return;
    }

    if (isServerPost) {
      if (!post) {
        return;
      }

      const targetComment = findCommentById(activeComments, commentId);

      if (!targetComment || targetComment.isDeleted) {
        return;
      }

      assignCommentReactionMutation
        .mutateAsync({
          postId: post.id,
          commentId,
          type:
            targetComment.viewerReaction === nextReaction
              ? 'none'
              : nextReaction,
        })
        .catch((error) => {
          showToast(
            getCommunityErrorMessage(error, '댓글 반응 처리에 실패했습니다.'),
            'error',
          );
        });

      return;
    }

    setComments((prevComments) =>
      updateCommentReaction(prevComments, commentId, nextReaction),
    );
  };
  const handleCommentPageChange = (nextPage: number) => {
    if (!isServerPost) {
      return;
    }

    const normalizedPage = Math.max(nextPage, COMMUNITY_COMMENTS_PAGE);

    if (normalizedPage === commentsPage) {
      return;
    }

    resetPagedCommentInteractionState();
    setCommentsPage(normalizedPage);
  };

  return {
    state: {
      commentDraft,
      commentsErrorMessage,
      editingCommentId,
      editingDraft,
      errorMessage,
      isAuthenticated,
      isCommentsLoading,
      isResolved,
      post,
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
    },
    viewModel: {
      commentCount: activeCommentCount,
      comments: activeComments,
      currentCommentsPage,
      editingSubmitEnabled: editingDraft.trim().length > 0,
      isCommentSubmitEnabled: commentDraft.trim().length > 0,
      isLikedByViewer: activeIsLikedByViewer,
      isPostReactionEnabled: isAuthenticated,
      isReplySubmitEnabled: replyDraft.trim().length > 0,
      reactionCount: activeReactionCount,
      showCommentPagination: isServerPost && totalCommentPages > 1,
      totalCommentPages,
    },
  };
};
