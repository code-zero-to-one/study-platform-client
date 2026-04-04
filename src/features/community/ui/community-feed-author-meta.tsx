'use client';

import type { ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import type { CommunityMemberRole } from '@/types/community/domain';
import CommunityAuthorNameTrigger from './community-author-name-trigger';
import { CommunityMemberRoleBadge } from './community-meta-badge';

interface CommunityFeedAuthorMetaProps {
  authorImage?: string;
  authorName: string;
  createdAt: string;
  memberId: number;
  role: CommunityMemberRole;
  afterDate?: ReactNode;
  className?: string;
}

export default function CommunityFeedAuthorMeta({
  authorImage,
  authorName,
  createdAt,
  memberId,
  role,
  afterDate,
  className,
}: CommunityFeedAuthorMetaProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-100', className)}>
      <span className="flex items-center gap-75">
        <Avatar image={authorImage} alt={authorName} size={20} />
        <CommunityAuthorNameTrigger
          memberId={memberId}
          name={authorName}
          className="font-designer-13r text-text-default"
        />
      </span>
      <CommunityMemberRoleBadge role={role} />
      <span className="font-designer-13r text-text-subtlest">{createdAt}</span>
      {afterDate}
    </div>
  );
}
