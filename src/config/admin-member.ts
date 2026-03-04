import type { ManageableRoleId } from '@/types/api/admin.types';

export const ROLE_MAP: Record<ManageableRoleId, string> = {
  ROLE_MEMBER: '일반',
  ROLE_ADMIN: '관리자',
};

export const ROLE_OPTIONS: Array<{ value: ManageableRoleId; label: string }> = [
  { value: 'ROLE_MEMBER', label: ROLE_MAP.ROLE_MEMBER },
  { value: 'ROLE_ADMIN', label: ROLE_MAP.ROLE_ADMIN },
];

export const isManageableRoleId = (
  value: string,
): value is ManageableRoleId => {
  return value === 'ROLE_MEMBER' || value === 'ROLE_ADMIN';
};

export const getRoleLabel = (roleId: string, roleName?: string) => {
  if (isManageableRoleId(roleId)) {
    return ROLE_MAP[roleId];
  }

  const trimmedRoleName = roleName?.trim() ?? '';
  if (trimmedRoleName.length > 0) {
    return trimmedRoleName;
  }

  return roleId;
};

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
