/**
 * 프로토타입 브랜치 전용 목업 데이터.
 * 프로덕션/스테이징 배포 시에는 사용되지 않음.
 */

export const PROTOTYPE_MEMBER_ID = 1;
export const PROTOTYPE_MEMBER_ID_STR = String(PROTOTYPE_MEMBER_ID);

export const PROTOTYPE_USER: {
  memberId: number;
  nickname: string;
  memberName: string;
  tel: null;
  profileImageUrl: null;
} = {
  memberId: PROTOTYPE_MEMBER_ID,
  nickname: '정하승',
  memberName: '정하승',
  tel: null,
  profileImageUrl: null,
};

export const PROTOTYPE_AUTH_SESSION = {
  accessToken: 'prototype-mock-token',
  memberId: PROTOTYPE_MEMBER_ID_STR,
} as const;
