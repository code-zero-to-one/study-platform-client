import React from 'react';
import { DailyStatistic, VotingOption } from '@/types/voting';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface DailyStatsChartProps {
  dailyStats: DailyStatistic[];
  options: VotingOption[];
  myVote?: number;
}

const OPTION_COLORS = [
  { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-600', hex: '#3b82f6' },
  { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-600', hex: '#22c55e' },
  { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-600', hex: '#a855f7' },
  { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-600', hex: '#f97316' },
  { bg: 'bg-pink-500', light: 'bg-pink-100', text: 'text-pink-600', hex: '#ec4899' },
];

export default function DailyStatsChart({ dailyStats, options, myVote }: DailyStatsChartProps) {
  if (!dailyStats || dailyStats.length === 0) return null;

  // 내가 선택한 옵션의 추이 계산
  const myOptionTrend = myVote && dailyStats.length > 1
    ? (dailyStats[dailyStats.length - 1].percentages[myVote] || 0) -
      (dailyStats[0].percentages[myVote] || 0)
    : null;

  // 최대값 찾기 (차트 높이 계산용)
  const maxPercentage = Math.max(
    ...dailyStats.flatMap((stat) => Object.values(stat.percentages)),
  );

  return (
    <div className="rounded-200 border border-border-subtle bg-background-default p-500">
      <h3 className="mb-400 font-designer-16b text-text-strong">일별 투표 추이</h3>

      {/* 내 선택 추세 */}
      {myVote && myOptionTrend !== null && (
        <div
          className={cn(
            'mb-400 flex items-center gap-200 rounded-100 p-300',
            myOptionTrend > 0 && 'bg-green-50',
            myOptionTrend < 0 && 'bg-red-50',
            myOptionTrend === 0 && 'bg-gray-50',
          )}
        >
          <div className="flex items-center gap-100">
            {myOptionTrend > 0 && <TrendingUp className="h-5 w-5 text-green-600" />}
            {myOptionTrend < 0 && <TrendingDown className="h-5 w-5 text-red-600" />}
            {myOptionTrend === 0 && <Minus className="h-5 w-5 text-gray-500" />}
          </div>
          <div>
            <p className="font-designer-13b text-text-strong">
              내가 선택한 의견이 어제보다{' '}
              {myOptionTrend > 0 && (
                <span className="text-green-600">+{myOptionTrend.toFixed(1)}%p 증가</span>
              )}
              {myOptionTrend < 0 && (
                <span className="text-red-600">{myOptionTrend.toFixed(1)}%p 감소</span>
              )}
              {myOptionTrend === 0 && <span className="text-gray-600">변화 없음</span>}
            </p>
            <p className="font-designer-12r text-text-subtle">
              {options.find((opt) => opt.id === myVote)?.label}
            </p>
          </div>
        </div>
      )}

      {/* 차트 */}
      <div className="mb-300">
        <div className="relative" style={{ height: '200px' }}>
          {/* Y축 레이블 */}
          <div className="absolute left-0 top-0 flex h-full flex-col justify-between pr-200 text-right font-designer-11r text-text-subtlest">
            <span>{maxPercentage.toFixed(0)}%</span>
            <span>{(maxPercentage * 0.75).toFixed(0)}%</span>
            <span>{(maxPercentage * 0.5).toFixed(0)}%</span>
            <span>{(maxPercentage * 0.25).toFixed(0)}%</span>
            <span>0%</span>
          </div>

          {/* 그리드 라인 */}
          <div className="absolute left-[40px] right-0 top-0 h-full">
            {[0, 25, 50, 75, 100].map((_, index) => (
              <div
                key={index}
                className="absolute w-full border-t border-border-subtlest"
                style={{ top: `${index * 25}%` }}
              />
            ))}
          </div>

          {/* 라인 차트 */}
          <svg
            className="absolute left-[40px] right-0 top-0 h-full w-[calc(100%-40px)]"
            preserveAspectRatio="none"
          >
            {options.map((option, optIndex) => {
              const color = OPTION_COLORS[optIndex % OPTION_COLORS.length];
              const points = dailyStats
                .map((stat, statIndex) => {
                  const x = (statIndex / (dailyStats.length - 1)) * 100;
                  const y = 100 - ((stat.percentages[option.id] || 0) / maxPercentage) * 100;
                  return `${x},${y}`;
                })
                .join(' ');

              return (
                <polyline
                  key={option.id}
                  points={points}
                  fill="none"
                  stroke={color.hex}
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    opacity: myVote === option.id ? 1 : 0.4,
                  }}
                  className="transition-all"
                />
              );
            })}
          </svg>
        </div>

        {/* X축 레이블 */}
        <div className="ml-[40px] flex justify-between border-t border-border-subtle pt-100">
          {dailyStats.map((stat, index) => (
            <span key={index} className="font-designer-11r text-text-subtlest">
              {stat.date}
            </span>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-200">
        {options.map((option, index) => {
          const color = OPTION_COLORS[index % OPTION_COLORS.length];
          const isMyVote = myVote === option.id;
          return (
            <div
              key={option.id}
              className={cn(
                'flex items-center gap-100 rounded-100 px-200 py-100',
                isMyVote ? color.light : 'bg-background-alternative',
              )}
            >
              <div className={cn('h-3 w-3 rounded-full', color.bg)} />
              <span
                className={cn(
                  'font-designer-12m',
                  isMyVote ? color.text : 'text-text-subtle',
                )}
              >
                {option.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
