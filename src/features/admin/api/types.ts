export type RoleId = 'ROLE_MEMBER' | 'ROLE_ADMIN' | 'ROLE_MENTOR';
type RoleName = '일반' | '관리자' | '멘토';
export type MemberStatus = 'ACTIVE' | 'PAUSED' | 'PERM_BAN' | 'DORMANT';

// 사용자 리스트 조회 API 요청 타입
export interface GetMemberListRequest {
  roleId?: RoleId;
  memberStatus?: MemberStatus;
  searchKeyword?: string;
  page?: number;
}

// 사용자 리스트 조회 API 응답 타입
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

// 사용자 계정 이력 조회 API 요청 타입
export interface GetAccountHistoriesRequest {
  memberId: number;
}

// 사용자 계정 이력 조회 API 응답 타입
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

// 사용자 상태 변경 API 요청 타입
export interface ChangeMemberStatusRequest {
  memberId: number;
  to: MemberStatus;
}

// 사용자 권한 변경 API 요청 타입
export interface ChangeMemberRoleRequest {
  memberId: number;
  roleId: RoleId;
}

// 성실 온도 이력 조회 API 요청 타입
export interface GetSincerityTemperatureHistoryRequest {
  memberId: number;
  page: number;
}

// 성실 온도 이력 조회 API 응답 타입
export interface GetSincerityTemperatureHistoryResponse {
  currentSincerityTemperature: number;
  sincerityTemperatureHistory: {
    content: {
      reasonType: 'STUDY_REVIEW';
      increment: number;
      recordedAt: string;
    }[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
