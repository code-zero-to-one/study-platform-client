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
import type { CommunityPost } from '@/types/community/domain';
import type { CommunityFeedData } from '@/types/community/query';
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
    onSuccess: async () => {
      await invalidateCommunityFeedQueries(queryClient);
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
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityFeedQueries(queryClient),
        invalidateCommunityPostQueries(queryClient, variables.postId),
      ]);
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
      queryClient.setQueriesData(
        { queryKey: communityQueryKeys.detail(variables.postId) },
        (current: CommunityPost | undefined) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            reactionCount: response.likeCount,
            viewerReaction:
              response.myPostReaction === 'like' ? 'like' : 'none',
          };
        },
      );

      await invalidateCommunityFeedQueries(queryClient);
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
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityFeedQueries(queryClient),
        invalidateCommunityPostQueries(queryClient, variables.postId),
      ]);
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
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityFeedQueries(queryClient),
        invalidateCommunityPostQueries(queryClient, variables.postId),
      ]);
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
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.commentsByPost(variables.postId),
      });
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
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityFeedQueries(queryClient),
        invalidateCommunityPostQueries(queryClient, variables.postId),
      ]);
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
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.commentsByPost(variables.postId),
      });
    },
  });
};
