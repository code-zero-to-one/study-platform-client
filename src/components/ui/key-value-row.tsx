import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface KeyValueRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  children: React.ReactNode;
  columnsClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  valueAs?: 'div' | 'p' | 'span';
}

export default function KeyValueRow({
  label,
  children,
  className,
  columnsClassName,
  labelClassName,
  valueClassName,
  valueAs = 'div',
  ...props
}: KeyValueRowProps) {
  const ValueTag = valueAs;

  return (
    <div className={cn('grid gap-75', columnsClassName, className)} {...props}>
      <p className={cn('font-designer-13m text-text-subtle', labelClassName)}>
        {label}
      </p>
      <ValueTag className={cn('font-designer-14r text-text-default', valueClassName)}>
        {children}
      </ValueTag>
    </div>
  );
}
