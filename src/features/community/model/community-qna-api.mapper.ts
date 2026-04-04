import {
  COMMUNITY_MEMBER_ROLE,
  type CommunityMemberRole,
} from '@/types/community/domain';
import {
  COMMUNITY_QNA_COMMENT_TARGET_TYPE,
  type CommunityQnaAcceptanceData,
  type CommunityQnaAnswerItem,
  type CommunityQnaAnswerMutationData,
  type CommunityQnaAuthor,
  type CommunityQnaComment,
  type CommunityQnaCommentDeleteResult,
  type CommunityQnaPageData,
  type CommunityQnaQuestionDeleteResult,
  type CommunityQnaQuestionDetail,
  type CommunityQnaQuestionDetailData,
  type CommunityQnaQuestionSummary,
  type CommunityQnaQuestionViewEvent,
} from '@/types/community/qna-domain';
import { formatKoreaRelativeTime } from '@/utils/time';
import type {
  CommunityQnaAcceptanceApiResponse,
  CommunityQnaAnswerApiResponse,
  CommunityQnaAnswerCommentsPageApiResponse,
  CommunityQnaAnswerDeleteApiResponse,
  CommunityQnaAnswerMutationApiResponse,
  CommunityQnaAuthorApiResponse,
  CommunityQnaCommentApiResponse,
  CommunityQnaCommentDeleteApiResponse,
  CommunityQnaPageApiResponse,
  CommunityQnaQuestionCommentsPageApiResponse,
  CommunityQnaQuestionDeleteApiResponse,
  CommunityQnaQuestionDetailAggregateApiResponse,
  CommunityQnaQuestionDetailApiResponse,
  CommunityQnaQuestionListApiResponse,
  CommunityQnaQuestionSummaryApiResponse,
  CommunityQnaQuestionViewEventApiResponse,
} from '../api/community-qna-api.types';

const COMMUNITY_QNA_AUTHOR_FALLBACK_NAME = '알 수 없는 사용자';
const COMMUNITY_MEMBER_ROLE_SET = new Set(Object.values(COMMUNITY_MEMBER_ROLE));

const normalizeRole = (value?: string): CommunityMemberRole => {
  return COMMUNITY_MEMBER_ROLE_SET.has(value as CommunityMemberRole)
    ? (value as CommunityMemberRole)
    : COMMUNITY_MEMBER_ROLE.UNKNOWN;
};

const normalizeAuthorName = (value?: string) => {
  const normalizedValue = value?.trim();

  return normalizedValue || COMMUNITY_QNA_AUTHOR_FALLBACK_NAME;
};

const toDisplayTime = (value?: string) => {
  if (!value) {
    return '';
  }

  return formatKoreaRelativeTime(value);
};

export const mapCommunityQnaAuthor = (
  response: CommunityQnaAuthorApiResponse,
): CommunityQnaAuthor => ({
  memberId: response.memberId ?? undefined,
  name: normalizeAuthorName(response.name ?? undefined),
  profileImageUrl: response.profileImageUrl ?? '',
  role: normalizeRole(response.role ?? undefined),
});

export const mapCommunityQnaQuestionSummary = (
  response: CommunityQnaQuestionSummaryApiResponse,
): CommunityQnaQuestionSummary => ({
  id: response.questionId,
  revision: response.revision,
  title: response.title,
  excerpt: response.excerpt ?? '',
  author: mapCommunityQnaAuthor(response.author),
  stats: {
    viewCount: response.stats.viewCount,
    answerCount: response.stats.answerCount,
    questionCommentCount: response.stats.questionCommentCount,
  },
  accepted: response.accepted,
  myAnswerExists: response.myAnswerExists,
  createdAt: toDisplayTime(response.createdAt),
  updatedAt: response.updatedAt,
});

export const mapCommunityQnaQuestionDetail = (
  response: CommunityQnaQuestionDetailApiResponse,
): CommunityQnaQuestionDetail => ({
  id: response.questionId,
  revision: response.revision,
  title: response.title,
  contentHtml: response.contentHtml,
  excerpt: response.excerpt ?? '',
  author: mapCommunityQnaAuthor(response.author),
  stats: {
    viewCount: response.stats.viewCount,
    answerCount: response.stats.answerCount,
    questionCommentCount: response.stats.questionCommentCount,
  },
  acceptedAnswerId: response.acceptedAnswerId ?? undefined,
  createdAt: toDisplayTime(response.createdAt),
  updatedAt: response.updatedAt,
});

