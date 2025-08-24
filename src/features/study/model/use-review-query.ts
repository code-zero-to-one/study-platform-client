import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  addStudyReview,
  getUserPositiveKeywords,
  getPartnerStudyReview,
  getMyNegativeKeywords,
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
    queryKey: ['myPositiveKeywords', params],
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
