import React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

export interface ViewModeOption<T extends string> {
  value: T;
  icon: React.ReactNode;
  title?: string;
}

interface ViewModeToggleProps<T extends string> {
  value: T;
  options: ViewModeOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export default function ViewModeToggle<T extends string>({
  value,
  options,
  onChange,
  className,
}: ViewModeToggleProps<T>) {
  return (
    <div
      className={cn(
        'bg-background-default rounded-100 border-border-subtle flex shrink-0 border p-50',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-75 p-100 transition-colors',
              isActive
                ? 'bg-fill-neutral-default-default text-text-strong shadow-sm'
                : 'text-text-subtlest hover:text-text-subtle',
            )}
            title={option.title}
            aria-label={option.title ?? option.value}
            aria-pressed={isActive}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
