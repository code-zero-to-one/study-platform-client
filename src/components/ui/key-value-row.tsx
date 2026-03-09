import type { ReactNode } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface KeyValueRowProps extends React.ComponentProps<'div'> {
  label: ReactNode;
  columnsClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
}

export default function KeyValueRow({
  label,
  children,
  className,
  columnsClassName,
  labelClassName,
  valueClassName,
  ...props
}: KeyValueRowProps) {
  return (
    <div
      className={cn(
        'grid gap-100',
        columnsClassName ?? 'grid-cols-[96px_minmax(0,1fr)]',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'font-designer-13r text-text-subtle break-keep',
          labelClassName,
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'font-designer-14m text-text-default min-w-0 break-words',
          valueClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
