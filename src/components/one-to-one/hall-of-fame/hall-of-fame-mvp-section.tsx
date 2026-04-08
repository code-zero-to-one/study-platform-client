'use client';

import { Users } from 'lucide-react';
import React from 'react';
import type { MVPTeam } from '@/types/one-to-one-study/hall-of-fame';
import MVPTeamCard from './mvp-team-card';

interface HallOfFameMvpSectionProps {
  team?: MVPTeam;
}

export default function HallOfFameMvpSection({
  team,
}: HallOfFameMvpSectionProps) {
  const weekLabel = team?.weekDate?.trim();

  return (
    <div className="flex flex-col gap-300">
      <h3 className="font-display-headings6 text-text-strong flex items-start gap-100">
        <Users className="text-text-information h-5 w-5" />
        {weekLabel ? `${weekLabel} 스터디 MVP 팀` : '최근 스터디 MVP 팀'}
      </h3>

      {team ? (
        <MVPTeamCard team={team} className="flex-1" />
      ) : (
        <div className="bg-background-default border-border-subtle rounded-200 flex h-[400px] items-center justify-center border">
          <p className="font-designer-14m text-text-subtle">
            최근 MVP 팀이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
