import { axiosInstance } from '@/api/client/axios';

export interface CreateInquiryRequest {
  title: string;
  content: string;
  category?: 'CURRICULUM' | 'DIFFICULTY' | 'HW_AMOUNT' | 'SCHEDULE' | 'ETC';
}

export interface CreateInquiryResponse {
  statusCode: number;
  timestamp: string;
  content: {
    generatedQuestionId: number;
  };
  message: string;
}

// 문의 작성
export const createInquiry = async (
  groupStudyId: number,
  request: CreateInquiryRequest,
) => {
  try {
    const { data } = await axiosInstance.post<CreateInquiryResponse>(
      `/group-studies/${groupStudyId}/questions`,
      request,
    );

    return data;
  } catch (error) {
    console.error('문의 작성 실패:', error);
    throw error;
  }
};
