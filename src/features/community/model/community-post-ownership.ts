import type { CommunityPost } from '@/types/community/domain';

export const isCommunityPostOwnedByMember = (
  post: CommunityPost,
  memberId?: number,
): boolean =>
  typeof memberId === 'number' &&
  post.origin === 'local' &&
  post.authorMemberId === memberId;
