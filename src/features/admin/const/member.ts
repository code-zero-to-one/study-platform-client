export const ROLE_MAP = {
  ROLE_MEMBER: '일반',
  ROLE_MENTOR: '멘토',
  ROLE_ADMIN: '관리자',
};

export const ROLE_OPTIONS = Object.entries(ROLE_MAP).map(([key, label]) => ({
  value: key,
  label,
}));

export const MEMBER_STATUS_MAP = {
  ACTIVE: '활성',
  PERM_BAN: '일시정지',
  PAUSED: '영구정지',
  DORMANT: '휴면',
};

export const MEMBER_STATUS_OPTIONS = Object.entries(MEMBER_STATUS_MAP).map(
  ([key, label]) => ({
    value: key,
    label,
  }),
);
