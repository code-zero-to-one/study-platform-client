import { axiosInstance } from '@/shared/tanstack-query/axios';
import { AddStudyReviewRequest, StudyEvaluationResponse } from './types';

export const getPartnerStudyReview =
  async (): Promise<StudyEvaluationResponse> => {
    const res = await axiosInstance.get(
      '/study/reviews/this-week/target-study',
    );

    return res.data.content;
  };

export const addStudyReview = async (data: AddStudyReviewRequest) => {
  const res = await axiosInstance.post('/study/reviews', data);

  return res.data.content;
};
