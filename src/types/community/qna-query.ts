import type {
  CommunityQnaAnswerItem,
  CommunityQnaComment,
  CommunityQnaPageData,
  CommunityQnaQuestionDetailData,
  CommunityQnaQuestionStatus,
  CommunityQnaQuestionSummary,
} from './qna-domain';

export interface CommunityQnaQuestionListQueryInput {
  page: number;
  size: number;
  status: CommunityQnaQuestionStatus;
}

export interface CommunityQnaQuestionDetailQueryInput {
  questionId: number;
  answerPage: number;
  answerSize: number;
  commentPage: number;
  commentSize: number;
}

export interface CommunityQnaQuestionCommentsQueryInput {
  questionId: number;
  page: number;
  size: number;
}

export interface CommunityQnaAnswerCommentsQueryInput {
  answerId: number;
  page: number;
  size: number;
}

export type CommunityQnaQuestionListData =
  CommunityQnaPageData<CommunityQnaQuestionSummary>;

export type CommunityQnaQuestionCommentsData =
  CommunityQnaPageData<CommunityQnaComment>;

export type CommunityQnaAnswerCommentsData =
  CommunityQnaPageData<CommunityQnaComment>;

export type CommunityQnaAnswerListData =
  CommunityQnaPageData<CommunityQnaAnswerItem>;

export type CommunityQnaQuestionDetailDataQuery =
  CommunityQnaQuestionDetailData;

export const communityQnaQueryKeys = {
  all: ['community', 'qna'] as const,
  questions: () => [...communityQnaQueryKeys.all, 'questions'] as const,
  questionList: (params: CommunityQnaQuestionListQueryInput) =>
    [...communityQnaQueryKeys.questions(), 'list', params] as const,
  questionDetails: () =>
    [...communityQnaQueryKeys.all, 'question-details'] as const,
  questionDetailRoot: (questionId: number) =>
    [...communityQnaQueryKeys.questionDetails(), questionId] as const,
  questionDetail: (params: CommunityQnaQuestionDetailQueryInput) =>
    [
      ...communityQnaQueryKeys.questionDetailRoot(params.questionId),
      {
        answerPage: params.answerPage,
        answerSize: params.answerSize,
        commentPage: params.commentPage,
        commentSize: params.commentSize,
      },
    ] as const,
  questionComments: () =>
    [...communityQnaQueryKeys.all, 'question-comments'] as const,
  questionCommentsRoot: (questionId: number) =>
    [...communityQnaQueryKeys.questionComments(), questionId] as const,
  questionCommentsPage: (params: CommunityQnaQuestionCommentsQueryInput) =>
    [
      ...communityQnaQueryKeys.questionCommentsRoot(params.questionId),
      {
        page: params.page,
        size: params.size,
      },
    ] as const,
  answerComments: () =>
    [...communityQnaQueryKeys.all, 'answer-comments'] as const,
  answerCommentsRoot: (answerId: number) =>
    [...communityQnaQueryKeys.answerComments(), answerId] as const,
  answerCommentsPage: (params: CommunityQnaAnswerCommentsQueryInput) =>
    [
      ...communityQnaQueryKeys.answerCommentsRoot(params.answerId),
      {
        page: params.page,
        size: params.size,
      },
    ] as const,
};
