'use client';

import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface NativeSelectProps extends React.ComponentProps<'select'> {
  uiSize?: 'm' | 'l';
}

export default function NativeSelect({
  className,
  children,
  uiSize = 'm',
  ...props
}: NativeSelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full appearance-none rounded-100 border border-border-default bg-background-default px-150 pr-450 font-designer-16m text-text-default focus-visible:outline-none disabled:cursor-not-allowed disabled:border-border-disabled disabled:bg-background-disabled disabled:text-text-disabled',
          uiSize === 'm' ? 'h-[40px]' : 'h-[48px]',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-150 h-4 w-4 -translate-y-1/2 text-text-subtle" />
    </div>
  );
}
