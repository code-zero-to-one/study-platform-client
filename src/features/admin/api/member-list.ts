import { axiosInstance } from '@/shared/tanstack-query/axios';
import {
  ChangeMemberRoleRequest,
  ChangeMemberStatusRequest,
  GetMemberListRequest,
  GetMemberListResponse,
} from './types';

// 사용자 목록 조회
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

// 사용자 계정 상태 변경
export const changeMemberStatus = async ({
  memberId,
  to,
}: ChangeMemberStatusRequest) => {
  const res = await axiosInstance.patch(
    `/admin/members/${memberId}/status?to=${to}`,
  );

  return res.data;
};

// 사용자 권한 변경
export const changeMemberRole = async ({
  memberId,
  roleId,
}: ChangeMemberRoleRequest) => {
  const res = await axiosInstance.patch(
    `/admin/members/${memberId}/role?role-id=${roleId}`,
  );

  return res.data;
};
