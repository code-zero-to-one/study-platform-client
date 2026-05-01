import { COMMUNITY_ME_DISPLAY_NAME } from '@/components/pages/community/_data/community-dummy-assets';
import { type Grade } from './feed-data';

export type QnaRole = 'me' | 'builder' | 'admin';

export interface QnaAnswer {
  id: string;
  author: string;
  role: QnaRole;
  body: string;
  when: string;
}

export interface QnaQuestion {
  id: string;
  courseId: string;
  courseName: string;
  lessonNum: number;
  author: string;
  role: QnaRole;
  grade: Grade;
  title: string;
  body: string;
  images?: string[];
  views: number;
  when: string;
  answers: QnaAnswer[];
}

export interface QnaCourse {
  id: string;
  name: string;
}

export const QNA_ADMIN = {
  name: '제로운영진',
  initial: '제',
} as const;

export const QNA_CURRENT_USER = COMMUNITY_ME_DISPLAY_NAME;

export function parseDaysAgo(when: string): number {
  if (when === '방금') return 0;
  const minMatch = when.match(/^(\d+)분\s*전/);
  if (minMatch) return Number(minMatch[1]) / 60 / 24;
  const hourMatch = when.match(/^(\d+)시간\s*전/);
  if (hourMatch) return Number(hourMatch[1]) / 24;
  if (when === '어제') return 1;
  const dayMatch = when.match(/^(\d+)일\s*전/);
  if (dayMatch) return Number(dayMatch[1]);
  const weekMatch = when.match(/^(\d+)주\s*전/);
  if (weekMatch) return Number(weekMatch[1]) * 7;
  const monthMatch = when.match(/^(\d+)(?:달|개월)\s*전/);
  if (monthMatch) return Number(monthMatch[1]) * 30;
  const yearMatch = when.match(/^(\d+)년\s*전/);
  if (yearMatch) return Number(yearMatch[1]) * 365;
  return 0;
}

export const QNA_COURSES: QnaCourse[] = [
  { id: 'vibe-intro', name: '바이브코딩 입문자 코스' },
  { id: 'web-basics', name: '웹 기초 완성 코스' },
  { id: 'react-fundamentals', name: 'React 기초 코스' },
];

