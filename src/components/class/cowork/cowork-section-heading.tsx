import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface CoworkSectionHeadingProps {
  label: string;
  title: string;
  description?: string;
  className?: string;
  invert?: boolean;
}

export function CoworkSectionHeading({
  label,
  title,
  description,
  className,
  invert = false,
}: CoworkSectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-150 text-center',
        className,
      )}
    >
      <span className="text-[13px] font-semibold text-rose-500 md:text-[15px]">
        {label}
      </span>
      <h2
        className={cn(
          'whitespace-pre-line text-[22px] font-bold leading-[1.35] tracking-[-0.4px] md:text-[32px]',
          invert ? 'text-white' : 'text-gray-900',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'whitespace-pre-line text-[14px] leading-[1.6] md:text-[17px]',
            invert ? 'text-white/70' : 'text-gray-500',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
