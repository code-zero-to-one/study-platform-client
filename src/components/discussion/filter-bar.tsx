import React from 'react';
import { SortOption, DiscussionTopic } from '@/types/discussion';
import { TOPIC_LABELS } from '@/mocks/discussion-mock-data';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { ArrowUpDown, Filter } from 'lucide-react';

interface FilterBarProps {
  sort: SortOption;
  topic: DiscussionTopic;
  onSortChange: (sort: SortOption) => void;
  onTopicChange: (topic: DiscussionTopic) => void;
}

const TOPICS: DiscussionTopic[] = ['all', 'development', 'study', 'free', 'question'];

export default function FilterBar({ sort, topic, onSortChange, onTopicChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-300 md:flex-row md:items-center md:justify-between">
      {/* 주제 필터 */}
      <div className="flex items-center gap-200 overflow-x-auto">
        <Filter className="h-4 w-4 shrink-0 text-text-subtle" />
        <div className="flex gap-100">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => onTopicChange(t)}
              className={cn(
                'shrink-0 rounded-100 px-300 py-150 font-designer-13b transition-all',
                topic === t
                  ? 'bg-fill-brand-default-default text-text-inverse shadow-1'
                  : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-brand hover:text-text-brand',
              )}
            >
              {TOPIC_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* 정렬 옵션 */}
      <div className="flex items-center gap-200">
        <ArrowUpDown className="h-4 w-4 shrink-0 text-text-subtle" />
        <div className="flex gap-100">
          <button
            onClick={() => onSortChange('latest')}
            className={cn(
              'rounded-100 px-300 py-150 font-designer-13b transition-all',
              sort === 'latest'
                ? 'bg-fill-neutral-strong-default text-text-inverse'
                : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-strong hover:text-text-strong',
            )}
          >
            최신순
          </button>
          <button
            onClick={() => onSortChange('popular')}
            className={cn(
              'rounded-100 px-300 py-150 font-designer-13b transition-all',
              sort === 'popular'
                ? 'bg-fill-neutral-strong-default text-text-inverse'
                : 'border border-border-subtle bg-background-default text-text-subtle hover:border-border-strong hover:text-text-strong',
            )}
          >
            인기순
          </button>
        </div>
      </div>
    </div>
  );
}
