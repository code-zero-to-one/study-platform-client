import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/api/client/axios';

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

export type ReviewSatisfaction = 'GOOD' | 'DISAPPOINTED';

export interface SelectableReviewItem {
  id?: number;
  reviewSelection?: string;
  label?: string;
  satisfactionType?: string;
}

export interface SelectableReviewItemListResponse {
  goodItems?: SelectableReviewItem[];
  disappointedItems?: SelectableReviewItem[];
}

export interface GroupStudyExperienceReviewListItem {
  reviewId?: number;
  writerId?: number;
  writerName?: string;
  satisfaction?: ReviewSatisfaction;
  content?: string;
  rating?: number;
  createdAt?: string;
}

export interface GroupStudyExperienceReviewDetail {
  reviewId?: number;
  groupStudyId?: number;
  groupStudyTitle?: string;
  writerId?: number;
  writerName?: string;
  satisfaction?: ReviewSatisfaction;
  selectableReviewItems?: SelectableReviewItem[];
  content?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupStudyExperienceReviewPageResponse {
  content?: GroupStudyExperienceReviewListItem[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface GroupStudyExperienceReviewRequest {
  satisfaction: ReviewSatisfaction;
  selectableReviewItemIds: number[];
  content: string;
  rating: number;
}

export type GroupStudyExperienceReviewCreateRequest =
  GroupStudyExperienceReviewRequest;
export type GroupStudyExperienceReviewUpdateRequest =
  GroupStudyExperienceReviewRequest;

// ─── queryKey 팩토리 ──────────────────────────────────────────────────────────

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

// ─── Query Hooks ──────────────────────────────────────────────────────────────

/**
 * 만족도별 선택형 평가 항목 전체 조회
 * GET /api/v1/group-studies/reviews/selectable-items
 */
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

/**
 * 그룹스터디 경험 후기 목록 조회 (페이지네이션)
 * GET /api/v1/group-studies/{groupStudyId}/reviews
 */
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
    staleTime: 60_000,
  });
};

/**
 * 그룹스터디 경험 후기 상세 조회
 * GET /api/v1/group-studies/reviews/{reviewId}
 */
export const useGetGroupStudyReviewDetail = (reviewId: number) => {
  return useQuery({
    queryKey: groupStudyReviewQueryKeys.detail(reviewId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{
        content: GroupStudyExperienceReviewDetail;
      }>(`/group-studies/reviews/${reviewId}`);

      return data.content;
    },
    enabled: !!reviewId,
    staleTime: 60_000,
  });
};

/**
 * 현재 사용자가 해당 그룹스터디에 후기를 작성했는지 여부 확인
 * GET /api/v1/group-studies/{groupStudyId}/reviews/written
 */
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
    staleTime: 60_000,
  });
};

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

/**
 * 그룹스터디 경험 후기 작성
 * POST /api/v1/group-studies/{groupStudyId}/reviews
 * 스터디 종료 후 7일 이내에만 가능
 */
export const useCreateGroupStudyReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupStudyId,
      request,
    }: {
      groupStudyId: number;
      request: GroupStudyExperienceReviewCreateRequest;
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

/**
 * 그룹스터디 경험 후기 수정
 * PUT /api/v1/group-studies/reviews/{reviewId}
 * 스터디 종료 후 7일 이내에만 가능
 */
export const useUpdateGroupStudyReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      request,
    }: {
      reviewId: number;
      request: GroupStudyExperienceReviewUpdateRequest;
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
