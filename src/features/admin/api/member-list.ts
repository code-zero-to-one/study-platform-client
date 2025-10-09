import { axiosInstance } from '@/shared/tanstack-query/axios';
import { GetMemberListRequest, GetMemberListResponse } from './types';

export const getMemberList = async ({
  roleId,
  memberStatus,
  searchKeyword,
  page = 1,
}: GetMemberListRequest): Promise<GetMemberListResponse> => {
  // size는 10으로 고정
  let queryString = `page=${page}&size=10`;

  if (roleId) {
    queryString += `&role-id=${roleId}`;
  }
  if (memberStatus) {
    queryString += `&member-status=${memberStatus}`;
  }
  if (searchKeyword) {
    queryString += `&search-keyword=${searchKeyword}`;
  }

  const res = await axiosInstance.get(`/admin/members?${queryString}`);

  return res.data.content;
};
