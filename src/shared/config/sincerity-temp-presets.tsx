import TempType1 from '@/shared/icons/temp_1.svg';
import TempType2 from '@/shared/icons/temp_2.svg';
import TempType3 from '@/shared/icons/temp_3.svg';
import TempType4 from '@/shared/icons/temp_4.svg';

export type SincerityType = 'type1' | 'type2' | 'type3' | 'type4';

export interface SincerityPreset {
  indicatorClass: string;
  textClass: string;
  bgClass: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label?: string;
}

export const SINCERITY_TEMP_PRESETS: Record<SincerityType, SincerityPreset> = {
  type1: {
    //  todo: Figma에 헥스코드로만 존재. 디자인 시스템 X.  현재 코드에서는 헥스값 인식을 하지 못하기 때문에 임의 컬러로 설정
    //  현재 기획 여쭤본 상태, 컬러값에 따라 global에 추가후 변경 가능성 O.
    //  indicatorClass: '#F5C400',
    //  textClass: '#FFD21F',
    indicatorClass: 'text-yellow-500',
    textClass: 'text-yellow-400',
    bgClass: 'bg-yellow-50',
    Icon: TempType1,
    label: '노란불씨',
  },
  type2: {
    indicatorClass: 'text-orange-400',
    textClass: 'text-orange-400',
    bgClass: 'bg-orange-50',
    Icon: TempType2,
    label: '주황불꽃',
  },
  type3: {
    indicatorClass: 'text-rose-500',
    textClass: 'text-rose-500',
    bgClass: 'bg-rose-50',
    Icon: TempType3,
    label: '불꽃',
  },
  type4: {
    indicatorClass: 'text-indigo-500',
    textClass: 'text-indigo-500',
    bgClass: 'bg-indigo-50',
    Icon: TempType4,
    label: '푸른불꽃',
  },
} as const;

const LEVEL_ID_TO_TYPE: Record<number, SincerityType> = {
  5: 'type1', // 1단계
  6: 'type2', // 2단계
  7: 'type3', // 3단계
  8: 'type4', // 4단계
};

// 매핑 안되는 값이 들어왔을 경우 FALLBACK
const FALLBACK_TYPE: SincerityType = 'type1';

export function getSincerityPresetByLevelId(levelId: number): SincerityPreset {
  const type = LEVEL_ID_TO_TYPE[levelId] ?? FALLBACK_TYPE;

  return SINCERITY_TEMP_PRESETS[type];
}
