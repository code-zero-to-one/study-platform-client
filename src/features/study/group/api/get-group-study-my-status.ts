import { axiosInstance } from '@/api/client/axios';
import {
  GroupStudyMyStatusRequest,
  GroupStudyMyStatusResponse,
} from './group-study-types';

// 그룹 스터디 신청한 내 상태 조회 API
export const getGroupStudyMyStatus = async ({
  groupStudyId,
}: GroupStudyMyStatusRequest): Promise<GroupStudyMyStatusResponse> => {
  const res = await axiosInstance.get(
    `/group-studies/${groupStudyId}/members/status`,
  );

  return res.data.content;
};
