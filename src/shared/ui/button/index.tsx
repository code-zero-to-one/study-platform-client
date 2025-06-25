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

/**
INFO: Shadcn 스타일을 extend 해서 사용할 거면 혼란이 생기니, 명확히 어떤 스타일을 extend 하는 건지 표시해야할 듯합니다.          
그게 아니면, 래핑하고 있는 상위 컴포넌트에서 똑같은 스타일 그대로 사용해야할 듯 싶습니다.                                  
실질적으로 생각해보면 디자이너분들이 저희 shadcn 을 보고 디자이닝 하는게 아니니 사실 shadcn 스타일링을 extend 하는 게 맞는 방식인지 
모르겠습니다.                                                                                                                       

 Badge 에 논의된 사항을 그대로 따릅니다.
 TODO: PR 이 approve 되면 해당 주석을 제거합니다.
 * **/

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
