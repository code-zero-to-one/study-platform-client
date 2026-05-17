import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { EvaluationApi } from '@/api/openapi';
import type { EvaluationRequest } from '@/api/openapi/models';

const evaluationApi = createApiInstance(EvaluationApi);

export const useGetEvaluation = (homeworkId: number) => {
  return useQuery({
    queryKey: ['evaluation', homeworkId],
    queryFn: async () => {
      const { data } = await evaluationApi.getEvaluation(homeworkId);

      return data.content;
    },
  });
};

export const useGetMissionEvaluationGrades = () => {
  return useQuery({
    queryKey: ['missionEvaluationGrades'],
    queryFn: async () => {
      const { data } = await evaluationApi.getMissionEvaluationGrades();

      return data.content;
    },
  });
};

export const useCreateEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      homeworkId,
      request,
    }: {
      homeworkId: number;
      request: EvaluationRequest;
    }) => {
      const { data } = await evaluationApi.createEvaluation(
        homeworkId,
        request,
      );

      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['evaluation', variables.homeworkId],
      });
    },
  });
};

export const useUpdateEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      evaluationId,
      request,
    }: {
      evaluationId: number;
      request: EvaluationRequest;
    }) => {
      const { data } = await evaluationApi.updateEvaluation(
        evaluationId,
        request,
      );

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['evaluation'],
      });
    },
  });
};

export const useDeleteEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evaluationId: number) => {
      const { data } = await evaluationApi.deleteEvaluation(evaluationId);

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['evaluation'],
      });
    },
  });
};
