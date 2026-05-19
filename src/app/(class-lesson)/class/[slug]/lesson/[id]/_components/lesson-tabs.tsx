'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

export type LessonTabValue = 'follow' | 'review';

interface Props {
  value: LessonTabValue;
  onChange: (next: LessonTabValue) => void;
}

const TABS: { value: LessonTabValue; label: string }[] = [
  { value: 'follow', label: '따라해보기' },
  { value: 'review', label: '레슨 돌아보기' },
];

export function LessonTabs({ value, onChange }: Props) {
  return (
    <div className="flex gap-300 border-b border-gray-200">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex items-center pb-150 pt-100 transition-colors',
              active
                ? 'font-designer-16b text-text-brand'
                : 'font-designer-16r text-gray-800',
            )}
          >
            {tab.label}
            {active && (
              <span className="absolute -bottom-px left-0 right-0 h-px bg-background-brand-default" />
            )}
          </button>
        );
      })}
    </div>
  );
}
