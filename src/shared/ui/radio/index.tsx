'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/shared/shadcn/lib/utils';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
}

const radioGroupItemVariants = cva(
  'border-border-default hover:bg-fill-neutral-subtle-hover disabled:border-border-disabled disabled:bg-icon-disabled data-[state=checked]:border-border-success rounded-full border-2 bg-white data-[state=checked]:border-4',
  {
    variants: {
      size: {
        medium: 'h-[16px] w-[16px]',
        large: 'h-[20px] w-[20px]',
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

function RadioGroupItem({
  size = 'large',
  className,
  ...props
}: { size: 'medium' | 'large' } & React.ComponentProps<
  typeof RadioGroupPrimitive.RadioGroupItem
>) {
  return (
    <RadioGroupPrimitive.RadioGroupItem
      className={cn(radioGroupItemVariants({ size }), className)}
      {...props}
    >
      <RadioGroupPrimitive.RadioGroupIndicator className="flex h-full w-full items-center justify-center rounded-full" />
    </RadioGroupPrimitive.RadioGroupItem>
  );
}

export { RadioGroup, RadioGroupItem };
