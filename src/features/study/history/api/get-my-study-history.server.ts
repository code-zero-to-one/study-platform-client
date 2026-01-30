import { axiosServerInstance } from '@/api/client/axios.server';
import type { PageableResponse, StudyHistoryContent } from '@/types/study-history';
import type { GetMyStudyHistoryParams } from './get-my-study-history';

export const getMyStudyHistoryServer = async (
  params: GetMyStudyHistoryParams,
) => {
  const { data } = await axiosServerInstance.get<
    PageableResponse<StudyHistoryContent>
  >('study/daily/history', { params });

  return data;
};
