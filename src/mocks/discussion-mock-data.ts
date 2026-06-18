import {
  Discussion,
  DiscussionTopic,
} from '@/types/one-to-one-study/discussion';

// Mock Discussion 데이터
export const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 1,
    title: 'Next.js 15 App Router에서 서버 컴포넌트 활용법',
    content: `Next.js 15의 App Router를 사용하면서 서버 컴포넌트와 클라이언트 컴포넌트를 어떻게 나눠야 할지 고민이 많습니다.

특히 다음과 같은 경우에 어떤 선택을 하시나요?

1. 데이터 페칭이 필요한 컴포넌트
2. 사용자 인터랙션이 필요한 컴포넌트
3. 상태 관리가 필요한 컴포넌트

여러분의 경험과 노하우를 공유해주세요!`,
    summary:
      'Next.js 15의 App Router를 사용하면서 서버 컴포넌트와 클라이언트 컴포넌트를 어떻게 나눠야 할지 고민이 많습니다.',
    author: {
      id: 1,
      nickname: '프론트엔드개발자',
      avatar: undefined,
    },
    topic: 'development',
    tags: ['Next.js', 'React', 'Server Components'],
    vote: {
      agreeCount: 42,
      disagreeCount: 3,
      myVote: null,
    },
    commentCount: 15,
    comments: [
      {
        id: 101,
        author: { id: 2, nickname: '시니어개발자' },
        content:
          '저는 데이터 페칭은 무조건 서버 컴포넌트에서 하고, useState나 useEffect가 필요한 부분만 클라이언트 컴포넌트로 분리합니다.',
        createdAt: '2026-01-19T10:30:00Z',
        isAuthor: false,
      },
      {
        id: 102,
        author: { id: 3, nickname: '주니어개발자' },
        content:
          '저도 같은 고민을 했었는데, 결국 성능 측정해보고 결정하는게 제일 좋더라구요!',
        createdAt: '2026-01-19T11:15:00Z',
        isAuthor: false,
      },
    ],
    viewCount: 1234,
    createdAt: '2026-01-18T14:30:00Z',
    updatedAt: '2026-01-18T14:30:00Z',
    lastActivityAt: '2026-01-19T11:15:00Z',
  },
  {
    id: 2,
    title: '효과적인 스터디 방법 공유합니다',
    content: `저는 3개월간 매일 아침 6시에 일어나서 1시간씩 알고리즘 문제를 풀었습니다.

처음에는 정말 힘들었지만, 2주가 지나니 습관이 되더라구요.

제가 사용한 방법:
- 전날 밤 11시 전에 잠들기
- 알람을 침대에서 먼 곳에 설정
- 스터디 그룹에서 서로 인증하기
- 작은 목표부터 시작하기

여러분은 어떤 방법을 사용하시나요?`,
    summary:
      '저는 3개월간 매일 아침 6시에 일어나서 1시간씩 알고리즘 문제를 풀었습니다. 처음에는 정말 힘들었지만, 2주가 지나니 습관이 되더라구요.',
    author: {
      id: 4,
      nickname: '아침형인간',
    },
    topic: 'study',
    tags: ['습관', '알고리즘', '아침 루틴'],
    vote: {
      agreeCount: 89,
      disagreeCount: 2,
      myVote: 'agree',
    },
    commentCount: 23,
    comments: [],
    viewCount: 2567,
    createdAt: '2026-01-17T09:00:00Z',
    updatedAt: '2026-01-17T09:00:00Z',
    lastActivityAt: '2026-01-19T08:45:00Z',
  },
  {
    id: 3,
    title: 'TypeScript의 제네릭은 언제 사용해야 할까요?',
    content: `TypeScript를 배우고 있는데 제네릭 개념이 너무 어렵습니다.

어떤 상황에서 제네릭을 사용하는 것이 좋을까요?
그리고 제네릭을 잘 사용하는 팁이 있다면 공유해주세요!`,
    summary:
      'TypeScript를 배우고 있는데 제네릭 개념이 너무 어렵습니다. 어떤 상황에서 제네릭을 사용하는 것이 좋을까요?',
    author: {
      id: 5,
      nickname: 'TS초보',
    },
    topic: 'question',
    tags: ['TypeScript', '제네릭', '질문'],
    vote: {
      agreeCount: 15,
      disagreeCount: 1,
      myVote: null,
    },
    commentCount: 8,
    comments: [],
    viewCount: 456,
    createdAt: '2026-01-19T08:00:00Z',
    updatedAt: '2026-01-19T08:00:00Z',
    lastActivityAt: '2026-01-19T10:20:00Z',
  },
  {
    id: 4,
    title: '개발자 취업 준비, 이렇게 했습니다',
    content: `6개월간 개발자 취업 준비를 하고 드디어 합격했습니다!

제가 한 것들:
1. 백준 골드 5 달성
2. 개인 프로젝트 3개 (Next.js, Spring Boot)
3. 기술 블로그 운영 (주 1회 포스팅)
4. 오픈소스 기여 경험
5. 네트워킹 (개발자 밋업 참석)

가장 도움이 된 것은 역시 실전 프로젝트 경험이었습니다.`,
    summary:
      '6개월간 개발자 취업 준비를 하고 드디어 합격했습니다! 제가 한 것들과 가장 도움이 된 것을 공유합니다.',
    author: {
      id: 6,
      nickname: '신입개발자',
    },
    topic: 'free',
    tags: ['취업', '경험담', '신입'],
    vote: {
      agreeCount: 156,
      disagreeCount: 5,
      myVote: null,
    },
    commentCount: 45,
    comments: [],
    viewCount: 3421,
    createdAt: '2026-01-16T15:30:00Z',
    updatedAt: '2026-01-16T15:30:00Z',
    lastActivityAt: '2026-01-19T09:30:00Z',
  },
  {
    id: 5,
    title: 'React Query vs SWR, 어떤 것을 선택해야 할까요?',
    content: `새 프로젝트를 시작하는데 데이터 페칭 라이브러리를 고민 중입니다.

React Query (TanStack Query)와 SWR 중 어떤 것이 더 좋을까요?

각각의 장단점과 실제 사용 경험을 공유해주시면 감사하겠습니다.`,
    summary:
      '새 프로젝트를 시작하는데 데이터 페칭 라이브러리를 고민 중입니다. React Query와 SWR 중 어떤 것이 더 좋을까요?',
    author: {
      id: 7,
      nickname: '기술선택고민중',
    },
    topic: 'development',
    tags: ['React Query', 'SWR', '비교'],
    vote: {
      agreeCount: 28,
      disagreeCount: 7,
      myVote: 'disagree',
    },
    commentCount: 19,
    comments: [],
    viewCount: 892,
    createdAt: '2026-01-19T07:00:00Z',
    updatedAt: '2026-01-19T07:00:00Z',
    lastActivityAt: '2026-01-19T12:00:00Z',
  },
  {
    id: 6,
    title: '코드 리뷰 문화, 어떻게 만들어가나요?',
    content: `팀에 코드 리뷰 문화가 없어서 도입하려고 합니다.

어떻게 시작하면 좋을까요?
그리고 효과적인 코드 리뷰 방법이 있다면 공유해주세요!`,
    summary:
      '팀에 코드 리뷰 문화가 없어서 도입하려고 합니다. 어떻게 시작하면 좋을까요?',
    author: {
      id: 8,
      nickname: '팀리더',
    },
    topic: 'development',
    tags: ['코드리뷰', '문화', '협업'],
    vote: {
      agreeCount: 67,
      disagreeCount: 3,
      myVote: null,
    },
    commentCount: 31,
    comments: [],
    viewCount: 1567,
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z',
    lastActivityAt: '2026-01-19T11:30:00Z',
  },
  {
    id: 7,
    title: '스터디 모임, 온라인 vs 오프라인?',
    content: `코로나 이후로 계속 온라인 스터디만 했는데, 요즘 오프라인도 고려 중입니다.

여러분은 어떤 방식을 선호하시나요?
각각의 장단점을 경험해보신 분들의 의견이 궁금합니다!`,
    summary:
      '코로나 이후로 계속 온라인 스터디만 했는데, 요즘 오프라인도 고려 중입니다. 여러분은 어떤 방식을 선호하시나요?',
    author: {
      id: 9,
      nickname: '스터디장',
    },
    topic: 'study',
    tags: ['스터디', '온라인', '오프라인'],
    vote: {
      agreeCount: 34,
      disagreeCount: 28,
      myVote: null,
    },
    commentCount: 42,
    comments: [],
    viewCount: 1123,
    createdAt: '2026-01-17T16:00:00Z',
    updatedAt: '2026-01-17T16:00:00Z',
    lastActivityAt: '2026-01-19T13:15:00Z',
  },
  {
    id: 8,
    title: 'Git 커밋 메시지 컨벤션 추천해주세요',
    content: `팀 프로젝트를 시작하는데 Git 커밋 메시지 규칙을 정하려고 합니다.

Conventional Commits를 사용하시나요?
아니면 다른 컨벤션을 사용하시나요?

실제로 사용하시는 커밋 메시지 예시와 함께 공유해주시면 감사하겠습니다!`,
    summary:
      '팀 프로젝트를 시작하는데 Git 커밋 메시지 규칙을 정하려고 합니다. 어떤 컨벤션을 추천하시나요?',
    author: {
      id: 10,
      nickname: 'Git초보',
    },
    topic: 'question',
    tags: ['Git', '커밋', '컨벤션'],
    vote: {
      agreeCount: 23,
      disagreeCount: 2,
      myVote: null,
    },
    commentCount: 14,
    comments: [],
    viewCount: 678,
    createdAt: '2026-01-19T09:30:00Z',
    updatedAt: '2026-01-19T09:30:00Z',
    lastActivityAt: '2026-01-19T12:45:00Z',
  },
];

// 토픽 한글 라벨
export const TOPIC_LABELS: Record<DiscussionTopic, string> = {
  all: '전체',
  development: '개발',
  study: '스터디',
  free: '자유',
  question: '질문',
};

// Mock API 함수들
export const mockFetchDiscussions = async (params: {
  q?: string;
  sort?: 'latest' | 'popular';
  topic?: DiscussionTopic;
  page?: number;
  limit?: number;
}): Promise<{ items: Discussion[]; hasMore: boolean; total: number }> => {
  // 시뮬레이션 딜레이
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...MOCK_DISCUSSIONS];

  // 검색 필터
  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.content.toLowerCase().includes(query) ||
        d.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }

  // 토픽 필터
  if (params.topic && params.topic !== 'all') {
    filtered = filtered.filter((d) => d.topic === params.topic);
  }

  // 정렬
  if (params.sort === 'popular') {
    filtered.sort((a, b) => b.vote.agreeCount - a.vote.agreeCount);
  } else {
    // latest (기본값)
    filtered.sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime(),
    );
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
