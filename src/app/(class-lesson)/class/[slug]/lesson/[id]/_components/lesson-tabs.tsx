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
    <div className="flex gap-250">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex flex-col items-center gap-112 px-100 pt-100 pb-0 transition-colors',
              active
                ? 'font-designer-20b text-rose-500'
                : 'font-designer-20r text-gray-800',
            )}
          >
            <span className="h-375 flex items-center justify-center text-center">
              {tab.label}
            </span>
            {active && <span className="h-[1px] self-stretch bg-rose-500" />}
          </button>
        );
      })}
    </div>
  );
}
