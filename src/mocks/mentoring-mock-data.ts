import {
  createDefaultMentorSettings,
  createEmptyWeeklySchedule,
  parseDurationLabelToMinutes,
  type MentorSettingsV2,
  type WeekdayKey,
} from '@/features/mentoring/model/mentor-settings';

export type MentoringMethodType = 'note' | 'phone' | 'online' | 'offline';
type LegacyMentoringMethodType = MentoringMethodType | 'chat' | 'call';

export interface MentoringMethodOption {
  type: MentoringMethodType;
  label: string;
  durationLabel: string;
  price: number;
  description: string;
  enabled?: boolean;
  requiresSchedule: boolean;
  timeSlots: string[];
}

export interface MentorReview {
  id: number;
  authorName: string;
  rating: number;
  createdAt: string;
  content: string;
  method: MentoringMethodType;
}

export interface MentorProfile {
  id: number;
  priority: number;
  headline: string;
  nickname: string;
  role: string;
  career: string;
  company: string;
  rating: number;
  reviewCount: number;
  mentoringCount: number;
  tags: string[];
  summary: string;
  bio: string;
  careerHistory: string[];
  strengths: string[];
  avatarEmoji?: string;
  imageUrl?: string;
  methods: Record<MentoringMethodType, MentoringMethodOption>;
  reviews: MentorReview[];
  mentorSettings?: MentorSettingsV2;
}

