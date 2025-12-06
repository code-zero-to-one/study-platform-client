import { axiosInstance } from '@/api/client/axios';
import { GroupStudyFormRequest } from './group-study-types';

// CS 스터디 매칭 신청
export const updateGroupStudy = async (
  groupStudyId: number,
  payload: GroupStudyFormRequest,
) => {
  try {
    const res = await axiosInstance.put(
      `/group-studies/${groupStudyId}`,
      payload,
    );

    return res.data;
  } catch (error) {
    console.error('그룹 스터디 수정 실패:', error);
    throw error;
  }
};
