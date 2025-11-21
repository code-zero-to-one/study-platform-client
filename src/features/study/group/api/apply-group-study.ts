import { axiosInstance } from '@/api/client/axios';
import {
  ApplyGroupStudyRequest,
  ApplyGroupStudyResponse,
} from './group-study-types';

// 그룹 스터디 신청 요청
export const applyGroupStudy = async ({
  groupStudyId,
  answer,
}: ApplyGroupStudyRequest): Promise<ApplyGroupStudyResponse> => {
  const res = await axiosInstance.post(`/group-studies/${groupStudyId}/apply`, {
    answer,
  });

  return res.data;
};
