import { Slot } from '@radix-ui/react-slot';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const buttonVariants = cva(
  'flex items-center justify-center cursor-pointer py-0 disabled:bg-background-disabled disabled:text-text-disabled',
  {
    variants: {
      color: {
        primary:
          'bg-fill-brand-default-default text-text-inverse hover:bg-fill-brand-default-hover active:bg-fill-brand-default-pressed',
        secondary:
          'bg-fill-neutral-default-default text-text-default hover:bg-fill-neutral-default-hover active:bg-fill-neutral-default-pressed',
        outlined:
          'bg-fill-background-surface-default text-text-default border border-border-default border-[1px] hover:bg-fill-neutral-subtle-hover active:bg-fill-neutral-subtle-pressed',
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
  const loadingIndicator = spinner ?? (
    <span className="h-14 w-14 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
  const contentText = loading ? (loadingText ?? children) : children;

  const content = (
    <span className="flex items-center gap-50">
      {loading && <span className="flex items-center">{loadingIndicator}</span>}
      {icon && iconPosition === 'left' && (
        <span className="flex items-center">{icon}</span>
      )}
      {contentText}
      {icon && iconPosition === 'right' && (
        <span className="flex items-center">{icon}</span>
      )}
    </span>
  );

  return asChild ? (
    // asChild 모드 → Slot은 children 하나만 받아야 함
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
    // 기본 모드 → 내부 UI 구성 가능
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
