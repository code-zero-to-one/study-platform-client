import type { CommunityMemberRole } from './domain';

export const COMMUNITY_QNA_QUESTION_STATUS = {
  OPEN: 'open',
  ANSWERED: 'answered',
  RESOLVED: 'resolved',
  ALL: 'all',
} as const;

export type CommunityQnaQuestionStatus =
  (typeof COMMUNITY_QNA_QUESTION_STATUS)[keyof typeof COMMUNITY_QNA_QUESTION_STATUS];

export const COMMUNITY_QNA_COMMENT_TARGET_TYPE = {
  QUESTION: 'question',
  ANSWER: 'answer',
} as const;

export type CommunityQnaCommentTargetType =
  (typeof COMMUNITY_QNA_COMMENT_TARGET_TYPE)[keyof typeof COMMUNITY_QNA_COMMENT_TARGET_TYPE];

export interface CommunityQnaAuthor {
  memberId?: number;
  name: string;
  profileImageUrl: string;
  role: CommunityMemberRole;
}

export interface CommunityQnaQuestionStats {
  viewCount: number;
  answerCount: number;
  questionCommentCount: number;
}

export interface CommunityQnaQuestionSummary {
  id: number;
  revision: number;
  title: string;
  excerpt: string;
  previewImage?: string;
  previewImageAlt?: string;
  author: CommunityQnaAuthor;
  stats: CommunityQnaQuestionStats;
  accepted: boolean;
  myAnswerExists: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityQnaQuestionDetail {
  id: number;
  revision: number;
  title: string;
  contentHtml: string;
  excerpt: string;
  previewImage?: string;
  previewImageAlt?: string;
  author: CommunityQnaAuthor;
  stats: CommunityQnaQuestionStats;
  acceptedAnswerId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityQnaQuestionViewer {
  isAuthenticated: boolean;
  canEditQuestion: boolean;
  canDeleteQuestion: boolean;
  canCreateAnswer: boolean;
  canAcceptAnswer: boolean;
  myAnswerId?: number;
}

export interface CommunityQnaCommentViewer {
  canEdit: boolean;
  canDelete: boolean;
}

export interface CommunityQnaComment {
  id: number;
  revision: number;
  targetType: CommunityQnaCommentTargetType;
  targetId: number;
  content: string;
  isDeleted: boolean;
  author: CommunityQnaAuthor;
  viewer: CommunityQnaCommentViewer;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityQnaAnswerStats {
  commentCount: number;
}

export interface CommunityQnaAnswerViewer {
  canEdit: boolean;
  canDelete: boolean;
  canComment: boolean;
}

export interface CommunityQnaAnswerItem {
  id: number;
  revision: number;
  contentHtml: string;
  author: CommunityQnaAuthor;
  stats: CommunityQnaAnswerStats;
  isAccepted: boolean;
  viewer: CommunityQnaAnswerViewer;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityQnaPageData<T> {
  items: readonly T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CommunityQnaQuestionDetailData {
  question: CommunityQnaQuestionDetail;
  viewer: CommunityQnaQuestionViewer;
  questionCommentsPage: CommunityQnaPageData<CommunityQnaComment>;
  answersPage: CommunityQnaPageData<CommunityQnaAnswerItem>;
}

export interface CommunityQnaAnswerMutationData {
  answer: CommunityQnaAnswerItem;
  questionStats: {
    answerCount: number;
  };
}

export interface CommunityQnaDeleteResult {
  deleteMode: string;
  deletedAt: string;
}

export interface CommunityQnaQuestionDeleteResult
  extends CommunityQnaDeleteResult {
  questionId: number;
}

export interface CommunityQnaAnswerDeleteResult
  extends CommunityQnaDeleteResult {
  answerId: number;
}

export interface CommunityQnaCommentDeleteResult
  extends CommunityQnaDeleteResult {
  commentId: number;
}

export interface CommunityQnaAcceptanceData {
  questionId: number;
  acceptedAnswerId?: number;
  acceptedAt?: string;
}

export interface CommunityQnaQuestionViewEvent {
  counted: boolean;
  viewCount: number;
}
