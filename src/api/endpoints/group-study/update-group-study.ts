import { axiosInstance } from '@/api/client/axios';
import {
  GroupStudyCreationResponse,
  GroupStudyUpdateRequest,
} from '@/types/api/group-study.types';

// 그룹 스터디 수정
export const updateGroupStudy = async (
  groupStudyId: number,
  payload: GroupStudyUpdateRequest,
): Promise<GroupStudyCreationResponse> => {
  try {
    const res = await axiosInstance.put<GroupStudyCreationResponse>(
      `/group-studies/${groupStudyId}`,
      payload,
    );

    return res.data;
  } catch (error) {
    console.error('그룹 스터디 수정 실패:', error);
    throw error;
  }
};
