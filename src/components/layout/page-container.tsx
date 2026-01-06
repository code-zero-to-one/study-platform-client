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
    <div className={clsx('mx-auto w-full max-w-[1164px]', className)}>
      {children}
    </div>
  );
}
