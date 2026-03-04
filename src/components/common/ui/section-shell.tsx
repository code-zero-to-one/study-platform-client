import React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface SectionShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionShell({
  children,
  className,
}: SectionShellProps) {
  return (
    <div className={cn('flex flex-col gap-400', className)}>{children}</div>
  );
}
