import { axiosServerInstance } from '@/api/client/axios.server';
import type { GroupStudyMyStatusResponse } from '@/types/api/group-study.types';

// 그룹 스터디 신청한 내 상태 조회 API
export const getGroupStudyMyStatusInServer = async ({
  groupStudyId,
}: {
  groupStudyId: number;
}): Promise<GroupStudyMyStatusResponse> => {
  const res = await axiosServerInstance.get(
    `/group-studies/${groupStudyId}/members/status`,
  );

  return res.data.content;
};
