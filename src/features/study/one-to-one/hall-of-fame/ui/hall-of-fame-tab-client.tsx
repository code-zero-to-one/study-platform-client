'use client';

import React, { useState, useMemo } from 'react';
import SectionShell from '@/components/ui/section-shell';
import { useHallOfFameQuery } from '@/features/study/one-to-one/hall-of-fame/model/use-hall-of-fame-query';
import type { HallOfFameData } from '@/types/hall-of-fame';
import {
  addScoreLabel,
  type RankingType,
  type RankerWithLabel,
} from './hall-of-fame-constants';
import HallOfFameHeader from './hall-of-fame-header';
import HallOfFameMvpSection from './hall-of-fame-mvp-section';
import HallOfFameRankerSection from './hall-of-fame-ranker-section';

interface HallOfFameTabClientProps {
  initialData?: HallOfFameData;
}

export default function HallOfFameTabClient({
  initialData,
}: HallOfFameTabClientProps) {
  const [rankingType, setRankingType] = useState<RankingType>('ATTENDANCE');
  const { data, isLoading, error } = useHallOfFameQuery({ initialData });

  // 랭킹 데이터 변환 및 scoreLabel 추가
  const allRankers = useMemo(() => {
    if (!data) {
      return {
        ATTENDANCE: [] as RankerWithLabel[],
        STUDY_LOG: [] as RankerWithLabel[],
        SINCERITY: [] as RankerWithLabel[],
      };
    }

    return {
      ATTENDANCE: data.rankings.attendanceRankings.map((r) =>
        addScoreLabel(r, 'ATTENDANCE'),
      ),
      STUDY_LOG: data.rankings.studyLogRankings.map((r) =>
        addScoreLabel(r, 'STUDY_LOG'),
      ),
      SINCERITY: data.rankings.sincerityRankings.map((r) =>
        addScoreLabel(r, 'SINCERITY'),
      ),
    };
  }, [data]);

  const currentRankers = allRankers[rankingType];
  const baseDate = data?.rankings.baseDate
    ? new Date(data.rankings.baseDate).toLocaleDateString('ko-KR')
    : new Date().toLocaleDateString('ko-KR');

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="text-text-subtle flex animate-pulse flex-col items-center gap-200">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="font-designer-14m">
            명예의 전당을 불러오고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="text-text-subtle flex flex-col items-center gap-200">
          <p className="font-designer-14m text-text-error">
            명예의 전당 정보를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SectionShell className="gap-600">
      <HallOfFameHeader />

      <div className="grid grid-cols-1 gap-500 xl:grid-cols-2">
        <HallOfFameRankerSection
          rankingType={rankingType}
          onChangeRankingType={setRankingType}
          baseDate={baseDate}
          rankers={currentRankers}
        />

        <HallOfFameMvpSection team={data?.mvpTeam} />
      </div>
    </SectionShell>
  );
}
