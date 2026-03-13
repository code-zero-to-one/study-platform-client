import { Lock } from 'lucide-react';
import React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Tooltip from '@/components/common/ui/tooltip';

interface TabItem {
  label: string;
  value: string;
  locked?: boolean;
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
        'border-border-subtle flex w-full cursor-pointer gap-200 border-b',
        className,
      )}
    >
      {tabs.map((tab) =>
        tab.locked ? (
          <Tooltip
            key={tab.value}
            delayDuration={0}
            trigger={
              <span className="inline-flex">
                <button
                  type="button"
                  disabled
                  className="font-designer-16b flex cursor-not-allowed items-center gap-50 border-b-2 border-transparent p-150 text-[#D5D7DA]"
                >
                  {tab.label}
                  <Lock size={14} />
                </button>
              </span>
            }
            value="스터디 가입하여 확인"
            side="bottom"
            contentClassName="font-designer-12m rounded-100"
          />
        ) : (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'font-designer-16b border-b-2 p-150 transition-colors',
              activeTab === tab.value
                ? 'border-primary text-primary text-[#181D27]'
                : 'border-transparent text-[#D5D7DA] hover:text-[#535862]',
            )}
          >
            {tab.label}
          </button>
        ),
      )}
    </div>
  );
}
