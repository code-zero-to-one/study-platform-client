export interface WeeklyComment {
  id: number;
  author: string;
  content: string;
  date: string;
}

export interface WeeklyPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  isManagerPick: boolean;
  likes: number;
  comments: WeeklyComment[];
}

export const MOCK_WEEKLY_DATA: WeeklyPost[] = [
  {
    id: 1,
    title: '[위클리 1월 3주차] 개발자 취업, 무엇이 가장 중요할까요?',
    content: '안녕하세요, 제로원 운영진입니다. \n이번 주 위클리 주제는 "취업 준비의 우선순위"입니다. \n\n여러분은 포트폴리오, 코딩 테스트, 면접 준비 중 어떤 것이 가장 중요하다고 생각하시나요? 자유롭게 의견을 나눠보아요!',
    author: 'ZeroOne_Manager',
    date: '2025.01.18',
    isManagerPick: true,
    likes: 124,
    comments: [
      { id: 1, author: 'User_101', content: '저는 코딩 테스트가 기본이라고 생각해요.', date: '2025.01.18' },
      { id: 2, author: 'User_102', content: '면접이 최종 관문이라 제일 중요한 것 같아요!', date: '2025.01.18' },
    ],
  },
  {
    id: 2,
    title: '요즘 다들 기상 스터디 잘 하고 계신가요?',
    content: '저는 오늘 늦잠 자서 지각했네요 ㅠㅠ 다들 화이팅입니다!',
    author: 'SleepyDev',
    date: '2025.01.17',
    isManagerPick: false,
    likes: 45,
    comments: [],
  },
  {
    id: 3,
    title: '리액트 상태 관리 라이브러리 추천해주세요',
    content: 'Redux, Recoil, Zustand, Jotai... 너무 많네요. 요즘 트렌드는 뭔가요?',
    author: 'ReactNewbie',
    date: '2025.01.16',
    isManagerPick: false,
    likes: 32,
    comments: [
      { id: 3, author: 'Frontend_Master', content: 'Zustand가 가볍고 쓰기 편해서 추천드려요!', date: '2025.01.16' },
    ],
  },
  ...Array.from({ length: 5 }, (_, i) => ({
    id: 10 + i,
    title: `오늘의 TIL 공유합니다 - ${i + 1}일차`,
    content: '오늘은 Next.js의 App Router에 대해 공부했습니다. 생각보다 어렵네요...',
    author: `Dev_${200 + i}`,
    date: `2025.01.${15 - i}`,
    isManagerPick: false,
    likes: 10 + i,
    comments: [],
  })),
];

