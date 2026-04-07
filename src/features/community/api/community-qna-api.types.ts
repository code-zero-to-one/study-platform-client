/* eslint-disable @rushstack/no-new-null -- backend JSON contract can explicitly return null for nullable fields. */
import type { CommunityMemberRole } from '@/types/community/domain';
import type {
  CommunityQnaCommentTargetType,
  CommunityQnaQuestionStatus,
} from '@/types/community/qna-domain';

export interface CommunityQnaBaseResponse<T> {
  content: T;
  errorCode?: string;
  errorName?: string;
  message?: string;
  statusCode?: number;
}

export interface CommunityQnaAuthorApiResponse {
  memberId?: number | null;
  name?: string | null;
  profileImageUrl?: string | null;
  role?: CommunityMemberRole | null;
}

export interface CommunityQnaQuestionStatsApiResponse {
  viewCount: number;
  answerCount: number;
  questionCommentCount: number;
  likeCount?: number;
}

export interface CommunityQnaQuestionSummaryApiResponse {
  questionId: number;
  revision: number;
  title: string;
  excerpt: string;
  previewImageUrl?: string | null;
  previewImageAlt?: string | null;
  author: CommunityQnaAuthorApiResponse;
  stats: CommunityQnaQuestionStatsApiResponse;
  accepted: boolean;
  myAnswerExists: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityQnaQuestionDetailApiResponse {
  questionId: number;
  revision: number;
  title: string;
  contentHtml: string;
  excerpt: string;
  previewImageUrl?: string | null;
  previewImageAlt?: string | null;
  author: CommunityQnaAuthorApiResponse;
  stats: CommunityQnaQuestionStatsApiResponse;
  acceptedAnswerId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityQnaQuestionViewerApiResponse {
  isAuthenticated: boolean;
  canEditQuestion: boolean;
  canDeleteQuestion: boolean;
  canCreateAnswer: boolean;
  canAcceptAnswer: boolean;
  myAnswerId?: number | null;
  questionReaction?: string | null;
}

export interface CommunityQnaCommentApiResponse {
  commentId: number;
  revision: number;
  targetType: CommunityQnaCommentTargetType;
  targetId: number;
  content: string;
  isDeleted: boolean;
  author: CommunityQnaAuthorApiResponse;
  viewer: {
    canEdit: boolean;
    canDelete: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommunityQnaAnswerApiResponse {
  answerId: number;
  revision: number;
  contentHtml: string;
  author: CommunityQnaAuthorApiResponse;
  stats: {
    commentCount: number;
    likeCount?: number;
  };
  isAccepted: boolean;
  viewer: {
    canEdit: boolean;
    canDelete: boolean;
    canComment: boolean;
    reaction?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommunityQnaPageApiResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type CommunityQnaQuestionListApiResponse =
  CommunityQnaPageApiResponse<CommunityQnaQuestionSummaryApiResponse>;

export type CommunityQnaQuestionCommentsPageApiResponse =
  CommunityQnaPageApiResponse<CommunityQnaCommentApiResponse>;

export type CommunityQnaAnswerCommentsPageApiResponse =
  CommunityQnaPageApiResponse<CommunityQnaCommentApiResponse>;

export type CommunityQnaAnswersPageApiResponse =
  CommunityQnaPageApiResponse<CommunityQnaAnswerApiResponse>;

export interface CommunityQnaQuestionDetailAggregateApiResponse {
  question: CommunityQnaQuestionDetailApiResponse;
  viewer: CommunityQnaQuestionViewerApiResponse;
  acceptedAnswer?: CommunityQnaAnswerApiResponse | null;
  questionCommentsPage: CommunityQnaQuestionCommentsPageApiResponse;
  answersPage: CommunityQnaAnswersPageApiResponse;
}

export interface CommunityQnaQuestionListQueryParams {
  page: number;
  size: number;
  status: CommunityQnaQuestionStatus;
}

export interface CommunityQnaQuestionDetailQueryParams {
  answerPage: number;
  answerSize: number;
  questionCommentPage: number;
  questionCommentSize: number;
}

export interface CommunityQnaQuestionUpsertRequest {
  title: string;
  contentHtml: string;
}

export interface CommunityQnaAnswerUpsertRequest {
  contentHtml: string;
}

export interface CommunityQnaCommentRequest {
  content: string;
}

export interface CommunityQnaQuestionDeleteApiResponse {
  questionId: number;
  deleteMode: string;
  deletedAt: string;
}

export interface CommunityQnaAnswerDeleteApiResponse {
  answerId: number;
  deleteMode: string;
  deletedAt: string;
}

export interface CommunityQnaCommentDeleteApiResponse {
  commentId: number;
  deleteMode: string;
  deletedAt: string;
}

export interface CommunityQnaAnswerMutationApiResponse {
  answer: CommunityQnaAnswerApiResponse;
  questionStats: {
    answerCount: number;
  };
}

export interface CommunityQnaAcceptanceApiResponse {
  questionId: number;
  acceptedAnswerId?: number | null;
  acceptedAt?: string | null;
}

export interface CommunityQnaReactionApiResponse {
  likeCount: number;
  reaction: string;
}

export interface CommunityQnaQuestionViewEventApiResponse {
  counted: boolean;
  viewCount: number;
}
