import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const pageContainerVariants = cva('mx-auto w-full max-w-[1280px]', {
  variants: {
    spacing: {
      content: 'px-200 py-400 sm:px-300 sm:py-500 xl:px-400 xl:py-600',
      fallback: 'px-200 py-500 sm:px-300 xl:px-400',
      registration: 'px-150 py-400 sm:px-300 xl:px-400 xl:py-500',
    },
  },
  defaultVariants: {
    spacing: 'content',
  },
});

interface PageContainerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {}

export default function PageContainer({
  className,
  spacing,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(pageContainerVariants({ spacing }), className)}
      {...props}
    />
  );
}
