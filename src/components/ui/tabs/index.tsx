import { Lock } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface TabItem {
  label: string;
  value: string;
  locked?: boolean;
  tooltip?: string;
}

interface SectionTabsProps {
  /** 탭 목록 */
  tabs: TabItem[];
  /** 선택된 탭 */
  activeTab: string;
  /** 탭 클릭 시 호출 */
  onChange: (value: string) => void;
  /** 추가 className */
  className?: string;
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
}: SectionTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <div
      className={cn(
        'border-border-subtle flex w-full cursor-pointer gap-200 border-b',
        className,
      )}
    >
      {tabs.map((tab) => (
        <div
          key={tab.value}
          className="relative"
          onMouseEnter={() => setHoveredTab(tab.value)}
          onMouseLeave={() => setHoveredTab(null)}
        >
          <button
            type="button"
            onClick={() => !tab.locked && onChange(tab.value)}
            disabled={tab.locked}
            className={cn(
              'font-designer-16b flex items-center gap-75 border-b-2 p-150 transition-colors',
              activeTab === tab.value
                ? 'border-primary text-primary text-[#181D27]'
                : 'border-transparent text-[#D5D7DA] hover:text-[#535862]',
              tab.locked && 'cursor-not-allowed opacity-60',
            )}
          >
            {tab.label}
            {tab.locked && <Lock className="h-150 w-150" />}
          </button>

          {/* 툴팁 */}
          {tab.locked && hoveredTab === tab.value && tab.tooltip && (
            <div className="rounded-100 bg-background-neutral-strong text-text-inverse font-designer-12m pointer-events-none absolute top-full left-1/2 z-50 mt-100 -translate-x-1/2 px-200 py-100 whitespace-nowrap shadow-lg">
              {tab.tooltip}
              <div className="border-b-background-neutral-strong absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
