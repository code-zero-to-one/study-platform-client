import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface FieldErrorTextProps {
  message?: string;
  className?: string;
}

export default function FieldErrorText({
  message,
  className,
}: FieldErrorTextProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={cn('font-designer-13r text-text-error mt-75', className)}>
      {message}
    </p>
  );
}
