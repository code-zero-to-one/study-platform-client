import { axiosInstance } from '@/api/client/axios';
import type {
  CompleteStudyRequest,
  DailyStudyDetail,
  PrepareStudyRequest,
} from '@/features/study/interview/api/interview-types';

// 스터디 상세 조회
export const getDailyStudyDetail = async (
  params: string,
): Promise<DailyStudyDetail> => {
  const res = await axiosInstance.get(`/study/daily/mine/${params}`);

  return res.data.content;
};

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
