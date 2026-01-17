import type {
  HomeworkResponseDto,
  EvaluationResponse,
  PeerReviewResponse,
  MissionResponseDto,
  MissionListResponse,
  GradeDto,
} from '@/api/openapi/models';

// Mock 평가 등급 데이터
export const mockEvaluationGrades: GradeDto[] = [
  { code: 'A_PLUS', label: 'A+', score: 95, orderNum: 1 },
  { code: 'A_MINUS', label: 'A-', score: 90, orderNum: 2 },
  { code: 'B_PLUS', label: 'B+', score: 85, orderNum: 3 },
  { code: 'B_MINUS', label: 'B-', score: 80, orderNum: 4 },
  { code: 'C_PLUS', label: 'C+', score: 75, orderNum: 5 },
  { code: 'C_MINUS', label: 'C-', score: 70, orderNum: 6 },
  { code: 'F', label: 'F', score: 0, orderNum: 7 },
];

// Mock 피어 리뷰 데이터
export const mockPeerReviews: PeerReviewResponse[] = [
  {
    peerReviewId: 1,
    homeworkId: 1,
    reviewerId: 2,
    reviewerNickname: '김철수',
    reviewerProfileImage: {
      resizedImages: [
        {
          resizedImageUrl: '/profile-default.svg',
        },
      ],
    },
    comment:
      '과제 내용이 정말 잘 정리되어 있네요! 특히 핵심 개념을 명확하게 설명한 부분이 좋았습니다.',
    createdAt: '2026-01-07T10:30:00',
    updatedAt: '2026-01-07T10:30:00',
    updated: false,
  },
  {
    peerReviewId: 2,
    homeworkId: 1,
    reviewerId: 3,
    reviewerNickname: '박영희',
    reviewerProfileImage: {
      resizedImages: [
        {
          resizedImageUrl: '/profile-default.svg',
        },
      ],
    },
    comment:
      '코드 예제가 이해하기 쉬웠어요. 다음에는 더 복잡한 케이스도 다뤄보면 좋을 것 같습니다!',
    createdAt: '2026-01-07T14:20:00',
    updatedAt: '2026-01-07T14:20:00',
    updated: false,
  },
];

// Mock 평가 데이터
export const mockEvaluation: EvaluationResponse = {
  evaluationId: 1,
  homeworkId: 1,
  grade: {
    gradeCode: 'A_PLUS',
    gradeLabel: 'A+',
    gradeScore: 95,
  },
  comment:
    '과제를 매우 성실하게 수행했습니다. 개념 이해도가 높고 코드 품질도 우수합니다. 계속 이런 식으로 학습하면 좋은 결과가 있을 것입니다!',
  createdAt: '2026-01-07T09:00:00',
  updatedAt: '2026-01-07T09:00:00',
  updated: false,
};

// Mock 숙제 상세 데이터
export const mockHomeworkDetail: HomeworkResponseDto = {
  homeworkId: 1,
  submitterId: 1,
  submitterNickname: '홍길동',
  submitterProfileImage: {
    resizedImages: [
      {
        resizedImageUrl: '/profile-default.svg',
      },
    ],
  },
  submitted: true,
  submissionTime: '2026-01-06T23:45:00',
  homeworkContent: {
    textContent: `이번 주 학습 내용을 정리했습니다.

1. React Hooks의 기본 개념
   - useState: 상태 관리를 위한 기본 훅
   - useEffect: 사이드 이펙트 처리
   - useContext: 전역 상태 관리

2. Custom Hooks 작성
   - 재사용 가능한 로직 분리
   - 컴포넌트 간 로직 공유

3. 실습 내용
   - Todo 앱 만들기
   - API 호출 및 데이터 페칭
   - 에러 핸들링 구현

배운 내용을 바탕으로 간단한 프로젝트를 만들어보았고, 많은 것을 배울 수 있었습니다.`,
    optionalContent: {
      link: 'https://github.com/example/react-hooks-practice',
    },
  },
  evaluation: undefined, // 초기에는 평가 없음
  peerReviews: mockPeerReviews,
};

// 평가 완료된 숙제 데이터
export const mockHomeworkWithEvaluation: HomeworkResponseDto = {
  ...mockHomeworkDetail,
  evaluation: mockEvaluation,
};

