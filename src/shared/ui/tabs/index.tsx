import React from 'react';
import { cn } from '@/shared/shadcn/lib/utils';

interface TabItem {
  label: string;
  value: string;
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
  return (
    <div
      className={cn(
        'border-border-subtle flex w-full cursor-pointer gap-200 border-b-[1px]',
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'font-designer-16b transition-colors border-b-2 p-150',
            activeTab === tab.value
              ? 'border-primary text-primary text-[#181D27]'
              : 'border-transparent text-[#D5D7DA] hover:text-[#535862]',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
