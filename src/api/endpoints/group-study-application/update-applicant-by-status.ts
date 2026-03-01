import { axiosInstance } from '@/api/client/axios';
import { UpdateApplicantByStatusRequest } from '@/types/api/group-study-application.types';

// 스터디 신청자 상태 변경
export const updateApplicantByStatus = async (
  params: UpdateApplicantByStatusRequest,
) => {
  const { status, groupStudyId, applyId } = params;

  const { data } = await axiosInstance.patch(
    `/group-studies/${groupStudyId}/apply/${applyId}/process`,
    {
      status,
    },
  );

  if (data.statusCode !== 200) {
    throw new Error('Failed to fetch entry list');
  }

  return data.content;
};
