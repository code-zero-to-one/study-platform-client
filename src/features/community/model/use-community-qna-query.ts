'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCommunityQnaAnswerComments,
  getCommunityQnaQuestionComments,
  getCommunityQnaQuestionDetail,
  getCommunityQnaQuestions,
} from '@/features/community/api/community-qna-api';
import {
  mapCommunityQnaAnswerCommentsPage,
  mapCommunityQnaQuestionCommentsPage,
  mapCommunityQnaQuestionDetailAggregate,
  mapCommunityQnaQuestionList,
} from '@/features/community/model/community-qna-api.mapper';
import { useCommunityViewerQueryScope } from '@/features/community/model/use-community-viewer-query-scope';
import type {
  CommunityQnaAnswerCommentsQueryInput,
  CommunityQnaQuestionCommentsQueryInput,
  CommunityQnaQuestionDetailQueryInput,
  CommunityQnaQuestionListQueryInput,
} from '@/types/community/qna-query';
import { communityQnaQueryKeys } from '@/types/community/qna-query';

const COMMUNITY_QNA_QUERY_STALE_TIME = 60_000;
const COMMUNITY_QNA_QUERY_GC_TIME = 5 * 60_000;

export const useCommunityQnaQuestionListQuery = (
  params: CommunityQnaQuestionListQueryInput,
  enabled = true,
) => {
  const viewerQueryScope = useCommunityViewerQueryScope();

  return useQuery({
    queryKey: [
      ...communityQnaQueryKeys.questionList(params),
      viewerQueryScope,
    ] as const,
    queryFn: async () =>
      mapCommunityQnaQuestionList(await getCommunityQnaQuestions(params)),
    staleTime: COMMUNITY_QNA_QUERY_STALE_TIME,
    gcTime: COMMUNITY_QNA_QUERY_GC_TIME,
    retry: false,
    enabled,
  });
};

export const useCommunityQnaQuestionDetailQuery = (
  params: CommunityQnaQuestionDetailQueryInput,
  enabled = true,
) => {
  const viewerQueryScope = useCommunityViewerQueryScope();

  return useQuery({
    queryKey: [
      ...communityQnaQueryKeys.questionDetail(params),
      viewerQueryScope,
    ] as const,
    queryFn: async () =>
      mapCommunityQnaQuestionDetailAggregate(
        await getCommunityQnaQuestionDetail(params.questionId, {
          answerPage: params.answerPage,
          answerSize: params.answerSize,
          questionCommentPage: params.commentPage,
          questionCommentSize: params.commentSize,
        }),
      ),
    staleTime: COMMUNITY_QNA_QUERY_STALE_TIME,
    gcTime: COMMUNITY_QNA_QUERY_GC_TIME,
    retry: false,
    enabled: enabled && params.questionId > 0,
  });
};

export const useCommunityQnaQuestionCommentsQuery = (
  params: CommunityQnaQuestionCommentsQueryInput,
  enabled = true,
) => {
  const viewerQueryScope = useCommunityViewerQueryScope();

  return useQuery({
    queryKey: [
      ...communityQnaQueryKeys.questionCommentsPage(params),
      viewerQueryScope,
    ] as const,
    queryFn: async () =>
      mapCommunityQnaQuestionCommentsPage(
        await getCommunityQnaQuestionComments(
          params.questionId,
          params.page,
          params.size,
        ),
      ),
    staleTime: COMMUNITY_QNA_QUERY_STALE_TIME,
    gcTime: COMMUNITY_QNA_QUERY_GC_TIME,
    retry: false,
    enabled: enabled && params.questionId > 0,
  });
};

export const useCommunityQnaAnswerCommentsQuery = (
  params: CommunityQnaAnswerCommentsQueryInput,
  enabled = true,
) => {
  const viewerQueryScope = useCommunityViewerQueryScope();

  return useQuery({
    queryKey: [
      ...communityQnaQueryKeys.answerCommentsPage(params),
      viewerQueryScope,
    ] as const,
    queryFn: async () =>
      mapCommunityQnaAnswerCommentsPage(
        await getCommunityQnaAnswerComments(
          params.answerId,
          params.page,
          params.size,
        ),
      ),
    staleTime: COMMUNITY_QNA_QUERY_STALE_TIME,
    gcTime: COMMUNITY_QNA_QUERY_GC_TIME,
    retry: false,
    enabled: enabled && params.answerId > 0,
  });
};
