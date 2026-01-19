import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva } from 'class-variance-authority';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

export const toggleButtonVariants = cva(
  [
    'inline-flex items-center justify-center font-medium border transition-colors disabled:pointer-events-none disabled:opacity-50',
    'data-[state=off]:bg-fill-neutral-subtle-default',
    'data-[state=off]:border-border-default',
    'data-[state=off]:text-text-default',
  ],
  {
    variants: {
      color: {
        primary: [
          'data-[state=on]:bg-fill-brand-subtle-default',
          'data-[state=on]:text-text-brand',
          'data-[state=on]:border-border-brand',
        ],
        gray: [
          'data-[state=on]:bg-background-accent-gray-strong',
          'data-[state=on]:text-text-inverse',
          'data-[state=on]:border-background-accent-gray-strong',
        ],
      },
      size: {
        sm: 'px-150 py-75 font-designer-13m',
        md: 'px-200 py-100 font-designer-14m',
        lg: 'px-250 py-150 font-designer-15m',
      },
      variant: {
        round: 'rounded-full',
        square: 'rounded-150',
      },
    },
    defaultVariants: {
      color: 'primary',
      size: 'md',
      variant: 'round',
    },
  },
);

interface ToggleButtonProps extends React.ComponentProps<
  typeof TogglePrimitive.Root
> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'round' | 'square';
  color?: 'primary' | 'gray';
  className?: string;
}

function ToggleButton({
  size = 'md',
  variant = 'round',
  color = 'primary',
  className,
  children,
  ...props
}: ToggleButtonProps) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle-button"
      className={cn(toggleButtonVariants({ color, size, variant }), className)}
      {...props}
    >
      {children}
    </TogglePrimitive.Root>
  );
}

export default ToggleButton;
