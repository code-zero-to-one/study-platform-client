import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface MentoringStageItem<Key extends string> {
  key: Key;
  step: string;
  label: string;
  description: string;
  count: number;
}

interface MentoringStageSelectorProps<Key extends string> {
  stages: MentoringStageItem<Key>[];
  activeKey: Key;
  onChange: (key: Key) => void;
}

export default function MentoringStageSelector<Key extends string>({
  stages,
  activeKey,
  onChange,
}: MentoringStageSelectorProps<Key>) {
  return (
    <div className="grid grid-cols-1 gap-125 lg:grid-cols-3">
      {stages.map((stage) => {
        const isActive = stage.key === activeKey;

        return (
          <button
            key={stage.key}
            type="button"
            onClick={() => onChange(stage.key)}
            className={cn(
              'rounded-150 border p-200 text-left transition-colors',
              isActive
                ? 'border-border-brand bg-background-default'
                : 'border-border-subtle bg-background-default hover:bg-background-alternative',
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-100">
                <span
                  className={cn(
                    'inline-flex h-300 w-300 shrink-0 items-center justify-center rounded-full font-designer-12b',
                    isActive
                      ? 'bg-fill-brand-default-default text-text-inverse'
                      : 'bg-background-alternative text-text-subtle',
                  )}
                >
                  {stage.step}
                </span>
                <span
                  className={cn(
                    'font-designer-15b',
                    isActive ? 'text-text-brand' : 'text-text-default',
                  )}
                >
                  {stage.label}
                </span>
              </div>
              <span className="shrink-0 font-designer-13m text-text-subtle">
                {stage.count}건
              </span>
            </div>
            <p className="mt-100 font-designer-12r text-text-subtle">
              {stage.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
