import { type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface FilterSortListTemplateProps {
  toolbar: ReactNode;
  children: ReactNode;
  pagination?: ReactNode;
  className?: string;
  toolbarClassName?: string;
  paginationClassName?: string;
}

export default function FilterSortListTemplate({
  toolbar,
  children,
  pagination,
  className,
  toolbarClassName,
  paginationClassName,
}: FilterSortListTemplateProps) {
  return (
    <section className={cn(className)}>
      <div
        className={cn(
          'mb-300 flex flex-col gap-150 sm:flex-row sm:items-center sm:justify-between',
          toolbarClassName,
        )}
      >
        {toolbar}
      </div>
      {children}
      {pagination ? (
        <div className={cn('mt-250', paginationClassName)}>{pagination}</div>
      ) : null}
    </section>
  );
}
