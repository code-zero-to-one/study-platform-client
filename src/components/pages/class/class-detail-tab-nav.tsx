import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { TABS, type Tab } from './class-detail-constants';

interface ClassDetailTabNavProps {
  activeTab: Tab;
  onTabClick: (tab: Tab) => void;
}

export function ClassDetailTabNav({
  activeTab,
  onTabClick,
}: ClassDetailTabNavProps) {
  return (
    <div className="mt-[27px] sticky top-0 z-10 border-b border-border-default bg-background-default">
      <div className="mx-auto max-w-page px-600">
        <nav className="flex gap-125">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabClick(tab.id)}
              className={cn(
                'flex flex-col gap-[9px] px-100 pt-100',
                activeTab === tab.id
                  ? 'font-designer-16b text-text-brand'
                  : 'font-designer-16r text-gray-800',
              )}
            >
              {tab.label}
              <div
                className={cn(
                  'h-px w-full transition-colors',
                  activeTab === tab.id
                    ? 'bg-background-brand-default'
                    : 'bg-transparent',
                )}
              />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
