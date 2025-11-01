import { axiosInstance } from '@/shared/tanstack-query/axios';
import { DeleteGroupStudyMemberRequest } from './group-study-types';

export const deleteGroupStudyMember = async ({
  groupStudyId,
  targetMemberId,
  reason,
}: DeleteGroupStudyMemberRequest) => {
  const res = await axiosInstance.delete(
    `/group-studies/${groupStudyId}/members`,
    { params: { targetMemberId, reason } },
  );

  return res.data.content; // 성공이면, null 반환
};
