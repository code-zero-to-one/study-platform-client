import { axiosInstance } from '@/shared/tanstack-query/axios';
import { UpdateProgressScoreRequest } from './group-study-types';

// 진행점수 부여/수정 API
export const updateProgressScore = async ({
  groupStudyId,
  ...data
}: UpdateProgressScoreRequest) => {
  const res = await axiosInstance.put(
    `/group-studies/${groupStudyId}/members/progress`,
    data,
  );

  return res.data.content;
};
