import {
  COMPANY_CATEGORY_OPTIONS,
  CONSULTING_DURATION_OPTIONS,
  type WeekdayKey,
  WEEKDAY_LABEL_MAP,
} from '@/types/mentoring/settings';

interface SelectionOption {
  value: string;
  label: string;
}

export const COMPANY_CATEGORY_DROPDOWN_OPTIONS = COMPANY_CATEGORY_OPTIONS.map(
  (category) => ({
    value: category,
    label: category,
  }),
);

export const MENTOR_CATEGORY_OPTIONS = [
  'SW 엔지니어',
  '프론트엔드/웹퍼블리셔',
  'CTO/테크니컬 디렉터',
  '게임 클라이언트 개발자',
  '백엔드/서버 개발자',
  '머신러닝 엔지니어',
  '클라우드 엔지니어',
] as const;

export const MENTOR_APPEAL_LINE_PRESETS = [
  '금융권 대기업',
  '네카라쿠배',
  '네카라 및 판교IT기업',
  '대기업',
  '창업',
  '쿠팡',
] as const;

export const JOB_GROUP_OPTIONS = [
  '개발',
  '게임개발',
  '디자인',
  '기획',
  '마케팅',
  '경영인사',
  '영업',
  '엔지니어링',
] as const;

export type JobGroupOption = (typeof JOB_GROUP_OPTIONS)[number];

export const JOB_TITLE_OPTIONS_BY_GROUP: Record<JobGroupOption, string[]> = {
  개발: [
    '백엔드/서버 개발자',
    '프론트엔드/웹퍼블리셔',
    'SW 엔지니어',
    '안드로이드 개발자',
    'iOS 개발자',
    '크로스플랫폼 앱 개발자',
    '데이터 엔지니어',
    '데이터 사이언티스트',
    '데이터 분석가',
    '머신러닝 엔지니어',
    'DBA',
    'DevOps',
    '시스템/네트워크 관리자',
    'QA/테스트엔지니어',
    '기술지원',
    '보안 엔지니어',
    '블록체인 엔지니어',
    'HW/임베디드 엔지니어',
    '애자일/스크럼 마스터',
    'CTO/테크니컬 디렉터',
  ],
  게임개발: [
    '선택',
    '게임 서버 개발자',
    '게임 클라이언트 개발자',
    '게임 기획자',
    '게임 그래픽 디자이너',
    '게임 아티스트',
    '모바일 게임 개발자',
    '게임 운영자',
  ],
  디자인: [
    '선택',
    '프로덕트 디자이너',
    '웹/앱 디자이너',
    '그래픽 디자이너',
    'BI/BX 디자이너',
    '광고 디자이너',
    '영상/모션 디자이너',
    '운영 디자이너',
  ],
  기획: [
    '선택',
    '서비스 기획자',
    'PO/PM',
    '비즈니스 분석가',
    '사업개발/기획자',
    '전략 기획자',
    '해외 사업개발/기획자',
    '상품 기획자/MD',
  ],
  마케팅: [
    '선택',
    '퍼포먼스 마케터',
    '콘텐츠 마케터',
    '디지털 마케터',
    '마케팅 기획자',
    '브랜드 마케터',
    '광고 기획자',
    'CRM 전문가',
    '카피라이터/UX Writer',
  ],
  경영인사: [
    '선택',
    '경영지원',
    '회계/경리',
    '조직관리',
    '정보보호 담당자',
    '인사/평가',
    '교육',
    '채용담당자',
    '서비스 운영',
    'CS 매니저',
  ],
  영업: [
    '선택',
    '기업영업',
    '영업 관리자',
    '기술영업',
    '솔루션 컨설턴트',
    '세일즈',
  ],
  엔지니어링: [
    '선택',
    '기계 엔지니어',
    '전자 엔지니어',
    '전기 엔지니어',
    '로봇·자동화',
    'CAD·3D 설계자',
    '제품 엔지니어',
    '제어 엔지니어',
    '장비 엔지니어',
    '전기기계 공학자',
    '설비 엔지니어',
    '공정 엔지니어',
  ],
};

const SELECT_PLACEHOLDER = '선택';

export const getJobTitleOptionsByGroup = (group: string): SelectionOption[] => {
  const typedGroup = group as JobGroupOption;
  const options = JOB_TITLE_OPTIONS_BY_GROUP[typedGroup];

  if (!options) {
    return [];
  }

  return options.map((title) => ({
    value: title === SELECT_PLACEHOLDER ? '' : title,
    label: title,
  }));
};

export const CAREER_YEAR_OPTIONS = [
  '주니어 (1년 ~ 3년)',
  '미들 (4년 ~ 7년)',
  '시니어 (8년 ~ 11년)',
  '테크리드 (12년 이상)',
] as const;

export const CONSULTING_DURATION_DROPDOWN_OPTIONS =
  CONSULTING_DURATION_OPTIONS.map((minutes) => ({
    value: String(minutes),
    label: `${minutes}분`,
  }));

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
