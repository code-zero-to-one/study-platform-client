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
    <div className="sticky top-0 z-10 mt-325 border-b border-border-default bg-background-default">
      <div className="mx-auto max-w-page px-600">
        <div className="relative">
          <nav className="flex gap-125 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabClick(tab.id)}
                className={cn(
                  'shrink-0 flex flex-col gap-100 px-100 pt-100',
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
          <div className="pointer-events-none absolute right-0 top-0 h-full w-400 bg-gradient-to-l from-background-default to-transparent" />
        </div>
      </div>
    </div>
  );
}