export const QNA_ITEMS: QnaQuestion[] = [
  {
    id: '1',
    courseId: 'vibe-intro',
    courseName: '바이브코딩 입문자 코스',
    lessonNum: 3,
    author: QNA_CURRENT_USER,
    role: 'me',
    grade: '빌더',
    title: 'Cursor 설치하다가 권한 에러가 나요',
    body: '맥북에서 Cursor를 처음 켬는데 "확인되지 않은 개발자" 라고 떠서 켬 수가 없어요. 시스템 환경설정에서 어떻게 풀어야 하나요?',
    images: [
      'https://picsum.photos/seed/qna1a/600/400',
      'https://picsum.photos/seed/qna1b/600/400',
    ],
    views: 142,
    when: '2시간 전',
    answers: [
      {
        id: 'q1-a1',
        author: QNA_ADMIN.name,
        role: 'admin',
        body: '시스템 환경설정 > 개인정보 보호 및 보안 > 보안 영역에서 "확인 없이 열기" 버튼이 보일 거예요. 그걸 눌러주시면 바로 열립니다 :)',
        when: '1시간 전',
      },
    ],
  },
  {
    id: '2',
    courseId: 'vibe-intro',
    courseName: '바이브코딩 입문자 코스',
    lessonNum: 3,
    author: '서연코덕',
    role: 'builder',
    grade: '빌더',
    title: 'Cursor와 VSCode 둘 다 깔려 있어도 괜찮나요?',
    body: '기존에 VSCode를 쓰고 있었는데, Cursor 깔면 충돌이 생기진 않을까요? 둘 다 쓸 수도 있는지 궁금합니다.',
    views: 88,
    when: '어제',
    answers: [
      {
        id: 'q2-a1',
        author: QNA_ADMIN.name,
        role: 'admin',
        body: '둘은 충돌하지 않으니 안심하셔도 돼요. Cursor 자체가 VSCode 기반이라 익숙하실 거고, 설정과 익스텐션을 가져올 수도 있어요.',
        when: '어제',
      },
    ],
  },
  {
    id: '3',
    courseId: 'vibe-intro',
    courseName: '바이브코딩 입문자 코스',
    lessonNum: 4,
    author: '도현모닝',
    role: 'builder',
    grade: '3학년',
    title: 'Claude한테 시킬 때 한국어가 나아요? 영어가 나아요?',
    body: '둘 다 시도해봤는데 결과가 미묘하게 다른 것 같아요. 강의에서는 한국어로 시켜도 된다고 하셔는데, 코드 양 많아질수록 한국어로도 괜찮은지 궁금해요.',
    views: 231,
    when: '2일 전',
    answers: [
      {
        id: 'q3-a1',
        author: QNA_ADMIN.name,
        role: 'admin',
        body: '일반적인 작업은 한국어로도 충분합니다. 다만 변수명, 함수명 같은 코드 표현에 영어로 "식별자는 영어로" 명시해주시면 결과가 더 안정적이에요. 예: "사용자 카드 컴포넌트(UserCard) 만들어줘".',
        when: '2일 전',
      },
    ],
  },
  {
    id: '4',
    courseId: 'vibe-intro',
    courseName: '바이브코딩 입문자 코스',
    lessonNum: 5,
    author: '유진타입',
    role: 'builder',
    grade: '1학년',
    title: '글자가 화면에 안 떠요. 어디서 봐야 하나요?',
    body: 'index.html을 만들고 h1을 적었는데, 더블클릭해서 열면 빈 화면이에요. 콘솔에 빨간 글자도 떠요.',
    images: [
      'https://picsum.photos/seed/qna4a/600/400',
      'https://picsum.photos/seed/qna4b/600/400',
      'https://picsum.photos/seed/qna4c/600/400',
    ],
    views: 57,
    when: '3일 전',
    answers: [],
  },
  {
    id: '5',
    courseId: 'vibe-intro',
    courseName: '바이브코딩 입문자 코스',
    lessonNum: 7,
    author: '도영크루',
    role: 'builder',
    grade: '2학년',
    title: '피그마 시안의 폰트가 코드에선 다르게 보여요',
    body: 'Pretendard로 디자인했는데, 코드에서는 그냥 시스템 폰트처럼 보입니다. 폰트 import는 어떻게 하나요?',
    views: 189,
    when: '4일 전',
    answers: [
      {
        id: 'q5-a1',
        author: QNA_ADMIN.name,
        role: 'admin',
        body: 'Pretendard CDN을 head에 link로 넣어주시면 돼요. "Pretendard CDN" 검색해서 link 태그 그대로 복사해 넣어보세요. 그 다음 body의 font-family를 "Pretendard"로 가장 앞에 두면 적용됩니다.',
        when: '4일 전',
      },
    ],
  },
  {
    id: '6',
    courseId: 'vibe-intro',
    courseName: '바이브코딩 입문자 코스',
    lessonNum: 9,
    author: '유빈코덕',
    role: 'builder',
    grade: '빌더',
    title: 'Vercel 배포 후 도메인 어떻게 바꾸나요?',
    body: '기본 .vercel.app URL 말고 사용자 도메인으로 연결하고 싶어요. 어디서 설정하면 되는지 알려주세요.',
    views: 312,
    when: '5일 전',
    answers: [
      {
        id: 'q6-a1',
        author: QNA_ADMIN.name,
        role: 'admin',
        body: 'Vercel 프로젝트 > Settings > Domains에서 추가하실 수 있어요. 가비아나 Namecheap 같은 곳에서 산 도메인이라면 DNS에 CNAME 한 줄 추가하면 1-2분 안에 연결돼요. 자세한 가이드 링크 첨부 드릴게요.',
        when: '5일 전',
      },
    ],
  },
  {
    id: '7',
    courseId: 'vibe-intro',
    courseName: '바이브코딩 입문자 코스',
    lessonNum: 1,
    author: QNA_CURRENT_USER,
    role: 'me',
    grade: '빌더',
    title: '디자이너인데 정말 코딩 0이어도 따라갈 수 있을까요?',
    body: '결제 전에 한 번 더 확인하고 싶어요. 진짜 HTML도 모르는 상태인데 5주 안에 가능한가요?',
    views: 445,
    when: '1주 전',
    answers: [
      {
        id: 'q7-a1',
        author: QNA_ADMIN.name,
        role: 'admin',
        body: '네! 입문자 코스는 "코드를 배우는 게" 아니라 "AI에게 잘 시키는 법을 배우는" 코스라 디자이너분들께 특히 잘 맞아요. 5주치 분량은 매일 12-22분이면 부담 없이 가능합니다.',
        when: '1주 전',
      },
    ],
  },
  {
    id: '8',
    courseId: 'web-basics',
    courseName: '웹 기초 완성 코스',
    lessonNum: 2,
    author: '민지위크',
    role: 'builder',
    grade: '1학년',
    title: 'CSS flex와 grid 언제 무엇을 써야 하나요?',
    body: '레이아웃 잡을 때 둘 다 쓸 수 있는 것 같은데, 어떤 기준으로 선택하면 좋을지 모르겠어요.',
    views: 278,
    when: '3일 전',
    answers: [
      {
        id: 'q8-a1',
        author: QNA_ADMIN.name,
        role: 'admin',
        body: '간단하게 말하면, 1차원(가로 또는 세로 방향)은 flex, 2차원(가로 세로 동시)은 grid입니다. 카드 그리드처럼 행과 열이 동시에 필요하면 grid, 헤더 네비게이션처럼 한 방향 정렬만 필요하면 flex를 쓰세요.',
        when: '2일 전',
      },
    ],
  },
  {
    id: '9',
    courseId: 'web-basics',
    courseName: '웹 기초 완성 코스',
    lessonNum: 4,
    author: '서경모각코',
    role: 'builder',
    grade: '빌더',
    title: 'position: absolute가 이상하게 동작해요',
    body: '부모한테 relative 줬는데 자식 absolute가 자꾸 밖으로 빠져나가요. 어떻게 해결하나요?',
    views: 154,
    when: '5일 전',
    answers: [],
  },
  {
    id: '10',
    courseId: 'react-fundamentals',
    courseName: 'React 기초 코스',
    lessonNum: 3,
    author: '하나모닝',
    role: 'builder',
    grade: '2학년',
    title: 'useState 초기값에 함수 넣기는 왜인가요?',
    body: 'useState(() => heavyCalc()) 이렇게 쓰는 걸 봤는데, 그냥 useState(heavyCalc())와 뭐가 다른 건지 모르겠어요.',
    views: 391,
    when: '1일 전',
    answers: [
      {
        id: 'q10-a1',
        author: QNA_ADMIN.name,
        role: 'admin',
        body: '함수로 감싸면 lazy initialization 이라고 해서, 컴포넌트가 처음 마운트될 때 딱 한 번만 실행돼요. 그냥 넣기는 렌더링할 때마다 실행되어 불필요한 계산을 반복합니다. 무거운 초기값 계산하는 건 화살표 함수 형태로 쓰세요.',
        when: '1일 전',
      },
    ],
  },
  {
    id: '11',
    courseId: 'react-fundamentals',
    courseName: 'React 기초 코스',
    lessonNum: 5,
    author: QNA_CURRENT_USER,
    role: 'me',
    grade: '빌더',
    title: 'useEffect 의존성 배열이 헷갈려요',
    body: '빈 배열, 값이 들어있는 배열, 아예 없는 것 세 가지 차이가 뭐지 정리해주실 수 있나요?',
    views: 502,
    when: '2일 전',
    answers: [
      {
        id: 'q11-a1',
        author: QNA_ADMIN.name,
        role: 'admin',
        body: '세 가지 요약:\n1. 빈 배열: 마운트 시 한 번만 실행 (componentDidMount)\n2. 값이 들어있는 배열: 해당 값이 바뀔 때마다 실행\n3. 배열 없음: 모든 렌더 후 실행 (거의 쓰지 않음)\n\n규칙: useEffect 안에서 사용하는 모든 state/props를 의존성 배열에 넣으면 됩니다.',
        when: '2일 전',
      },
    ],
  },
];
