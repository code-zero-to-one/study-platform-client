'use client';

import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/shared/shadcn/lib/utils';
import { Input as ShadcnInput } from '@/shared/shadcn/ui/input';

type NativeInputProps = React.ComponentProps<typeof ShadcnInput>;

type Color = 'default' | 'error' | 'success';
type Size = 'm' | 'l';

export type BaseInputProps = Omit<
  NativeInputProps,
  'size' | 'onChange' | 'value'
> & {
  color?: Color;
  size?: Size;
  value?: string;
  onValueChange?: (v: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

const inputVariants = cva(
  'rounded-100 border px-150 whitespace-pre-line focus-visible:ring-0 font-designer-16m',
  {
    variants: {
      color: {
        default: 'border-border-default text-text-default',
        error: 'border-border-error text-text-default',
        success: 'border-border-success text-text-default',
      },
      size: {
        m: 'h-[40px] py-100',
        l: 'h-[48px] py-150',
      },
    },
    defaultVariants: {
      color: 'default',
      size: 'l',
    },
  },
);

export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      className,
      color = 'default',
      size = 'l',
      onValueChange,
      onChange,
      ...props
    },
    ref,
  ) => {
    return (
      <ShadcnInput
        ref={ref}
        className={cn(inputVariants({ color, size }), className)}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value ?? '');
        }}
        {...props}
      />
    );
  },
);

BaseInput.displayName = 'BaseInput';
export default BaseInput;
