'use client';

import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  acceptCommunityQnaAnswer,
  assignCommunityQnaAnswerReaction,
  assignCommunityQnaQuestionReaction,
  clearCommunityQnaAnswerAcceptance,
  createCommunityQnaAnswer,
  createCommunityQnaAnswerComment,
  createCommunityQnaQuestionComment,
  createCommunityQnaQuestion,
  deleteCommunityQnaAnswer,
  deleteCommunityQnaComment,
  deleteCommunityQnaQuestion,
  updateCommunityQnaComment,
  updateCommunityQnaAnswer,
  updateCommunityQnaQuestion,
} from '@/features/community/api/community-qna-api';
import {
  mapCommunityQnaAnswerItem,
  mapCommunityQnaAnswerDeleteResult,
  mapCommunityQnaAnswerMutation,
  mapCommunityQnaAcceptance,
  mapCommunityQnaComment,
  mapCommunityQnaCommentDeleteResult,
  mapCommunityQnaQuestionDeleteResult,
  mapCommunityQnaQuestionDetail,
  mapCommunityQnaReactionResult,
} from '@/features/community/model/community-qna-api.mapper';
import type {
  CommunityQnaQuestionDetailData,
  CommunityQnaQuestionSummary,
} from '@/types/community/qna-domain';
import type { CommunityQnaQuestionListData } from '@/types/community/qna-query';
import { communityQnaQueryKeys } from '@/types/community/qna-query';

const invalidateCommunityQnaQuestionListQueries = (
  queryClient: QueryClient,
) => {
  return queryClient.invalidateQueries({
    queryKey: communityQnaQueryKeys.questions(),
  });
};

const invalidateCommunityQnaQuestionAggregateQueries = (
  queryClient: QueryClient,
  questionId: number,
) => {
  return queryClient.invalidateQueries({
    queryKey: communityQnaQueryKeys.questionDetailRoot(questionId),
  });
};

const invalidateCommunityQnaAnswerCommentQueries = (
  queryClient: QueryClient,
  answerId: number,
) => {
  return queryClient.invalidateQueries({
    queryKey: communityQnaQueryKeys.answerCommentsRoot(answerId),
  });
};

export const useCreateCommunityQnaQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      request,
      idempotencyKey,
    }: {
      request: Parameters<typeof createCommunityQnaQuestion>[0];
      idempotencyKey?: Parameters<typeof createCommunityQnaQuestion>[1];
    }) =>
      createCommunityQnaQuestion(request, idempotencyKey).then(
        mapCommunityQnaQuestionDetail,
      ),
    onError: () => {},
    onSuccess: (response) => {
      Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          response.id,
        ),
      ]).catch(() => {});
    },
  });
};

export const useUpdateCommunityQnaQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      revision,
      request,
    }: {
      questionId: number;
      revision: number;
      request: Parameters<typeof updateCommunityQnaQuestion>[1];
    }) =>
      updateCommunityQnaQuestion(questionId, request, revision).then(
        mapCommunityQnaQuestionDetail,
      ),
    onError: () => {},
    onSuccess: (_, variables) => {
      Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
      ]).catch(() => {});
    },
  });
};

export const useDeleteCommunityQnaQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      revision,
    }: {
      questionId: number;
      revision: number;
    }) =>
      deleteCommunityQnaQuestion(questionId, revision).then(
        mapCommunityQnaQuestionDeleteResult,
      ),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
      ]);
    },
  });
};

export const useCreateCommunityQnaAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      request,
      idempotencyKey,
    }: {
      questionId: number;
      request: Parameters<typeof createCommunityQnaAnswer>[1];
      idempotencyKey?: Parameters<typeof createCommunityQnaAnswer>[2];
    }) =>
      createCommunityQnaAnswer(questionId, request, idempotencyKey).then(
        mapCommunityQnaAnswerMutation,
      ),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
      ]);
    },
  });
};

export const useUpdateCommunityQnaAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      answerId,
      revision,
      request,
    }: {
      questionId: number;
      answerId: number;
      revision: number;
      request: Parameters<typeof updateCommunityQnaAnswer>[1];
    }) =>
      updateCommunityQnaAnswer(answerId, request, revision).then(
        mapCommunityQnaAnswerItem,
      ),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
        invalidateCommunityQnaAnswerCommentQueries(
          queryClient,
          variables.answerId,
        ),
      ]);
    },
  });
};

export const useDeleteCommunityQnaAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      answerId,
      revision,
    }: {
      questionId: number;
      answerId: number;
      revision: number;
    }) =>
      deleteCommunityQnaAnswer(answerId, revision).then(
        mapCommunityQnaAnswerDeleteResult,
      ),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
        invalidateCommunityQnaAnswerCommentQueries(
          queryClient,
          variables.answerId,
        ),
      ]);
    },
  });
};

export const useAcceptCommunityQnaAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      answerId,
    }: {
      questionId: number;
      answerId: number;
    }) => acceptCommunityQnaAnswer(answerId).then(mapCommunityQnaAcceptance),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
      ]);
    },
  });
};

export const useClearCommunityQnaAnswerAcceptanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      answerId,
    }: {
      questionId: number;
      answerId: number;
    }) =>
      clearCommunityQnaAnswerAcceptance(answerId).then(
        mapCommunityQnaAcceptance,
      ),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
      ]);
    },
  });
};

export const useCreateCommunityQnaQuestionCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      request,
      idempotencyKey,
    }: {
      questionId: number;
      request: Parameters<typeof createCommunityQnaQuestionComment>[1];
      idempotencyKey?: Parameters<typeof createCommunityQnaQuestionComment>[2];
    }) =>
      createCommunityQnaQuestionComment(
        questionId,
        request,
        idempotencyKey,
      ).then(mapCommunityQnaComment),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
      ]);
    },
  });
};

export const useCreateCommunityQnaAnswerCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      answerId,
      request,
      idempotencyKey,
    }: {
      questionId: number;
      answerId: number;
      request: Parameters<typeof createCommunityQnaAnswerComment>[1];
      idempotencyKey?: Parameters<typeof createCommunityQnaAnswerComment>[2];
    }) =>
      createCommunityQnaAnswerComment(answerId, request, idempotencyKey).then(
        mapCommunityQnaComment,
      ),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
        invalidateCommunityQnaAnswerCommentQueries(
          queryClient,
          variables.answerId,
        ),
      ]);
    },
  });
};

export const useUpdateCommunityQnaCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      commentId,
      revision,
      request,
    }: {
      questionId: number;
      commentId: number;
      revision: number;
      request: Parameters<typeof updateCommunityQnaComment>[1];
    }) =>
      updateCommunityQnaComment(commentId, request, revision).then(
        mapCommunityQnaComment,
      ),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await invalidateCommunityQnaQuestionAggregateQueries(
        queryClient,
        variables.questionId,
      );
    },
  });
};

export const useDeleteCommunityQnaCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      commentId,
      revision,
    }: {
      questionId: number;
      commentId: number;
      revision: number;
    }) =>
      deleteCommunityQnaComment(commentId, revision).then(
        mapCommunityQnaCommentDeleteResult,
      ),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
      ]);
    },
  });
};

export const useUpdateCommunityQnaAnswerCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      answerId,
      commentId,
      revision,
      request,
    }: {
      answerId: number;
      commentId: number;
      revision: number;
      request: Parameters<typeof updateCommunityQnaComment>[1];
    }) =>
      updateCommunityQnaComment(commentId, request, revision).then(
        mapCommunityQnaComment,
      ),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await invalidateCommunityQnaAnswerCommentQueries(
        queryClient,
        variables.answerId,
      );
    },
  });
};

export const useDeleteCommunityQnaAnswerCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      answerId,
      commentId,
      revision,
    }: {
      questionId: number;
      answerId: number;
      commentId: number;
      revision: number;
    }) =>
      deleteCommunityQnaComment(commentId, revision).then(
        mapCommunityQnaCommentDeleteResult,
      ),
    onError: () => {},
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          variables.questionId,
        ),
        invalidateCommunityQnaAnswerCommentQueries(
          queryClient,
          variables.answerId,
        ),
      ]);
    },
  });
};

const updateQuestionDetailReaction = (
  current: CommunityQnaQuestionDetailData | undefined,
  likeCount: number,
  reaction: string,
): CommunityQnaQuestionDetailData | undefined => {
  if (!current) {
    return current;
  }

  return {
    ...current,
    question: {
      ...current.question,
      stats: { ...current.question.stats, likeCount },
    },
    viewer: { ...current.viewer, questionReaction: reaction },
  };
};

const updateAnswerDetailReaction = (
  current: CommunityQnaQuestionDetailData | undefined,
  answerId: number,
  likeCount: number,
  reaction: string,
): CommunityQnaQuestionDetailData | undefined => {
  if (!current) {
    return current;
  }

  return {
    ...current,
    answersPage: {
      ...current.answersPage,
      items: current.answersPage.items.map((answer) =>
        answer.id === answerId
          ? {
              ...answer,
              stats: { ...answer.stats, likeCount },
              viewer: { ...answer.viewer, reaction },
            }
          : answer,
      ),
    },
  };
};

const updateQuestionListReaction = (
  current: CommunityQnaQuestionListData | undefined,
  questionId: number,
  likeCount: number,
): CommunityQnaQuestionListData | undefined => {
  if (!current) {
    return current;
  }

  return {
    ...current,
    items: current.items.map((question: CommunityQnaQuestionSummary) =>
      question.id === questionId
        ? { ...question, stats: { ...question.stats, likeCount } }
        : question,
    ),
  };
};

export const useAssignCommunityQnaQuestionReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, type }: { questionId: number; type: string }) =>
      assignCommunityQnaQuestionReaction(questionId, { type }).then(
        mapCommunityQnaReactionResult,
      ),
    onError: () => {},
    onSuccess: (response, variables) => {
      queryClient.setQueriesData<CommunityQnaQuestionDetailData>(
        {
          queryKey: communityQnaQueryKeys.questionDetailRoot(
            variables.questionId,
          ),
        },
        (current) =>
          updateQuestionDetailReaction(
            current,
            response.likeCount,
            response.reaction,
          ),
      );

      queryClient.setQueriesData<CommunityQnaQuestionListData>(
        { queryKey: communityQnaQueryKeys.questions() },
        (current) =>
          updateQuestionListReaction(
            current,
            variables.questionId,
            response.likeCount,
          ),
      );
    },
  });
};

export const useAssignCommunityQnaAnswerReactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      answerId,
      type,
    }: {
      questionId: number;
      answerId: number;
      type: string;
    }) =>
      assignCommunityQnaAnswerReaction(answerId, { type }).then(
        mapCommunityQnaReactionResult,
      ),
    onError: () => {},
    onSuccess: (response, variables) => {
      queryClient.setQueriesData<CommunityQnaQuestionDetailData>(
        {
          queryKey: communityQnaQueryKeys.questionDetailRoot(
            variables.questionId,
          ),
        },
        (current) =>
          updateAnswerDetailReaction(
            current,
            variables.answerId,
            response.likeCount,
            response.reaction,
          ),
      );
    },
  });
};
