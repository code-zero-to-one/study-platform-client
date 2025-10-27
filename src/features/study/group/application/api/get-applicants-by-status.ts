import { axiosInstance } from '@/shared/tanstack-query/axios';
import {
  GetApplicantsByStatusRequest,
  GetApplicantsByStatusResponse,
} from './type';

// 상태별 스터디 신청자 조회
export const getApplicantsByStatus = async (
  params: GetApplicantsByStatusRequest,
): Promise<GetApplicantsByStatusResponse> => {
  const { page, size, status, groupStudyId } = params;

  const { data } = await axiosInstance.get(
    `/group-studies/${groupStudyId}/applies?applyStatus=${status}`,
    {
      params: {
        page,
        'page-size': size,
      },
    },
  );

  if (data.statusCode !== 200) {
    throw new Error('Failed to fetch entry list');
  }

  return data.content;
};
