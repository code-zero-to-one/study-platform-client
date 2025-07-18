import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { cn } from '@/shared/shadcn/lib/utils';
import { Badge as BadgeShadcn } from '@/shared/shadcn/ui/badge';

const badgeVariants = cva(
  'inline-flex min-w-[24px] px-100 py-50 justify-center items-center gap-[2px] text-xs font-medium whitespace-nowrap',
  {
    variants: {
      color: {
        default:
          'bg-background-accent-blue-subtle text-text-subtlest border-border-default',
        completed: 'bg-fill-success-subtle-default text-text-success',
        incomplete: 'bg-fill-danger-subtle-default text-text-error',
        orange:
          'bg-background-accent-orange-subtle text-background-accent-orange-strong',
        gray: 'bg-background-accent-gray-subtle text-background-accent-gray-strong',
        purple:
          'bg-background-accent-purple-subtle text-background-accent-purple-strong',
      },
      shape: {
        rectangle: 'rounded-50',
        round: 'rounded-full',
      },
    },
    defaultVariants: {
      color: 'default',
      shape: 'rectangle',
    },
  },
);

interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof BadgeShadcn> {
  color?: VariantProps<typeof badgeVariants>['color'];
  shape?: VariantProps<typeof badgeVariants>['shape'];
}

/** 완료/미완료 등 상태를 보여주는 배지 컴포넌트 */
function Badge({
  color = 'default',
  shape = 'rectangle',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <BadgeShadcn
      className={cn(badgeVariants({ color, shape }), className)}
      {...props}
    >
      {children}
    </BadgeShadcn>
  );
}

export default Badge;
