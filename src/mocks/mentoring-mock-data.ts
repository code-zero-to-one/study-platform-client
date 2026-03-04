import {
  createDefaultMentorSettings,
  parseDurationLabelToMinutes,
} from '@/features/mentoring/model/mentor-settings';
import type {
  MentorProfile,
  MentorSortOption,
  MentoringMethodOption,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import type { MentorSettings } from '@/types/mentoring/settings';
export type {
  MentorProfile,
  MentorReview,
  MentorSortType,
  MentoringMethodOption,
  MentoringMethodType,
} from '@/types/mentoring/domain';

const DEFAULT_TIME_SLOTS = ['21:00~21:30', '21:30~22:00', '22:00~22:30'];
const METHOD_ORDER: MentoringMethodType[] = [
  'note',
  'simple',
  'deep',
  'offline',
];

const normalizeConsultingDuration = (minutes: number) => {
  if (minutes <= 30) {
    return 30 as const;
  }
  if (minutes <= 60) {
    return 60 as const;
  }

  return 90 as const;
};

const createMethodOption = (
  type: MentoringMethodType,
  overrides: Partial<MentoringMethodOption>,
): MentoringMethodOption => {
  const defaults: Record<MentoringMethodType, MentoringMethodOption> = {
    note: {
      type: 'note',
      label: '쪽지상담',
      durationLabel: '비동기',
      price: 9900,
      description:
        '질문/고민/자료를 미리 전달하고 텍스트로 빠르게 답변받는 비동기 상담입니다.',
      enabled: true,
      requiresSchedule: false,
      timeSlots: [],
    },
    simple: {
      type: 'simple',
      label: '간편상담',
      durationLabel: '15분',
      price: 19000,
      description:
        '허들을 낮춘 단기 상담입니다. 사전 질문을 바탕으로 핵심만 빠르게 정리합니다.',
      enabled: true,
      requiresSchedule: true,
      timeSlots: DEFAULT_TIME_SLOTS,
    },
    deep: {
      type: 'deep',
      label: '심층상담',
      durationLabel: '60분',
      price: 49000,
      description:
        '화면 공유/코드 리뷰 등 실시간 피드백이 필요한 상담에 적합합니다.',
      enabled: true,
      requiresSchedule: true,
      timeSlots: DEFAULT_TIME_SLOTS,
    },
    offline: {
      type: 'offline',
      label: '대면상담',
      durationLabel: '60분',
      price: 100000,
      description:
        '커피챗 또는 심층 상담으로 진행합니다. 세일즈 제안 목적 상담도 가능합니다.',
      enabled: true,
      requiresSchedule: true,
      timeSlots: DEFAULT_TIME_SLOTS,
    },
  };

  return {
    ...defaults[type],
    ...overrides,
  };
};

const getNormalizedMethods = (
  mentor: MentorProfile,
): Record<MentoringMethodType, MentoringMethodOption> => {
  const methods = mentor.methods as Partial<
    Record<MentoringMethodType, MentoringMethodOption>
  >;
  const noteMethod = methods.note;
  const simpleMethod = methods.simple;
  const deepMethod = methods.deep;
  const offlineMethod = methods.offline;
  const defaultDeepDuration = normalizeConsultingDuration(
    parseDurationLabelToMinutes(deepMethod?.durationLabel ?? '60분') ?? 60,
  );
  const defaultOfflineDuration = normalizeConsultingDuration(
    parseDurationLabelToMinutes(offlineMethod?.durationLabel ?? '60분') ?? 60,
  );

  return {
    note: createMethodOption('note', {
      ...noteMethod,
      type: 'note',
      label: noteMethod?.label || '쪽지상담',
      durationLabel: '비동기',
      requiresSchedule: false,
      timeSlots: [],
    }),
    simple: createMethodOption('simple', {
      ...simpleMethod,
      type: 'simple',
      label: simpleMethod?.label || '간편상담',
      durationLabel: '15분',
      requiresSchedule: true,
      timeSlots: simpleMethod?.timeSlots ?? DEFAULT_TIME_SLOTS,
    }),
    deep: createMethodOption('deep', {
      ...deepMethod,
      type: 'deep',
      label: deepMethod?.label || '심층상담',
      durationLabel: `${defaultDeepDuration}분`,
      requiresSchedule: true,
      timeSlots: deepMethod?.timeSlots ?? DEFAULT_TIME_SLOTS,
      enabled:
        deepMethod?.enabled ??
        (simpleMethod?.enabled !== false || offlineMethod?.enabled !== false),
      price:
        deepMethod?.price ??
        simpleMethod?.price ??
        offlineMethod?.price ??
        createMethodOption('deep', {}).price,
    }),
    offline: createMethodOption('offline', {
      ...offlineMethod,
      type: 'offline',
      label: offlineMethod?.label || '대면상담',
      durationLabel: `${defaultOfflineDuration}분`,
      requiresSchedule: true,
      timeSlots: offlineMethod?.timeSlots ?? DEFAULT_TIME_SLOTS,
    }),
  };
};

export const MENTOR_PROFILES: MentorProfile[] = [
  {
    id: 101,
    nickname: 'DevDevDev',
    role: '백엔드/서버 개발자',
    career: '미들 (4~8년)',
    company: '네카라쿠배',
    rating: 4.9,
    reviewCount: 58,
    mentoringCount: 112,
    menteeCount: 126,
    tags: ['Java', 'Kotlin', 'MySQL', 'Spring Boot', 'backend'],
    summary:
      '채용 관점에서 이력서/포트폴리오를 점검하고 실전 면접 피드백을 제공합니다.',
    bio: `대기업과 스타트업을 모두 경험한 백엔드 개발자입니다.

지원자 평가와 기술 인터뷰를 다수 진행해왔고, 지원자 입장에서 막히는 지점을 채용자 시선으로 명확히 짚어드립니다.

서류 합격률을 높이고 싶은 분, 모의 면접으로 실전 감각을 만들고 싶은 분에게 적합합니다.`,
    careerHistory: [
      'IT 대기업 백엔드 개발자 (2019 ~ 현재)',
      '채용 인터뷰어 및 과제 평가 200+건',
      '부트캠프 취업 멘토 활동',
    ],
    strengths: [
      '이력서/포트폴리오 실전 피드백',
      '백엔드 면접 대비',
      '커리어 전환 상담',
    ],
    avatarEmoji: 'D',
    methods: {
      note: createMethodOption('note', {
        price: 33000,
      }),
      simple: createMethodOption('simple', {
        price: 39000,
      }),
      deep: createMethodOption('deep', {
        price: 49000,
      }),
      offline: createMethodOption('offline', {
        price: 89000,
      }),
    },
    reviews: [
      {
        id: 1,
        authorName: '김OO',
        rating: 5,
        createdAt: '2026.02.12',
        method: 'note',
        content:
          '이력서에서 어떤 경험을 강조해야 할지 명확해졌고 실제 면접 질문까지 정리해주셔서 바로 써먹었습니다.',
      },
      {
        id: 2,
        authorName: '박OO',
        rating: 5,
        createdAt: '2026.02.05',
        method: 'simple',
        content:
          '15분인데도 핵심만 압축해서 알려주셔서 고민이 빠르게 정리됐습니다.',
      },
      {
        id: 3,
        authorName: '이OO',
        rating: 4,
        createdAt: '2026.01.28',
        method: 'offline',
        content: '포트폴리오 방향성을 잡는 데 큰 도움을 받았습니다.',
      },
    ],
  },
  {
    id: 102,
    nickname: '송이',
    role: '프론트엔드/웹퍼블리셔',
    career: '미들 (4~8년)',
    company: '국내 대기업',
    rating: 5.0,
    reviewCount: 147,
    mentoringCount: 333,
    menteeCount: 353,
    tags: ['JavaScript', 'React', '면접', '이력서', 'frontend'],
    summary:
      '프론트엔드 취업 시장에 맞춘 이력서/과제전형/면접 답변 전략을 제공합니다.',
    bio: `프론트엔드 개발자로 대기업, 스타트업을 모두 경험했습니다.

채용 과제에서 자주 감점되는 지점과 포트폴리오 구성 전략을 멘티 상황에 맞춰 구체적으로 안내합니다.

취업과 이직 준비 과정에서 "뭘 먼저 해야 하는지"를 명확히 만들고 싶은 분께 추천합니다.`,
    careerHistory: [
      '국내 대기업 프론트엔드 개발자 (2021 ~ 현재)',
      '스타트업 프론트엔드 개발자 (2018 ~ 2021)',
      '프론트엔드 포트폴리오 리뷰 300+건',
    ],
    strengths: [
      'React 포트폴리오 설계',
      '프론트엔드 과제전형 대비',
      '이직 전략 수립',
    ],
    avatarEmoji: 'S',
    methods: {
      note: createMethodOption('note', {
        price: 40000,
      }),
      simple: createMethodOption('simple', {
        price: 45000,
      }),
      deep: createMethodOption('deep', {
        price: 55000,
      }),
      offline: createMethodOption('offline', {
        price: 95000,
      }),
    },
    reviews: [
      {
        id: 4,
        authorName: '정OO',
        rating: 5,
        createdAt: '2026.02.08',
        method: 'note',
        content: '과제전형 코드 구조를 어떻게 보여줘야 하는지 감이 잡혔습니다.',
      },
      {
        id: 5,
        authorName: '최OO',
        rating: 5,
        createdAt: '2026.01.26',
        method: 'simple',
        content: '면접 답변 구조를 함께 정리해주셔서 자신감이 생겼어요.',
      },
    ],
  },
  {
    id: 103,
    nickname: '티아',
    role: '게임 서버 개발자',
    career: 'Lead 레벨',
    company: '넥슨게임즈',
    rating: 5.0,
    reviewCount: 81,
    mentoringCount: 148,
    menteeCount: 162,
    tags: ['Unity', 'Unreal Engine', '면접', 'backend', 'game-programming'],
    summary:
      '게임 개발 커리어 전환부터 포트폴리오 구성, 실무 기반 기술면접까지 코칭합니다.',
    bio: `게임 클라이언트/서버를 모두 경험한 개발자입니다.

학습 우선순위, 프로젝트 포지셔닝, 포트폴리오 메시지까지 한 번에 정리해드립니다.

취업/이직 준비 중인 게임 개발자 분들이 가장 많이 막히는 지점을 짧은 세션에서도 해결할 수 있도록 구조화해 진행합니다.`,
    careerHistory: [
      '게임사 서버 개발 리드 (2022 ~ 현재)',
      '클라이언트 개발자 (2018 ~ 2022)',
      '게임 개발 멘토링 150+회',
    ],
    strengths: [
      '게임 포트폴리오 설계',
      '클라/서버 진로 선택',
      '모의 면접 피드백',
    ],
    avatarEmoji: 'T',
    methods: {
      note: createMethodOption('note', {
        price: 49500,
      }),
      simple: createMethodOption('simple', {
        price: 55000,
      }),
      deep: createMethodOption('deep', {
        price: 65000,
      }),
      offline: createMethodOption('offline', {
        price: 120000,
      }),
    },
    reviews: [
      {
        id: 6,
        authorName: '장OO',
        rating: 5,
        createdAt: '2026.02.02',
        method: 'note',
        content: '학습 로드맵이 명확해져서 시간 낭비를 많이 줄였습니다.',
      },
      {
        id: 7,
        authorName: '윤OO',
        rating: 5,
        createdAt: '2026.01.21',
        method: 'simple',
        content:
          '게임 서버 면접 질문을 실제 사례로 연습할 수 있어서 좋았습니다.',
      },
      {
        id: 8,
        authorName: '백OO',
        rating: 5,
        createdAt: '2026.01.19',
        method: 'offline',
        content: '포트폴리오 전체 스토리라인을 잡아주셔서 큰 도움이 됐습니다.',
      },
      {
        id: 9,
        authorName: '고OO',
        rating: 5,
        createdAt: '2026.01.14',
        method: 'note',
        content: '바로 실행 가능한 액션 아이템 위주로 정리해주십니다.',
      },
      {
        id: 10,
        authorName: '노OO',
        rating: 5,
        createdAt: '2026.01.09',
        method: 'note',
        content: '짧은 질문에도 핵심을 정확히 짚어주셔서 반복 신청하고 있어요.',
      },
    ],
  },
  {
    id: 104,
    nickname: '마리골드A',
    role: '프론트엔드/웹퍼블리셔',
    career: '시니어 (9년 이상)',
    company: 'ex-네카라쿠배',
    rating: 4.9,
    reviewCount: 70,
    mentoringCount: 173,
    menteeCount: 181,
    tags: ['JavaScript', 'React', '면접', '기술면접', 'frontend'],
    summary: '프론트엔드 취업 전 과정을 레벨별로 나눠 체계적으로 코칭합니다.',
    bio: '신입/경력 프론트엔드 지원자 모두를 대상으로 레벨 체크 기반 멘토링을 제공합니다.',
    careerHistory: ['프론트엔드 리드 9년+', '기술면접관 참여 다수'],
    strengths: ['레벨 진단', '서류/면접 통합 코칭'],
    avatarEmoji: 'M',
    methods: {
      note: createMethodOption('note', {
        price: 66000,
      }),
      simple: createMethodOption('simple', {
        enabled: false,
      }),
      deep: createMethodOption('deep', {
        enabled: false,
      }),
      offline: createMethodOption('offline', {
        enabled: false,
      }),
    },
    reviews: [],
  },
  {
    id: 105,
    nickname: '취업꼭찍기 제로미니',
    role: '보안 엔지니어',
    career: '시니어 (9년 이상)',
    company: '프리랜서',
    rating: 5.0,
    reviewCount: 16,
    mentoringCount: 79,
    menteeCount: 93,
    tags: ['악성코드', '모의해킹', 'Forensic', 'security', '취업'],
    summary:
      '정보보안 직무 중심 취업/이직 전략과 실무 준비 로드맵을 제공합니다.',
    bio: '보안 직무 입문과 경력 전환 모두를 대상으로 커리어 코칭을 진행합니다.',
    careerHistory: ['보안 엔지니어 9년+', '공기업/대기업 보안 직무 멘토링'],
    strengths: ['보안 직무 로드맵', '이직 전략'],
    avatarEmoji: 'J',
    methods: {
      note: createMethodOption('note', {
        price: 22000,
      }),
      simple: createMethodOption('simple', {
        price: 29000,
      }),
      deep: createMethodOption('deep', {
        price: 35000,
      }),
      offline: createMethodOption('offline', {
        enabled: false,
      }),
    },
    reviews: [],
  },
  {
    id: 106,
    nickname: '까이',
    role: 'PO/PM',
    career: '미들 (4~8년)',
    company: '네카오',
    rating: 5.0,
    reviewCount: 9,
    mentoringCount: 22,
    menteeCount: 29,
    tags: ['포트폴리오', '면접', '서비스기획', '이력서', '취업'],
    summary:
      '서비스 기획 직무 전환/이직을 준비하는 분들을 위한 포트폴리오 코칭입니다.',
    bio: 'PO/PM 커리어를 준비하는 멘티에게 포트폴리오와 케이스 스터디 방향을 안내합니다.',
    careerHistory: ['네카오 PO/PM', '기획 포트폴리오 리뷰 다수'],
    strengths: ['기획 포트폴리오', '케이스 스터디'],
    avatarEmoji: 'K',
    methods: {
      note: createMethodOption('note', {
        price: 49500,
      }),
      simple: createMethodOption('simple', {
        price: 56000,
      }),
      deep: createMethodOption('deep', {
        price: 62000,
      }),
      offline: createMethodOption('offline', {
        enabled: false,
      }),
    },
    reviews: [],
  },
  {
    id: 107,
    nickname: '열정개발자',
    role: '백엔드/서버 개발자',
    career: '주니어 (1~3년)',
    company: '네카라 중 한 곳',
    rating: 5.0,
    reviewCount: 2,
    mentoringCount: 4,
    menteeCount: 7,
    tags: ['Java', 'Spring', '포트폴리오', '이력서', 'backend'],
    summary:
      '주니어 시선에서 바로 적용할 수 있는 합격 이력서 개선 포인트를 제공합니다.',
    bio: '최근 합격 경험을 기반으로 주니어 맞춤형 멘토링을 제공합니다.',
    careerHistory: ['대기업 백엔드 합격', '주니어 멘토링 진행'],
    strengths: ['이력서 피드백', '주니어 취업 전략'],
    avatarEmoji: 'E',
    methods: {
      note: createMethodOption('note', {
        price: 11000,
      }),
      simple: createMethodOption('simple', {
        enabled: false,
      }),
      deep: createMethodOption('deep', {
        enabled: false,
      }),
      offline: createMethodOption('offline', {
        enabled: false,
      }),
    },
    reviews: [],
  },
  {
    id: 108,
    nickname: 'kaya',
    role: '프론트엔드/웹퍼블리셔',
    career: 'Lead 레벨',
    company: '글로벌 IT 기업',
    rating: 4.8,
    reviewCount: 31,
    mentoringCount: 64,
    menteeCount: 78,
    tags: ['포트폴리오', '면접', '리액트', '커리어', 'frontend'],
    summary: '면접 대비와 커리어 고민을 실제 사례 중심으로 정리해드립니다.',
    bio: '글로벌 서비스 개발 경험을 바탕으로 이직/성장 전략을 제시합니다.',
    careerHistory: ['글로벌 IT 프론트엔드 리드', '면접관 경험'],
    strengths: ['커리어 코칭', '면접 대비'],
    avatarEmoji: 'K',
    methods: {
      note: createMethodOption('note', {
        price: 39000,
      }),
      simple: createMethodOption('simple', {
        price: 47000,
      }),
      deep: createMethodOption('deep', {
        price: 54000,
      }),
      offline: createMethodOption('offline', {
        price: 88000,
      }),
    },
    reviews: [],
  },
];

export const sortOptions = [
  { value: 'default', label: '기본순' },
  { value: 'rating', label: '평점순' },
  { value: 'review', label: '리뷰순' },
  { value: 'low-price', label: '낮은 가격순' },
] as const satisfies readonly MentorSortOption[];

export const getEnabledMentoringMethods = (mentor: MentorProfile) => {
  const methods = getNormalizedMethods(mentor);

  return METHOD_ORDER.filter(
    (method) => methods[method] && methods[method].enabled !== false,
  );
};

export const getLowestPriceOption = (mentor: MentorProfile) => {
  const methods = getEnabledMentoringMethods(mentor);
  const normalizedMethods = getNormalizedMethods(mentor);

  if (methods.length === 0) {
    return null;
  }

  return methods
    .map((method) => normalizedMethods[method])
    .sort((a, b) => a.price - b.price)[0];
};

export const getMentorById = (id: number) => {
  const mentor = MENTOR_PROFILES.find((item) => item.id === id);

  if (!mentor) {
    return undefined;
  }

  return withMentorSettings(mentor);
};

export const formatWon = (price: number) => `₩${price.toLocaleString('ko-KR')}`;

export const getMethodLabel = (method: MentoringMethodType) => {
  return {
    note: '쪽지상담',
    simple: '간편상담',
    deep: '심층상담',
    offline: '대면상담',
  }[method];
};

const getNormalizedSettings = (mentor: MentorProfile): MentorSettings => {
  const defaults = createDefaultMentorSettings();
  const methods = getNormalizedMethods(mentor);
  const source = mentor.mentorSettings as MentorSettings | undefined;
  const normalizedDeepDuration = normalizeConsultingDuration(
    parseDurationLabelToMinutes(methods.deep.durationLabel) ??
      defaults.deepDurationMinutes,
  );
  const normalizedOfflineDuration = normalizeConsultingDuration(
    parseDurationLabelToMinutes(methods.offline.durationLabel) ??
      defaults.offlineDurationMinutes,
  );
  const appealLine = source?.appealLine?.trim();

  return {
    ...defaults,
    ...source,
    noteEnabled:
      source?.noteEnabled ?? methods.note.enabled ?? defaults.noteEnabled,
    notePrice: source?.notePrice ?? methods.note.price ?? defaults.notePrice,
    simpleEnabled:
      source?.simpleEnabled ?? methods.simple.enabled ?? defaults.simpleEnabled,
    simplePrice:
      source?.simplePrice ?? methods.simple.price ?? defaults.simplePrice,
    deepEnabled:
      source?.deepEnabled ?? methods.deep.enabled ?? defaults.deepEnabled,
    deepPrice: source?.deepPrice ?? methods.deep.price ?? defaults.deepPrice,
    deepDurationMinutes:
      source?.deepDurationMinutes ??
      source?.offlineDurationMinutes ??
      normalizedDeepDuration,
    offlineEnabled:
      source?.offlineEnabled ??
      methods.offline.enabled ??
      defaults.offlineEnabled,
    offlinePrice:
      source?.offlinePrice ?? methods.offline.price ?? defaults.offlinePrice,
    offlineDurationMinutes:
      source?.offlineDurationMinutes ??
      source?.deepDurationMinutes ??
      normalizedOfflineDuration,
    appealLine: appealLine || defaults.appealLine,
    companyCategory: source?.companyCategory ?? defaults.companyCategory,
    interviewQuestions:
      source?.interviewQuestions ?? defaults.interviewQuestions,
  };
};

export const getMentorSettings = (mentor: MentorProfile): MentorSettings => {
  return getNormalizedSettings(mentor);
};

export function withMentorSettings(mentor: MentorProfile): MentorProfile {
  return {
    ...mentor,
    methods: getNormalizedMethods(mentor),
    mentorSettings: getNormalizedSettings(mentor),
  };
}
