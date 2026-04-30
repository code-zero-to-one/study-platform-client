import { type CSSProperties } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface MaterialIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  filled?: boolean;
  weight?: 300 | 400 | 500 | 600 | 700;
}

export function MaterialIcon({
  name,
  size = 22,
  className,
  style,
  filled = false,
  weight = 400,
}: MaterialIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('material-symbols-outlined', className)}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