// Mock 미션 목록 데이터
export const mockMissions: MissionListResponse[] = [
  {
    missionId: 1,
    weekNum: 1,
    title: 'React Hooks 학습',
    startDate: '2026-01-01',
    endDate: '2026-01-07',
    status: 'IN_PROGRESS',
    maxEvaluationCount: 10,
    evaluatedCount: 2,
  },
  {
    missionId: 2,
    weekNum: 2,
    title: 'TypeScript 기초',
    startDate: '2026-01-08',
    endDate: '2026-01-14',
    status: 'NOT_STARTED',
    maxEvaluationCount: 10,
    evaluatedCount: 0,
  },
  {
    missionId: 3,
    weekNum: 0,
    title: 'JavaScript ES6+ 복습',
    startDate: '2025-12-25',
    endDate: '2025-12-31',
    status: 'ENDED',
    maxEvaluationCount: 10,
    evaluatedCount: 10,
  },
];

// Mock 미션 상세 데이터
export const mockMissionDetail: MissionResponseDto = {
  missionId: 1,
  weekNum: 1,
  missionTitle: 'React Hooks 학습',
  missionGuide: `이번 주는 React Hooks에 대해 학습합니다.

[학습 목표]
1. useState, useEffect, useContext 이해하기
2. Custom Hooks 만들어보기
3. 실전 프로젝트에 적용하기

[제출 방법]
- 학습한 내용을 정리하여 제출해주세요
- 실습한 코드를 GitHub에 올리고 링크를 첨부해주세요
- 최소 100자 이상 작성해주세요`,
  missionStartDate: '2026-01-01',
  missionEndDate: '2026-01-07',
  status: 'IN_PROGRESS',
  currentHomeworkSubmissionCount: 8,
  maxHomeworkSubmissionCount: 10,
  homeworks: [
    {
      homeworkId: 1,
      submitterId: 1,
      submitterNickname: '홍길동',
      submitterProfileImage: {
        resizedImages: [{ resizedImageUrl: '/profile-default.svg' }],
      },
      submissionTime: '2026-01-06T23:45:00',
      homeworkStatus: 'EVALUATION_COMPLETED',
      evaluation: {
        evaluationGradeLabel: 'A+',
      },
    },
    {
      homeworkId: 2,
      submitterId: 2,
      submitterNickname: '김철수',
      submitterProfileImage: {
        resizedImages: [{ resizedImageUrl: '/profile-default.svg' }],
      },
      submissionTime: '2026-01-06T20:30:00',
      homeworkStatus: 'SUBMITTED',
    },
    {
      homeworkId: 3,
      submitterId: 3,
      submitterNickname: '박영희',
      submitterProfileImage: {
        resizedImages: [{ resizedImageUrl: '/profile-default.svg' }],
      },
      submissionTime: '2026-01-06T18:15:00',
      homeworkStatus: 'SUBMITTED',
    },
    {
      homeworkId: 4,
      submitterId: 4,
      submitterNickname: '이민수',
      submitterProfileImage: {
        resizedImages: [{ resizedImageUrl: '/profile-default.svg' }],
      },
      submissionTime: '2026-01-06T22:00:00',
      homeworkStatus: 'EVALUATION_COMPLETED',
      evaluation: {
        evaluationGradeLabel: 'B+',
      },
    },
    {
      homeworkId: 5,
      submitterId: 5,
      submitterNickname: '정수현',
      submitterProfileImage: {
        resizedImages: [{ resizedImageUrl: '/profile-default.svg' }],
      },
      submissionTime: '2026-01-07T01:20:00',
      homeworkStatus: 'SUBMITTED',
    },
    {
      homeworkId: undefined,
      submitterId: 6,
      submitterNickname: '최지원',
      submitterProfileImage: {
        resizedImages: [{ resizedImageUrl: '/profile-default.svg' }],
      },
      submissionTime: undefined,
      homeworkStatus: 'NOT_SUBMITTED',
    },
    {
      homeworkId: 7,
      submitterId: 7,
      submitterNickname: '강태영',
      submitterProfileImage: {
        resizedImages: [{ resizedImageUrl: '/profile-default.svg' }],
      },
      submissionTime: '2026-01-06T16:45:00',
      homeworkStatus: 'SUBMITTED',
    },
    {
      homeworkId: 8,
      submitterId: 8,
      submitterNickname: '윤서진',
      submitterProfileImage: {
        resizedImages: [{ resizedImageUrl: '/profile-default.svg' }],
      },
      submissionTime: '2026-01-07T02:10:00',
      homeworkStatus: 'SUBMITTED',
    },
    {
      homeworkId: undefined,
      submitterId: 9,
      submitterNickname: '임하늘',
      submitterProfileImage: {
        resizedImages: [{ resizedImageUrl: '/profile-default.svg' }],
      },
      submissionTime: undefined,
      homeworkStatus: 'NOT_SUBMITTED',
    },
    {
      homeworkId: 10,
      submitterId: 10,
      submitterNickname: '송민재',
      submitterProfileImage: {
        resizedImages: [{ resizedImageUrl: '/profile-default.svg' }],
      },
      submissionTime: '2026-01-06T21:30:00',
      homeworkStatus: 'SUBMITTED',
    },
  ],
};

