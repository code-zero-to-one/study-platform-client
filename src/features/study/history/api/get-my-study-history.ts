import { axiosInstance } from '@/api/client/axios';
import { PageableResponse, StudyHistoryContent } from '@/types/study-history';

export interface GetMyStudyHistoryParams {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

export const getMyStudyHistory = async (params: GetMyStudyHistoryParams) => {
  const { data } = await axiosInstance.get<PageableResponse<StudyHistoryContent>>(
    'study/daily/history',
    { params }
  );
  return data;
};

