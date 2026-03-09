import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

export function SurfacePanelHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('border-border-subtle border-b p-200', className)}
      {...props}
    />
  );
}

export default function SurfacePanel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-200 border-border-subtle bg-background-default border',
        className,
      )}
      {...props}
    />
  );
}
