'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-100 transition-colors focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      tone: {
        ghost: 'text-text-subtle hover:bg-background-alternative',
        outline:
          'border-border-subtle bg-background-default text-text-default hover:border-border-brand border',
        brand:
          'bg-fill-brand-default-default text-text-inverse hover:bg-fill-brand-default-hover',
      },
      size: {
        xs: 'h-[28px] w-[28px]',
        sm: 'h-[32px] w-[32px]',
        md: 'h-[40px] w-[40px]',
        lg: 'h-[48px] w-[48px]',
      },
    },
    defaultVariants: {
      tone: 'ghost',
      size: 'sm',
    },
  },
);

type IconButtonProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> &
  VariantProps<typeof iconButtonVariants> & {
    asChild?: boolean;
    label: string;
    loading?: boolean;
    spinner?: React.ReactNode;
  };

export default function IconButton({
  className,
  tone,
  size,
  asChild = false,
  label,
  children,
  loading = false,
  spinner,
  disabled,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const loadingIndicator = spinner ?? (
    <span className="h-14 w-14 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
  const isDisabled = disabled || loading;

  return (
    <Comp
      type={asChild ? undefined : 'button'}
      className={cn(iconButtonVariants({ tone, size }), className)}
      aria-label={label}
      aria-busy={loading || undefined}
      data-disabled={isDisabled || undefined}
      disabled={asChild ? undefined : isDisabled}
      {...props}
    >
      {loading ? loadingIndicator : children}
    </Comp>
  );
}
