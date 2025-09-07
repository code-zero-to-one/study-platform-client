import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { getKoreaDate } from '@/shared/lib/time';
import { isApiError } from '@/shared/tanstack-query/api-error';
import {
  addStudyReview,
  getUserPositiveKeywords,
  getPartnerStudyReview,
  getMyNegativeKeywords,
  getMyReviews,
  getShouldReviewPartner,
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
    onError: (error) => {
      if (isApiError(error)) {
        if (error.errorCode === 'CMM001') {
          alert('이미 후기를 작성했습니다.');
        } else if (error.errorCode === 'CMM003') {
          alert('스터디 또는 스터디 멤버가 존재하지 않습니다.');
        }
      }
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
    enabled: () => {
      const now = getKoreaDate();
      const dayOfWeek = now.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0: 일요일, 6: 토요일

      return isWeekend;
    },
  });
};
