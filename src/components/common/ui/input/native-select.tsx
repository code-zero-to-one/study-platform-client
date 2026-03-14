import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const nativeSelectVariants = cva(
  'rounded-100 border bg-background-default text-text-default focus:border-border-brand focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      scale: {
        sm: 'font-designer-12r px-100 py-75',
        md: 'font-designer-13r h-400 px-100',
      },
      tone: {
        default: 'border-border-default',
        subtle: 'border-border-subtle',
      },
    },
    defaultVariants: {
      scale: 'md',
      tone: 'default',
    },
  },
);

type NativeSelectProps = Omit<
  React.ComponentPropsWithoutRef<'select'>,
  'size'
> &
  VariantProps<typeof nativeSelectVariants>;

export default function NativeSelect({
  className,
  scale,
  tone,
  children,
  ...props
}: NativeSelectProps) {
  return (
    <select
      className={cn(nativeSelectVariants({ scale, tone }), className)}
      {...props}
    >
      {children}
    </select>
  );
}
