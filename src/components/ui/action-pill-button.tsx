import React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

type ActionPillVariant = 'primary' | 'neutral' | 'ghost';
type ActionPillSize = 'xs' | 'sm' | 'md';

interface ActionPillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionPillVariant;
  size?: ActionPillSize;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ActionPillVariant, string> = {
  primary:
    'bg-fill-brand-default-default text-text-inverse hover:bg-fill-brand-default-hover',
  neutral:
    'bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover',
  ghost:
    'bg-background-default text-text-subtle hover:bg-fill-neutral-subtle-hover',
};

const SIZE_CLASSES: Record<ActionPillSize, string> = {
  xs: 'px-100 py-50 font-designer-11m',
  sm: 'px-150 py-50 font-designer-12m',
  md: 'px-200 py-100 font-designer-12m',
};

export default function ActionPillButton({
  variant = 'ghost',
  size = 'sm',
  icon,
  className,
  children,
  ...props
}: ActionPillButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-100 flex items-center gap-50 transition-colors',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
