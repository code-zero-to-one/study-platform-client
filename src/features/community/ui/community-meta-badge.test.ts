import { describe, expect, it } from 'vitest';
import { COMMUNITY_MEMBER_ROLE } from '@/types/community/domain';
import { getCommunityRoleMeta } from './community-meta-badge';

describe('getCommunityRoleMeta', () => {
  it('keeps developer members on the developer badge', () => {
    expect(getCommunityRoleMeta(COMMUNITY_MEMBER_ROLE.DEVELOPER)).toEqual({
      color: 'blue',
      label: '개발자',
    });
  });

  it('shows mentors with the same badge as developers', () => {
    expect(getCommunityRoleMeta(COMMUNITY_MEMBER_ROLE.MENTOR)).toEqual({
      color: 'blue',
      label: '개발자',
    });
  });

  it('treats non-developer roles as newcomer badges', () => {
    expect(getCommunityRoleMeta(COMMUNITY_MEMBER_ROLE.NEWCOMER)).toEqual({
      color: 'gray',
      label: 'IT문자',
    });
    expect(getCommunityRoleMeta(COMMUNITY_MEMBER_ROLE.UNKNOWN)).toEqual({
      color: 'gray',
      label: 'IT문자',
    });
  });
});
