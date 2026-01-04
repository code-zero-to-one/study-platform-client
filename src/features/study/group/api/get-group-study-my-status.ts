import { axiosInstance } from '@/api/client/axios';
import type { GroupStudyMyStatusResponse } from './group-study-types';

// 그룹 스터디 신청한 내 상태 조회 API
export const getGroupStudyMyStatus = async ({
  groupStudyId,
}: {
  groupStudyId: number;
}): Promise<GroupStudyMyStatusResponse> => {
  const res = await axiosInstance.get(
    `/group-studies/${groupStudyId}/members/status`,
  );

  return res.data.content;
};
