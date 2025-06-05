'use client';

import { HTMLAttributes } from 'react';
import {
  type CalendarDay as DayPickerDay,
  type Modifiers,
} from 'react-day-picker';
import { cn } from '@/shared/shadcn/lib/utils';

interface CalendarDayProps extends HTMLAttributes<HTMLTableCellElement> {
  day: DayPickerDay;
  modifiers?: Modifiers;
  children?: React.ReactNode;
}

export function CalendarDay({
  day,
  modifiers,
  children,
  className,
  ...props
}: CalendarDayProps) {
  const customClass = cn(
    modifiers?.outside && 'text-text-subtlest',
    !modifiers?.outside &&
      modifiers?.completed &&
      'bg-background-success-default text-text-inverse rounded-full',
    !modifiers?.outside &&
      !modifiers?.completed &&
      modifiers?.sunday &&
      'text-text-error',
  );

  return (
    <td className={cn('relative text-center align-top', className)} {...props}>
      <div className="relative w-full">
        <div className="pt-[100%]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'flex size-[32px] items-center justify-center rounded-full',
              customClass,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </td>
  );
}
