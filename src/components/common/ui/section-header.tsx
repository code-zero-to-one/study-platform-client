import React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export default function SectionHeader({
  title,
  description,
  icon,
  rightSlot,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-150', className)}>
      <div className="flex items-start justify-between gap-200">
        <h2
          className={cn(
            'font-display-headings6 text-text-strong min-w-0 flex items-center gap-150 break-keep',
            titleClassName,
          )}
        >
          {title}
          {icon}
        </h2>
        {rightSlot}
      </div>
      {description && (
        <div
          className={cn(
            'font-designer-14r text-text-subtle',
            descriptionClassName,
          )}
        >
          {description}
        </div>
      )}
    </div>
  );
}
