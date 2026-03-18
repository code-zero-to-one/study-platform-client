export interface MockStudyReviewItem {
  reviewId: number;
  writerProfileImage?: string;
  writerNickname: string;
  satisfaction: 'GOOD' | 'DISAPPOINTED';
  selectedItems: string[];
  content: string;
  rating: number;
  createdAt: string;
}

export interface MockStudyForReviewList {
  studyId: number;
  title: string;
  thumbnail: string;
  studyType: 'GROUP_STUDY' | 'PREMIUM_STUDY';
  studyRole: 'LEADER' | 'MEMBER';
  participantsCount: number;
  maxMembersCount: number;
  startDate: string;
  endDate: string;
}

export interface MockReviewSummary {
  studyId: number;
  studyTitle: string;
  startDate: string;
  endDate: string;
  totalReviewCount: number;
  goodCount: number;
  disappointedCount: number;
  averageRating: number;
  totalRatingCount: number;
  goodItems: { label: string; count: number }[];
  disappointedItems: { label: string; count: number }[];
  reviews: MockStudyReviewItem[];
}

export const POSITIVE_ITEMS = [
  '커리큘럼이 체계적으로 구성되어 있었어요.',
  '스터디 분위기가 활발했어요.',
  '학습 자료의 품질이 높았어요.',
  '스터디 진행이 원활했어요.',
  '다른 멤버들과의 교류가 유익했어요.',
  '동기부여가 잘 되었어요.',
];

export const NEGATIVE_ITEMS = [
  '커리큘럼이 따라가기 힘들었어요.',
  '스터디 분위기가 산만했어요.',
  '학습 자료가 부족했어요.',
  '스터디 진행이 매끄럽지 않았어요.',
  '멤버들과의 소통이 어려웠어요.',
  '동기부여가 잘 되지 않았어요.',
];

export const MOCK_GROUP_STUDIES_FOR_REVIEW: MockStudyForReviewList[] = [
  {
    studyId: 1,
    title: '바이브 코딩 수익화 스터디',
    thumbnail:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    studyType: 'GROUP_STUDY',
    studyRole: 'LEADER',
    participantsCount: 20,
    maxMembersCount: 20,
    startDate: '2025.10.25',
    endDate: '2025.12.14',
  },
  {
    studyId: 2,
    title: '배우면서 커리어지는 클린코드 스터디',
    thumbnail:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    studyType: 'GROUP_STUDY',
    studyRole: 'LEADER',
    participantsCount: 15,
    maxMembersCount: 15,
    startDate: '2026.01.08',
    endDate: '2026.02.27',
  },
  {
    studyId: 3,
    title: '개발자를 위한 UX/UI 스터디',
    thumbnail:
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop',
    studyType: 'GROUP_STUDY',
    studyRole: 'MEMBER',
    participantsCount: 18,
    maxMembersCount: 19,
    startDate: '2026.02.07',
    endDate: '2026.02.28',
  },
  {
    studyId: 4,
    title: '1일1알고리즘 운동 인증 챌린지',
    thumbnail:
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
    studyType: 'GROUP_STUDY',
    studyRole: 'LEADER',
    participantsCount: 4,
    maxMembersCount: 10,
    startDate: '2025.11.17',
    endDate: '2026.02.28',
  },
  {
    studyId: 5,
    title: '컴퓨터 네트워킹 하향식 접근 완독 스터디',
    thumbnail:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    studyType: 'GROUP_STUDY',
    studyRole: 'MEMBER',
    participantsCount: 8,
    maxMembersCount: 20,
    startDate: '2025.11.10',
    endDate: '2025.12.14',
  },
];

export const MOCK_PREMIUM_STUDIES_FOR_REVIEW: MockStudyForReviewList[] = [
  {
    studyId: 101,
    title: '시니어 개발자와 함께하는 시스템 설계 멘토링',
    thumbnail:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop',
    studyType: 'PREMIUM_STUDY',
    studyRole: 'LEADER',
    participantsCount: 10,
    maxMembersCount: 10,
    startDate: '2025.12.01',
    endDate: '2026.01.31',
  },
  {
    studyId: 102,
    title: 'AI 프로덕트 매니저 실무 멘토링',
    thumbnail:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    studyType: 'PREMIUM_STUDY',
    studyRole: 'LEADER',
    participantsCount: 8,
    maxMembersCount: 12,
    startDate: '2026.01.15',
    endDate: '2026.03.15',
  },
  {
    studyId: 103,
    title: '프론트엔드 성능 최적화 마스터 클래스',
    thumbnail:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    studyType: 'PREMIUM_STUDY',
    studyRole: 'MEMBER',
    participantsCount: 6,
    maxMembersCount: 8,
    startDate: '2026.02.01',
    endDate: '2026.03.01',
  },
];

