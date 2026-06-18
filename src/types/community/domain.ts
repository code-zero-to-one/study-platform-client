export const COMMUNITY_BOARD = {
  QNA: 'qna',
  FREE: 'free',
  ACHIEVEMENT: 'achievement',
  KNOWLEDGE: 'knowledge',
} as const;

export type CommunityBoard =
  (typeof COMMUNITY_BOARD)[keyof typeof COMMUNITY_BOARD];

const COMMUNITY_BOARD_SET = new Set<string>(Object.values(COMMUNITY_BOARD));

export const COMMUNITY_UNSUPPORTED_BOARD = 'unsupported' as const;

export type CommunityPostBoard =
  | CommunityBoard
  | typeof COMMUNITY_UNSUPPORTED_BOARD;

export const isCommunityBoard = (value: string): value is CommunityBoard =>
  COMMUNITY_BOARD_SET.has(value);

export const COMMUNITY_FEED_FILTER = {
  ALL: 'all',
  QNA: 'qna',
  FREE: 'free',
  ACHIEVEMENT: 'achievement',
  KNOWLEDGE: 'knowledge',
} as const;

export type CommunityFeedFilter =
  (typeof COMMUNITY_FEED_FILTER)[keyof typeof COMMUNITY_FEED_FILTER];

export const COMMUNITY_MEMBER_ROLE = {
  NEWCOMER: 'newcomer',
  DEVELOPER: 'developer',
  MENTOR: 'mentor',
  UNKNOWN: 'unknown',
} as const;

export type CommunityMemberRole =
  (typeof COMMUNITY_MEMBER_ROLE)[keyof typeof COMMUNITY_MEMBER_ROLE];

export const COMMUNITY_COMMENT_REACTION = {
  LIKE: 'like',
  DISLIKE: 'dislike',
  NONE: 'none',
} as const;

export const COMMUNITY_POST_ORIGIN = {
  API: 'api',
  LOCAL: 'local',
  MOCK: 'mock',
} as const;

export type CommunityCommentReaction =
  (typeof COMMUNITY_COMMENT_REACTION)[keyof typeof COMMUNITY_COMMENT_REACTION];
export type CommunityCommentReactionSelection = Exclude<
  CommunityCommentReaction,
  typeof COMMUNITY_COMMENT_REACTION.NONE
>;
export type CommunityPostOrigin =
  (typeof COMMUNITY_POST_ORIGIN)[keyof typeof COMMUNITY_POST_ORIGIN];
export type CommunityPostReaction = 'like' | 'none';

export interface CommunityFeedFilterOption {
  id: CommunityFeedFilter;
  label: string;
}

export const COMMUNITY_FEED_VIEW = {
  LIST: 'list',
  CARD: 'card',
} as const;

export type CommunityFeedView =
  (typeof COMMUNITY_FEED_VIEW)[keyof typeof COMMUNITY_FEED_VIEW];

export interface CommunityFeedViewOption {
  id: CommunityFeedView;
  label: string;
}

export interface CommunityBoardOption {
  id: CommunityBoard;
  label: string;
}

export interface CommunityPost {
  id: number;
  origin: CommunityPostOrigin;
  revision?: number;
  board: CommunityPostBoard;
  title: string;
  summary: string;
  content: readonly string[];
  contentHtml?: string;
  previewImage?: string;
  previewImageAlt?: string;
  authorMemberId?: number;
  authorName: string;
  authorImage: string;
  authorIntro: string;
  role: CommunityMemberRole;
  viewCount: number;
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt?: string;
  isTrending: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  viewerReaction?: CommunityPostReaction;
}

export interface CommunityComment {
  id: number;
  revision?: number;
  parentCommentId?: number;
  depth?: number;
  authorMemberId?: number;
  authorName: string;
  authorImage: string;
  authorRole: CommunityMemberRole;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isAuthor: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canReply?: boolean;
  likeCount: number;
  dislikeCount: number;
  viewerReaction: CommunityCommentReaction;
  replyCount?: number;
  replies: readonly CommunityComment[];
}
