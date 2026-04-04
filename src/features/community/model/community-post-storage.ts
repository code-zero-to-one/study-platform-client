import {
  COMMUNITY_POST_ORIGIN,
  type CommunityPost,
} from '@/types/community/domain';
import { getCommunityPostInteraction } from './community-detail-storage';
import { COMMUNITY_MOCK_AUTHOR } from './community-page-mock-data';
import {
  COMMUNITY_POSTS,
  getCommunityMockPostById,
} from './community-page-mock-data';

const COMMUNITY_LOCAL_POSTS_STORAGE_KEY = 'zeroone.community.local-posts';
const COMMUNITY_POSTS_CHANGE_EVENT = 'zeroone.community.posts.changed';

const COMMUNITY_MOCK_POST_IDS = new Set(COMMUNITY_POSTS.map((post) => post.id));

const normalizeCommunityPost = (value: unknown): CommunityPost | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as Partial<CommunityPost>;

  if (
    typeof candidate.id !== 'number' ||
    typeof candidate.board !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.summary !== 'string' ||
    !Array.isArray(candidate.content) ||
    (typeof candidate.contentHtml !== 'string' &&
      typeof candidate.contentHtml !== 'undefined') ||
    typeof candidate.authorName !== 'string' ||
    typeof candidate.authorImage !== 'string' ||
    typeof candidate.authorIntro !== 'string' ||
    typeof candidate.role !== 'string' ||
    typeof candidate.viewCount !== 'number' ||
    typeof candidate.reactionCount !== 'number' ||
    typeof candidate.commentCount !== 'number' ||
    typeof candidate.createdAt !== 'string' ||
    typeof candidate.isTrending !== 'boolean'
  ) {
    return undefined;
  }

  return {
    ...candidate,
    origin:
      candidate.origin === COMMUNITY_POST_ORIGIN.MOCK
        ? COMMUNITY_POST_ORIGIN.MOCK
        : COMMUNITY_POST_ORIGIN.LOCAL,
    authorMemberId:
      typeof candidate.authorMemberId === 'number'
        ? candidate.authorMemberId
        : COMMUNITY_MOCK_AUTHOR.memberId,
  } as CommunityPost;
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

    return parsedValue
      .map(normalizeCommunityPost)
      .filter((post): post is CommunityPost => Boolean(post));
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

  const localPosts = posts
    .filter((post) => !COMMUNITY_MOCK_POST_IDS.has(post.id))
    .map((post) => ({
      ...post,
      origin: COMMUNITY_POST_ORIGIN.LOCAL,
    }));

  window.localStorage.setItem(
    COMMUNITY_LOCAL_POSTS_STORAGE_KEY,
    JSON.stringify(localPosts),
  );

  window.dispatchEvent(new Event(COMMUNITY_POSTS_CHANGE_EVENT));
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

export const findCommunityLocalPostById = (
  postId: number,
): CommunityPost | undefined =>
  readStoredCommunityPosts()
    .map(mergePostWithInteraction)
    .find((post) => post.id === postId);

export const updateCommunityLocalPost = (nextPost: CommunityPost) => {
  const storedPosts = readStoredCommunityPosts();
  const postIndex = storedPosts.findIndex((post) => post.id === nextPost.id);

  if (postIndex < 0) {
    return undefined;
  }

  const updatedPost = {
    ...nextPost,
    origin: COMMUNITY_POST_ORIGIN.LOCAL,
  };
  const nextPosts = [...storedPosts];

  nextPosts[postIndex] = updatedPost;
  persistCommunityLocalPosts(nextPosts);

  return mergePostWithInteraction(updatedPost);
};

export const deleteCommunityLocalPost = (postId: number) => {
  const storedPosts = readStoredCommunityPosts();
  const nextPosts = storedPosts.filter((post) => post.id !== postId);

  if (nextPosts.length === storedPosts.length) {
    return false;
  }

  persistCommunityLocalPosts(nextPosts);

  return true;
};

export const subscribeCommunityPostsChange = (
  onChange: () => void,
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleChange = () => {
    onChange();
  };

  window.addEventListener(COMMUNITY_POSTS_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener(COMMUNITY_POSTS_CHANGE_EVENT, handleChange);
  };
};
