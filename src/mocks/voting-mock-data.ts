import { Voting } from '@/types/voting';

// Mock Voting 데이터
export const MOCK_VOTINGS: Voting[] = [
  {
    id: 1,
    round: 158,
    title: '내가 자주 쓰는 생성형 AI는?',
    description: '개발할 때 가장 자주 사용하는 AI 도구를 선택해주세요.',
    options: [
      { id: 1, label: '챗GPT', voteCount: 450, percentage: 57.8 },
      { id: 2, label: '클로드', voteCount: 250, percentage: 32.1 },
      { id: 3, label: '구글 제미나이', voteCount: 78, percentage: 10.0 },
    ],
    totalVotes: 778,
    myVote: undefined,
    commentCount: 45,
    comments: [],
    createdAt: '2026-01-18T09:00:00Z',
    endsAt: '2026-01-25T23:59:59Z',
    isActive: true,
    tags: ['AI', '개발도구'],
  },
  {
    id: 2,
    round: 157,
    title: '주말에 코딩하는 스타일은?',
    description: '주말 코딩 습관에 대해 알려주세요.',
    options: [
      { id: 1, label: '주말엔 절대 안함', voteCount: 320, percentage: 45.7 },
      { id: 2, label: '가끔 필요할 때만', voteCount: 280, percentage: 40.0 },
      { id: 3, label: '주말에도 열심히', voteCount: 100, percentage: 14.3 },
    ],
    totalVotes: 700,
    myVote: 1,
    commentCount: 67,
    comments: [],
    createdAt: '2026-01-15T10:00:00Z',
    endsAt: '2026-01-22T23:59:59Z',
    isActive: true,
    tags: ['라이프스타일', '워라밸'],
  },
  {
    id: 3,
    round: 156,
    title: '코드 리뷰에서 가장 중요한 것은?',
    description: null,
    options: [
      { id: 1, label: '버그 찾기', voteCount: 180, percentage: 30.0 },
      { id: 2, label: '코드 품질', voteCount: 220, percentage: 36.7 },
      { id: 3, label: '성능 최적화', voteCount: 100, percentage: 16.7 },
      { id: 4, label: '가독성', voteCount: 100, percentage: 16.7 },
    ],
    totalVotes: 600,
    myVote: 2,
    commentCount: 34,
    comments: [],
    createdAt: '2026-01-14T14:00:00Z',
    endsAt: '2026-01-21T23:59:59Z',
    isActive: true,
    tags: ['코드리뷰', '개발문화'],
  },
  {
    id: 4,
    round: 155,
    title: '첫 프로그래밍 언어는?',
    description: '처음 배운 프로그래밍 언어를 선택해주세요.',
    options: [
      { id: 1, label: 'C/C++', voteCount: 450, percentage: 50.0 },
      { id: 2, label: 'Python', voteCount: 300, percentage: 33.3 },
      { id: 3, label: 'Java', voteCount: 150, percentage: 16.7 },
    ],
    totalVotes: 900,
    myVote: undefined,
    commentCount: 89,
    comments: [],
    createdAt: '2026-01-13T11:00:00Z',
    isActive: false, // 종료된 투표
    tags: ['프로그래밍', '언어'],
  },
  {
    id: 5,
    round: 154,
    title: 'Dark Mode vs Light Mode',
    description: 'IDE나 에디터에서 선호하는 테마는?',
    options: [
      { id: 1, label: 'Dark Mode', voteCount: 720, percentage: 80.0 },
      { id: 2, label: 'Light Mode', voteCount: 180, percentage: 20.0 },
    ],
    totalVotes: 900,
    myVote: 1,
    commentCount: 112,
    comments: [],
    createdAt: '2026-01-12T09:00:00Z',
    endsAt: '2026-01-19T23:59:59Z',
    isActive: true,
    tags: ['IDE', '취향'],
  },
  {
    id: 6,
    round: 153,
    title: '백엔드 프레임워크 선호도',
    description: 'Node.js 기반 백엔드 개발 시 선호하는 프레임워크는?',
    options: [
      { id: 1, label: 'Express', voteCount: 300, percentage: 42.9 },
      { id: 2, label: 'NestJS', voteCount: 250, percentage: 35.7 },
      { id: 3, label: 'Fastify', voteCount: 100, percentage: 14.3 },
      { id: 4, label: 'Koa', voteCount: 50, percentage: 7.1 },
    ],
    totalVotes: 700,
    myVote: undefined,
    commentCount: 23,
    comments: [],
    createdAt: '2026-01-11T15:00:00Z',
    endsAt: '2026-01-18T23:59:59Z',
    isActive: true,
    tags: ['백엔드', 'Node.js'],
  },
];

// 상세 댓글 데이터 (필요시 추가)
export const MOCK_VOTING_COMMENTS: Record<number, any[]> = {
  1: [
    {
      id: 1001,
      author: { id: 10, nickname: 'AI마니아' },
      content: '챗GPT가 제일 빠르고 정확한 것 같아요!',
      createdAt: '2026-01-19T10:00:00Z',
      isAuthor: false,
      votedOption: '챗GPT',
    },
    {
      id: 1002,
      author: { id: 11, nickname: '클로드팬' },
      content: '클로드가 코드 품질이 더 좋습니다. 긴 문맥도 잘 이해해요.',
      createdAt: '2026-01-19T11:30:00Z',
      isAuthor: false,
      votedOption: '클로드',
    },
    {
      id: 1003,
      author: { id: 12, nickname: '개발자123' },
      content: '챗GPT 쓰다가 클로드로 갈아탔습니다. 만족스러워요!',
      createdAt: '2026-01-19T13:00:00Z',
      isAuthor: false,
      votedOption: '클로드',
    },
  ],
  2: [
    {
      id: 2001,
      author: { id: 20, nickname: '워라밸중시' },
      content: '주말엔 쉬어야죠! 번아웃 조심하세요.',
      createdAt: '2026-01-18T09:00:00Z',
      isAuthor: false,
      votedOption: '주말엔 절대 안함',
    },
  ],
};

// Mock API 함수
export const mockFetchVotings = async (params: {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
}): Promise<{ items: Voting[]; hasMore: boolean; total: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...MOCK_VOTINGS];

  // 진행 중인 투표만 필터
  if (params.activeOnly) {
    filtered = filtered.filter((v) => v.isActive);
  }

  const page = params.page || 1;
  const limit = params.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  const items = filtered.slice(start, end);
  const hasMore = end < filtered.length;

  return {
    items,
    hasMore,
    total: filtered.length,
  };
};

export const mockFetchVotingDetail = async (id: number): Promise<Voting | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const voting = MOCK_VOTINGS.find((v) => v.id === id);
  if (!voting) return null;

  // 댓글 추가
  const comments = MOCK_VOTING_COMMENTS[id] || [];

  return {
    ...voting,
    comments,
  };
};

export const mockVote = async (votingId: number, optionId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  // 실제로는 서버에 요청
  console.log('Vote:', votingId, optionId);
};
