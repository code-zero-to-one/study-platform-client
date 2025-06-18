import { cn } from '@/shared/shadcn/lib/utils';
import { Input as ShadcnInput } from '@/shared/shadcn/ui/input';

function BaseInput({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnInput>) {
  return (
    <ShadcnInput
      className={cn(
        className,
        'rounded-100 border-border-default border px-150 py-100 whitespace-pre-line focus-visible:ring-0',
      )}
      {...props}
    />
  );
}

export default BaseInput;
