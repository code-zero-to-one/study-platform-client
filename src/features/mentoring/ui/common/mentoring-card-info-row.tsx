import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface MentoringCardInfoRowProps {
  label: string;
  value: string;
  className?: string;
  valueClassName: string;
}

export default function MentoringCardInfoRow({
  label,
  value,
  className,
  valueClassName,
}: MentoringCardInfoRowProps) {
  return (
    <div className={cn('flex flex-col gap-25', className)}>
      <p className="font-designer-12m text-text-subtle">{label}</p>
      <p className={valueClassName}>{value}</p>
    </div>
  );
}
