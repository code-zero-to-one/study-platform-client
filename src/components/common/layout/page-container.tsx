import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={clsx('mx-auto w-[1280px] px-400 py-600', className)}>
      {children}
    </div>
  );
}
