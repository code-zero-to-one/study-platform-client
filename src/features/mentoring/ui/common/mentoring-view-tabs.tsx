import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface MentoringViewTabItem<Key extends string> {
  key: Key;
  label: string;
  description: string;
  count: number;
}

interface MentoringViewTabsProps<Key extends string> {
  tabs: MentoringViewTabItem<Key>[];
  activeKey: Key;
  onChange: (key: Key) => void;
}

export default function MentoringViewTabs<Key extends string>({
  tabs,
  activeKey,
  onChange,
}: MentoringViewTabsProps<Key>) {
  return (
    <div className="bg-background-alternative rounded-150 grid grid-cols-1 gap-75 p-50 md:grid-cols-2">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'rounded-100 px-200 py-200 text-left transition-colors',
              isActive ? 'bg-fill-brand-subtle-default' : 'hover:bg-background-default',
            )}
          >
            <div className="flex items-start justify-between gap-100">
              <div className="min-w-0">
                <p
                  className={cn(
                    'font-designer-15b',
                    isActive ? 'text-text-brand' : 'text-text-default',
                  )}
                >
                  {tab.label}
                </p>
                <p className="mt-25 font-designer-12r text-text-subtle">
                  {tab.description}
                </p>
              </div>
              <span className="shrink-0 font-designer-12m text-text-subtle">
                {tab.count}건
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
