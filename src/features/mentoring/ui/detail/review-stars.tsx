import { Star } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface ReviewStarsProps {
  rating: number;
}

export default function ReviewStars({ rating }: ReviewStarsProps) {
  return (
    <div className="flex items-center gap-50">
      {Array.from({ length: 5 }).map((_, index) => {
        const score = index + 1;

        return (
          <Star
            key={score}
            className={cn(
              'h-14 w-14 shrink-0',
              score <= rating
                ? 'text-text-warning fill-current'
                : 'text-icon-disabled fill-current',
            )}
          />
        );
      })}
    </div>
  );
}