const DEFAULT_TIME_SLOTS = ['21:00~21:30', '21:30~22:00', '22:00~22:30'];
const METHOD_ORDER: MentoringMethodType[] = ['note', 'phone', 'online', 'offline'];

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
  type: MentoringMethodType | 'chat' | 'call',
  overrides: Partial<MentoringMethodOption>,
): MentoringMethodOption => {
  const defaults: Record<LegacyMentoringMethodType, MentoringMethodOption> = {
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
    phone: {
      type: 'phone',
      label: '15분 전화상담',
      durationLabel: '15분',
      price: 19000,
      description:
        '허들을 낮춘 단기 상담입니다. 사전 질문을 바탕으로 핵심만 빠르게 정리합니다.',
      enabled: true,
      requiresSchedule: true,
      timeSlots: DEFAULT_TIME_SLOTS,
    },
    online: {
      type: 'online',
      label: '온라인상담',
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
    chat: {
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
    call: {
      type: 'phone',
      label: '15분 전화상담',
      durationLabel: '15분',
      price: 19000,
      description:
        '허들을 낮춘 단기 상담입니다. 사전 질문을 바탕으로 핵심만 빠르게 정리합니다.',
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

const LEGACY_WEEKDAY_ORDER: WeekdayKey[] = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
];

const extractStartTimesFromLegacySlots = (slots: string[]) => {
  return Array.from(
    new Set(
      slots
        .map((slot) => {
          const [start] = slot.split('~');

          return start?.trim() ?? '';
        })
        .filter((slot) => /^\d{2}:\d{2}$/.test(slot)),
    ),
  ).sort();
};

const createFallbackWeeklySchedule = (
  mentor: MentorProfile,
): Record<WeekdayKey, string[]> => {
  const weekly = createEmptyWeeklySchedule();
  const legacyMethods = mentor.methods as Partial<
    Record<LegacyMentoringMethodType, MentoringMethodOption>
  >;
  const phoneMethod = legacyMethods.phone ?? legacyMethods.call;
  const onlineMethod = legacyMethods.online ?? legacyMethods.call;
  const offlineMethod = legacyMethods.offline;
  const fallbackSlots = extractStartTimesFromLegacySlots([
    ...(phoneMethod?.timeSlots ?? []),
    ...(onlineMethod?.timeSlots ?? []),
    ...(offlineMethod?.timeSlots ?? []),
  ]);

  if (fallbackSlots.length === 0) {
    return weekly;
  }

  LEGACY_WEEKDAY_ORDER.forEach((day) => {
    weekly[day] = [...fallbackSlots];
  });

  return weekly;
};

const getNormalizedMethods = (
  mentor: MentorProfile,
): Record<MentoringMethodType, MentoringMethodOption> => {
  const legacyMethods = mentor.methods as Partial<
    Record<LegacyMentoringMethodType, MentoringMethodOption>
  >;
  const legacyNote = legacyMethods.note ?? legacyMethods.chat;
  const legacyPhone = legacyMethods.phone ?? legacyMethods.call;
  const legacyOnline = legacyMethods.online ?? legacyMethods.call;
  const legacyOffline = legacyMethods.offline;
  const defaultOnlineDuration = normalizeConsultingDuration(
    parseDurationLabelToMinutes(legacyOnline?.durationLabel ?? '60분') ?? 60,
  );
  const defaultOfflineDuration = normalizeConsultingDuration(
    parseDurationLabelToMinutes(legacyOffline?.durationLabel ?? '60분') ?? 60,
  );

  return {
    note: createMethodOption('note', {
      ...legacyNote,
      type: 'note',
      label: legacyNote?.label || '쪽지상담',
      durationLabel: '비동기',
      requiresSchedule: false,
      timeSlots: [],
    }),
    phone: createMethodOption('phone', {
      ...legacyPhone,
      type: 'phone',
      label: legacyPhone?.label || '15분 전화상담',
      durationLabel: '15분',
      requiresSchedule: true,
      timeSlots: legacyPhone?.timeSlots ?? DEFAULT_TIME_SLOTS,
    }),
    online: createMethodOption('online', {
      ...legacyOnline,
      type: 'online',
      label: legacyOnline?.label || '온라인상담',
      durationLabel: `${defaultOnlineDuration}분`,
      requiresSchedule: true,
      timeSlots: legacyOnline?.timeSlots ?? DEFAULT_TIME_SLOTS,
      enabled:
        legacyOnline?.enabled ??
        (legacyPhone?.enabled !== false || legacyOffline?.enabled !== false),
      price:
        legacyOnline?.price ??
        legacyPhone?.price ??
        legacyOffline?.price ??
        createMethodOption('online', {}).price,
    }),
    offline: createMethodOption('offline', {
      ...legacyOffline,
      type: 'offline',
      label: legacyOffline?.label || '대면상담',
      durationLabel: `${defaultOfflineDuration}분`,
      requiresSchedule: true,
      timeSlots: legacyOffline?.timeSlots ?? DEFAULT_TIME_SLOTS,
    }),
  };
};

const buildSettingsFromLegacyMentor = (
  mentor: MentorProfile,
): MentorSettingsV2 => {
  const defaults = createDefaultMentorSettings();
  const skillTags = mentor.tags.slice(0, 5);
  const methods = getNormalizedMethods(mentor);
  const onlineDurationMinutes = normalizeConsultingDuration(
    parseDurationLabelToMinutes(methods.online.durationLabel) ?? 60,
  );
  const offlineDurationMinutes = normalizeConsultingDuration(
    parseDurationLabelToMinutes(methods.offline.durationLabel) ?? 60,
  );

  return {
    ...defaults,
    categories: [mentor.role],
    mentoringTitle: mentor.headline,
    jobGroup: mentor.role,
    jobTitle: mentor.role,
    careerYears: mentor.career,
    skillTags,
    companyName: mentor.company === '비공개' ? '' : mentor.company,
    hideCompanyName: mentor.company === '비공개',
    noteEnabled: methods.note.enabled !== false,
    notePrice: methods.note.price,
    phoneEnabled: methods.phone.enabled !== false,
    phonePrice: methods.phone.price,
    onlineEnabled: methods.online.enabled !== false,
    onlinePrice: methods.online.price,
    onlineDurationMinutes,
    offlineEnabled: methods.offline.enabled !== false,
    offlinePrice: methods.offline.price,
    offlineDurationMinutes,
    maxParticipants: 1,
    schedule: {
      timezone: 'Asia/Seoul',
      slotUnitMinutes: 30,
      weekly: createFallbackWeeklySchedule(mentor),
    },
    detailedDescription: mentor.bio,
    interviewQuestions: [],
    preNotice: '',
    schemaVersion: 3,
    updatedAt: new Date().toISOString(),
  };
};

export const MENTOR_PROFILES: MentorProfile[] = [
  {
    id: 101,
    priority: 1,
    headline:
      '"현직 채용 담당자"의 시니어 개발자 취업을 위한 이력서 피드백, 모의 면접, 고민 상담',
    nickname: 'DevDevDev',
    role: '백엔드/서버 개발자',
    career: '미들 (4~8년)',
    company: '네카라쿠배',
    rating: 4.9,
    reviewCount: 58,
    mentoringCount: 112,
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
      phone: createMethodOption('phone', {
        price: 39000,
      }),
      online: createMethodOption('online', {
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
        method: 'phone',
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
    priority: 2,
    headline: '프론트엔드 취업/이직을 위한 맞춤형 이력서 피드백 및 멘토링',
    nickname: '송이',
    role: '프론트엔드/웹퍼블리셔',
    career: '미들 (4~8년)',
    company: '국내 대기업',
    rating: 5.0,
    reviewCount: 147,
    mentoringCount: 333,
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
      phone: createMethodOption('phone', {
        price: 45000,
      }),
      online: createMethodOption('online', {
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
        method: 'phone',
        content: '면접 답변 구조를 함께 정리해주셔서 자신감이 생겼어요.',
      },
    ],
  },
  {
    id: 103,
    priority: 3,
    headline:
      '[게임 프로그래머] 클라/서버 학습 방향, 취업, 이직, 모의면접, 포트폴리오 멘토링',
    nickname: '티아',
    role: '게임 서버 개발자',
    career: 'Lead 레벨',
    company: '넥슨게임즈',
    rating: 5.0,
    reviewCount: 81,
    mentoringCount: 148,
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
      phone: createMethodOption('phone', {
        price: 55000,
      }),
      online: createMethodOption('online', {
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
        method: 'phone',
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
    priority: 4,
    headline:
      '[RE-OPEN] 테크기업 FE 채용 완벽대비 - 레벨체크, 서류, 과제, 면접, 신입, 경력',
    nickname: '마리골드A',
    role: '프론트엔드/웹퍼블리셔',
    career: '시니어 (9년 이상)',
    company: 'ex-네카라쿠배',
    rating: 4.9,
    reviewCount: 70,
    mentoringCount: 173,
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
      phone: createMethodOption('phone', {
        enabled: false,
      }),
      online: createMethodOption('online', {
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
    priority: 5,
    headline:
      '공기업 취업, 정보보안 분야 커리어, 면접, 이직 관련 상담 (네카라쿠배 취업, 대기업 취업 포함)',
    nickname: '취업꼭찍기 제로미니',
    role: '보안 엔지니어',
    career: '시니어 (9년 이상)',
    company: '프리랜서',
    rating: 5.0,
    reviewCount: 16,
    mentoringCount: 79,
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
      phone: createMethodOption('phone', {
        price: 29000,
      }),
      online: createMethodOption('online', {
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
    priority: 6,
    headline:
      '[PM/서비스기획] 네카오 출신 현직 자의 포트폴리오·이력서·커리어 1:1 코칭',
    nickname: '까이',
    role: 'PO/PM',
    career: '미들 (4~8년)',
    company: '네카오',
    rating: 5.0,
    reviewCount: 9,
    mentoringCount: 22,
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
      phone: createMethodOption('phone', {
        price: 56000,
      }),
      online: createMethodOption('online', {
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
    priority: 7,
    headline:
      '[선착순 할인] 대기업 백엔드 합격 이력서 공유 & 이력서/포폴 1:1 멘토링 (잔여 2명)',
    nickname: '열정개발자',
    role: '백엔드/서버 개발자',
    career: '주니어 (1~3년)',
    company: '네카라 중 한 곳',
    rating: 5.0,
    reviewCount: 2,
    mentoringCount: 4,
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
      phone: createMethodOption('phone', {
        enabled: false,
      }),
      online: createMethodOption('online', {
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
    priority: 8,
    headline: '프론트엔드 개발 취직/이직/커리어 고민 집중 멘토링',
    nickname: 'kaya',
    role: '프론트엔드/웹퍼블리셔',
    career: 'Lead 레벨',
    company: '글로벌 IT 기업',
    rating: 4.8,
    reviewCount: 31,
    mentoringCount: 64,
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
      phone: createMethodOption('phone', {
        price: 47000,
      }),
      online: createMethodOption('online', {
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
] as const;

export type MentorSortType = (typeof sortOptions)[number]['value'];

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
    phone: '15분 전화상담',
    online: '온라인상담',
    offline: '대면상담',
  }[method];
};

const getNormalizedSettings = (mentor: MentorProfile): MentorSettingsV2 => {
  const fallback = buildSettingsFromLegacyMentor(mentor);
  const source = mentor.mentorSettings as
    | (MentorSettingsV2 & {
        chatEnabled?: boolean;
        chatPrice?: number;
        callEnabled?: boolean;
        callPrice?: number;
        sessionDurationMinutes?: number;
      })
    | undefined;

  if (!source) {
    return fallback;
  }

  const legacyDuration = normalizeConsultingDuration(
    source.sessionDurationMinutes ?? fallback.onlineDurationMinutes,
  );

  return {
    ...fallback,
    ...source,
    noteEnabled: source.noteEnabled ?? source.chatEnabled ?? fallback.noteEnabled,
    notePrice: source.notePrice ?? source.chatPrice ?? fallback.notePrice,
    phoneEnabled:
      source.phoneEnabled ?? source.callEnabled ?? fallback.phoneEnabled,
    phonePrice: source.phonePrice ?? source.callPrice ?? fallback.phonePrice,
    onlineEnabled:
      source.onlineEnabled ?? source.callEnabled ?? fallback.onlineEnabled,
    onlinePrice: source.onlinePrice ?? source.callPrice ?? fallback.onlinePrice,
    onlineDurationMinutes:
      source.onlineDurationMinutes ??
      source.offlineDurationMinutes ??
      legacyDuration,
    offlineEnabled: source.offlineEnabled ?? fallback.offlineEnabled,
    offlinePrice: source.offlinePrice ?? fallback.offlinePrice,
    offlineDurationMinutes:
      source.offlineDurationMinutes ??
      source.onlineDurationMinutes ??
      legacyDuration,
    interviewQuestions: source.interviewQuestions ?? fallback.interviewQuestions,
    schemaVersion: 3,
  };
};

export const getMentorSettings = (mentor: MentorProfile): MentorSettingsV2 => {
  return getNormalizedSettings(mentor);
};

export function withMentorSettings(mentor: MentorProfile): MentorProfile {
  return {
    ...mentor,
    methods: getNormalizedMethods(mentor),
    mentorSettings: getNormalizedSettings(mentor),
  };
}
