/**
 * 랜딩페이지 A/B 테스트용 상수
 * A안: 수치/통계 중심
 * B안: 사용자 후기 중심
 */

// ============================================
// 공통 데이터
// ============================================

export const HERO_SECTION = {
  title: {
    main: '당신을 위한 IT 스터디,',
    sub: '함께 가는 ZERO-ONE.',
  },
  description: [
    '혼자서는 막막한 IT 스터디, 제로원에서 완주하세요.',
    '함께 배우고 기록으로 증명하여 커리어 성장을 이루세요.',
  ],
  cta: '나에게 맞는 스터디 둘러보기',
} as const;

// ============================================
// 통계 섹션 (A안에서 먼저, B안에서 나중)
// ============================================

export const STATS_SECTION = {
  stats: [
    {
      label: '함께 성장한 멤버',
      value: '200',
      suffix: '+',
      icon: '/images/clock-in-landing-page.svg',
      description: '누적 가입자 수',
    },
    {
      label: '1:1 스터디 매칭',
      value: '3000',
      suffix: '+',
      icon: '/images/book-in-landing-page.svg',
      description: '누적 1:1 스터디 수',
    },
    {
      label: '든든한 멘토',
      value: '10',
      suffix: '+',
      icon: 'images/shoes-in-landing-page.svg',
      description: '현직 멘토진 수',
    },
  ],
} as const;

// ============================================
// 리뷰/후기 섹션 (B안에서 먼저, A안에서 나중)
// ============================================

export const REVIEWS_SECTION = {
  title: 'IT 스터디는 ZERO-ONE에서.',
  reviews: [
    {
      id: 1,
      avatar: '/images/avatar-1.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      name: '익명 1',
      text: '"혼자 공부할 때보다 더 많은 학습자료, 방법을 얻어갈 수 있었어요."',
      position: 'left',
    },
    {
      id: 2,
      avatar: '/images/avatar-2.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      name: '익명 2',
      text: '"제로원 스터디를 하면서 QA 자격증을 취득했어요."',
      position: 'right',
    },
    {
      id: 3,
      avatar: '/images/avatar-3.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      name: '익명 3',
      text: '"매칭된 상대가 있어서 어떻게든 공부를 하게 되네요."',
      position: 'left',
    },
    {
      id: 4,
      avatar: '/images/avatar-4.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      name: '익명 4',
      text: '"다른 분들과의 네트워킹을 통해 제 실력 파악이 가능했어요"',
      position: 'right',
    },
  ],
} as const;

// ============================================
// 그룹 스터디 섹션
// ============================================

export const GROWTH_SECTION = {
  badge: '그룹 스터디',
  title: '혼자보다 다같이, 끝까지.',
  description: [
    '비슷한 관심사의 사람들과 모여 질문하고 피드백하며 성장 자극을 주고 받아요.',
  ],
  cta: '나와 함께 완주할 그룹 스터디 동료 찾기',
  cards: [
    {
      badge: 'D-5',
      title: '1일 1코딩테스트 문제 풀이',
      description: ['코딩테스트 스터디'],
      location: '서울',
      imageSrc: '/images/mentoring-card.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
    },
    {
      badge: 'D-10',
      title: '핸즈온 LLM',
      description: ['책 스터디'],
      location: '서울',
      imageSrc: '/images/llm-card.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
    },
    {
      badge: 'D-1',
      title: '실전, 내 서비스 만들기',
      description: ['챌린지'],
      location: '서울',
      imageSrc: '/images/handshake-card.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
    },
    {
      badge: 'D+12',
      title: '마케터를 위한 자동화 실무',
      description: ['챌린지'],
      location: '온라인',
      imageSrc: '/images/handshake-card.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
    },
  ],
} as const;

// ============================================
// 1:1 스터디 섹션
// ============================================

export const ONE_ON_ONE_STUDY_SECTION = {
  badge: '1:1 스터디',
  title: ['매일 심도 있게 토론하고 싶다면?'],
  description: [
    '이건 어떻게 동작할까? 꼬리질문은 어떻게 대비하지?',
    '1:1 스터디로 CS 개념에 딥다이브 해보세요.',
  ],
  imageSrc: '/images/one-by-one-study.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
  cta: '나에게 딱 맞는 1:1 스터디 파트너 찾기',
} as const;

// ============================================
// 전문가 멘토진 섹션
// ============================================

export const MENTOR_SECTION = {
  badge: '전문 멘토 모집 중',
  title: '현직 최고 수준의 전문가들에게 배우는 압도적인 실무 역량',
  description: [
    '지금까지 혼자서 개발, 디자인, 콘텐츠 제작 등을 해온 수많은 취준생들을 위해 준비했습니다.',
    '취업 준비와 함께 실무 역량을 키우고 싶다면 전문가에게 도움을 받을 수 있도록 준비 중입니다.',
  ],
  mentors: [
    {
      id: 1,
      name: '김석우',
      avatar: '/images/mentor-1.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      title: '스타트업 | 7년차 CTO',
      description: [
        '백엔드와 데브옵스를 주력으로 하고 있습니다. 아키텍처 설계 및 구현, 장애 대응, 대용량 트래픽 처리, 안정적인 인프라 운영 등 제품의 A to Z를 풀어내고 있습니다.',
      ],
    },
    {
      id: 2,
      name: '이지훈',
      avatar: '/images/mentor-2.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      title: '외국계 | 8년차 Front-end Developer',
      description: [
        '유럽 현지 회사에서 다년간 여러 회사에서 근무한 경험이 있습니다. 특히 웹 최적화, SEO 등 웹 개발 경험이 풍부합니다.',
      ],
    },
    {
      id: 3,
      name: '유인태',
      avatar: '/images/mentor-3.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      title: '핀테크 | 15년차 Back-end Developer',
      description: [
        '웹사이트 개발의 A-Z를 경험해봤으며 크롤링으로 특허를 출헌한 경험이 있습니다. 면접 다수 진행 및 직업 전문학교 프로젝트 관리를 했습니다.',
      ],
    },
    {
      id: 4,
      name: '',
      avatar: '/images/mentor-4.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      title: '',
      description: [''],
    },
  ],
} as const;

// ============================================
// 오픈 알림 폼 섹션
// ============================================

export const NOTIFICATION_SECTION = {
  badge: '마감 임박',
  title: '지금 필요한 스터디, 빠르게 만나보세요.',
  description: [
    '원하는 스터디가 아직 없나요?',
    '멘토님들이 새로운 스터디를 준비 중이에요.',
    '관심 분야를 남기면 오픈 소식을 가장 먼저 알려드려요.',
    '⚠️ 선착순 마감 시 알림이 발송되지 않을 수 있어요.',
  ],
} as const;

// ============================================
// Footer
// ============================================

export const FOOTER_DATA = {
  message: [
    '제로원을 방문해주신 모든 분들에게 감사드립니다.',
    '더욱 더 좋은 서비스와 기회로 보답하도록 하겠습니다.',
  ],
  socials: [
    {
      name: 'Threads',
      url: 'https://www.threads.net/@code_zero_to_one',
      icon: '/icons/thread.svg',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/code_zero_to_one/',
      icon: '/icons/instagram.svg',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@코드제로투원',
      icon: '/icons/youtube.svg',
    },
  ],
  business: {
    companyName: '정성컴퍼니',
    ceo: '조성진',
    phone: '010-6856-6609',
    businessNumber: '798-31-01774',
    address: '서울시 강남구 역삼동 620-17 203호',
  },
  copyright: '© 2024 ZERO-ONE. All rights reserved.',
} as const;
