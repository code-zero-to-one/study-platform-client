import { cn } from '@/shared/shadcn/lib/utils';
import { cva } from 'class-variance-authority';

interface Props {
  text: string;
  isActive?: boolean;
  className?: string;
}

const chipVariants = cva(
  ' itmes-center flex min-h-[40px] justify-center rounded-full border border-[var(--border)] p-[8px] text-[14px] leading-[22px] font-[500] text-[var(--color-text-default)]',
  {
    variants: {
      color: {
        default:
          'bg-[var(--color-background-default)] text-text-subtlest border-[var(--color-border-default)]',
        isActive:
          'bg-[var(--color-fill-brand-default-default)] text-[var(--color-text-inverse)] border-none',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  },
);

function Chip({ text, isActive = false, className }: Props) {
  return (
    <div
      className={cn(
        chipVariants({ color: isActive ? 'isActive' : 'default' }),
        className,
      )}
    >
      {text}
    </div>
  );
}

export default Chip;
