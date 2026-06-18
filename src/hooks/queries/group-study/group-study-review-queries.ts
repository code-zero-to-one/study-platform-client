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
  availability: (groupStudyId: number) =>
    [...groupStudyReviewQueryKeys.all, 'availability', groupStudyId] as const,
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

export type ReviewAvailabilityType =
  | 'AVAILABLE'
  | 'STUDY_NOT_COMPLETED'
  | 'PERIOD_EXPIRED'
  | 'ALREADY_REVIEWED';

export interface ReviewAvailability {
  available: boolean;
  type: ReviewAvailabilityType;
}

/**
 * 스터디 후기 작성 가능 여부 조회 (백엔드 realEndTime 기준)
 * GET /group-studies/{groupStudyId}/reviews/availability
 *
 * 날짜 계산을 프론트에서 하지 않고 백엔드에 위임 — 수동 완료 시나리오를 정확히 처리
 */
export const useGetGroupStudyReviewAvailability = (
  groupStudyId: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: groupStudyReviewQueryKeys.availability(groupStudyId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        content: ReviewAvailability;
      }>(`/group-studies/${groupStudyId}/reviews/availability`);

      return data.content;
    },
    enabled: (options?.enabled ?? true) && !!groupStudyId,
    staleTime: 60 * 1000,
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
