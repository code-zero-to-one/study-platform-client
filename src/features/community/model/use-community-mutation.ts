'use client';

import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  assignCommunityCommentReaction,
  assignCommunityPostReaction,
  createCommunityComment,
  createCommunityPost,
  createCommunityReply,
  deleteCommunityComment,
  deleteCommunityPost,
  recordCommunityPostView,
  updateCommunityComment,
  updateCommunityPost,
} from '@/features/community/api/community-api';
import { mapCommunityComment } from '@/features/community/model/community-api.mapper';
import {
  COMMUNITY_COMMENT_REACTION,
  type CommunityComment,
  type CommunityPost,
} from '@/types/community/domain';
import type {
  CommunityCommentsPageData,
  CommunityFeedData,
} from '@/types/community/query';
import { communityQueryKeys } from '@/types/community/query';

const invalidateCommunityFeedQueries = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: communityQueryKeys.feeds(),
  });
};

const updateCommunityPostViewCount = (
  post: CommunityPost,
  postId: number,
  viewCount: number,
) => {
  if (post.id !== postId) {
    return post;
  }

  return {
    ...post,
    viewCount,
  };
};

const updateCommunityPostReaction = (
  post: CommunityPost,
  postId: number,
  reactionCount: number,
  viewerReaction: CommunityPost['viewerReaction'],
) => {
  if (post.id !== postId) {
    return post;
  }

  return {
    ...post,
    reactionCount,
    viewerReaction,
  };
};

const updateCommunityPostCommentCount = (
  post: CommunityPost,
  postId: number,
  commentCount: number,
) => {
  if (post.id !== postId) {
    return post;
  }

  return {
    ...post,
    commentCount,
  };
};

const updateCommunityFeedViewCount = (
  current: CommunityFeedData | undefined,
  postId: number,
  viewCount: number,
) => {
  if (!current) {
    return current;
  }

  return {
    ...current,
    popularItems: current.popularItems.map((post) =>
      updateCommunityPostViewCount(post, postId, viewCount),
    ),
    items: current.items.map((post) =>
      updateCommunityPostViewCount(post, postId, viewCount),
    ),
  };
};

const updateCommunityFeedReactionCount = (
  current: CommunityFeedData | undefined,
  postId: number,
  reactionCount: number,
  viewerReaction: CommunityPost['viewerReaction'],
) => {
  if (!current) {
    return current;
  }

  return {
    ...current,
    popularItems: current.popularItems.map((post) =>
      updateCommunityPostReaction(post, postId, reactionCount, viewerReaction),
    ),
    items: current.items.map((post) =>
      updateCommunityPostReaction(post, postId, reactionCount, viewerReaction),
    ),
  };
};

const updateCommunityFeedCommentCount = (
  current: CommunityFeedData | undefined,
  postId: number,
  commentCount: number,
) => {
  if (!current) {
    return current;
  }

  return {
    ...current,
    popularItems: current.popularItems.map((post) =>
      updateCommunityPostCommentCount(post, postId, commentCount),
    ),
    items: current.items.map((post) =>
      updateCommunityPostCommentCount(post, postId, commentCount),
    ),
  };
};

const updateCommunityRelatedPostCommentCount = (
  current: readonly CommunityPost[] | undefined,
  postId: number,
  commentCount: number,
) => {
  if (!current) {
    return current;
  }

  return current.map((post) =>
    updateCommunityPostCommentCount(post, postId, commentCount),
  );
};

const invalidateCommunityPostQueries = (
  queryClient: QueryClient,
  postId: number,
) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: communityQueryKeys.detail(postId),
    }),
    queryClient.invalidateQueries({
      queryKey: communityQueryKeys.relatedPostsByPost(postId),
    }),
    queryClient.invalidateQueries({
      queryKey: communityQueryKeys.commentsByPost(postId),
    }),
  ]);
};

const updateCommunityCommentTree = (
  comments: readonly CommunityComment[],
  commentId: number,
  updater: (comment: CommunityComment) => CommunityComment,
): readonly CommunityComment[] => {
  let changed = false;

  const nextComments = comments.map((comment) => {
    if (comment.id === commentId) {
      const updatedComment = updater(comment);

      if (updatedComment !== comment) {
        changed = true;
      }

      return updatedComment;
    }

    if (comment.replies.length === 0) {
      return comment;
    }

    const nextReplies = updateCommunityCommentTree(
      comment.replies,
      commentId,
      updater,
    );

    if (nextReplies === comment.replies) {
      return comment;
    }

    changed = true;

    return {
      ...comment,
      replies: nextReplies,
    };
  });

  return changed ? nextComments : comments;
};

