import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  addStudyReview,
  getUserPositiveKeywords,
  getPartnerStudyReview,
  getMyNegativeKeywords,
  getMyReviews,
  getWeeklyStudyReviewStatus,
} from '../api/get-review';
import {
  MyNegativeKeywordsRequest,
  UserPositiveKeywordsRequest,
} from '../api/types';

export const usePartnerStudyReviewQuery = () => {
  return useSuspenseQuery({
    queryKey: ['partnerStudyReview'],
    queryFn: getPartnerStudyReview,
  });
};

export const useAddStudyReviewMutation = () => {
  return useMutation({
    mutationFn: addStudyReview,
    onSuccess: () => {
      // todo: 모달로 변경
      alert('후기 작성이 완료되었습니다.');
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

export const useWeeklyStudyReviewStatusQuery = () => {
  return useQuery({
    queryKey: ['weeklyStudyReviewStatus'],
    queryFn: getWeeklyStudyReviewStatus,
    refetchInterval: 1000 * 60 * 30, // 30분
  });
};
