'use client';

import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  acceptCommunityQnaAnswer,
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
} from '@/features/community/model/community-qna-api.mapper';
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
    onSuccess: async (response) => {
      await Promise.all([
        invalidateCommunityQnaQuestionListQueries(queryClient),
        invalidateCommunityQnaQuestionAggregateQueries(
          queryClient,
          response.id,
        ),
      ]);
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
