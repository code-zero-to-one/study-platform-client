import type { CommunityBoard, CommunityComment, CommunityPost } from './domain';

export interface CommunityFeedQueryInput {
  board: CommunityBoard | 'all';
  page: number;
  size: number;
}

export interface CommunityFeedData {
  popularItems: readonly CommunityPost[];
  items: readonly CommunityPost[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalPostCount: number;
}

export interface CommunityRelatedPostsQueryInput {
  postId: number;
  size: number;
}

export interface CommunityCommentsQueryInput {
  postId: number;
  page: number;
  size: number;
}

export interface CommunityCommentsPageData {
  items: readonly CommunityComment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalCommentCount: number;
}

export const communityQueryKeys = {
  all: ['community'] as const,
  feeds: () => [...communityQueryKeys.all, 'feeds'] as const,
  feed: (params: CommunityFeedQueryInput) =>
    [...communityQueryKeys.feeds(), params] as const,
  details: () => [...communityQueryKeys.all, 'details'] as const,
  detail: (postId: number) =>
    [...communityQueryKeys.details(), postId] as const,
  relatedPosts: () => [...communityQueryKeys.all, 'related-posts'] as const,
  relatedPostsByPost: (postId: number) =>
    [...communityQueryKeys.relatedPosts(), postId] as const,
  relatedPostList: (params: CommunityRelatedPostsQueryInput) =>
    [
      ...communityQueryKeys.relatedPostsByPost(params.postId),
      params.size,
    ] as const,
  comments: () => [...communityQueryKeys.all, 'comments'] as const,
  commentsByPost: (postId: number) =>
    [...communityQueryKeys.comments(), postId] as const,
  commentsPage: (params: CommunityCommentsQueryInput) =>
    [
      ...communityQueryKeys.commentsByPost(params.postId),
      {
        page: params.page,
        size: params.size,
      },
    ] as const,
};