const normalizeCommunityCommentReaction = (
  value?: string,
): CommunityComment['viewerReaction'] => {
  return value === COMMUNITY_COMMENT_REACTION.LIKE ||
    value === COMMUNITY_COMMENT_REACTION.DISLIKE
    ? value
    : COMMUNITY_COMMENT_REACTION.NONE;
};

const updateCommunityCommentsPageData = (
  current: CommunityCommentsPageData | undefined,
  updater: (page: CommunityCommentsPageData) => CommunityCommentsPageData,
) => {
  if (!current) {
    return current;
  }

  return updater(current);
};

const updateCommunityCommentsTotalCount = (
  queryClient: QueryClient,
  postId: number,
  totalCommentCount: number,
) => {
  queryClient.setQueriesData<CommunityCommentsPageData>(
    { queryKey: communityQueryKeys.commentsByPost(postId) },
    (current) =>
      updateCommunityCommentsPageData(current, (page) => ({
        ...page,
        totalCommentCount,
        totalPages: Math.max(1, Math.ceil(totalCommentCount / page.size)),
      })),
  );
};

const setCommunityPostCommentCount = (
  queryClient: QueryClient,
  postId: number,
  commentCount: number,
) => {
  queryClient.setQueriesData(
    { queryKey: communityQueryKeys.detail(postId) },
    (current: CommunityPost | undefined) => {
      if (!current) {
        return current;
      }

      return updateCommunityPostCommentCount(current, postId, commentCount);
    },
  );

  queryClient.setQueriesData<CommunityFeedData>(
    { queryKey: communityQueryKeys.feeds() },
    (current) => updateCommunityFeedCommentCount(current, postId, commentCount),
  );

  queryClient.setQueriesData<readonly CommunityPost[]>(
    { queryKey: communityQueryKeys.relatedPostsByPost(postId) },
    (current) =>
      updateCommunityRelatedPostCommentCount(current, postId, commentCount),
  );

  updateCommunityCommentsTotalCount(queryClient, postId, commentCount);
};

export const useCreateCommunityPostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      request,
      idempotencyKey,
    }: {
      request: Parameters<typeof createCommunityPost>[0];
      idempotencyKey: Parameters<typeof createCommunityPost>[1];
    }) => createCommunityPost(request, idempotencyKey),
    onError: () => {},
    onSuccess: () => {
      invalidateCommunityFeedQueries(queryClient).catch(() => {});
    },
  });
};

export const useUpdateCommunityPostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      revision,
      request,
    }: {
      postId: number;
      revision: number;
      request: Parameters<typeof updateCommunityPost>[2];
    }) => updateCommunityPost(postId, revision, request),
    onError: () => {},
    onSuccess: (_, variables) => {
      Promise.all([
        invalidateCommunityFeedQueries(queryClient),
        invalidateCommunityPostQueries(queryClient, variables.postId),
      ]).catch(() => {});
    },
  });
};

export const useDeleteCommunityPostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, revision }: { postId: number; revision: number }) =>
      deleteCommunityPost(postId, revision),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityFeedQueries(queryClient),
        invalidateCommunityPostQueries(queryClient, variables.postId),
      ]);
    },
  });
};

export const useRecordCommunityPostViewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => recordCommunityPostView(postId),
    onError: () => {},
    onSuccess: (response, postId) => {
      queryClient.setQueriesData(
        { queryKey: communityQueryKeys.detail(postId) },
        (current: CommunityPost | undefined) => {
          if (!current) {
            return current;
          }

          return updateCommunityPostViewCount(
            current,
            postId,
            response.viewCount,
          );
        },
      );

      queryClient.setQueriesData<CommunityFeedData>(
        { queryKey: communityQueryKeys.feeds() },
        (current) =>
          updateCommunityFeedViewCount(current, postId, response.viewCount),
      );
    },
  });
};

