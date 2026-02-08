'use client';

import { ExternalLink } from 'lucide-react';
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
 * - 미가입자: 대제목만 노출, 클릭 시 미션 상세로 이동(상세는 blur+CTA)
 * - 가입자: 전체 미션 리스트 노출
 * - 제목 오른쪽에 "n주" 표시
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
        {/* 미션 리스트 - 잠금 여부와 관계없이 대제목만 표시, 클릭 시 미션 상세로 이동 */}
        <div className="space-y-200">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="group rounded-100 border-border-default bg-fill-neutral-subtle-default text-text-default hover:bg-fill-neutral-subtle-hover flex cursor-pointer items-center justify-between border p-300 transition-colors"
              onMouseEnter={() => setHoveredMissionId(mission.id)}
              onMouseLeave={() => setHoveredMissionId(null)}
              onClick={() => onMissionClick?.(mission.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onMissionClick?.(mission.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${mission.title} 미션으로 이동`}
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
                <ExternalLink className="text-text-subtle h-200 w-200 transition-transform group-hover:scale-125" />
              </span>

              {/* 호버 툴팁 (잠김 상태일 때) */}
              {isLocked && hoveredMissionId === mission.id && (
                <div className="rounded-100 bg-background-neutral-strong text-text-inverse font-designer-12m pointer-events-none absolute top-full left-1/2 z-50 mt-100 -translate-x-1/2 px-200 py-100 whitespace-nowrap shadow-lg">
                  스터디 가입 후 확인 가능
                  <div className="border-b-background-neutral-strong absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
