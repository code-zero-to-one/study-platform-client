import type { CommunityPost } from '@/types/community/domain';
import { getCommunityPostInteraction } from './community-detail-storage';
import {
  COMMUNITY_POSTS,
  getCommunityMockPostById,
} from './community-page-mock-data';

const COMMUNITY_LOCAL_POSTS_STORAGE_KEY = 'zeroone.community.local-posts';

const COMMUNITY_MOCK_POST_IDS = new Set(COMMUNITY_POSTS.map((post) => post.id));

const isCommunityPost = (value: unknown): value is CommunityPost => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<CommunityPost>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.board === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.summary === 'string' &&
    Array.isArray(candidate.content) &&
    (typeof candidate.contentHtml === 'string' ||
      typeof candidate.contentHtml === 'undefined') &&
    typeof candidate.authorName === 'string' &&
    typeof candidate.authorImage === 'string' &&
    typeof candidate.authorIntro === 'string' &&
    typeof candidate.role === 'string' &&
    typeof candidate.viewCount === 'number' &&
    typeof candidate.reactionCount === 'number' &&
    typeof candidate.commentCount === 'number' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.isTrending === 'boolean'
  );
};

const mergePostWithInteraction = (post: CommunityPost): CommunityPost => {
  const interaction = getCommunityPostInteraction(post.id);

  if (!interaction) {
    return post;
  }

  return {
    ...post,
    commentCount: interaction.commentCount,
    reactionCount: interaction.reactionCount,
  };
};

const readStoredCommunityPosts = (): readonly CommunityPost[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(
    COMMUNITY_LOCAL_POSTS_STORAGE_KEY,
  );

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isCommunityPost);
  } catch {
    return [];
  }
};

export const getCommunityPostsFromStorage = (): readonly CommunityPost[] =>
  readStoredCommunityPosts().map(mergePostWithInteraction);

export const getCommunityFeedPosts = (): readonly CommunityPost[] => [
  ...readStoredCommunityPosts().map(mergePostWithInteraction),
  ...COMMUNITY_POSTS.map(mergePostWithInteraction),
];

export const persistCommunityLocalPosts = (posts: readonly CommunityPost[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  const localPosts = posts.filter(
    (post) => !COMMUNITY_MOCK_POST_IDS.has(post.id),
  );

  window.localStorage.setItem(
    COMMUNITY_LOCAL_POSTS_STORAGE_KEY,
    JSON.stringify(localPosts),
  );
};

export const findCommunityPostById = (
  postId: number,
): CommunityPost | undefined => {
  const mockPost = getCommunityMockPostById(postId);

  if (mockPost) {
    return mergePostWithInteraction(mockPost);
  }

  const storedPost = readStoredCommunityPosts().find(
    (post) => post.id === postId,
  );

  return storedPost ? mergePostWithInteraction(storedPost) : undefined;
};
