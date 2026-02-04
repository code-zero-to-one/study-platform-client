'use client';

import Image from 'next/image';
import React from 'react';

interface RankBadgeProps {
  rank: number;
}

export default function RankBadge({ rank }: RankBadgeProps) {
  const iconPath =
    rank === 1
      ? '/icons/gold-rank.svg'
      : rank === 2
        ? '/icons/silver-rank.svg'
        : '/icons/bronze-rank.svg';

  if (rank > 3) {
    return (
      <div className="font-bold-h3 text-text-subtle w-[36px] text-center">
        {rank}
      </div>
    );
  }

  return (
    <div className="relative h-[48px] w-[36px] md:h-[60px] md:w-[45px]">
      <Image src={iconPath} alt={`${rank}위`} fill className="object-contain" />
    </div>
  );
}
