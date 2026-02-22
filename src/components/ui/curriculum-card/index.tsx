'use client';

import { ExternalLink, Lock } from 'lucide-react';
import { useState } from 'react';

interface Mission {
  id: number;
  title: string;
  order: number;
}

interface CurriculumSummaryCardProps {
  missions: Mission[];
  isLocked: boolean;
  onMissionClick?: (missionId: number) => void;
  className?: string;
}

/**
 * 커리큘럼 요약 카드 컴포넌트
 * - 1주차(OT): 전체 공개, 클릭 가능, External Link 아이콘, 툴팁 없음
 * - 2~4주차: Lock 아이콘, 클릭 불가, hover 시 툴팁
 */
export default function CurriculumSummaryCard({
  missions,
  isLocked,
  onMissionClick,
  className = '',
}: CurriculumSummaryCardProps) {
  const [hoveredMissionId, setHoveredMissionId] = useState<number | null>(null);
  const weekCount = missions.length;

  return (
    <div
      className={`rounded-200 border-border-default bg-background-default border p-400 ${className}`}
    >
      <div className="font-designer-18b mb-300 flex gap-100">
        <span className="text-text-default">커리큘럼 요약</span>
        {weekCount > 0 && <span className="text-[#A4A7AE]">{weekCount}주</span>}
      </div>

      <div className="relative">
        {/* 미션 리스트 */}
        <div className="space-y-200">
          {missions.map((mission) => {
            const isOT = mission.order === 1; // 1주차 OT
            const isClickable = isOT;
            const showTooltip = !isOT && isLocked;

            return (
              <div
                key={mission.id}
                className={`group rounded-100 border-border-default ${
                  isClickable
                    ? 'bg-fill-neutral-subtle-default hover:bg-fill-neutral-subtle-hover cursor-pointer'
                    : 'bg-fill-neutral-subtle-default cursor-not-allowed opacity-80'
                } text-text-default flex items-center justify-between border p-300 transition-colors`}
                onMouseEnter={() => setHoveredMissionId(mission.id)}
                onMouseLeave={() => setHoveredMissionId(null)}
                onClick={() => {
                  if (isClickable) {
                    onMissionClick?.(mission.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onMissionClick?.(mission.id);
                  }
                }}
                role="button"
                tabIndex={isClickable ? 0 : -1}
                aria-label={
                  isClickable
                    ? `${mission.title} 미션으로 이동`
                    : `${mission.title} (잠김)`
                }
              >
                <div className="flex items-center gap-200">
                  <span className="font-designer-14b text-text-subtlest">
                    {mission.order}
                  </span>
                  <span className="font-designer-14m text-text-default">
                    {mission.title.replace(/^\d+주차\s*미션\s*:\s*/, '')}
                  </span>
                </div>

                <span className="rounded-50 p-50">
                  {isOT ? (
                    <ExternalLink className="text-text-subtle h-200 w-200 transition-transform group-hover:scale-125" />
                  ) : (
                    <Lock className="text-text-subtle h-200 w-200" />
                  )}
                </span>

                {/* 호버 툴팁 (2~4주차만) */}
                {showTooltip && hoveredMissionId === mission.id && (
                  <div className="rounded-100 bg-background-neutral-strong text-text-inverse font-designer-12m pointer-events-none absolute top-full left-1/2 z-50 mt-100 -translate-x-1/2 px-200 py-100 whitespace-nowrap shadow-lg">
                    스터디 가입 후 확인 가능
                    <div className="border-b-background-neutral-strong absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
