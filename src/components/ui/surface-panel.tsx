import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

const surfacePanelVariants = cva(
  'border-border-subtle border bg-background-default',
  {
    variants: {
      radius: {
        sm: 'rounded-100',
        md: 'rounded-150',
        lg: 'rounded-200',
      },
      overflow: {
        visible: '',
        hidden: 'overflow-hidden',
      },
    },
    defaultVariants: {
      radius: 'sm',
      overflow: 'visible',
    },
  },
);

type SurfacePanelElement = 'div' | 'section' | 'article';

interface SurfacePanelProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof surfacePanelVariants> {
  as?: SurfacePanelElement;
}

export default function SurfacePanel({
  as = 'section',
  className,
  radius,
  overflow,
  ...props
}: SurfacePanelProps) {
  const Component = as;

  return (
    <Component
      className={cn(surfacePanelVariants({ radius, overflow }), className)}
      {...props}
    />
  );
}

type SurfacePanelHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function SurfacePanelHeader({
  className,
  ...props
}: SurfacePanelHeaderProps) {
  return (
    <div className={cn('border-border-subtle border-b p-200', className)} {...props} />
  );
}

type SurfacePanelEmptyProps = React.HTMLAttributes<HTMLDivElement>;

export function SurfacePanelEmpty({
  className,
  ...props
}: SurfacePanelEmptyProps) {
  return <div className={cn('px-200 py-250 text-center', className)} {...props} />;
}