export const useAssignCommunityPostReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      type,
    }: {
      postId: number;
      type: Parameters<typeof assignCommunityPostReaction>[1]['type'];
    }) => assignCommunityPostReaction(postId, { type }),
    onError: () => {},
    onSuccess: async (response, variables) => {
      const nextViewerReaction =
        response.myPostReaction === 'like' ? 'like' : 'none';

      queryClient.setQueriesData(
        { queryKey: communityQueryKeys.detail(variables.postId) },
        (current: CommunityPost | undefined) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            reactionCount: response.likeCount,
            viewerReaction: nextViewerReaction,
          };
        },
      );

      queryClient.setQueriesData<CommunityFeedData>(
        { queryKey: communityQueryKeys.feeds() },
        (current) =>
          updateCommunityFeedReactionCount(
            current,
            variables.postId,
            response.likeCount,
            nextViewerReaction,
          ),
      );
    },
  });
};

export const useCreateCommunityCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      content,
      idempotencyKey,
    }: {
      postId: number;
      content: string;
      idempotencyKey: string;
    }) => createCommunityComment(postId, { content }, idempotencyKey),
    onError: () => {},
    onSuccess: async (response, variables) => {
      setCommunityPostCommentCount(
        queryClient,
        variables.postId,
        response.postCommentCount,
      );

      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.commentsByPost(variables.postId),
      });
    },
  });
};

export const useCreateCommunityReplyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      content,
      idempotencyKey,
    }: {
      postId: number;
      commentId: number;
      content: string;
      idempotencyKey: string;
    }) => createCommunityReply(postId, commentId, { content }, idempotencyKey),
    onError: () => {},
    onSuccess: async (response, variables) => {
      setCommunityPostCommentCount(
        queryClient,
        variables.postId,
        response.postCommentCount,
      );

      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.commentsByPost(variables.postId),
      });
    },
  });
};

export const useUpdateCommunityCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      revision,
      content,
    }: {
      postId: number;
      commentId: number;
      revision: number;
      content: string;
    }) => updateCommunityComment(postId, commentId, revision, { content }),
    onError: () => {},
    onSuccess: async (response, variables) => {
      const nextComment = mapCommunityComment(response.comment);

      queryClient.setQueriesData<CommunityCommentsPageData>(
        { queryKey: communityQueryKeys.commentsByPost(variables.postId) },
        (current) =>
          updateCommunityCommentsPageData(current, (page) => {
            const nextItems = updateCommunityCommentTree(
              page.items,
              variables.commentId,
              () => nextComment,
            );

            if (nextItems === page.items) {
              return page;
            }

            return {
              ...page,
              items: nextItems,
            };
          }),
      );
    },
  });
};

export const useDeleteCommunityCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      revision,
    }: {
      postId: number;
      commentId: number;
      revision: number;
    }) => deleteCommunityComment(postId, commentId, revision),
    onError: () => {},
    onSuccess: async (response, variables) => {
      setCommunityPostCommentCount(
        queryClient,
        variables.postId,
        response.postCommentCount,
      );

      queryClient.setQueriesData<CommunityCommentsPageData>(
        { queryKey: communityQueryKeys.commentsByPost(variables.postId) },
        (current) =>
          updateCommunityCommentsPageData(current, (page) => {
            const nextItems = updateCommunityCommentTree(
              page.items,
              variables.commentId,
              () => mapCommunityComment(response.comment),
            );

            if (nextItems === page.items) {
              return page;
            }

            return {
              ...page,
              items: nextItems,
            };
          }),
      );

      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.commentsByPost(variables.postId),
      });
    },
  });
};

export const useAssignCommunityCommentReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      type,
    }: {
      postId: number;
      commentId: number;
      type: Parameters<typeof assignCommunityCommentReaction>[2]['type'];
    }) => assignCommunityCommentReaction(postId, commentId, { type }),
    onError: () => {},
    onSuccess: async (response, variables) => {
      queryClient.setQueriesData<CommunityCommentsPageData>(
        { queryKey: communityQueryKeys.commentsByPost(variables.postId) },
        (current) =>
          updateCommunityCommentsPageData(current, (page) => {
            const nextItems = updateCommunityCommentTree(
              page.items,
              variables.commentId,
              (comment) => ({
                ...comment,
                likeCount: response.likeCount,
                dislikeCount: response.dislikeCount,
                viewerReaction: normalizeCommunityCommentReaction(
                  response.myCommentReaction ?? undefined,
                ),
              }),
            );

            if (nextItems === page.items) {
              return page;
            }

            return {
              ...page,
              items: nextItems,
            };
          }),
      );
    },
  });
};
