import { axiosInstance } from '@/shared/tanstack-query/axios';
import { OpenGroupStudyRequest } from './group-study-types';

// CS 스터디 매칭 신청
export const createGroupStudy = async (payload: OpenGroupStudyRequest) => {
  try {
    const res = await axiosInstance.post('/group-studies', payload);

    return res.data;
  } catch (error) {
    console.error('그룹 스터디 생성 실패:', error);
    throw error;
  }
};
