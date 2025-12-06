import { axiosInstance } from '@/api/client/axios';
import {
  MemberStudyListRequest,
  MemberStudyListResponse,
} from './group-study-types';

export const getMemberStudyList = async ({
  memberId,
  studyType = 'BOTH',
  studyStatus = 'BOTH',
  inProgressPage = 1,
  inProgressPageSize = 9,
  completedPage = 1,
  completedPageSize = 9,
}: MemberStudyListRequest): Promise<MemberStudyListResponse> => {
  const res = await axiosInstance.get(`/members/${memberId}/studies`, {
    params: {
      'study-type': studyType,
      'study-status': studyStatus,
      'in-progress-page': inProgressPage,
      'in-progress-page-size': inProgressPageSize,
      'completed-page': completedPage,
      'completed-page-size': completedPageSize,
    },
  });

  return res.data.content;
};
