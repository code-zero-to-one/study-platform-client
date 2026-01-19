import React from 'react';
import { VotingOption } from '@/types/voting';
import { Check } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface VoteResultsChartProps {
  options: VotingOption[];
  myVote?: number;
  totalVotes: number;
  showPercentage?: boolean;
}

const OPTION_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
];

const OPTION_BG_COLORS = [
  'bg-blue-50',
  'bg-green-50',
  'bg-purple-50',
  'bg-orange-50',
  'bg-pink-50',
];

const OPTION_TEXT_COLORS = [
  'text-blue-600',
  'text-green-600',
  'text-purple-600',
  'text-orange-600',
  'text-pink-600',
];

export default function VoteResultsChart({
  options,
  myVote,
  totalVotes,
  showPercentage = true,
}: VoteResultsChartProps) {
  return (
    <div className="flex flex-col gap-300">
      {options.map((option, index) => {
        const isMyVote = myVote === option.id;
        const colorClass = OPTION_COLORS[index % OPTION_COLORS.length];
        const bgColorClass = OPTION_BG_COLORS[index % OPTION_BG_COLORS.length];
        const textColorClass = OPTION_TEXT_COLORS[index % OPTION_TEXT_COLORS.length];

        return (
          <div
            key={option.id}
            className={cn(
              'relative overflow-hidden rounded-200 border-2 transition-all',
              isMyVote ? 'border-text-brand' : 'border-border-subtle',
            )}
          >
            {/* 배경 프로그레스 바 */}
            <div
              className={cn('absolute inset-0 transition-all duration-500', bgColorClass)}
              style={{ width: `${option.percentage}%` }}
            />

            {/* 컨텐츠 */}
            <div className="relative flex items-center justify-between px-400 py-300">
              <div className="flex items-center gap-200">
                {/* 내가 투표한 항목 표시 */}
                {isMyVote && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fill-brand-default-default">
                    <Check className="h-4 w-4 text-text-inverse" />
                  </div>
                )}

                {/* 옵션 라벨 */}
                <span
                  className={cn(
                    'font-designer-15b',
                    isMyVote ? 'text-text-strong' : 'text-text-default',
                  )}
                >
                  {option.label}
                </span>
              </div>

              {/* 투표 수 & 퍼센트 */}
              <div className="flex items-center gap-200">
                <span className="font-designer-14r text-text-subtle">
                  {option.voteCount.toLocaleString()}명
                </span>
                {showPercentage && (
                  <span className={cn('font-designer-18b', textColorClass)}>
                    {option.percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* 총 투표 수 */}
      <div className="mt-100 text-center">
        <span className="font-designer-13r text-text-subtle">
          총 <strong className="font-designer-13b text-text-strong">{totalVotes.toLocaleString()}</strong>명 참여
        </span>
      </div>
    </div>
  );
}
