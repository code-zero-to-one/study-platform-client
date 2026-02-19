import { type MentoringMethodType } from '@/mocks/mentoring-mock-data';

const MENTOR_WRITE_ROLES = ['ROLE_MENTOR', 'ROLE_ADMIN'] as const;

export const hasMentorWritePermission = (
  roleIds: readonly string[] | undefined,
) => {
  if (!roleIds) {
    return false;
  }

  return MENTOR_WRITE_ROLES.some((role) => roleIds.includes(role));
};

export const MENTORING_METHOD_TYPES: readonly MentoringMethodType[] = [
  'note',
  'phone',
  'online',
  'offline',
];

export const isMentoringMethodType = (
  value: string | undefined,
): value is MentoringMethodType => {
  if (!value) {
    return false;
  }

  return MENTORING_METHOD_TYPES.includes(value as MentoringMethodType);
};