export const MOCK_GROUP_REVIEW_DETAIL: Record<number, MockReviewSummary> = {
  1: {
    studyId: 1,
    studyTitle: '바이브 코딩 수익화 스터디',
    startDate: '2025.10.25',
    endDate: '2025.12.14',
    totalReviewCount: 20,
    goodCount: 17,
    disappointedCount: 3,
    averageRating: 4.25,
    totalRatingCount: 20,
    goodItems: [
      { label: '자료를 보기 좋게 정리해서 이해가 쉬웠어요.', count: 3 },
      {
        label: '시간 약속을 잘 지켜서 스터디가 매끄럽게 진행됐어요.',
        count: 3,
      },
      { label: '질문이 체계적으로 준비되어 있었어요.', count: 2 },
      {
        label: '핵심 개념을 잘 이해하고 있다는 게 느껴졌어요.',
        count: 1,
      },
      {
        label: '공유해주신 자료가 깊이 있게 학습한 것이 느껴졌어요.',
        count: 1,
      },
    ],
    disappointedItems: [
      { label: '커리큘럼이 따라가기 힘들었어요', count: 1 },
      { label: '스터디 분위기가 산만했어요', count: 1 },
      { label: '학습 자료가 부족했어요', count: 1 },
      { label: '스터디 진행이 매끄럽지 않았어요', count: 0 },
      { label: '멤버들과의 소통이 어려웠어요', count: 0 },
    ],
    reviews: [
      {
        reviewId: 1,
        writerProfileImage: undefined,
        writerNickname: '닉넴',
        satisfaction: 'GOOD',
        selectedItems: [
          '커리큘럼이 체계적으로 구성되어 있었어요.',
          '스터디 분위기가 활발했어요.',
        ],
        content:
          '이번 스터디를 통해 실무 역량이 정말 많이 향상되었습니다. 강사님의 설명이 매우 명확했어요!',
        rating: 4.5,
        createdAt: '2025.11.08 01:09',
      },
      {
        reviewId: 2,
        writerProfileImage: undefined,
        writerNickname: '코딩왕',
        satisfaction: 'GOOD',
        selectedItems: [
          '학습 자료의 품질이 높았어요.',
          '다른 멤버들과의 교류가 유익했어요.',
        ],
        content:
          '강의 내용이 매우 알차고 실무에 바로 적용할 수 있는 팁들을 많이 얻어갑니다. 특히 코드 리뷰 과정에서 세세한 부분까지 짚어주셔서 큰 도움이 되었습니다. 다음 스터디도 꼭 참여하고 싶어요!',
        rating: 5,
        createdAt: '2025.11.10 14:22',
      },
      {
        reviewId: 3,
        writerProfileImage: undefined,
        writerNickname: '러닝커브',
        satisfaction: 'GOOD',
        selectedItems: [
          '커리큘럼이 체계적으로 구성되어 있었어요.',
          '동기부여가 잘 되었어요.',
        ],
        content:
          '처음에는 커리큘럼이 조금 빡세다고 느꼈지만, 막상 따라가다 보니 실력이 부쩍 늘어있는 게 느껴졌어요. 함께 공부하는 분들도 열정적이라 자극을 많이 받았습니다. 좋은 환경 만들어주셔서 감사합니다.',
        rating: 4,
        createdAt: '2025.11.12 09:45',
      },
    ],
  },
  2: {
    studyId: 2,
    studyTitle: '배우면서 커리어지는 클린코드 스터디',
    startDate: '2026.01.08',
    endDate: '2026.02.27',
    totalReviewCount: 12,
    goodCount: 10,
    disappointedCount: 2,
    averageRating: 4.5,
    totalRatingCount: 12,
    goodItems: [
      { label: '커리큘럼이 체계적으로 구성되어 있었어요.', count: 5 },
      { label: '스터디 분위기가 활발했어요.', count: 4 },
      { label: '학습 자료의 품질이 높았어요.', count: 3 },
    ],
    disappointedItems: [
      { label: '스터디 진행이 매끄럽지 않았어요', count: 1 },
      { label: '멤버들과의 소통이 어려웠어요', count: 1 },
    ],
    reviews: [
      {
        reviewId: 4,
        writerNickname: '클린코더',
        satisfaction: 'GOOD',
        selectedItems: ['커리큘럼이 체계적으로 구성되어 있었어요.'],
        content:
          '클린 코드의 원칙을 실제 프로젝트에 적용하면서 배울 수 있어서 좋았습니다. 코드 리뷰 시간이 특히 유익했어요.',
        rating: 5,
        createdAt: '2026.03.05 18:30',
      },
      {
        reviewId: 5,
        writerNickname: '개발새발',
        satisfaction: 'GOOD',
        selectedItems: [
          '스터디 분위기가 활발했어요.',
          '다른 멤버들과의 교류가 유익했어요.',
        ],
        content:
          '매주 발표와 토론을 통해 다양한 관점을 접할 수 있었습니다. 리더분의 진행이 매끄러워서 시간이 금방 갔어요.',
        rating: 4.5,
        createdAt: '2026.03.04 11:15',
      },
    ],
  },
  4: {
    studyId: 4,
    studyTitle: '1일1알고리즘 운동 인증 챌린지',
    startDate: '2025.11.17',
    endDate: '2026.02.28',
    totalReviewCount: 4,
    goodCount: 3,
    disappointedCount: 1,
    averageRating: 3.75,
    totalRatingCount: 4,
    goodItems: [
      { label: '동기부여가 잘 되었어요.', count: 3 },
      { label: '스터디 진행이 원활했어요.', count: 2 },
    ],
    disappointedItems: [
      { label: '학습 자료가 부족했어요', count: 1 },
    ],
    reviews: [
      {
        reviewId: 6,
        writerNickname: '알고리즘러',
        satisfaction: 'GOOD',
        selectedItems: ['동기부여가 잘 되었어요.'],
        content:
          '매일 인증하는 시스템 덕분에 꾸준히 알고리즘 문제를 풀 수 있었어요. 혼자였으면 절대 못했을 거예요.',
        rating: 4,
        createdAt: '2026.03.02 09:00',
      },
    ],
  },
};

