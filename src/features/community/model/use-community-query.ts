'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCommunityComments,
  getCommunityFeed,
  getCommunityPostDetail,
  getCommunityRelatedPosts,
} from '@/features/community/api/community-api';
import {
  mapCommunityCommentsPage,
  mapCommunityFeed,
  mapCommunityPostDetail,
  mapCommunityPostSummary,
} from '@/features/community/model/community-api.mapper';
import type {
  CommunityCommentsQueryInput,
  CommunityFeedQueryInput,
  CommunityRelatedPostsQueryInput,
} from '@/types/community/query';
import { communityQueryKeys } from '@/types/community/query';

const COMMUNITY_QUERY_STALE_TIME = 60_000;
const COMMUNITY_QUERY_GC_TIME = 5 * 60_000;

export const useCommunityFeedQuery = (
  params: CommunityFeedQueryInput,
  enabled = true,
) => {
  return useQuery({
    queryKey: communityQueryKeys.feed(params),
    queryFn: async () => mapCommunityFeed(await getCommunityFeed(params)),
    staleTime: COMMUNITY_QUERY_STALE_TIME,
    gcTime: COMMUNITY_QUERY_GC_TIME,
    enabled,
  });
};

export const useCommunityPostDetailQuery = (postId: number, enabled = true) => {
  return useQuery({
    queryKey: communityQueryKeys.detail(postId),
    queryFn: async () =>
      mapCommunityPostDetail(await getCommunityPostDetail(postId)),
    staleTime: COMMUNITY_QUERY_STALE_TIME,
    gcTime: COMMUNITY_QUERY_GC_TIME,
    retry: false,
    enabled: enabled && postId > 0,
  });
};

export const useCommunityRelatedPostsQuery = ({
  postId,
  size,
  enabled = true,
}: CommunityRelatedPostsQueryInput & { enabled?: boolean }) => {
  return useQuery({
    queryKey: communityQueryKeys.relatedPostList({ postId, size }),
    queryFn: async () => {
      const response = await getCommunityRelatedPosts(postId, size);

      return response.map((post) => mapCommunityPostSummary(post));
    },
    staleTime: COMMUNITY_QUERY_STALE_TIME,
    gcTime: COMMUNITY_QUERY_GC_TIME,
    enabled: enabled && postId > 0,
  });
};

export const useCommunityCommentsQuery = ({
  postId,
  page,
  size,
  enabled = true,
}: CommunityCommentsQueryInput & { enabled?: boolean }) => {
  return useQuery({
    queryKey: communityQueryKeys.commentsPage({ postId, page, size }),
    queryFn: async () =>
      mapCommunityCommentsPage(await getCommunityComments(postId, page, size)),
    staleTime: COMMUNITY_QUERY_STALE_TIME,
    gcTime: COMMUNITY_QUERY_GC_TIME,
    retry: false,
    enabled: enabled && postId > 0,
  });
};
