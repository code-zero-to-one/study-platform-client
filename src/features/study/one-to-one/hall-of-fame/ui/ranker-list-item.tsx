'use client';

import { Crown } from 'lucide-react';
import React from 'react';
import UserAvatar from '@/components/ui/avatar';
import UserProfileModal from '@/entities/user/ui/user-profile-modal';
import type { RankerWithLabel } from './hall-of-fame-constants';
import RankBadge from './rank-badge';

interface RankerListItemProps {
  ranker: RankerWithLabel;
}

export default function RankerListItem({ ranker }: RankerListItemProps) {
  return (
    <UserProfileModal
      memberId={ranker.userId}
      trigger={
        <div className="group bg-background-default border-border-subtle rounded-150 shadow-1 hover:shadow-2 hover:border-border-default flex cursor-pointer items-center gap-300 border p-250 transition-all">
          <div className="flex w-[50px] shrink-0 items-center justify-center">
            <RankBadge rank={ranker.rank} />
          </div>

          <UserAvatar
            image={
              ranker.profileImage?.resizedImages?.[0]?.resizedImageUrl ??
              undefined
            }
            alt={ranker.nickname}
            size={48}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-100">
              <span className="font-designer-16b text-text-strong group-hover:text-text-brand truncate transition-colors">
                {ranker.nickname}
              </span>
              {ranker.rank === 1 && (
                <Crown
                  className="text-text-warning h-3 w-3"
                  fill="currentColor"
                />
              )}
            </div>
            <span className="font-designer-13r text-text-subtle truncate">
              {ranker.jobs && ranker.jobs.length > 0
                ? ranker.jobs
                    .map((job) => job.description || job.job || '')
                    .filter(Boolean)
                    .join(', ')
                : ranker.major}
            </span>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-bold-h5 text-text-strong">
              {ranker.scoreLabel}
            </div>
          </div>
        </div>
      }
    />
  );
}
