import type { MentoringMethodType } from '@/types/mentoring/domain';

export const MENTORING_METHOD_ORDER: MentoringMethodType[] = [
  'note',
  'simple',
  'deep',
  'offline',
];

export const MENTORING_METHOD_LABEL_MAP: Record<MentoringMethodType, string> = {
  note: '쪽지상담',
  simple: '간편상담',
  deep: '심층상담',
  offline: '대면상담',
};

export const MENTORING_METHOD_DEFAULT_DURATION_LABEL_MAP: Record<
  MentoringMethodType,
  string
> = {
  note: '비동기',
  simple: '15분',
  deep: '60분',
  offline: '60분',
};

export const MENTORING_METHOD_REQUEST_TYPE_MAP: Record<
  MentoringMethodType,
  'NOTE' | 'SIMPLE' | 'IN_DEPTH' | 'OFFLINE'
> = {
  note: 'NOTE',
  simple: 'SIMPLE',
  deep: 'IN_DEPTH',
  offline: 'OFFLINE',
};

export const MENTORING_METHOD_RESPONSE_TYPE_MAP: Record<
  string,
  MentoringMethodType
> = {
  NOTE: 'note',
  SIMPLE: 'simple',
  IN_DEPTH: 'deep',
  OFFLINE: 'offline',
  DEEP: 'deep',
  note: 'note',
  simple: 'simple',
  in_depth: 'deep',
  inDepth: 'deep',
  deep: 'deep',
  offline: 'offline',
};

export const parseMentoringMethodType = (
  value: unknown,
): MentoringMethodType | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  return (
    MENTORING_METHOD_RESPONSE_TYPE_MAP[value] ??
    MENTORING_METHOD_RESPONSE_TYPE_MAP[value.toUpperCase()]
  );
};