export const mapCommunityQnaComment = (
  response: CommunityQnaCommentApiResponse,
): CommunityQnaComment => ({
  id: response.commentId,
  revision: response.revision,
  targetType:
    response.targetType === COMMUNITY_QNA_COMMENT_TARGET_TYPE.ANSWER
      ? COMMUNITY_QNA_COMMENT_TARGET_TYPE.ANSWER
      : COMMUNITY_QNA_COMMENT_TARGET_TYPE.QUESTION,
  targetId: response.targetId,
  content: response.content,
  isDeleted: response.isDeleted,
  author: mapCommunityQnaAuthor(response.author),
  viewer: {
    canEdit: response.viewer.canEdit,
    canDelete: response.viewer.canDelete,
  },
  createdAt: toDisplayTime(response.createdAt),
  updatedAt: response.updatedAt,
});

export const mapCommunityQnaAnswerItem = (
  response: CommunityQnaAnswerApiResponse,
): CommunityQnaAnswerItem => ({
  id: response.answerId,
  revision: response.revision,
  contentHtml: response.contentHtml,
  author: mapCommunityQnaAuthor(response.author),
  stats: {
    commentCount: response.stats.commentCount,
  },
  isAccepted: response.isAccepted,
  viewer: {
    canEdit: response.viewer.canEdit,
    canDelete: response.viewer.canDelete,
    canComment: response.viewer.canComment,
  },
  createdAt: toDisplayTime(response.createdAt),
  updatedAt: response.updatedAt,
});

const mapCommunityQnaPage = <TApi, TDomain>(
  response: CommunityQnaPageApiResponse<TApi>,
  mapItem: (item: TApi) => TDomain,
): CommunityQnaPageData<TDomain> => ({
  items: response.items.map(mapItem),
  page: response.page,
  size: response.size,
  totalElements: response.totalElements,
  totalPages: response.totalPages,
  hasNext: response.hasNext,
  hasPrevious: response.hasPrevious,
});

export const mapCommunityQnaQuestionList = (
  response: CommunityQnaQuestionListApiResponse,
) => mapCommunityQnaPage(response, mapCommunityQnaQuestionSummary);

export const mapCommunityQnaQuestionCommentsPage = (
  response: CommunityQnaQuestionCommentsPageApiResponse,
) => mapCommunityQnaPage(response, mapCommunityQnaComment);

export const mapCommunityQnaAnswerCommentsPage = (
  response: CommunityQnaAnswerCommentsPageApiResponse,
) => mapCommunityQnaPage(response, mapCommunityQnaComment);

export const mapCommunityQnaQuestionDetailAggregate = (
  response: CommunityQnaQuestionDetailAggregateApiResponse,
): CommunityQnaQuestionDetailData => ({
  question: mapCommunityQnaQuestionDetail(response.question),
  viewer: {
    isAuthenticated: response.viewer.isAuthenticated,
    canEditQuestion: response.viewer.canEditQuestion,
    canDeleteQuestion: response.viewer.canDeleteQuestion,
    canCreateAnswer: response.viewer.canCreateAnswer,
    canAcceptAnswer: response.viewer.canAcceptAnswer,
    myAnswerId: response.viewer.myAnswerId ?? undefined,
  },
  questionCommentsPage: mapCommunityQnaQuestionCommentsPage(
    response.questionCommentsPage,
  ),
  answersPage: mapCommunityQnaPage(
    response.answersPage,
    mapCommunityQnaAnswerItem,
  ),
});

export const mapCommunityQnaAnswerMutation = (
  response: CommunityQnaAnswerMutationApiResponse,
): CommunityQnaAnswerMutationData => ({
  answer: mapCommunityQnaAnswerItem(response.answer),
  questionStats: {
    answerCount: response.questionStats.answerCount,
  },
});

export const mapCommunityQnaQuestionDeleteResult = (
  response: CommunityQnaQuestionDeleteApiResponse,
): CommunityQnaQuestionDeleteResult => ({
  questionId: response.questionId,
  deleteMode: response.deleteMode,
  deletedAt: response.deletedAt,
});

export const mapCommunityQnaAnswerDeleteResult = (
  response: CommunityQnaAnswerDeleteApiResponse,
) => ({
  answerId: response.answerId,
  deleteMode: response.deleteMode,
  deletedAt: response.deletedAt,
});

export const mapCommunityQnaCommentDeleteResult = (
  response: CommunityQnaCommentDeleteApiResponse,
): CommunityQnaCommentDeleteResult => ({
  commentId: response.commentId,
  deleteMode: response.deleteMode,
  deletedAt: response.deletedAt,
});

export const mapCommunityQnaAcceptance = (
  response: CommunityQnaAcceptanceApiResponse,
): CommunityQnaAcceptanceData => ({
  questionId: response.questionId,
  acceptedAnswerId: response.acceptedAnswerId ?? undefined,
  acceptedAt: response.acceptedAt ?? undefined,
});

export const mapCommunityQnaQuestionViewEvent = (
  response: CommunityQnaQuestionViewEventApiResponse,
): CommunityQnaQuestionViewEvent => ({
  counted: response.counted,
  viewCount: response.viewCount,
});
