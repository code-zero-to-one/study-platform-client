import { Flame, FileText, Thermometer } from 'lucide-react';
import type { Ranker } from '@/types/one-to-one-study/hall-of-fame';

export type RankingType = 'ATTENDANCE' | 'STUDY_LOG' | 'SINCERITY';

export interface RankerWithLabel extends Ranker {
  scoreLabel: string;
}

export const TAB_CONFIG: Record<
  RankingType,
  {
    label: string;
    icon: typeof Flame;
    unit: string;
    colorClass: string;
  }
> = {
  ATTENDANCE: {
    label: '불꽃 출석왕',
    icon: Flame,
    unit: '회',
    colorClass: 'text-text-brand',
  },
  STUDY_LOG: {
    label: '열정 기록왕',
    icon: FileText,
    unit: '건',
    colorClass: 'text-text-information',
  },
  SINCERITY: {
    label: '성실 온도왕',
    icon: Thermometer,
    unit: '℃',
    colorClass: 'text-text-warning',
  },
};

export const addScoreLabel = (
  ranker: Ranker,
  type: RankingType,
): RankerWithLabel => {
  let scoreLabel = '';

  if (type === 'ATTENDANCE') {
    scoreLabel = `${ranker.score}회`;
  } else if (type === 'STUDY_LOG') {
    scoreLabel = `${ranker.score}건`;
  } else {
    scoreLabel = `${ranker.score}℃`;
  }

  return {
    ...ranker,
    scoreLabel,
  };
};
