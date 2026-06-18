import { axiosInstance } from '@/api/client/axios';
import type {
  GroupStudyUpdateRequest,
  GroupStudyWriteResponse,
} from '@/types/api/group-study.types';

// 그룹 스터디 수정
export const updateGroupStudy = async (
  groupStudyId: number,
  payload: GroupStudyUpdateRequest,
): Promise<GroupStudyWriteResponse> => {
  try {
    const res = await axiosInstance.put<GroupStudyWriteResponse>(
      `/group-studies/${groupStudyId}`,
      payload,
    );

    return res.data;
  } catch (error) {
    console.error('그룹 스터디 수정 실패:', error);
    throw error;
  }
};
