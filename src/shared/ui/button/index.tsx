import { cva } from 'class-variance-authority';
import { VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/shadcn/lib/utils';
import { Button as ButtonShadcn } from '@/shared/shadcn/ui/button';

const buttonVariants = cva(
  'rounded-100 flex items-center justify-center cursor-pointer gap-50',
  {
    variants: {
      color: {
        primary:
          'bg-fill-brand-default-default text-text-inverse hover:bg-fill-brand-default-hover active:bg-fill-brand-default-pressed disabled:bg-background-disabled disabled:text-text-disabled',
        secondary:
          'bg-fill-neutral-default-default text-text-default hover:bg-fill-neutral-default-hover active:bg-fill-neutral-default-pressed disabled:bg-background-disabled disabled:text-text-disabled',
      },
      size: {
        xsmall: 'px-75 py-25 font-designer-13b',
        small: 'px-75 py-50 font-designer-14b',
        medium: 'px-100 py-75 font-designer-16b',
        large: 'px-150 py-100 font-designer-16b',
      },
    },
    defaultVariants: {
      color: 'primary',
      size: 'medium',
    },
  },
);

interface ButtonProps
  // "size" overrides default shadcn prop.size
  extends Omit<React.ComponentPropsWithoutRef<typeof ButtonShadcn>, 'size'> {
  children: React.ReactNode;
  color?: VariantProps<typeof buttonVariants>['color'];
  size?: VariantProps<typeof buttonVariants>['size'];
}

/** 메인 Buton 컴포넌트 */
function Button({
  color = 'primary',
  size = 'medium',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonShadcn
      className={cn(buttonVariants({ color, size }), className)}
      {...props}
    >
      {children}
    </ButtonShadcn>
  );
}

export default Button;
