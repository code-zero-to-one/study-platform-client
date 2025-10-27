import { axiosServerInstance } from '@/shared/tanstack-query/axios.server';
import {
  GroupStudyDetailRequest,
  GroupStudyDetailResponse,
} from './group-study-types';

// 그룹 스터디 리스트 조회
export const getGroupStudyDetailInServer = async ({
  groupStudyId,
}: GroupStudyDetailRequest): Promise<GroupStudyDetailResponse> => {
  const res = await axiosServerInstance.get(`/group-studies/${groupStudyId}`);

  return res.data.content;
};
