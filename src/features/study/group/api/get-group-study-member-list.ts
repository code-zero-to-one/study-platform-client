import { axiosInstance } from '@/shared/tanstack-query/axios';
import {
  GroupStudyMembersRequest,
  GroupStudyMembersResponse,
} from './group-study-types';

// 그룹 스터디 참여자 리스트 조회 API - 페이징 처리 o/x 둘 다 가능
export const getGroupStudyMemberList = async ({
  id,
  pageNumber,
  pageSize,
}: GroupStudyMembersRequest): Promise<GroupStudyMembersResponse> => {
  const isPaging = pageNumber && pageSize ? true : false;
  const res = await axiosInstance.get(`/group-studies/${id}/members`, {
    params: isPaging ? { pageNumber, pageSize, isPaging } : { isPaging },
  });

  return res.data;
};
