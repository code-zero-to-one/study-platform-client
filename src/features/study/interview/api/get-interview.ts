import type {
  CompleteStudyRequest,
  PrepareStudyRequest,
} from '@/features/study/interview/api/interview-types';
import { axiosInstance } from '@/shared/tanstack-query/axios';

// 면접 준비 시작
export const putStudyDaily = async (
  dailyId: number,
  body: PrepareStudyRequest,
) => {
  const res = await axiosInstance.put(`/study/daily/${dailyId}/prepare`, body);

  return res.data;
};

// 면접 완료 및 회고 작성
export const completeStudy = async (
  dailyStudyId: number,
  body: CompleteStudyRequest,
) => {
  const res = await axiosInstance.post(
    `/study/daily/${dailyStudyId}/complete`,
    body,
  );

  return res.data;
};