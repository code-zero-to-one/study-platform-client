import { ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1280px] px-400 py-600', className)}
    >
      {children}
    </div>
  );
}
