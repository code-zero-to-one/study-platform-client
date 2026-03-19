import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/api/client/axios';
import type {
  GroupStudyExperienceReviewDetail,
  GroupStudyExperienceReviewPageResponse,
  GroupStudyExperienceReviewRequest,
  SelectableReviewItemListResponse,
} from '@/types/api/group-study-review.types';

export type {
  GroupStudyExperienceReviewDetail,
  GroupStudyExperienceReviewListItem,
  GroupStudyExperienceReviewPageResponse,
  GroupStudyExperienceReviewRequest,
  GroupStudyReviewStatistics,
  GroupStudyReviewStatisticsItem,
  ReviewSatisfaction,
  SelectableReviewItem,
  SelectableReviewItemListResponse,
} from '@/types/api/group-study-review.types';

export const groupStudyReviewQueryKeys = {
  all: ['groupStudyReview'] as const,
  selectableItems: () =>
    [...groupStudyReviewQueryKeys.all, 'selectable-items'] as const,
  lists: () => [...groupStudyReviewQueryKeys.all, 'list'] as const,
  list: (groupStudyId: number, page?: number, size?: number) =>
    [...groupStudyReviewQueryKeys.lists(), groupStudyId, page, size] as const,
  details: () => [...groupStudyReviewQueryKeys.all, 'detail'] as const,
  detail: (reviewId: number) =>
    [...groupStudyReviewQueryKeys.details(), reviewId] as const,
  written: (groupStudyId: number) =>
    [...groupStudyReviewQueryKeys.all, 'written', groupStudyId] as const,
};

export const groupStudyReviewDetailQueryOptions = (reviewId: number) => ({
  queryKey: groupStudyReviewQueryKeys.detail(reviewId),
  queryFn: async () => {
    const { data } = await axiosInstance.get<{
      content: GroupStudyExperienceReviewDetail;
    }>(`/group-studies/reviews/${reviewId}`);

    return data.content;
  },
  staleTime: 60_000,
});

export const useGetGroupStudyReviewSelectableItems = () => {
  return useQuery({
    queryKey: groupStudyReviewQueryKeys.selectableItems(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        content: SelectableReviewItemListResponse;
      }>('/group-studies/reviews/selectable-items');

      return data.content;
    },
    staleTime: 1000 * 60 * 60, // 항목 목록은 자주 바뀌지 않으므로 1시간
  });
};

export const useGetGroupStudyReviews = ({
  groupStudyId,
  page = 1,
  size = 10,
}: {
  groupStudyId: number;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: groupStudyReviewQueryKeys.list(groupStudyId, page, size),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        content: GroupStudyExperienceReviewPageResponse;
      }>(`/group-studies/${groupStudyId}/reviews`, {
        params: { page, size },
      });

      return data.content;
    },
    enabled: !!groupStudyId,
    staleTime: 60 * 1000,
  });
};

export const useGetGroupStudyReviewDetail = (reviewId: number) => {
  return useQuery({
    ...groupStudyReviewDetailQueryOptions(reviewId),
    enabled: !!reviewId,
  });
};

export const useGetGroupStudyReviewWritten = (
  groupStudyId: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: groupStudyReviewQueryKeys.written(groupStudyId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ content: boolean }>(
        `/group-studies/${groupStudyId}/reviews/written`,
      );

      return data.content;
    },
    enabled: (options?.enabled ?? true) && !!groupStudyId,
    staleTime: 60 * 1000,
  });
};

export const useCreateGroupStudyReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupStudyId,
      request,
    }: {
      groupStudyId: number;
      request: GroupStudyExperienceReviewRequest;
    }) => {
      const { data } = await axiosInstance.post<{ content: number }>(
        `/group-studies/${groupStudyId}/reviews`,
        request,
      );

      return data.content; // 생성된 reviewId 반환
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: groupStudyReviewQueryKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: groupStudyReviewQueryKeys.written(variables.groupStudyId),
      });
    },
  });
};

export const useUpdateGroupStudyReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      request,
    }: {
      reviewId: number;
      request: GroupStudyExperienceReviewRequest;
    }) => {
      await axiosInstance.put(`/group-studies/reviews/${reviewId}`, request);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: groupStudyReviewQueryKeys.detail(variables.reviewId),
      });
      await queryClient.invalidateQueries({
        queryKey: groupStudyReviewQueryKeys.lists(),
      });
    },
  });
};

/**
 * 그룹스터디 경험 후기 삭제
 * DELETE /api/v1/group-studies/reviews/{reviewId}
 * 스터디 종료 후 7일 이내에만 가능
 */
export const useDeleteGroupStudyReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      groupStudyId,
    }: {
      reviewId: number;
      groupStudyId: number;
    }) => {
      await axiosInstance.delete(`/group-studies/reviews/${reviewId}`);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: groupStudyReviewQueryKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: groupStudyReviewQueryKeys.written(variables.groupStudyId),
      });
    },
  });
};
