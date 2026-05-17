'use client';

import React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type {
  RankingType,
  RankerWithLabel,
} from '@/config/hall-of-fame-constants';
import { TAB_CONFIG } from '@/config/hall-of-fame-constants';
import RankerListItem from './ranker-list-item';
import RankingTabButton from './ranking-tab-button';

interface HallOfFameRankerSectionProps {
  rankingType: RankingType;
  onChangeRankingType: (type: RankingType) => void;
  baseDate: string;
  rankers: RankerWithLabel[];
}

export default function HallOfFameRankerSection({
  rankingType,
  onChangeRankingType,
  baseDate,
  rankers,
}: HallOfFameRankerSectionProps) {
  return (
    <div className="flex flex-col gap-300">
      <div className="flex flex-col items-start gap-150">
        <div className="flex flex-wrap items-baseline gap-x-100 gap-y-50">
          <h3 className="font-display-headings6 text-text-strong flex items-center gap-100">
            <span className={TAB_CONFIG[rankingType].colorClass}>
              {(() => {
                const Icon = TAB_CONFIG[rankingType].icon;

                return <Icon className="h-4 w-4" />;
              })()}
            </span>
            {TAB_CONFIG[rankingType].label} TOP 5
          </h3>
          <span className="font-designer-13r text-text-subtlest mt-50">
            {baseDate} 기준
          </span>
        </div>

        <div className="bg-background-default rounded-200 border-border-subtle mb-100 flex w-fit flex-wrap gap-100 border p-100">
          {(Object.keys(TAB_CONFIG) as RankingType[]).map((type) => (
            <RankingTabButton
              key={type}
              isActive={rankingType === type}
              onClick={() => onChangeRankingType(type)}
            >
              <span
                className={cn(
                  rankingType !== type && TAB_CONFIG[type].colorClass,
                )}
              >
                {(() => {
                  const Icon = TAB_CONFIG[type].icon;

                  return <Icon className="h-4 w-4" />;
                })()}
              </span>
              {TAB_CONFIG[type].label}
            </RankingTabButton>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-150">
        {rankers.length > 0 ? (
          rankers.map((ranker) => (
            <RankerListItem key={ranker.userId} ranker={ranker} />
          ))
        ) : (
          <div className="bg-background-default border-border-subtle rounded-200 flex h-[400px] items-center justify-center border">
            <p className="font-designer-14m text-text-subtle">
              랭킹이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
