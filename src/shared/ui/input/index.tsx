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
        'rounded-100 whitespace-pre-line border border-border-default px-150 py-100 focus-visible:ring-0',
      )}
      {...props}
    />
  );
}
