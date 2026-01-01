import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { GroupStudyHomeworkApi } from '@/api/openapi';
import type {
  HomeworkEditRequest,
  HomeworkSubmissionRequest,
} from '@/api/openapi/models';

const groupStudyHomeworkApi = createApiInstance(GroupStudyHomeworkApi);

export const useSubmitHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      missionId,
      request,
    }: {
      missionId: number;
      request: HomeworkSubmissionRequest;
    }) => {
      const { data } = await groupStudyHomeworkApi.submitHomework(
        missionId,
        request,
      );

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['homeworks'],
      });
    },
  });
};

export const useEditHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      homeworkId,
      request,
    }: {
      homeworkId: number;
      request: HomeworkEditRequest;
    }) => {
      const { data } = await groupStudyHomeworkApi.editHomework(
        homeworkId,
        request,
      );

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['homeworks'],
      });
    },
  });
};
