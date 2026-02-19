import { axiosInstance } from '@/api/client/axios';
import { QuestionCategory } from '../model/question.schema';

export interface CreateQuestionRequest {
  title: string;
  content: string;
  category?: QuestionCategory;
}

export interface CreateQuestionResponse {
  statusCode: number;
  timestamp: string;
  content: {
    generatedQuestionId: number;
  };
  message: string;
}

export interface QuestionListItemResponse {
  questionId: number;
  accessible: boolean;
  title: string;
  content: string;
  category: QuestionCategory;
  status: 'ACCEPTED' | 'ANSWER_COMPLETED';
  authorNickname: string;
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
    number: number;
  };
  message: string;
}

export interface QuestionDetailResponse {
  questionId: number;
  title: string;
  content: string;
  category: QuestionCategory;
  authorId: number;
  authorNickname: string;
  status: 'ACCEPTED' | 'ANSWER_COMPLETED';
  createdAt: string;
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
  try {
    const { data } = await axiosInstance.post<CreateQuestionResponse>(
      `/group-studies/${groupStudyId}/questions`,
      request,
    );

    return data;
  } catch (error) {
    console.error('문의 작성 실패:', error);
    throw error;
  }
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
