'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  rating: number;
  onChange: (next: number) => void;
}

const HINTS = [
  '별점을 눌러주세요.',
  '어려웠어요',
  '조금 어려웠어요',
  '보통이에요',
  '재밌었어요',
  '너무 재밌었어요',
];

export function RatingBox({ rating, onChange }: Props) {
  const [hover, setHover] = useState(0);
  const display = hover || rating;

  return (
    <div className="flex h-[120px] w-full flex-col items-center justify-center gap-100 rounded-200 border border-gray-300 bg-background-default">
      <div className="flex items-center justify-center gap-200">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${star}점`}
            className="h-[42px] w-[42px] shrink-0"
          >
            <Image
              src={
                star <= display
                  ? '/class/star-enabled.svg'
                  : '/class/star-disabled.svg'
              }
              alt=""
              aria-hidden="true"
              width={42}
              height={42}
            />
          </button>
        ))}
      </div>
      <p className="text-center font-designer-14sb text-gray-400 mt-200">
        {HINTS[display]}
      </p>
    </div>
  );
}
