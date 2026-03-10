import { axiosInstance } from '@/api/client/axios';
import type {
  AddStudyReviewRequest,
  DismissStudyReviewModalRequest,
  MyNegativeKeywordsRequest,
  MyNegativeKeywordsResponse,
  MyReviewsRequest,
  MyReviewsResponse,
  StudyEvaluationResponse,
  StudyReviewModalStateResponse,
  UserPositiveKeywordsRequest,
  UserPositiveKeywordsResponse,
} from '@/types/api/review.types';

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

export const getUserPositiveKeywords = async ({
  memberId,
  pageSize,
}: UserPositiveKeywordsRequest): Promise<UserPositiveKeywordsResponse> => {
  const params: Record<string, string | number> = {};

  if (memberId) {
    params['member-id'] = memberId;
  }

  if (pageSize) {
    params['page-size'] = pageSize;
  }

  const res = await axiosInstance.get(
    '/study/reviews/members/keywords/positive',
    { params },
  );

  return res.data.content;
};

export const getMyNegativeKeywords = async ({
  pageSize,
}: MyNegativeKeywordsRequest): Promise<MyNegativeKeywordsResponse> => {
  const params: Record<string, number> = {};

  if (pageSize) {
    params['page-size'] = pageSize;
  }

  const res = await axiosInstance.get(
    '/study/reviews/members/keywords/negative',
    { params },
  );

  return res.data.content;
};

export const getMyReviews = async ({
  cursor,
}: MyReviewsRequest): Promise<MyReviewsResponse> => {
  const params: Record<string, number> = {
    'page-size': 10,
  };

  if (cursor) {
    params.cursor = cursor;
  }

  const res = await axiosInstance.get('/study/reviews/members', { params });

  return res.data.content;
};

export const getStudyReviewModalState =
  async (): Promise<StudyReviewModalStateResponse> => {
    const res = await axiosInstance.get('/study/reviews/this-week/modal-state');

    return res.data.content;
  };

export const dismissStudyReviewModal = async ({
  targetStudySpaceId,
}: DismissStudyReviewModalRequest) => {
  await axiosInstance.post('/study/reviews/this-week/modal-dismiss', {
    targetStudySpaceId,
  });
};
