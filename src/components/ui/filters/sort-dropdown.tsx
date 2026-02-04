import React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortDropdownProps<T extends string> {
  value: T;
  options: readonly SortOption<T>[];
  onChange: (value: T) => void;
  icon?: React.ReactNode;
  className?: string;
  menuClassName?: string;
}

export default function SortDropdown<T extends string>({
  value,
  options,
  onChange,
  icon,
  className,
  menuClassName,
}: SortDropdownProps<T>) {
  const label = options.find((option) => option.value === value)?.label ?? '';

  return (
    <div className={cn('group relative', className)}>
      <button
        type="button"
        className="rounded-100 bg-background-default border-border-subtle font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover flex items-center gap-50 border px-200 py-150 whitespace-nowrap transition-colors"
      >
        {icon}
        {label}
      </button>
      <div className="absolute top-full right-0 z-20 hidden w-[120px] pt-50 group-hover:block">
        <div
          className={cn(
            'bg-background-default border-border-subtle rounded-100 shadow-2 overflow-hidden border',
            menuClassName,
          )}
        >
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => onChange(option.value)}
              className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
