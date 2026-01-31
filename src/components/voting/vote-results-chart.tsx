import { Check, Crown, TrendingUp } from 'lucide-react';
import React from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { VotingOption } from '@/types/voting';

interface VoteResultsChartProps {
  options: VotingOption[];
  myVote?: number;
  totalVotes: number;
  showPercentage?: boolean;
}

const OPTION_COLORS = [
  {
    primary: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-400',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-500',
  },
  {
    primary: 'bg-green-500',
    gradient: 'from-green-500 to-green-400',
    light: 'bg-green-50',
    text: 'text-green-600',
    ring: 'ring-green-500',
  },
  {
    primary: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-400',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'ring-purple-500',
  },
  {
    primary: 'bg-orange-500',
    gradient: 'from-orange-500 to-orange-400',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    ring: 'ring-orange-500',
  },
  {
    primary: 'bg-pink-500',
    gradient: 'from-pink-500 to-pink-400',
    light: 'bg-pink-50',
    text: 'text-pink-600',
    ring: 'ring-pink-500',
  },
];

export default function VoteResultsChart({
  options,
  myVote,
  totalVotes,
  showPercentage = true,
}: VoteResultsChartProps) {
  // 퍼센트 기준으로 정렬 (높은 순)
  const sortedOptions = [...options].sort(
    (a, b) => b.percentage - a.percentage,
  );
  const topOption = sortedOptions[0];

  return (
    <div className="flex flex-col gap-400">
      {sortedOptions.map((option, index) => {
        const isMyVote = myVote === option.id;
        const isTopVote = option.id === topOption.id;
        const colorIndex = options.findIndex((opt) => opt.id === option.id);
        const colors = OPTION_COLORS[colorIndex % OPTION_COLORS.length];
        const rank = index + 1;

        return (
          <div
            key={option.id}
            className={cn(
              'group rounded-200 relative overflow-hidden transition-all duration-300',
              isMyVote
                ? 'border-fill-brand-default-default shadow-2 border-2'
                : 'border-border-subtle hover:border-border-brand hover:shadow-1 border',
            )}
          >
            {/* 배경 그라데이션 프로그레스 바 */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-r transition-all duration-1000 ease-out',
                colors.gradient,
                'opacity-10',
              )}
              style={{
                width: `${option.percentage}%`,
                transitionDelay: `${index * 100}ms`,
              }}
            />

            {/* 컨텐츠 */}
            <div className="relative flex items-center justify-between px-500 py-400">
              {/* 왼쪽: 순위 + 옵션명 + 내 투표 표시 */}
              <div className="flex items-center gap-300">
                {/* 순위 배지 */}
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center text-lg font-bold transition-all',
                    isTopVote ? 'text-yellow-500' : cn(colors.text),
                  )}
                >
                  {isTopVote ? <Crown className="h-5 w-5" /> : rank}
                </div>

                <div className="flex flex-col gap-50">
                  {/* 옵션 라벨 */}
                  <div className="flex items-center gap-200">
                    <span
                      className={cn(
                        'text-lg font-bold transition-colors',
                        isMyVote ? 'text-text-strong' : 'text-text-default',
                      )}
                    >
                      {option.label}
                    </span>

                    {/* 내가 투표한 항목 표시 */}
                    {isMyVote && (
                      <div className="rounded-100 bg-fill-brand-default-default flex items-center gap-50 px-200 py-50">
                        <Check className="text-text-inverse h-3 w-3" />
                        <span className="font-designer-11b text-text-inverse">
                          내 선택
                        </span>
                      </div>
                    )}

                    {/* 1위 표시 */}
                    {isTopVote && (
                      <div className="rounded-100 flex items-center gap-50 bg-gradient-to-r from-yellow-400 to-orange-500 px-200 py-50">
                        <TrendingUp className="h-3 w-3 text-white" />
                        <span className="font-designer-11b text-white">
                          1위
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 투표 수 */}
                  <span className="font-designer-13r text-text-subtle">
                    {option.voteCount.toLocaleString()}명이 선택
                  </span>
                </div>
              </div>

              {/* 오른쪽: 퍼센트 */}
              {showPercentage && (
                <div className="flex flex-col items-end gap-50">
                  <span
                    className={cn(
                      'font-bold transition-all duration-300',
                      isTopVote ? 'text-4xl text-yellow-600' : 'text-3xl',
                      colors.text,
                    )}
                  >
                    {option.percentage.toFixed(1)}%
                  </span>
                  <div className="bg-border-subtle h-1 w-16 rounded-full">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        colors.primary,
                      )}
                      style={{
                        width: `${(option.percentage / topOption.percentage) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 호버 효과용 빛나는 테두리 */}
            {!isMyVote && (
              <div
                className="rounded-200 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `inset 0 0 20px rgba(59, 130, 246, 0.1)`,
                }}
              />
            )}
          </div>
        );
      })}

      {/* 총 투표 수 - 더 강조된 디자인 */}
      <div className="rounded-200 border-border-subtle bg-background-alternative mt-200 flex items-center justify-center gap-200 border p-400">
        <div className="bg-fill-brand-default-default flex h-8 w-8 items-center justify-center rounded-full">
          <TrendingUp className="text-text-inverse h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-designer-12r text-text-subtle">
            총 투표 참여
          </span>
          <span className="text-text-strong text-xl font-bold">
            {totalVotes.toLocaleString()}명
          </span>
        </div>
      </div>
    </div>
  );
}
