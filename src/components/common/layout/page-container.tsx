import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={clsx('mx-auto w-7xl px-400 py-600', className)}>
      {children}
    </div>
  );
}
