import { axiosInstance } from '@/api/client/axios';
import { OpenGroupStudyRequest } from './group-study-types';

// CS 스터디 매칭 신청
export const createGroupStudy = async (payload: OpenGroupStudyRequest) => {
  const res = await axiosInstance.post('/group-studies', payload);

  return res.data;
};
