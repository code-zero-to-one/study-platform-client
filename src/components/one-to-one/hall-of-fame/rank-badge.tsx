'use client';

import React from 'react';
import BronzeRankIcon from 'public/icons/bronze-rank.svg';
import GoldRankIcon from 'public/icons/gold-rank.svg';
import SilverRankIcon from 'public/icons/silver-rank.svg';

interface RankBadgeProps {
  rank: number;
}

export default function RankBadge({ rank }: RankBadgeProps) {
  const Icon =
    rank === 1 ? GoldRankIcon : rank === 2 ? SilverRankIcon : BronzeRankIcon;

  if (rank > 3) {
    return (
      <div className="font-designer-28b text-text-subtle w-[36px] text-center">
        {rank}
      </div>
    );
  }

  return (
    <div className="relative h-[48px] w-[36px] md:h-[60px] md:w-[45px]">
      <Icon aria-label={`${rank}위`} role="img" className="h-full w-full" />
    </div>
  );
}
