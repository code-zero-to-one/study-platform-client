import * as React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

type ChipButtonVariant = 'preset' | 'state';

type ChipButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ChipButtonVariant;
  active?: boolean;
};

const VARIANT_CLASS: Record<ChipButtonVariant, string> = {
  preset:
    'font-designer-12m text-text-subtle hover:text-text-default border-border-subtlest rounded-500 border px-100 py-50',
  state: 'font-designer-13b rounded-100 border px-100 py-50',
};

export default function ChipButton({
  variant = 'preset',
  active = false,
  type = 'button',
  className,
  children,
  ...props
}: ChipButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        VARIANT_CLASS[variant],
        variant === 'state' &&
          (active
            ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
            : 'border-border-default bg-background-default text-text-subtle'),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
