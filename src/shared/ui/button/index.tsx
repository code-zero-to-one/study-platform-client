import { cva } from 'class-variance-authority';
import { cn } from '@/shared/shadcn/lib/utils';
import { Button as ButtonShadcn } from '@/shared/shadcn/ui/button';

interface ButtonProps extends React.ComponentProps<'button'> {
  color?: 'primary' | 'secondary';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
}

const buttonVariants = cva(
  'rounded-100 flex items-center justify-center cursor-pointer',
  {
    variants: {
      color: {
        primary:
          'bg-fill-brand-default-default text-text-inverse hover:bg-fill-brand-default-hover active:bg-fill-brand-default-pressed disabled:bg-background-disabled disabled:text-text-disabled',
        secondary:
          'bg-fill-neutral-default-default text-text-default hover:bg-fill-neutral-default-hover active:bg-fill-neutral-default-pressed disabled:bg-background-disabled disabled:text-text-disabled',
      },
      size: {
        xsmall: 'px-75 py-25 gap-25 font-designer-13b',
        small: 'px-75 py-50 gap-25 font-designer-14b',
        medium: 'px-100 py-75 gap-50 font-designer-16b',
        large: 'px-150 py-100 gap-50 font-designer-16b',
      },
    },
    defaultVariants: {
      color: 'primary',
      size: 'medium',
    },
  },
);

function Button({ color = 'primary', size = 'medium', ...props }: ButtonProps) {
  const { className, ...rest } = props;

  return (
    <ButtonShadcn
      className={cn(
        buttonVariants({
          color,
          size,
        }),
        className,
      )}
      {...rest}
    />
  );
}

export default Button;
