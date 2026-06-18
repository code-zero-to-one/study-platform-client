import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';
import { cloneElement, isValidElement } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const ICON_SIZE_MAP = {
  xsmall: 18,
  small: 20,
  medium: 24,
  large: 24,
} as const;

const buttonVariants = cva(
  'flex items-center justify-center cursor-pointer py-0 disabled:bg-background-disabled disabled:cursor-not-allowed',
  {
    variants: {
      color: {
        primary:
          'bg-fill-brand-default-default text-text-inverse hover:bg-fill-brand-default-hover active:bg-fill-brand-default-pressed disabled:text-text-disabled-strong',
        secondary:
          'bg-fill-neutral-default-default text-text-default hover:bg-fill-neutral-default-hover active:bg-fill-neutral-default-pressed disabled:text-text-disabled',
        outlined:
          'bg-fill-background-surface-default text-text-default border border-border-default border-[1px] hover:bg-fill-neutral-subtle-hover active:bg-fill-neutral-subtle-pressed disabled:text-text-disabled disabled:border-border-disabled',
      },
      size: {
        xsmall: 'px-100 font-designer-13b rounded-75 h-350',
        small: 'px-100 font-designer-14b rounded-75 h-400',
        medium: 'px-150 font-designer-16b rounded-100 h-500',
        large: 'px-200 font-designer-16b rounded-100 h-600',
      },
    },
    defaultVariants: {
      color: 'primary',
      size: 'medium',
    },
  },
);

const buttonContentGapVariants = cva('flex items-center', {
  variants: {
    size: {
      xsmall: 'gap-50',
      small: 'gap-50',
      medium: 'gap-75',
      large: 'gap-75',
    },
  },
  defaultVariants: { size: 'medium' },
});

function Button({
  color,
  size,
  className,
  children,
  icon,
  iconPosition = 'left',
  asChild = false,
  loading = false,
  loadingText,
  spinner,
  disabled,
  ...props
}: React.ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    loadingText?: string;
    spinner?: React.ReactNode;
  }) {
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;
  const iconSize = ICON_SIZE_MAP[size ?? 'medium'];
  const sizedIcon = isValidElement<{ size?: number }>(icon)
    ? cloneElement(icon, { size: icon.props.size ?? iconSize })
    : icon;
  const loadingIndicator = spinner ?? (
    <span className="h-14 w-14 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
  const contentText = loading ? (loadingText ?? children) : children;

  const content = (
    <span className={buttonContentGapVariants({ size })}>
      {loading && <span className="flex items-center">{loadingIndicator}</span>}
      {sizedIcon && iconPosition === 'left' && (
        <span className="flex items-center">{sizedIcon}</span>
      )}
      {contentText}
      {sizedIcon && iconPosition === 'right' && (
        <span className="flex items-center">{sizedIcon}</span>
      )}
    </span>
  );

  return asChild ? (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ color, size }), className)}
      aria-busy={loading || undefined}
      data-disabled={isDisabled || undefined}
      {...props}
    >
      {children}
    </Comp>
  ) : (
    <button
      data-slot="button"
      className={cn(buttonVariants({ color, size }), className)}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      {...props}
    >
      {content}
    </button>
  );
}

export default Button;
