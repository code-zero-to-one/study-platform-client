'use client';

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type {
  CommunityFeedViewOption,
  CommunityFeedFilter,
  CommunityFeedFilterOption,
  CommunityPost,
} from '@/types/community/domain';
import {
  COMMUNITY_FEED_VIEW,
  CommunityFeedView,
} from '@/types/community/domain';
import CommunityPostCard from './community-post-card';
import CommunityPostListItem from './community-post-list-item';
import CommunitySectionShell from './community-section-shell';

const VIEW_ICON = {
  [COMMUNITY_FEED_VIEW.CARD]: LayoutGrid,
  [COMMUNITY_FEED_VIEW.LIST]: List,
} as const;

interface CommunityFeedSectionProps {
  activeFilter: CommunityFeedFilter;
  activeView: CommunityFeedView;
  filterOptions: readonly CommunityFeedFilterOption[];
  posts: readonly CommunityPost[];
  viewOptions: readonly CommunityFeedViewOption[];
  onFilterChange: (nextFilter: CommunityFeedFilter) => void;
  onViewChange: (nextView: CommunityFeedView) => void;
}

export default function CommunityFeedSection({
  activeFilter,
  activeView,
  filterOptions,
  posts,
  viewOptions,
  onFilterChange,
  onViewChange,
}: CommunityFeedSectionProps) {
  return (
    <CommunitySectionShell id="community-feed" className="gap-300">
      <div className="flex flex-col gap-200 border-b border-border-subtle pb-200">
        <div className="flex flex-col gap-150 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-150">
            <p className="font-designer-24b text-text-strong">글</p>
            <p className="font-designer-13r text-text-subtle">
              {posts.length}개
            </p>
          </div>

          <div className="flex w-fit items-center gap-50 rounded-150 border border-border-subtle bg-background-default p-50">
            {viewOptions.map((option) => {
              const isActive = option.id === activeView;
              const Icon = VIEW_ICON[option.id];

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onViewChange(option.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'flex h-400 items-center gap-75 rounded-100 px-150 transition-colors',
                    isActive
                      ? 'bg-fill-brand-subtle-default font-designer-14b text-text-strong'
                      : 'font-designer-14m text-text-subtle hover:text-text-default',
                  )}
                >
                  <Icon className="h-16 w-16" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-250 overflow-x-auto pb-50">
          {filterOptions.map((filter) => {
            const isActive = filter.id === activeFilter;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  'border-b-2 pb-100 whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-border-brand font-designer-14b text-text-strong'
                    : 'border-transparent font-designer-14m text-text-subtle hover:text-text-default',
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeView === COMMUNITY_FEED_VIEW.LIST ? (
        <div className="flex flex-col">
          {posts.map((post) => (
            <CommunityPostListItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="grid gap-250 md:grid-cols-2">
          {posts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </CommunitySectionShell>
  );
}
