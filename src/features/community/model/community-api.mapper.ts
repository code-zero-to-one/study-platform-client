import {
  COMMUNITY_COMMENT_REACTION,
  COMMUNITY_MEMBER_ROLE,
  COMMUNITY_POST_ORIGIN,
  COMMUNITY_UNSUPPORTED_BOARD,
  type CommunityComment,
  type CommunityCommentReaction,
  type CommunityMemberRole,
  type CommunityPost,
  type CommunityPostBoard,
  type CommunityPostReaction,
  isCommunityBoard,
} from '@/types/community/domain';
import { formatKoreaRelativeTime } from '@/utils/time';
import type {
  CommunityCommentApiResponse,
  CommunityCommentPageApiResponse,
  CommunityPostDetailApiResponse,
  CommunityPostFeedApiResponse,
  CommunityPostSummaryApiResponse,
} from '../api/community-api.types';

const COMMUNITY_MEMBER_ROLE_SET = new Set(Object.values(COMMUNITY_MEMBER_ROLE));
const COMMUNITY_AUTHOR_FALLBACK_NAME = '알 수 없는 사용자';
const warnedUnsupportedBoards = new Set<string>();

const warnUnsupportedBoard = (value: string) => {
  if (
    process.env.NODE_ENV === 'production' ||
    warnedUnsupportedBoards.has(value)
  ) {
    return;
  }

  warnedUnsupportedBoards.add(value);
  console.warn(
    `[community] 지원하지 않는 board literal을 받았습니다: ${value}`,
  );
};

const normalizeBoard = (value: string): CommunityPostBoard => {
  if (isCommunityBoard(value)) {
    return value;
  }

  warnUnsupportedBoard(value);

  return COMMUNITY_UNSUPPORTED_BOARD;
};

const normalizeRole = (value?: string): CommunityMemberRole => {
  return COMMUNITY_MEMBER_ROLE_SET.has(value as CommunityMemberRole)
    ? (value as CommunityMemberRole)
    : COMMUNITY_MEMBER_ROLE.UNKNOWN;
};

const normalizePostReaction = (value?: string): CommunityPostReaction =>
  value === 'like' || value === 'none' ? value : 'none';

const normalizeCommentReaction = (value?: string): CommunityCommentReaction => {
  return value === COMMUNITY_COMMENT_REACTION.LIKE ||
    value === COMMUNITY_COMMENT_REACTION.DISLIKE ||
    value === COMMUNITY_COMMENT_REACTION.NONE
    ? value
    : COMMUNITY_COMMENT_REACTION.NONE;
};

const toDisplayTime = (value?: string) => {
  if (!value) {
    return '';
  }

  return formatKoreaRelativeTime(value);
};

const toExcerptParagraphs = (excerpt?: string) => {
  if (!excerpt?.trim()) {
    return [];
  }

  return [excerpt.trim()];
};

const normalizeAuthorName = (value?: string) => {
  const normalizedValue = value?.trim();

  return normalizedValue || COMMUNITY_AUTHOR_FALLBACK_NAME;
};

export const mapCommunityPostSummary = (
  response: CommunityPostSummaryApiResponse,
  options?: {
    isTrending?: boolean;
  },
): CommunityPost => ({
  id: response.postId,
  origin: COMMUNITY_POST_ORIGIN.API,
  board: normalizeBoard(response.board),
  title: response.title,
  summary: response.excerpt ?? '',
  content: toExcerptParagraphs(response.excerpt),
  contentHtml: undefined,
  previewImage: response.previewImageUrl ?? undefined,
  previewImageAlt: response.previewImageAlt ?? undefined,
  authorMemberId: response.author.memberId ?? undefined,
  authorName: normalizeAuthorName(response.author.name ?? undefined),
  authorImage: response.author.profileImageUrl ?? '',
  authorIntro: '',
  role: normalizeRole(response.author.role),
  viewCount: response.stats.viewCount,
  reactionCount: response.stats.likeCount,
  commentCount: response.stats.commentCount,
  createdAt: toDisplayTime(response.createdAt),
  updatedAt: response.updatedAt,
  isTrending: options?.isTrending ?? false,
  canEdit: response.viewer.canEdit,
  canDelete: response.viewer.canDelete,
  viewerReaction: undefined,
});

export const mapCommunityPostDetail = (
  response: CommunityPostDetailApiResponse,
): CommunityPost => ({
  id: response.postId,
  origin: COMMUNITY_POST_ORIGIN.API,
  revision: response.revision,
  board: normalizeBoard(response.board),
  title: response.title,
  summary: response.excerpt ?? '',
  content: toExcerptParagraphs(response.excerpt),
  contentHtml: response.contentHtml,
  previewImage: response.previewImageUrl ?? undefined,
  previewImageAlt: response.previewImageAlt ?? undefined,
  authorMemberId: response.author.memberId ?? undefined,
  authorName: normalizeAuthorName(response.author.name ?? undefined),
  authorImage: response.author.profileImageUrl ?? '',
  authorIntro: response.author.intro ?? '',
  role: normalizeRole(response.author.role),
  viewCount: response.stats.viewCount,
  reactionCount: response.stats.likeCount,
  commentCount: response.stats.commentCount,
  createdAt: toDisplayTime(response.createdAt),
  updatedAt: response.updatedAt,
  isTrending: false,
  canEdit: response.viewer.canEdit,
  canDelete: response.viewer.canDelete,
  viewerReaction: normalizePostReaction(response.viewer.myPostReaction),
});

export const mapCommunityComment = (
  response: CommunityCommentApiResponse,
): CommunityComment => ({
  id: response.commentId,
  revision: response.revision,
  parentCommentId: response.parentCommentId ?? undefined,
  depth: response.depth,
  authorMemberId: response.author.memberId ?? undefined,
  authorName: normalizeAuthorName(response.author.name ?? undefined),
  authorImage: response.author.profileImageUrl ?? '',
  authorRole: normalizeRole(response.author.role),
  content: response.content,
  createdAt: toDisplayTime(response.createdAt),
  updatedAt: response.updatedAt,
  isAuthor: response.viewer.canEdit || response.viewer.canDelete,
  isDeleted: response.isDeleted,
  isEdited: response.isEdited,
  canEdit: response.viewer.canEdit,
  canDelete: response.viewer.canDelete,
  canReply: response.viewer.canReply,
  likeCount: response.stats.likeCount,
  dislikeCount: response.stats.dislikeCount,
  viewerReaction: normalizeCommentReaction(response.viewer.myCommentReaction),
  replyCount: response.stats.replyCount,
  replies: response.replies.map(mapCommunityComment),
});

export const mapCommunityFeed = (response: CommunityPostFeedApiResponse) => ({
  popularItems: response.popularItems.map((item) =>
    mapCommunityPostSummary(item, { isTrending: true }),
  ),
  items: response.items.map((item) => mapCommunityPostSummary(item)),
  page: response.page,
  size: response.size,
  totalElements: response.totalElements,
  totalPages: response.totalPages,
  hasNext: response.hasNext,
  hasPrevious: response.hasPrevious,
  totalPostCount: response.totalPostCount,
});

export const mapCommunityCommentsPage = (
  response: CommunityCommentPageApiResponse,
) => ({
  items: response.items.map(mapCommunityComment),
  page: response.page,
  size: response.size,
  totalElements: response.totalElements,
  totalPages: response.totalPages,
  hasNext: response.hasNext,
  hasPrevious: response.hasPrevious,
  totalCommentCount: response.totalCommentCount,
});
