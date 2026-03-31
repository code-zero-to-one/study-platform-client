'use client';

import Avatar from '@/components/common/ui/avatar';
import type { CommunityQnaAuthor } from '@/types/community/qna-domain';
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import { CommunityMemberRoleBadge } from './community-meta-badge';

interface CommunityQnaAuthorSummaryProps {
  author: CommunityQnaAuthor;
  nameClassName?: string;
}

export default function CommunityQnaAuthorSummary({
  author,
  nameClassName = 'font-designer-20b text-text-strong',
}: CommunityQnaAuthorSummaryProps) {
  return (
    <section className="flex items-center gap-200">
      <Avatar image={author.profileImageUrl} alt={author.name} size={56} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-100">
          <CommunityAuthorNameTrigger
            memberId={author.memberId}
            name={author.name}
            className={nameClassName}
          />
          <CommunityMemberRoleBadge role={author.role} />
        </div>
      </div>
    </section>
  );
}
