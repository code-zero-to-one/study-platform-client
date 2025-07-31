import { cva } from 'class-variance-authority';
import { cn } from '@/shared/shadcn/lib/utils';
import { Input as ShadcnInput } from '@/shared/shadcn/ui/input';

interface BaseInputProps
  extends Omit<React.ComponentProps<typeof ShadcnInput>, 'size'> {
  color?: 'default' | 'error' | 'success';
  size?: 'm' | 'l';
}

const inputVariants = cva(
  'rounded-100 border px-150 py-100 whitespace-pre-line focus-visible:ring-0 font-designer-16m',
  {
    variants: {
      color: {
        default: 'border-border-default text-text-default',
        error: 'border-border-error text-text-default',
        success: 'border-border-success text-text-default',
      },
      size: {
        m: 'py-100',
        l: 'py-150',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  },
);

function BaseInput({
  className,
  color = 'default',
  size = 'l',
  ...props
}: BaseInputProps) {
  return (
    <ShadcnInput
      className={cn(inputVariants({ color, size }), className)}
      {...props}
    />
  );
}

export default BaseInput;
