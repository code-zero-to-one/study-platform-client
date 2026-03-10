import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  addStudyReview,
  dismissStudyReviewModal,
  getMyNegativeKeywords,
  getMyReviews,
  getPartnerStudyReview,
  getStudyReviewModalState,
  getUserPositiveKeywords,
} from '@/api/endpoints/review/get-review';
import type {
  DismissStudyReviewModalRequest,
  MyNegativeKeywordsRequest,
  PartnerStudyReviewQueryParams,
  UserPositiveKeywordsRequest,
} from '@/types/api/review.types';

export const reviewQueryKeys = {
  all: ['review'] as const,
  modalState: () => [...reviewQueryKeys.all, 'modal-state'] as const,
  partnerStudies: () => [...reviewQueryKeys.all, 'partner-study'] as const,
  partnerStudy: (targetStudySpaceId?: number) =>
    [
      ...reviewQueryKeys.partnerStudies(),
      targetStudySpaceId ?? 'unknown',
    ] as const,
  myReviews: () => [...reviewQueryKeys.all, 'my-reviews'] as const,
  userPositiveKeywords: (params: UserPositiveKeywordsRequest) =>
    [...reviewQueryKeys.all, 'user-positive-keywords', params] as const,
  myNegativeKeywords: (params: MyNegativeKeywordsRequest) =>
    [...reviewQueryKeys.all, 'my-negative-keywords', params] as const,
};

export const usePartnerStudyReviewQuery = ({
  enabled = true,
  targetStudySpaceId,
}: PartnerStudyReviewQueryParams) => {
  return useQuery({
    queryKey: reviewQueryKeys.partnerStudy(targetStudySpaceId),
    queryFn: getPartnerStudyReview,
    enabled: enabled && !!targetStudySpaceId,
  });
};

export const useAddStudyReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStudyReview,
    onSuccess: async () => {
      alert('후기 작성이 완료되었습니다.');
      await queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.modalState(),
      });
      await queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.partnerStudies(),
      });
      await queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.myReviews(),
      });
    },
  });
};

export const useDismissStudyReviewModalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DismissStudyReviewModalRequest) =>
      dismissStudyReviewModal(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.modalState(),
      });
    },
  });
};

export const useUserPositiveKeywordsQuery = (
  params: UserPositiveKeywordsRequest,
) => {
  return useQuery({
    queryKey: reviewQueryKeys.userPositiveKeywords(params),
    queryFn: ({ queryKey }) => {
      const [, , requestParams] = queryKey as [
        string,
        string,
        UserPositiveKeywordsRequest,
      ];

      return getUserPositiveKeywords(requestParams);
    },
  });
};

export const useMyNegativeKeywordsQuery = (
  params: MyNegativeKeywordsRequest,
) => {
  return useQuery({
    queryKey: reviewQueryKeys.myNegativeKeywords(params),
    queryFn: () => getMyNegativeKeywords(params),
  });
};

export const useMyReviewsInfinityQuery = () => {
  return useInfiniteQuery({
    queryKey: reviewQueryKeys.myReviews(),
    queryFn: ({ pageParam = null }) => getMyReviews({ cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (lastPage.reviews.hasNext) {
        return lastPage.reviews.nextCursor;
      }

      return undefined;
    },
    select: (data) => {
      const allReviews = data.pages.flatMap((page) => page.reviews.items);
      const lastPage = data.pages[data.pages.length - 1];
      const totalCount = data.pages[0].totalCount;
      const hasNext = lastPage.reviews.hasNext;

      return {
        reviews: allReviews,
        totalCount,
        hasNext,
      };
    },
  });
};

export const useStudyReviewModalStateQuery = () => {
  return useQuery({
    queryKey: reviewQueryKeys.modalState(),
    queryFn: getStudyReviewModalState,
    refetchInterval: 1000 * 60 * 30,
  });
};
