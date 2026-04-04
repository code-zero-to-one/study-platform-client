import { axiosInstance } from '@/api/client/axios';
import type {
  GroupStudyCreateRequest,
  GroupStudyWriteResponse,
} from '@/types/api/group-study.types';

// 그룹 스터디 개설
export const createGroupStudy = async (
  payload: GroupStudyCreateRequest,
): Promise<GroupStudyWriteResponse> => {
  try {
    const res = await axiosInstance.post<GroupStudyWriteResponse>(
      '/group-studies',
      payload,
    );

    return res.data;
  } catch (error) {
    console.error('그룹 스터디 생성 실패:', error);
    throw error;
  }
};
