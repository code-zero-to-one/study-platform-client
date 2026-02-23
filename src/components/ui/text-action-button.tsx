import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

const textActionButtonVariants = cva(
  'inline-flex items-center gap-50 rounded-75 border px-100 py-75',
  {
    variants: {
      tone: {
        subtle:
          'text-text-subtle hover:text-text-default border-border-subtlest',
        default: 'text-text-subtle hover:text-text-default border-border-default',
      },
      weight: {
        regular: 'font-designer-14m',
        bold: 'font-designer-13b',
      },
      withTransition: {
        true: 'transition-colors',
        false: '',
      },
    },
    defaultVariants: {
      tone: 'subtle',
      weight: 'regular',
      withTransition: false,
    },
  },
);

type TextActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof textActionButtonVariants> & {
    icon?: React.ReactNode;
  };

export default function TextActionButton({
  type = 'button',
  className,
  tone,
  weight,
  withTransition,
  icon,
  children,
  ...props
}: TextActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        textActionButtonVariants({ tone, weight, withTransition }),
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
