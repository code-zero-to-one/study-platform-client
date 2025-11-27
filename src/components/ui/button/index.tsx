import { cva } from 'class-variance-authority';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface ButtonProps extends React.ComponentProps<'button'> {
  color?: 'primary' | 'secondary';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const buttonVariants = cva(
  'flex items-center justify-center cursor-pointer py-0',
  {
    variants: {
      color: {
        primary:
          'bg-fill-brand-default-default text-text-inverse hover:bg-fill-brand-default-hover active:bg-fill-brand-default-pressed disabled:bg-background-disabled disabled:text-text-disabled',
        secondary:
          'bg-fill-neutral-default-default text-text-default hover:bg-fill-neutral-default-hover active:bg-fill-neutral-default-pressed disabled:bg-background-disabled disabled:text-text-disabled',
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
  color = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ color, size }), className)}
      {...rest}
    >
      <span className="flex items-center gap-50">
        {icon && iconPosition === 'left' && (
          <span className="flex items-center">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="flex items-center">{icon}</span>
        )}
      </span>
    </button>
  );
}

export default Button;
