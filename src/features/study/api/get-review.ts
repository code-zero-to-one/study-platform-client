import { axiosInstance } from '@/shared/tanstack-query/axios';
import type {
  AddStudyReviewRequest,
  UserPositiveKeywordsResponse,
  UserPositiveKeywordsRequest,
  StudyEvaluationResponse,
  MyNegativeKeywordsRequest,
  MyNegativeKeywordsResponse,
  MyReviewsResponse,
  MyReviewsRequest,
} from './types';

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

  // cursor 전송하지 않는 경우 첫 데이터부터 조회
  if (cursor) {
    params.cursor = cursor;
  }

  const res = await axiosInstance.get('/study/reviews/members', { params });

  return res.data.content;
};
