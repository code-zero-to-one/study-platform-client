import { axiosInstance } from '@/api/client/axios';
import { ProgressGradesResponse } from './group-study-types';

// 진행 점수 등급 목록 조회 API
export const getProgressGrades = async (): Promise<ProgressGradesResponse> => {
  const res = await axiosInstance.get('/group-studies/members/progress-grades');

  return res.data.content;
};
