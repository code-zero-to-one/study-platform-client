import { cn } from '@/shared/shadcn/lib/utils';
import { Input as ShadcnInput } from '@/shared/shadcn/ui/input';

export default function Input({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnInput>) {
  return (
    <ShadcnInput
      className={cn(
        className,
        'rounded-[var(--radius-100)] border border-[var(--color-border-default)] px-[var(--spacing-150)] py-[var(--spacing-100)] focus-visible:ring-0',
      )}
      {...props}
    />
  );
}
