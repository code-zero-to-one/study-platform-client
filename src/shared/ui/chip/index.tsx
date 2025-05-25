import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/shared/shadcn/lib/utils';

interface Props<T extends string | number> {
  id: T;
  text: string;
  isActive?: boolean;
  className?: string;
  onClick?: (id: T, e: React.MouseEvent) => void;
  onClose?: (e: React.MouseEvent) => void;
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

function Chip<T extends string | number>({
  id,
  text,
  isActive = false,
  className,
  onClose,
  onClick,
}: Props<T>) {
  return (
    <div
      className={cn(
        chipVariants({ color: isActive ? 'isActive' : 'default' }),
        className,
        'flex items-center gap-[var(--spacing-50)]',
        `${onClick ? 'cursor-pointer' : ''}`,
      )}
      onClick={(e) => {
        if (onClick) {
          onClick(id, e);
        }
      }}
    >
      {text}
      {onClose && (
        <button onClick={onClose} className="cursor-pointer">
          <X size={20} />
        </button>
      )}
    </div>
  );
}

export default Chip;
