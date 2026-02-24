import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface FormSectionCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  bodyClassName?: string;
}

export default function FormSectionCard({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  bodyClassName,
}: FormSectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-150 border-border-subtle bg-background-default border p-250',
        className,
      )}
    >
      <h2
        className={cn(
          'font-designer-20b text-text-default mb-75',
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'font-designer-13r text-text-subtle mb-150',
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  );
}
