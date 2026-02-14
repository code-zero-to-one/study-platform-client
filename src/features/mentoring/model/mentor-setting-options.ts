import {
  CONTACT_COUNTRY_CODES,
  SESSION_DURATION_OPTIONS,
  type WeekdayKey,
  WEEKDAY_LABEL_MAP,
} from './mentor-settings';

interface SelectionOption {
  value: string;
  label: string;
}

export const CONTACT_COUNTRY_OPTIONS: SelectionOption[] =
  CONTACT_COUNTRY_CODES.map((code) => ({
    value: code,
    label: code,
  }));

export const MENTOR_CATEGORY_OPTIONS = [
  'AI 기술',
  'AI 활용(AX)',
  '개발 · 프로그래밍',
  '게임 개발',
  '데이터 사이언스',
  '보안 · 네트워크',
  '하드웨어',
  '디자인 · 아트',
  '기획 · 경영 · 마케팅',
  '외국어',
  '업무 생산성',
  '커리어 · 자기계발',
  '대학 교육',
] as const;

export const JOB_GROUP_OPTIONS = [
  '프론트엔드',
  '백엔드',
  '풀스택',
  '데이터',
  'AI/ML',
  '모바일',
  '게임',
  '보안',
  'DevOps',
  '기획/PM',
] as const;

export const JOB_TITLE_OPTIONS = [
  '주니어 개발자',
  '미들 개발자',
  '시니어 개발자',
  '테크리드',
  '엔지니어링 매니저',
  '프로덕트 매니저',
] as const;

export const CAREER_YEAR_OPTIONS = [
  '1년 미만',
  '1~2년',
  '3~4년',
  '5~7년',
  '8~10년',
  '11년 이상',
] as const;

export const SESSION_DURATION_DROPDOWN_OPTIONS = SESSION_DURATION_OPTIONS.map(
  (minutes) => ({
    value: String(minutes),
    label: `${minutes}분`,
  }),
);

export const MAX_PARTICIPANT_OPTIONS = Array.from(
  { length: 10 },
  (_, index) => {
    const count = index + 1;

    return {
      value: String(count),
      label: String(count),
    };
  },
);

export const CONTACT_COUNTRY_DROPDOWN_OPTIONS = CONTACT_COUNTRY_CODES.map(
  (code) => ({
    value: code,
    label: code,
  }),
);

export const WEEKDAY_ORDERED_OPTIONS: Array<{
  key: WeekdayKey;
  label: string;
}> = (Object.keys(WEEKDAY_LABEL_MAP) as WeekdayKey[]).map((key) => ({
  key,
  label: WEEKDAY_LABEL_MAP[key],
}));

export const MENTOR_SKILL_TAG_PRESETS = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Spring',
  'Python',
  '면접',
  '이력서',
  '포트폴리오',
  '커리어',
];

export const SETTLEMENT_PAYER_OPTIONS = [
  { value: 'INDIVIDUAL', label: '개인' },
  { value: 'BUSINESS', label: '사업자' },
  { value: 'OVERSEAS', label: '해외 거주자' },
] as const;
