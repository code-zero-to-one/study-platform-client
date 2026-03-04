import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface MetricCardProps extends React.ComponentPropsWithoutRef<'article'> {
  label: React.ReactNode;
  value: React.ReactNode;
  labelClassName?: string;
  valueClassName?: string;
}

export default function MetricCard({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
  ...props
}: MetricCardProps) {
  return (
    <article
      className={cn('rounded-100 border-border-subtle border p-200', className)}
      {...props}
    >
      <p className={cn('font-designer-14m text-text-subtle', labelClassName)}>
        {label}
      </p>
      <p className={cn('font-designer-24b text-text-strong', valueClassName)}>
        {value}
      </p>
    </article>
  );
}
