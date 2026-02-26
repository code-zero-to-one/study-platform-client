import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  MyNegativeKeywordsRequest,
  UserPositiveKeywordsRequest,
} from '@/entities/review/api/review-types';
import {
  addStudyReview,
  getUserPositiveKeywords,
  getPartnerStudyReview,
  getMyNegativeKeywords,
  getMyReviews,
  getShouldReviewPartner,
} from '../api/get-review';

export const usePartnerStudyReviewQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['partnerStudyReview'],
    queryFn: getPartnerStudyReview,
    enabled,
  });
};

export const useAddStudyReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStudyReview,
    onSuccess: async () => {
      // todo: 모달로 변경
      alert('후기 작성이 완료되었습니다.');
      await queryClient.invalidateQueries({
        queryKey: ['shouldReviewPartner'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['partnerStudyReview'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['myReviews'],
      });
    },
  });
};

export const useUserPositiveKeywordsQuery = (
  params: UserPositiveKeywordsRequest,
) => {
  return useQuery({
    queryKey: ['userPositiveKeywords', params],
    queryFn: ({ queryKey }) => {
      const [, requestParams] = queryKey as [
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
    queryKey: ['myNegativeKeywords', params],
    queryFn: () => getMyNegativeKeywords(params),
  });
};

export const useMyReviewsInfinityQuery = () => {
  return useInfiniteQuery({
    queryKey: ['myReviews'],
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

export const useShouldReviewPartnerQuery = () => {
  return useQuery({
    queryKey: ['shouldReviewPartner'],
    queryFn: getShouldReviewPartner,
    refetchInterval: 1000 * 60 * 30, // 30분
  });
};
