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
    author: { id: 1, nickname: 'AI개발자' },
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
    myVote: undefined,
    commentCount: 67,
    comments: [],
    createdAt: '2026-01-15T10:00:00Z',
    endsAt: '2026-01-22T23:59:59Z',
    isActive: true,
    tags: ['라이프스타일', '워라밸'],
    author: { id: 2, nickname: '워라밸중시' },
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
    myVote: undefined,
    commentCount: 34,
    comments: [],
    createdAt: '2026-01-14T14:00:00Z',
    endsAt: '2026-01-21T23:59:59Z',
    isActive: true,
    tags: ['코드리뷰', '개발문화'],
    author: { id: 3, nickname: '시니어개발자' },
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
    endsAt: '2026-01-27T23:59:59Z',
    isActive: true,
    tags: ['프로그래밍', '언어'],
    author: { id: 4, nickname: '주니어개발자' },
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
    myVote: undefined,
    commentCount: 112,
    comments: [],
    createdAt: '2026-01-12T09:00:00Z',
    endsAt: '2026-01-26T23:59:59Z',
    isActive: true,
    tags: ['IDE', '취향'],
    author: { id: 5, nickname: '프론트개발자' },
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
    endsAt: '2026-01-28T23:59:59Z',
    isActive: true,
    tags: ['백엔드', 'Node.js'],
    author: { id: 6, nickname: '백엔드개발자' },
  },
];

// 상세 댓글 데이터 (필요시 추가)
export const MOCK_VOTING_COMMENTS: Record<number, any[]> = {
  1: [
    {
      id: 1001,
      author: { id: 10, nickname: 'AI마니아' },
      content: '챗GPT가 제일 빠르고 정확한 것 같아요! 특히 최근 GPT-4 터보는 속도도 빨라져서 더 좋습니다.',
      createdAt: '2026-01-19T10:00:00Z',
      isAuthor: false,
      votedOption: '챗GPT',
    },
    {
      id: 1002,
      author: { id: 11, nickname: '클로드팬' },
      content: '클로드가 코드 품질이 더 좋습니다. 긴 문맥도 잘 이해해요. 200K 토큰까지 지원하는 건 정말 혁신적이에요.',
      createdAt: '2026-01-19T11:30:00Z',
      isAuthor: false,
      votedOption: '클로드',
    },
    {
      id: 1003,
      author: { id: 12, nickname: '개발자123' },
      content: '챗GPT 쓰다가 클로드로 갈아탔습니다. 만족스러워요! 특히 코드 리뷰할 때 더 자세하게 설명해주더라구요.',
      createdAt: '2026-01-19T13:00:00Z',
      isAuthor: false,
      votedOption: '클로드',
    },
    {
      id: 1004,
      author: { id: 13, nickname: '프론트개발자' },
      content: '챗GPT는 플러그인 생태계가 좋아서 계속 쓰고 있어요. 웹 검색 기능도 유용하고요.',
      createdAt: '2026-01-19T14:15:00Z',
      isAuthor: false,
      votedOption: '챗GPT',
    },
    {
      id: 1005,
      author: { id: 14, nickname: 'AI연구자' },
      content: '제미나이도 최근 많이 좋아졌더라구요. 멀티모달 기능이 강력해요!',
      createdAt: '2026-01-19T15:30:00Z',
      isAuthor: false,
      votedOption: '구글 제미나이',
    },
    {
      id: 1006,
      author: { id: 15, nickname: '백엔드개발자' },
      content: '저는 용도에 따라 번갈아 씁니다. 빠른 질문은 챗GPT, 복잡한 코드 분석은 클로드!',
      createdAt: '2026-01-19T16:45:00Z',
      isAuthor: false,
      votedOption: '챗GPT',
    },
    {
      id: 1007,
      author: { id: 16, nickname: '주니어개발자' },
      content: '클로드가 코딩 초보한테 더 친절하게 설명해주는 것 같아요. 단계별로 알려줘서 이해하기 쉬워요.',
      createdAt: '2026-01-19T17:20:00Z',
      isAuthor: false,
      votedOption: '클로드',
    },
    {
      id: 1008,
      author: { id: 17, nickname: '시니어개발자' },
      content: '챗GPT Plus 쓰고 있는데 비용 대비 효율이 좋아요. 매일 쓰는데도 부담 없는 가격이라 만족합니다.',
      createdAt: '2026-01-19T18:00:00Z',
      isAuthor: false,
      votedOption: '챗GPT',
    },
  ],
  2: [
    {
      id: 2001,
      author: { id: 20, nickname: '워라밸중시' },
      content: '주말엔 쉬어야죠! 번아웃 조심하세요. 장기적으로 보면 쉬는 게 더 생산적입니다.',
      createdAt: '2026-01-18T09:00:00Z',
      isAuthor: false,
      votedOption: '주말엔 절대 안함',
    },
    {
      id: 2002,
      author: { id: 21, nickname: '열정개발자' },
      content: '주말에 사이드 프로젝트 하는 게 재밌어서 자발적으로 하고 있어요!',
      createdAt: '2026-01-18T10:30:00Z',
      isAuthor: false,
      votedOption: '주말에도 열심히',
    },
    {
      id: 2003,
      author: { id: 22, nickname: '균형추구자' },
      content: '평소엔 안하지만 마감 임박하면 어쩔 수 없이... 그래도 최대한 줄이려고 노력해요.',
      createdAt: '2026-01-18T11:45:00Z',
      isAuthor: false,
      votedOption: '가끔 필요할 때만',
    },
  ],
};

