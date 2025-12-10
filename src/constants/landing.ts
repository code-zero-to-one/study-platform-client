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
    main: '스터디를 완주하고 싶다면',
    sub: '제로원에서 시작해요!',
  },
  description: [
    '나에게 맞는 1:1 스터디 및 그룹 스터디를 개설하거나 참여해보세요',
    '그리고 제로원에서 쉽게 스터디를 관리하세요!',
  ],
  cta: '스터디 시작하기',
} as const;

// ============================================
// 통계 섹션 (A안에서 먼저, B안에서 나중)
// ============================================

export const STATS_SECTION = {
  stats: [
    {
      label: '누적 가입자 수',
      value: '200',
      suffix: '+',
      icon: '/images/clock-emoji.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      description: '함께 성장한 멤버',
    },
    {
      label: '누적 1:1 스터디',
      value: '3000',
      suffix: '+',
      icon: '/images/stack-books.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      description: '진행된 스터디 수',
    },
    {
      label: '현직 멘토진',
      value: '10',
      suffix: '+',
      icon: '/images/clapping-hands.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      description: '든든한 멘토',
    },
  ],
} as const;

// ============================================
// 리뷰/후기 섹션 (B안에서 먼저, A안에서 나중)
// ============================================

export const REVIEWS_SECTION = {
  title: '왜 제로원에서 스터디를 해야할까요?',
  reviews: [
    {
      id: 1,
      avatar: '/images/avatar-1.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      name: '익명 1',
      text: '"혼자 공부할 때보다 더 많은 학습자료, 방법을 얻어갈 수 있어요"',
      position: 'left',
    },
    {
      id: 2,
      avatar: '/images/avatar-2.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      name: '익명 2',
      text: '"제로원 스터디를 하면서 QA자격증을 취득했어요"',
      position: 'right',
    },
    {
      id: 3,
      avatar: '/images/avatar-3.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      name: '익명 3',
      text: '"매칭된 상대가 있어서 어떻게든 공부를 하게 되어요"',
      position: 'left',
    },
    {
      id: 4,
      avatar: '/images/avatar-4.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      name: '익명 4',
      text: '"다른 분들과 네트워킹을 통해 제 실력 파악이 가능했어요"',
      position: 'right',
    },
  ],
} as const;

// ============================================
// 그룹 스터디 섹션
// ============================================

export const GROWTH_SECTION = {
  badge: '그룹 스터디',
  title: '여러 사람들과 의견을 나누며 성장해보세요',
  description: [
    '프론트엔드, 백엔드, 인프라, 코딩테스트, CS 등 필요한 지식을 심도있게 쌓아가요.',
  ],
  cta: '그룹 스터디 보러가기', // TODO: 버튼 뜨도록
  cards: [
    {
      badge: 'D-5',
      title: '1일 1코딩테스트 문제 풀이',
      description: ['코딩테스트 스터디'],
      imageSrc: '/images/mentoring-card.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
    },
    {
      badge: 'D-10',
      title: '핸즈온 LLM',
      description: ['책 스터디'],
      imageSrc: '/images/llm-card.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
    },
    {
      badge: 'D-1',
      title: '실전, 내 서비스 만들기',
      description: ['챌린지'],
      imageSrc: '/images/handshake-card.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
    },
    {
      badge: 'D+12',
      title: '마케터를 위한 자동화 실무',
      description: ['챌린지'],
      imageSrc: '/images/handshake-card.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
    },
  ],
} as const;

// ============================================
// 1:1 스터디 섹션
// ============================================

export const ONE_ON_ONE_STUDY_SECTION = {
  badge: '1:1 스터디',
  title: ['매일 심도있게 토론하고 싶다면?'],
  description: [
    '이건 어떻게 동작할까? 꼬리질문은 어떻게 대비하지?',
    '이런 생각이 드셨다면 1:1 스터디로 개념을 딥다이브 해보세요.',
  ],
  imageSrc: '/images/mentoring-workspace.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
  cta: '1:1 스터디 보러가기', // TODO: 버튼 뜨도록
} as const;

// ============================================
// 전문가 멘토진 섹션
// ============================================

export const MENTOR_SECTION = {
  badge: '전문가 멘토진 모집 중',
  title: '현직 최고 수준의 전문가들에게 배우는 압도적인 실무 역량',
  description: [
    '지금까지 혼자서 개발, 디자인, 콘텐츠 제작 등을 해온 수많은 취준생들을 위해 준비했습니다.',
    '취업 준비와 함께 실무 역량을 키우고 싶다면 전문가에게 도움을 받을 수 있도록 준비 중입니다.',
  ],
  mentors: [
    {
      id: 1,
      name: '김용휘',
      avatar: '/images/mentor-1.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      title: '모빌리티 스타트업',
      // TODO: 7년차 CTO 추가
      description: [
        '백엔드와 데브옵스를 주력으로 하고 있습니다.',
        '아키텍처 설계 및 구현, 장애 대응, 대용량 트래픽 처리, 안정적인 인프라 운영 등',
        '제품의 A to Z를 풀어내고 있습니다.',
      ],
    },
    {
      id: 2,
      name: '독독',
      avatar: '/images/mentor-2.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      title: '독일 회사',
      description: [
        '다년간 여러 유럽 현지 회사에서 근무한 경험이 있습니다.',
        '특히 웹 최적화, SEO 등 웹 개발 경험이 풍부합니다.',
      ],
    },
    {
      id: 3,
      name: '프레임',
      avatar: '/images/mentor-3.png', // TODO: [A안/B안] 실제 이미지 경로 교체 필요
      title: '금융회사',
      description: [
        '웹사이트 개발의 A-Z를 경험해봤으며',
        '크롤링으로 특허를 출헌한 경험이 있습니다.',
        '면접 다수 진행 및 직업 전문학교 프로젝트 관리를 했습니다.',
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
  title: '오픈 알림을 신청해보세요',
  description: [
    '아직 원하는 스터디나 기능이 없나요?',
    '오픈 알림을 신청하시면',
    '멘토링, 스터디, 외주 프로젝트 개설에 대한 정보를 가장 먼저 알려드릴게요.',
    '',
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
