'use client';

import { useAuth } from '@/features/auth/model/use-auth';

const COMMUNITY_VIEWER_QUERY_SCOPE = {
  ANONYMOUS: 'anonymous',
} as const;

export const resolveCommunityViewerQueryScope = (memberId?: number) => {
  if (typeof memberId === 'number') {
    return `member:${memberId}`;
  }

  return COMMUNITY_VIEWER_QUERY_SCOPE.ANONYMOUS;
};

export const useCommunityViewerQueryScope = () => {
  const { memberId } = useAuth();

  return resolveCommunityViewerQueryScope(memberId);
};
