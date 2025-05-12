import { cn } from '@/shared/shadcn/lib/utils';

interface Props {
  text: string;
  isActive?: boolean;
}

function Chip({ text, isActive = false }: Props) {
  return (
    <div
      className={cn(
        'itmes-center flex min-h-[40px] justify-center rounded-full border border-[var(--border)] p-[8px] text-[14px] leading-[22px] font-[500] text-[var(--color-text-default)]',
        isActive && 'bg-[var(--color-fill-success-default)]',
        isActive && 'text-[var(--color-text-inverse)]',
      )}
    >
      {text}
    </div>
  );
}

export default Chip;
