'use client';

import Avatar from '@/components/common/ui/avatar';
import type { CommunityPost } from '@/types/community/domain';
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import { CommunityMemberRoleBadge } from './community-meta-badge';

interface CommunityAuthorProfileCardProps {
  post: CommunityPost;
}

export default function CommunityAuthorProfileCard({
  post,
}: CommunityAuthorProfileCardProps) {
  const hasAuthorIntro = post.authorIntro.trim().length > 0;

  return (
    <section className="flex items-start gap-200">
      <Avatar image={post.authorImage} alt={post.authorName} size={56} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-100">
          <CommunityAuthorNameTrigger
            memberId={post.authorMemberId}
            name={post.authorName}
            className="font-designer-20b text-text-strong"
          />
          <CommunityMemberRoleBadge role={post.role} />
        </div>

        {hasAuthorIntro ? (
          <p className="mt-100 font-designer-14r leading-250 text-text-subtle">
            {post.authorIntro}
          </p>
        ) : null}
      </div>
    </section>
  );
}