// 일별 통계 데이터
export const MOCK_DAILY_STATS: Record<number, any[]> = {
  1: [
    { date: '1일', percentages: { 1: 52.0, 2: 35.0, 3: 13.0 } },
    { date: '2일', percentages: { 1: 54.5, 2: 33.5, 3: 12.0 } },
    { date: '3일', percentages: { 1: 56.0, 2: 33.0, 3: 11.0 } },
    { date: '4일', percentages: { 1: 57.0, 2: 32.5, 3: 10.5 } },
    { date: '5일', percentages: { 1: 57.8, 2: 32.1, 3: 10.0 } },
  ],
  2: [
    { date: '1일', percentages: { 1: 48.0, 2: 38.0, 3: 14.0 } },
    { date: '2일', percentages: { 1: 47.0, 2: 39.0, 3: 14.0 } },
    { date: '3일', percentages: { 1: 46.0, 2: 39.5, 3: 14.5 } },
    { date: '4일', percentages: { 1: 45.7, 2: 40.0, 3: 14.3 } },
  ],
};

// Mock API 함수
export const mockFetchVotings = async (params: {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
  sortBy?: 'latest' | 'popular';
}): Promise<{ items: Voting[]; hasMore: boolean; total: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // localStorage에서 커스텀 투표 가져오기
  const customVotings = localStorage.getItem('customVotings');
  let customVotingsList: Voting[] = [];
  
  try {
    const parsed = customVotings ? JSON.parse(customVotings) : [];
    // 배열이고 각 항목이 유효한지 확인
    customVotingsList = Array.isArray(parsed) 
      ? parsed.filter((v): v is Voting => 
          v !== null && 
          v !== undefined && 
          typeof v === 'object' &&
          'id' in v && 
          'author' in v &&
          v.author !== null &&
          v.author !== undefined
        )
      : [];
  } catch (error) {
    console.error('Failed to parse customVotings from localStorage:', error);
    customVotingsList = [];
  }

  // 커스텀 투표 + Mock 투표 합치기 (커스텀 투표가 먼저)
  let filtered = [...customVotingsList, ...MOCK_VOTINGS];

  // 진행 중인 투표만 필터
  if (params.activeOnly) {
    filtered = filtered.filter((v) => v.isActive);
  }

  // 정렬
  const sortBy = params.sortBy || 'latest';
  if (sortBy === 'popular') {
    // 인기순: 총 투표 수 내림차순 → 댓글 수 내림차순
    filtered.sort((a, b) => {
      if (b.totalVotes !== a.totalVotes) {
        return b.totalVotes - a.totalVotes;
      }
      return b.commentCount - a.commentCount;
    });
  } else {
    // 최신순: 생성일 내림차순
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
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

  // 1. 먼저 기존 Mock 데이터에서 찾기
  let voting = MOCK_VOTINGS.find((v) => v.id === id);
  
  // 2. 없으면 로컬 스토리지에서 찾기 (새로 만든 투표)
  if (!voting) {
    const customVotings = localStorage.getItem('customVotings');
    if (customVotings) {
      const parsed = JSON.parse(customVotings) as Voting[];
      voting = parsed.find((v) => v.id === id);
    }
  }

  if (!voting) return null;

  // 댓글 추가
  const comments = MOCK_VOTING_COMMENTS[id] || [];
  
  // 일별 통계 추가
  const dailyStats = MOCK_DAILY_STATS[id] || [];

  return {
    ...voting,
    comments,
    commentCount: comments.length,
    dailyStats,
  };
};

export const mockVote = async (votingId: number, optionId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  // 실제로는 서버에 요청
  console.log('Vote:', votingId, optionId);
};
