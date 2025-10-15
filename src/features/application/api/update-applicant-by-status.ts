import { axiosInstance } from '@/shared/tanstack-query/axios';
import { updateApplicantByStatusRequest } from './type';

// 스터디 신청자 상태 변경
export const updateApplicantByStatus = async (
  params: updateApplicantByStatusRequest,
) => {
  const { status, groupStudyId, applyId } = params;

  const { data } = await axiosInstance.patch(
    `/group-studies/${groupStudyId}/apply/${applyId}/process`,
    {
      params: {
        status,
      },
    },
  );

  if (data.statusCode !== 200) {
    throw new Error('Failed to fetch entry list');
  }

  return data.content;
};
