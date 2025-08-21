import { axiosInstance } from '@/shared/tanstack-query/axios';
import { StudyEvaluationResponse } from './types';

export const getPartnerStudyReview =
  async (): Promise<StudyEvaluationResponse> => {
    const res = await axiosInstance.get(
      '/study/reviews/this-week/target-study',
    );

    return res.data.content;
  };
