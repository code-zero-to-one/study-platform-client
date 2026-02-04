import React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface InlineSectionHeaderProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export default function InlineSectionHeader({
  title,
  icon,
  badge,
  rightSlot,
  className,
  titleClassName,
}: InlineSectionHeaderProps) {
  return (
    <div className={cn('flex justify-between', className)}>
      <div className="flex items-center gap-150">
        {icon}
        <span
          className={cn('font-designer-16m text-text-default', titleClassName)}
        >
          {title}
        </span>
        {badge}
      </div>
      {rightSlot}
    </div>
  );
}
