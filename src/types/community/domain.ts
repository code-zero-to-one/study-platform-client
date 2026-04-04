export const COMMUNITY_BOARD = {
  QNA: 'qna',
  FREE: 'free',
  ACHIEVEMENT: 'achievement',
  KNOWLEDGE: 'knowledge',
} as const;

export type CommunityBoard =
  (typeof COMMUNITY_BOARD)[keyof typeof COMMUNITY_BOARD];

export const COMMUNITY_FEED_FILTER = {
  ALL: 'all',
  QNA: 'qna',
  FREE: 'free',
  ACHIEVEMENT: 'achievement',
  KNOWLEDGE: 'knowledge',
  POPULAR: 'popular',
} as const;

export type CommunityFeedFilter =
  (typeof COMMUNITY_FEED_FILTER)[keyof typeof COMMUNITY_FEED_FILTER];

export const COMMUNITY_MEMBER_ROLE = {
  NEWCOMER: 'newcomer',
  DEVELOPER: 'developer',
  MENTOR: 'mentor',
} as const;

export type CommunityMemberRole =
  (typeof COMMUNITY_MEMBER_ROLE)[keyof typeof COMMUNITY_MEMBER_ROLE];

export const COMMUNITY_COMMENT_REACTION = {
  LIKE: 'like',
  DISLIKE: 'dislike',
} as const;

export type CommunityCommentReaction =
  (typeof COMMUNITY_COMMENT_REACTION)[keyof typeof COMMUNITY_COMMENT_REACTION];

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
  board: CommunityBoard;
  title: string;
  summary: string;
  content: readonly string[];
  contentHtml?: string;
  previewImage?: string;
  previewImageAlt?: string;
  authorMemberId: number;
  authorName: string;
  authorImage: string;
  authorIntro: string;
  role: CommunityMemberRole;
  viewCount: number;
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  isTrending: boolean;
}

export interface CommunityComment {
  id: number;
  authorName: string;
  authorImage: string;
  authorRole: CommunityMemberRole;
  content: string;
  createdAt: string;
  isAuthor: boolean;
  isEdited?: boolean;
  likeCount: number;
  dislikeCount: number;
  viewerReaction?: CommunityCommentReaction;
  replies: readonly CommunityComment[];
}
