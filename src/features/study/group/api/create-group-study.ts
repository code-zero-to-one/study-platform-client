import { axiosInstance } from '@/api/client/axios';
import { GroupStudyFormRequest } from './group-study-types';

// CS 스터디 매칭 신청
export const createGroupStudy = async (payload: GroupStudyFormRequest) => {
  try {
    const res = await axiosInstance.post('/group-studies', payload);

    return res.data;
  } catch (error) {
    console.error('그룹 스터디 생성 실패:', error);
    throw error;
  }
};
