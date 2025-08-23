import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { addStudyReview, getPartnerStudyReview } from '../api/get-review';

export const usePartnerStudyReviewQuery = () => {
  return useQuery({
    queryKey: ['partnerStudyReview'],
    queryFn: getPartnerStudyReview,
  });
};

export const useAddStudyReviewMutation = () => {
  return useMutation({
    mutationFn: addStudyReview,
  });
};