// Mock 데이터를 localStorage에 저장하고 관리하는 헬퍼 함수들
export const getMockHomework = (homeworkId: number): HomeworkResponseDto => {
  const stored = localStorage.getItem(`homework_${homeworkId}`);
  if (stored) {
    return JSON.parse(stored);
  }

  // 미션 목록 데이터와 동기화: homeworkId 1과 4는 평가 완료 상태
  if (homeworkId === 1 || homeworkId === 4) {
    return {
      ...mockHomeworkDetail,
      homeworkId,
      submitterId: homeworkId,
      submitterNickname: homeworkId === 1 ? '홍길동' : '이민수',
      evaluation:
        homeworkId === 1
          ? mockEvaluation
          : {
              evaluationId: 2,
              homeworkId: 4,
              grade: {
                gradeCode: 'B_PLUS',
                gradeLabel: 'B+',
                gradeScore: 85,
              },
              comment:
                '과제를 잘 수행했습니다. 기본 개념은 잘 이해하고 있으나, 조금 더 깊이 있는 학습이 필요합니다.',
              createdAt: '2026-01-07T10:00:00',
              updatedAt: '2026-01-07T10:00:00',
              updated: false,
            },
    };
  }

  // 기본 mock 데이터 반환 (평가 없음)
  return {
    ...mockHomeworkDetail,
    homeworkId,
    submitterId: homeworkId,
    submitterNickname: `테스트유저${homeworkId}`,
  };
};

export const saveMockHomework = (homework: HomeworkResponseDto) => {
  localStorage.setItem(
    `homework_${homework.homeworkId}`,
    JSON.stringify(homework),
  );
};

export const getMockPeerReviews = (
  homeworkId: number,
): PeerReviewResponse[] => {
  const stored = localStorage.getItem(`peerReviews_${homeworkId}`);
  if (stored) {
    return JSON.parse(stored);
  }

  return mockPeerReviews;
};

export const saveMockPeerReviews = (
  homeworkId: number,
  peerReviews: PeerReviewResponse[],
) => {
  localStorage.setItem(
    `peerReviews_${homeworkId}`,
    JSON.stringify(peerReviews),
  );
};

export const addMockPeerReview = (
  homeworkId: number,
  newReview: Omit<
    PeerReviewResponse,
    'peerReviewId' | 'createdAt' | 'updatedAt'
  >,
): PeerReviewResponse => {
  const existing = getMockPeerReviews(homeworkId);
  const newId = Math.max(...existing.map((r) => r.peerReviewId || 0), 0) + 1;
  const review: PeerReviewResponse = {
    ...newReview,
    peerReviewId: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updated: false,
  };
  saveMockPeerReviews(homeworkId, [...existing, review]);

  return review;
};

export const updateMockPeerReview = (
  peerReviewId: number,
  comment: string,
): PeerReviewResponse | null => {
  // 모든 숙제의 피어 리뷰를 순회하며 찾기
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith('peerReviews_'),
  );
  for (const key of keys) {
    const reviews: PeerReviewResponse[] = JSON.parse(
      localStorage.getItem(key) || '[]',
    );
    const index = reviews.findIndex((r) => r.peerReviewId === peerReviewId);
    if (index !== -1) {
      reviews[index] = {
        ...reviews[index],
        comment,
        updatedAt: new Date().toISOString(),
        updated: true,
      };
      localStorage.setItem(key, JSON.stringify(reviews));

      return reviews[index];
    }
  }

  return null;
};

export const deleteMockPeerReview = (peerReviewId: number): boolean => {
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith('peerReviews_'),
  );
  for (const key of keys) {
    const reviews: PeerReviewResponse[] = JSON.parse(
      localStorage.getItem(key) || '[]',
    );
    const filtered = reviews.filter((r) => r.peerReviewId !== peerReviewId);
    if (filtered.length !== reviews.length) {
      localStorage.setItem(key, JSON.stringify(filtered));

      return true;
    }
  }

  return false;
};