export const MOCK_PREMIUM_REVIEW_DETAIL: Record<number, MockReviewSummary> = {
  101: {
    studyId: 101,
    studyTitle: '시니어 개발자와 함께하는 시스템 설계 멘토링',
    startDate: '2025.12.01',
    endDate: '2026.01.31',
    totalReviewCount: 10,
    goodCount: 9,
    disappointedCount: 1,
    averageRating: 4.7,
    totalRatingCount: 10,
    goodItems: [
      { label: '커리큘럼이 체계적으로 구성되어 있었어요.', count: 7 },
      { label: '학습 자료의 품질이 높았어요.', count: 5 },
      { label: '다른 멤버들과의 교류가 유익했어요.', count: 4 },
    ],
    disappointedItems: [
      { label: '커리큘럼이 따라가기 힘들었어요', count: 1 },
    ],
    reviews: [
      {
        reviewId: 101,
        writerNickname: '주니어개발자',
        satisfaction: 'GOOD',
        selectedItems: [
          '커리큘럼이 체계적으로 구성되어 있었어요.',
          '학습 자료의 품질이 높았어요.',
        ],
        content:
          '시니어 개발자분의 실제 경험담을 기반으로 한 시스템 설계 강의가 정말 인상적이었습니다. 이론만이 아닌 실무 기반의 접근법을 배울 수 있어서 매우 만족합니다.',
        rating: 5,
        createdAt: '2026.02.10 16:30',
      },
      {
        reviewId: 102,
        writerNickname: '백엔드마스터',
        satisfaction: 'GOOD',
        selectedItems: ['다른 멤버들과의 교류가 유익했어요.'],
        content:
          '멘토님의 코드 리뷰와 1:1 피드백이 정말 도움이 많이 되었습니다. 특히 대용량 트래픽 처리 부분에서 많은 인사이트를 얻었어요.',
        rating: 4.5,
        createdAt: '2026.02.08 10:45',
      },
    ],
  },
  102: {
    studyId: 102,
    studyTitle: 'AI 프로덕트 매니저 실무 멘토링',
    startDate: '2026.01.15',
    endDate: '2026.03.15',
    totalReviewCount: 7,
    goodCount: 6,
    disappointedCount: 1,
    averageRating: 4.3,
    totalRatingCount: 7,
    goodItems: [
      { label: '스터디 분위기가 활발했어요.', count: 4 },
      { label: '커리큘럼이 체계적으로 구성되어 있었어요.', count: 3 },
      { label: '동기부여가 잘 되었어요.', count: 2 },
    ],
    disappointedItems: [
      { label: '스터디 진행이 매끄럽지 않았어요', count: 1 },
    ],
    reviews: [
      {
        reviewId: 103,
        writerNickname: 'PM지망생',
        satisfaction: 'GOOD',
        selectedItems: [
          '스터디 분위기가 활발했어요.',
          '커리큘럼이 체계적으로 구성되어 있었어요.',
        ],
        content:
          'AI 프로덕트 기획부터 런칭까지의 전 과정을 체계적으로 배울 수 있었습니다. 현직 PM님의 생생한 경험이 가장 큰 자산이었어요.',
        rating: 4.5,
        createdAt: '2026.03.18 09:20',
      },
    ],
  },
};
