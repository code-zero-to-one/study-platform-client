'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface StarRatingInputProps {
  value: number; // 0~5, 0.5 단위 (0 = 미선택)
  onChange: (rating: number) => void;
}

export default function StarRatingInput({
  value,
  onChange,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue > 0 ? hoverValue : value;

  const getStarFill = (idx: number): 'full' | 'half' | 'empty' => {
    const score = idx + 1;
    if (displayValue >= score) return 'full';
    if (displayValue >= score - 0.5) return 'half';

    return 'empty';
  };

  const getValueFromX = (
    clientX: number,
    rect: DOMRect,
    idx: number,
  ): number => {
    const x = clientX - rect.left;

    return x < rect.width / 2 ? idx + 0.5 : idx + 1;
  };

  return (
    <div className="flex items-center gap-50">
      {Array.from({ length: 5 }).map((_, idx) => {
        const fill = getStarFill(idx);

        return (
          <button
            key={`star-${idx + 1}`}
            type="button"
            aria-label={`${idx + 1}점`}
            className="relative cursor-pointer"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoverValue(getValueFromX(e.clientX, rect, idx));
            }}
            onMouseLeave={() => setHoverValue(0)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onChange(getValueFromX(e.clientX, rect, idx));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              const touch = e.changedTouches[0];
              if (touch) {
                const rect = e.currentTarget.getBoundingClientRect();
                onChange(getValueFromX(touch.clientX, rect, idx));
              }
            }}
          >
            {/* 빈 별 (베이스) */}
            <Star
              className={cn(
                'h-300 w-300 shrink-0',
                'text-icon-disabled fill-current',
              )}
            />

            {/* 채워진 별 오버레이 (full 또는 half) */}
            {fill !== 'empty' && (
              <div
                className={cn(
                  'absolute inset-0 overflow-hidden',
                  fill === 'half' ? 'w-1/2' : 'w-full',
                )}
              >
                <Star
                  className={cn(
                    'h-300 w-300 shrink-0',
                    'text-text-warning fill-current',
                  )}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
