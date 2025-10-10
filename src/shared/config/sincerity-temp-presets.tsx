import TempType1 from '@/shared/icons/temp_1.svg';
import TempType2 from '@/shared/icons/temp_2.svg';
import TempType3 from '@/shared/icons/temp_3.svg';
import TempType4 from '@/shared/icons/temp_4.svg';

export type SincerityLabel = '1단계' | '2단계' | '3단계' | '4단계';

export interface SincerityPreset {
  indicatorClass: string;
  textClass: string;
  bgClass: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label?: string;
}

export const SINCERITY_TEMP_PRESETS: Record<SincerityLabel, SincerityPreset> = {
  '1단계': {
    //  todo: Figma에 헥스코드로만 존재. 디자인 시스템 X.  현재 코드에서는 헥스값 인식을 하지 못하기 때문에 임의 컬러로 설정
    //  현재 기획 여쭤본 상태, 컬러값에 따라 global에 추가후 변경 가능성 O.
    //  indicatorClass: '#F5C400',
    //  textClass: '#FFD21F',
    indicatorClass: 'bg-yellow-300',
    textClass: 'text-yellow-400',
    bgClass: 'bg-yellow-50',
    Icon: TempType1,
    label: '노란불씨',
  },
  '2단계': {
    indicatorClass: 'bg-orange-400',
    textClass: 'text-orange-400',
    bgClass: 'bg-orange-50',
    Icon: TempType2,
    label: '주황불꽃',
  },
  '3단계': {
    indicatorClass: 'bg-rose-500',
    textClass: 'text-rose-500',
    bgClass: 'bg-rose-50',
    Icon: TempType3,
    label: '불꽃',
  },
  '4단계': {
    indicatorClass: 'bg-indigo-500',
    textClass: 'text-indigo-500',
    bgClass: 'bg-indigo-50',
    Icon: TempType4,
    label: '푸른불꽃',
  },
} as const;

export function toLevelLabel(levelName?: string): SincerityLabel {
  const n = Number((levelName ?? '').match(/\d+/)?.[0] ?? 1);
  const clamped = Math.min(4, Math.max(1, n || 1));

  return `${clamped}단계` as SincerityLabel;
}

/**
 * @param levelName - 레벨 이름 (가능한 값: "1단계" | "2단계" | "3단계" | "4단계")
 */

// 매핑 안되는 값이 들어왔을 경우 FALLBACK
export function getSincerityPresetByLevelName(
  levelName?: string,
): SincerityPreset {
  const levelLabel = levelName as SincerityLabel;

  return SINCERITY_TEMP_PRESETS[levelLabel];
}
