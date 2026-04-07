'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { isCommunityQnaNotFoundError } from '@/features/community/api/community-qna-api';
import { useCommunityQnaQuestionDetailQuery } from '@/features/community/model/use-community-qna-query';
import { analyzeError, ErrorType, type ErrorInfo } from '@/utils/error-handler';
import {
  COMMUNITY_DEFAULT_PAGE,
  normalizeCommunityPageParam,
} from './community-route';

const COMMUNITY_QNA_DEFAULT_ANSWER_PAGE_SIZE = 20;
const COMMUNITY_QNA_DEFAULT_COMMENT_PAGE_SIZE = 20;
const COMMUNITY_QNA_INVALID_AGGREGATE_MESSAGE =
  '질문 상세 응답 형식이 올바르지 않습니다.';

interface UseCommunityQnaDetailControllerParams {
  questionId: number;
  initialAnswerPage?: number;
  initialCommentPage?: number;
}

const buildNextSearch = ({
  currentSearchParams,
  answerPage,
  commentPage,
}: {
  currentSearchParams: URLSearchParams;
  answerPage?: number;
  commentPage?: number;
}) => {
  const nextSearchParams = new URLSearchParams(currentSearchParams.toString());

  if (answerPage && answerPage > COMMUNITY_DEFAULT_PAGE) {
    nextSearchParams.set('answerPage', String(answerPage));
  } else {
    nextSearchParams.delete('answerPage');
  }

  if (commentPage && commentPage > COMMUNITY_DEFAULT_PAGE) {
    nextSearchParams.set('commentPage', String(commentPage));
  } else {
    nextSearchParams.delete('commentPage');
  }

  return nextSearchParams.toString();
};

export const useCommunityQnaDetailController = ({
  questionId,
  initialAnswerPage = COMMUNITY_DEFAULT_PAGE,
  initialCommentPage = COMMUNITY_DEFAULT_PAGE,
}: UseCommunityQnaDetailControllerParams) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const answerPage =
    normalizeCommunityPageParam(searchParams.get('answerPage')) ??
    initialAnswerPage;
  const commentPage =
    normalizeCommunityPageParam(searchParams.get('commentPage')) ??
    initialCommentPage;
  const detailQuery = useCommunityQnaQuestionDetailQuery({
    questionId,
    answerPage,
    answerSize: COMMUNITY_QNA_DEFAULT_ANSWER_PAGE_SIZE,
    commentPage,
    commentSize: COMMUNITY_QNA_DEFAULT_COMMENT_PAGE_SIZE,
  });

  const replacePages = ({
    nextAnswerPage = answerPage,
    nextCommentPage = commentPage,
  }: {
    nextAnswerPage?: number;
    nextCommentPage?: number;
  }) => {
    const nextQuery = buildNextSearch({
      currentSearchParams: new URLSearchParams(searchParams.toString()),
      answerPage: nextAnswerPage,
      commentPage: nextCommentPage,
    });

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  const question = detailQuery.data?.question;
  const viewer = detailQuery.data?.viewer;
  const acceptedAnswer = detailQuery.data?.acceptedAnswer;
  const questionCommentsPageData = detailQuery.data?.questionCommentsPage;
  const answersPageData = detailQuery.data?.answersPage;
  const hasInvalidAggregate =
    detailQuery.isSuccess &&
    (!question || !viewer || !questionCommentsPageData || !answersPageData);
  const myAnswer = viewer?.myAnswerId
    ? answersPageData?.items.find((answer) => answer.id === viewer.myAnswerId)
    : undefined;
  const isNotFound =
    detailQuery.isError && isCommunityQnaNotFoundError(detailQuery.error);
  const errorInfo: Pick<ErrorInfo, 'type' | 'userMessage'> | undefined =
    isNotFound
      ? undefined
      : detailQuery.isError
        ? analyzeError(detailQuery.error)
        : hasInvalidAggregate
          ? {
              type: ErrorType.CLIENT,
              userMessage: COMMUNITY_QNA_INVALID_AGGREGATE_MESSAGE,
            }
          : undefined;

  const answerCtaDescription = !viewer?.isAuthenticated
    ? '로그인 후 답변을 작성할 수 있습니다.'
    : viewer.myAnswerId
      ? myAnswer
        ? '이미 답변을 작성했습니다. 내 답변 수정 또는 삭제를 진행할 수 있습니다.'
        : '이미 답변을 작성했습니다.'
      : viewer.canCreateAnswer
        ? '이 질문에 답변을 남겨 보세요.'
        : viewer.canAcceptAnswer
          ? undefined
          : '개발자 등록 사용자만 답변을 작성할 수 있습니다.';

  return {
    state: {
      question,
      viewer,
      acceptedAnswer,
      questionCommentsPageData,
      answersPageData,
      isResolved: detailQuery.isSuccess || detailQuery.isError,
      isNotFound,
      errorInfo,
    },
    actions: {
      handleAnswerPageChange: (nextPage: number) => {
        replacePages({ nextAnswerPage: nextPage });
      },
      handleCommentPageChange: (nextPage: number) => {
        replacePages({ nextCommentPage: nextPage });
      },
      refetchQuestionDetail: () => detailQuery.refetch(),
    },
    viewModel: {
      answerPage,
      commentPage,
      answerCtaDescription,
      answerCount: question?.stats.answerCount ?? 0,
      myAnswerId: viewer?.myAnswerId,
      questionCommentCount: question?.stats.questionCommentCount ?? 0,
      answerTotalPages: Math.max(
        answersPageData?.totalPages ?? COMMUNITY_DEFAULT_PAGE,
        COMMUNITY_DEFAULT_PAGE,
      ),
      commentTotalPages: Math.max(
        questionCommentsPageData?.totalPages ?? COMMUNITY_DEFAULT_PAGE,
        COMMUNITY_DEFAULT_PAGE,
      ),
      showAnswerPagination:
        (answersPageData?.totalPages ?? COMMUNITY_DEFAULT_PAGE) >
        COMMUNITY_DEFAULT_PAGE,
      showCommentPagination:
        (questionCommentsPageData?.totalPages ?? COMMUNITY_DEFAULT_PAGE) >
        COMMUNITY_DEFAULT_PAGE,
    },
  };
};
