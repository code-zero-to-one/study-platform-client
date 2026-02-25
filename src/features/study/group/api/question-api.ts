import { axiosInstance } from '@/api/client/axios';
import type { ResizedImage } from './group-study-types';
import { QuestionCategory } from '../model/question.schema';

export interface ImageDto {
  imageId: string;
  resizedImages: ResizedImage[];
}

export interface CreateQuestionRequest {
  title: string;
  content: string;
  category?: QuestionCategory;
  imageExtension?: string;
}

export interface CreateQuestionResponse {
  statusCode: number;
  timestamp: string;
  content: {
    generatedQuestionId: number;
    imageUploadUrl?: string;
  };
  message: string;
}

export interface QuestionListItemResponse {
  questionId: number;
  accessible: boolean;
  title: string;
  content: string;
  category?: QuestionCategory;
  status: 'ACCEPTED' | 'ANSWER_COMPLETED';
  authorId: number;
  authorNickname: string;
  authorProfileImage?: ImageDto;
  viewCount: number;
  createdAt: string;
}

export interface GetQuestionsResponse {
  statusCode: number;
  timestamp: string;
  content: {
    totalElements: number;
    totalPages: number;
    size: number;
    content: QuestionListItemResponse[];
    page: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message: string;
}

export interface QuestionDetailResponse {
  questionId: number;
  title: string;
  content: string;
  category?: QuestionCategory;
  authorId: number;
  authorNickname: string;
  authorProfileImage?: ImageDto;
  viewCount: number;
  questionImage?: ImageDto;
  status: 'ACCEPTED' | 'ANSWER_COMPLETED';
  createdAt: string;
  answer?: string;
  answererId?: number;
  answererNickname?: string;
  answeredProfileImage?: ImageDto;
  answeredAt?: string;
}

export interface GetQuestionResponse {
  statusCode: number;
  timestamp: string;
  content: QuestionDetailResponse;
  message: string;
}

// 문의 작성
export const createQuestion = async (
  groupStudyId: number,
  request: CreateQuestionRequest,
) => {
  const { data } = await axiosInstance.post<CreateQuestionResponse>(
    `/group-studies/${groupStudyId}/questions`,
    request,
  );

  return data;
};

// 문의 목록 조회
export const getQuestions = async (
  groupStudyId: number,
  page: number,
  pageSize: number,
) => {
  const { data } = await axiosInstance.get<GetQuestionsResponse>(
    `/group-studies/${groupStudyId}/questions`,
    { params: { page, 'page-size': pageSize } },
  );

  return data;
};

// 문의 단건 조회
export const getQuestion = async (groupStudyId: number, questionId: number) => {
  const { data } = await axiosInstance.get<GetQuestionResponse>(
    `/group-studies/${groupStudyId}/questions/${questionId}`,
  );

  return data;
};

export interface CreateAnswerRequest {
  answer: string;
}

export const createAnswer = async (
  groupStudyId: number,
  questionId: number,
  request: CreateAnswerRequest,
) => {
  const { data } = await axiosInstance.post(
    `/group-studies/${groupStudyId}/questions/${questionId}/answer`,
    request,
  );

  return data;
};
