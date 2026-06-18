import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-background-alternative animate-pulse rounded-100',
        className,
      )}
    />
  );
}
