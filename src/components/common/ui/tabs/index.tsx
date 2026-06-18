import { Lock } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Tooltip from '@/components/common/ui/tooltip';

interface TabItem {
  label: string;
  value: string;
  locked?: boolean;
  lockedTooltip?: string;
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

const tabBaseClass = 'font-designer-16b shrink-0 border-b-2 p-150';
const lockedTabButtonClass = cn(
  tabBaseClass,
  'flex cursor-not-allowed items-center gap-50 border-transparent text-text-disabled',
);

// lockedTooltip이 없으면 disabled 버튼만 렌더
// lockedTooltip이 있으면 Tooltip 래핑 + aria-disabled (pointer events 유지)
// 웹: pointerEnter/Leave(mouse)로 hover 제어
// 모바일: pointerDown(touch)으로 toggle 제어 — touch 시 pointerleave가 즉시 발생해 Radix가 닫히는 문제 해결
function LockedTabButton({
  label,
  lockedTooltip,
}: {
  label: string;
  lockedTooltip?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!lockedTooltip) {
    return (
      <button type="button" disabled className={lockedTabButtonClass}>
        {label}
        <Lock size={14} />
      </button>
    );
  }

  return (
    <Tooltip
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          aria-disabled="true"
          className={lockedTabButtonClass}
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') setOpen(true);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') setOpen(false);
          }}
          onPointerDown={(e) => {
            if (e.pointerType === 'touch') setOpen((prev) => !prev);
          }}
        >
          {label}
          <Lock size={14} />
        </button>
      }
      value={lockedTooltip}
      side="bottom"
      delayDuration={0}
      contentClassName="font-designer-12m rounded-100 bg-background-neutral-strong whitespace-nowrap px-200 shadow-lg"
    />
  );
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
        'border-border-subtle flex w-full cursor-pointer gap-200 overflow-x-auto border-b',
        className,
      )}
    >
      {tabs.map((tab) =>
        tab.locked ? (
          <LockedTabButton
            key={tab.value}
            label={tab.label}
            lockedTooltip={tab.lockedTooltip}
          />
        ) : (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              tabBaseClass,
              'transition-colors',
              activeTab === tab.value
                ? 'border-primary text-primary text-text-strong'
                : 'border-transparent text-text-disabled hover:text-text-subtle',
            )}
          >
            {tab.label}
          </button>
        ),
      )}
    </div>
  );
}
