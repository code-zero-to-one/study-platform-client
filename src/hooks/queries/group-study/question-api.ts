import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAnswer,
  createQuestion,
  type CreateQuestionRequest,
  deleteQuestion,
  getQuestion,
  getQuestions,
  modifyQuestion,
  type ModifyQuestionRequest,
} from '@/api/endpoints/group-study/question';

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupStudyId,
      request,
    }: {
      groupStudyId: number;
      request: CreateQuestionRequest;
    }) => {
      const data = await createQuestion(groupStudyId, request);

      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['questions', variables.groupStudyId],
      });
    },
  });
};

export const useGetQuestions = ({
  groupStudyId,
  page = 1,
  pageSize = 15,
  enabled = true,
}: {
  groupStudyId: number;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['questions', groupStudyId, page, pageSize],
    queryFn: async () => {
      const data = await getQuestions(groupStudyId, page, pageSize);

      return data.content;
    },
    enabled: !!groupStudyId && enabled,
    staleTime: 60 * 1000,
  });
};

export const useGetQuestion = ({
  groupStudyId,
  questionId,
  enabled = true,
}: {
  groupStudyId: number;
  questionId: number;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['question', groupStudyId, questionId],
    queryFn: async () => {
      const data = await getQuestion(groupStudyId, questionId);

      return data.content;
    },
    enabled: !!groupStudyId && !!questionId && enabled,
    staleTime: 60 * 1000,
  });
};

export const useModifyQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupStudyId,
      questionId,
      request,
    }: {
      groupStudyId: number;
      questionId: number;
      request: ModifyQuestionRequest;
    }) => {
      const data = await modifyQuestion(groupStudyId, questionId, request);

      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['question', variables.groupStudyId, variables.questionId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['questions', variables.groupStudyId],
      });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupStudyId,
      questionId,
    }: {
      groupStudyId: number;
      questionId: number;
    }) => {
      const data = await deleteQuestion(groupStudyId, questionId);

      return data.content;
    },
    onSuccess: async (_, variables) => {
      queryClient.removeQueries({
        queryKey: ['question', variables.groupStudyId, variables.questionId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['questions', variables.groupStudyId],
      });
    },
  });
};

export const useCreateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupStudyId,
      questionId,
      content,
    }: {
      groupStudyId: number;
      questionId: number;
      content: string;
    }) => {
      return createAnswer(groupStudyId, questionId, { answer: content });
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['question', variables.groupStudyId, variables.questionId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['questions', variables.groupStudyId],
      });
    },
  });
};
