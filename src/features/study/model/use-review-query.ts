import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { addStudyReview, getPartnerStudyReview } from '../api/get-review';

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
