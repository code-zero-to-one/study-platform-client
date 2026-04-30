export type CourseLevel = '입문' | '중급' | '심화';
export type CourseStatus = 'available' | 'coming-soon';

export interface CourseChapter {
  id: string;
  num: string;
  title: string;
  emoji: string;
  desc: string;
}

export interface CourseLesson {
  num: number;
  ch: string;
  title: string;
  chapter: string;
  minutes: number;
  goal: string;
}

export interface AvailableCourse {
  id: string;
  slug: string;
  status: 'available';
  badge: { kind: 'level' | 'duration'; label: string }[];
  level: CourseLevel;
  ribbon?: string;
  title: string;
  tagline: string;
  price: number;
  originalPrice: number;
  thumbAccent: string;
  chapters: CourseChapter[];
}

export interface ComingSoonCourse {
  id: string;
  status: 'coming-soon';
  title: string;
  emoji: string;
  releaseLabel: string;
}

export type Course = AvailableCourse | ComingSoonCourse;

export const VIBE_COURSE: AvailableCourse = {
  id: 'vibe-intro',
  slug: 'vibe-intro',
  status: 'available',
  level: '입문',
  ribbon: '얼리버드 진행 중',
  badge: [
    { kind: 'level', label: '입문' },
    { kind: 'duration', label: '5일 완성' },
  ],
  title: '바이브코딩 입문자 코스',
  tagline: '코딩 한 줄 안 해본 디자이너도 5일 안에 첫 웹을 배포합니다.',
  price: 39900,
  originalPrice: 79000,
  thumbAccent: 'linear-gradient(135deg, #F63D68 0%, #FD6F8E 60%, #FECDD6 100%)',
  chapters: [
    {
      id: 'ch0',
      num: 'CH 0',
      title: '온보딩',
      emoji: 'wb_sunny',
      desc: '왜 우리는 만드는가',
    },
    {
      id: 'ch1',
      num: 'CH 1',
      title: '환경 세팅',
      emoji: 'tune',
      desc: '도구를 손에 익히기',
    },
    {
      id: 'ch2',
      num: 'CH 2',
      title: '첫 화면',
      emoji: 'monitor',
      desc: '비어 있던 캔버스에 첫 픽셀',
    },
    {
      id: 'ch3',
      num: 'CH 3',
      title: '피그마 → 코드',
      emoji: 'auto_fix_high',
      desc: '디자인이 살아 움직이는 순간',
    },
    {
      id: 'ch4',
      num: 'CH 4',
      title: '배포',
      emoji: 'rocket_launch',
      desc: '내 손으로 만든 URL을 갖는다',
    },
  ],
};

export const VIBE_LESSONS: CourseLesson[] = [
  {
    num: 1,
    ch: 'ch0',
    title: '왜 만드는 사람이 되는가',
    chapter: 'CH 0 · 온보딩',
    minutes: 12,
    goal: "'만들기'가 디자이너의 사고를 어떻게 확장하는지 이해한다.",
  },
  {
    num: 2,
    ch: 'ch0',
    title: '바이브코딩이 뭔가요?',
    chapter: 'CH 0 · 온보딩',
    minutes: 13,
    goal: "AI에게 '잘 시키는' 새로운 작업 방식의 흐름을 익힌다.",
  },
  {
    num: 3,
    ch: 'ch1',
    title: 'Cursor 설치하고 첫 인사',
    chapter: 'CH 1 · 환경 세팅',
    minutes: 18,
    goal: 'Cursor를 설치하고 첫 채팅을 주고받을 수 있다.',
  },
  {
    num: 4,
    ch: 'ch1',
    title: 'Claude와 대화하는 법',
    chapter: 'CH 1 · 환경 세팅',
    minutes: 17,
    goal: '원하는 결과를 끌어내는 프롬프트의 기본기를 익힌다.',
  },
  {
    num: 5,
    ch: 'ch2',
    title: '비어 있는 페이지에 글자 띄우기',
    chapter: 'CH 2 · 첫 화면',
    minutes: 20,
    goal: 'HTML 한 페이지에 내 이름이 보이게 만들 수 있다.',
  },
  {
    num: 6,
    ch: 'ch2',
    title: '버튼 만들고 색 입히기',
    chapter: 'CH 2 · 첫 화면',
    minutes: 20,
    goal: '기본 컴포넌트 하나를 색·여백까지 직접 다듬어본다.',
  },
  {
    num: 7,
    ch: 'ch3',
    title: '피그마 시안을 그대로 옮기기',
    chapter: 'CH 3 · 피그마 → 코드',
    minutes: 22,
    goal: '피그마 한 화면을 코드로 옮기는 워크플로우를 경험한다.',
  },
  {
    num: 8,
    ch: 'ch3',
    title: '내 손에 익히는 컴포넌트',
    chapter: 'CH 3 · 피그마 → 코드',
    minutes: 23,
    goal: '재사용 가능한 컴포넌트로 화면을 조립할 수 있다.',
  },
  {
    num: 9,
    ch: 'ch4',
    title: '도메인 연결하고 배포하기',
    chapter: 'CH 4 · 배포',
    minutes: 18,
    goal: 'Vercel로 내 사이트의 실제 URL을 만들 수 있다.',
  },
  {
    num: 10,
    ch: 'ch4',
    title: '세상에 보여주기',
    chapter: 'CH 4 · 배포',
    minutes: 12,
    goal: '완성한 사이트를 빌더 피드에 올려 첫 피드백을 받는다.',
  },
];

export const COMING_SOON_COURSES: ComingSoonCourse[] = [
  {
    id: 'ai-design',
    status: 'coming-soon',
    title: 'AI 활용 디자인 코스',
    emoji: 'auto_awesome',
    releaseLabel: '2026 여름 오픈',
  },
  {
    id: 'service-zero-one',
    status: 'coming-soon',
    title: '내 서비스 0→1 코스',
    emoji: 'rocket_launch',
    releaseLabel: '2026 가을 오픈',
  },
];

export interface TrustIndicator {
  num: string;
  label: string;
  icon: string;
}

export const CLASS_TRUST_INDICATORS: TrustIndicator[] = [
  { num: '127', label: '베타 수강 디자이너', icon: 'groups' },
  { num: '94%', label: '5일 안에 첫 배포 성공', icon: 'trending_up' },
  { num: '4.9', label: '수강 만족도 (5점 만점)', icon: 'favorite' },
  { num: '100%', label: '환불 보장 (CH2 이전)', icon: 'verified' },
];
