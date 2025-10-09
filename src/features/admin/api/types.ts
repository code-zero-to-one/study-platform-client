export type RoleId = 'ROLE_MEMBER' | 'ROLE_ADMIN' | 'ROLE_MENTOR';
type RoleName = '일반' | '관리자' | '멘토';
export type MemberStatus = 'ACTIVE' | 'PAUSED' | 'PERM_BAN' | 'DORMANT';

export interface GetMemberListRequest {
  roleId?: RoleId;
  memberStatus?: MemberStatus;
  searchKeyword?: string;
  page?: number;
}

export interface GetMemberListResponse {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  content: {
    memberId: number;
    memberStatus: MemberStatus;
    memberName: string;
    joinedAt: string;
    loginMostRecentlyAt: string;
    role: {
      roleId: RoleId;
      roleName: RoleName;
    };
  }[];
}

export interface GetAccountHistoriesRequest {
  memberId: number;
}

export interface GetAccountHistoriesResponse {
  memberId: number;
  joinedAt: string;
  loginMostRecentlyAt: string;
  loginHists: string[];
  roleChangeHists: {
    changedAt: string;
    from: string;
    to: string;
  }[];
  memberStatusChangeHists: {
    changedAt: string;
    from: string;
    to: string;
  }[];
}
