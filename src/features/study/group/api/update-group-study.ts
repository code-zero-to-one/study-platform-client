import { axiosInstance } from '@/shared/tanstack-query/axios';
import { OpenGroupStudyRequest } from './group-study-types';

// CS 스터디 매칭 신청
export const updateGroupStudy = async (
  studyGroupId: number,
  payload: OpenGroupStudyRequest,
) => {
  try {
    const res = await axiosInstance.put(
      `/group-studies/${studyGroupId}`,
      payload,
    );

    return res.data;
  } catch (error) {
    console.error('그룹 스터디 수정 실패:', error);
    throw error;
  }
};
