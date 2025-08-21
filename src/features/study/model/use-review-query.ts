import { useQuery } from '@tanstack/react-query';
import { getPartnerStudyReview } from '../api/get-review';

export const usePartnerStudyReviewQuery = () => {
  return useQuery({
    queryKey: ['partnerStudyReview'],
    queryFn: getPartnerStudyReview,
  });
};
