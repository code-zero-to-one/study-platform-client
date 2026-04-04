'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getCommunityErrorMessage,
  isCommunityNotFoundError,
} from '@/features/community/api/community-api';
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
import { useCommunityPostDetailQuery } from './use-community-query';

interface UseCommunityDetailControllerParams {
  initialPost?: CommunityPost;
  postId: number;
}

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
  const fallbackPost = useMemo(
    () => findCommunityPostById(postId) ?? initialPost,
    [initialPost, postId],
  );
  const shouldUseServerDetail =
    fallbackPost?.origin !== COMMUNITY_POST_ORIGIN.LOCAL;
  const postDetailQuery = useCommunityPostDetailQuery(
    postId,
    shouldUseServerDetail,
  );
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

  useEffect(() => {
    if (shouldUseServerDetail && postDetailQuery.isPending && !fallbackPost) {
      setIsResolved(false);

      return;
    }

    const nextState = resolveDetailState(
      postId,
      postDetailQuery.data ?? fallbackPost,
      true,
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
    if (!post) {
      return;
    }

    persistCommunityPostInteraction({
      postId: post.id,
      comments,
      commentCount,
      isLikedByViewer,
      reactionCount,
    });
  }, [commentCount, comments, isLikedByViewer, post, reactionCount]);

  const handleToggleLike = () => {
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

    if (!normalizedComment) {
      return;
    }

    const nextComment = createViewerComment(normalizedComment);

    setComments((prevComments) => [nextComment, ...prevComments]);
    setCommentCount((prevCount) => prevCount + 1);
    setCommentDraft('');
  };

  const handleOpenReply = (commentId: number) => {
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
    if (!replyTargetId) {
      return;
    }

    const normalizedReply = replyDraft.trim();

    if (!normalizedReply) {
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
    const targetComment = findCommentById(comments, commentId);

    if (!targetComment) {
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

    setComments((prevComments) =>
      updateCommentContent(prevComments, editingCommentId, normalizedContent),
    );
    setEditingCommentId(undefined);
    setEditingDraft('');
  };

  const handleDeleteComment = (commentId: number) => {
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
    setComments((prevComments) =>
      updateCommentReaction(prevComments, commentId, nextReaction),
    );
  };

  return {
    state: {
      commentDraft,
      editingCommentId,
      editingDraft,
      errorMessage,
      isResolved,
      post,
      replyDraft,
      replyTargetId,
    },
    actions: {
      handleCancelEditingComment,
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
      commentCount,
      comments,
      editingSubmitEnabled: editingDraft.trim().length > 0,
      isCommentSubmitEnabled: commentDraft.trim().length > 0,
      isLikedByViewer,
      isReplySubmitEnabled: replyDraft.trim().length > 0,
      reactionCount,
    },
  };
};
