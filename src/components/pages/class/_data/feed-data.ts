export type ThumbKind =
  | 'portfolio'
  | 'bookclub'
  | 'landing'
  | 'petdiary'
  | 'retros'
  | 'cafemenu';

export type Grade =
  | '빌더'
  | '1학년'
  | '2학년'
  | '3학년'
  | '4학년'
  | '펠로우'
  | '운영자';

export interface FeedComment {
  name: string;
  grade: Grade;
  text: string;
}

export interface FeedItem {
  id: number;
  name: string;
  grade: Grade;
  title: string;
  motiv: string;
  review: string;
  likes: number;
  comments: number;
  thumbKind: ThumbKind;
  day: number;
  when: string;
  role: string;
  commentsList?: FeedComment[];
}

export const FEED_ITEMS: FeedItem[] = [
  {
    id: 1,
    name: '김지윤',
    grade: '2학년',
    title: '내 포트폴리오 사이트',
    motiv: '5년차 디자이너인데 내 사이트 하나 없는 게 부끄러웠어요.',
    review:
      '코드 한 줄 안 쳐봤는데 5일 만에 진짜 URL이 생겼어요. 친구한테 자랑할 수 있어서 행복해요.',
    likes: 142,
    comments: 23,
    thumbKind: 'portfolio',
    day: 5,
    when: '2일 전',
    role: '디자이너 김지윤',
  },
  {
    id: 2,
    name: '박서연',
    grade: '빌더',
    title: '독서 모임 신청 페이지',
    motiv: '매번 구글폼만 돌리던 게 답답했어요.',
    review:
      '디자인을 그대로 코드로 옮기는 게 이렇게 가능한지 몰랐어요. CH3에서 진짜 충격이었어요.',
    likes: 89,
    comments: 12,
    thumbKind: 'bookclub',
    day: 4,
    when: '4일 전',
    role: '기획자 박서연',
  },
  {
    id: 3,
    name: '이도현',
    grade: '3학년',
    title: '사이드 프로젝트 랜딩',
    motiv: '아이디어만 100개 쌓아두고 못 만들고 있던 한 명입니다.',
    review:
      'AI에게 시키는 법을 배운 게 코드 배운 것보다 큽니다. 다음 코스 빨리 열어주세요!',
    likes: 201,
    comments: 34,
    thumbKind: 'landing',
    day: 5,
    when: '1주 전',
    role: '마케터 이도현',
  },
  {
    id: 4,
    name: '정민서',
    grade: '1학년',
    title: '강아지 산책 일지',
    motiv: '우리 강아지 산책 기록을 직접 만들고 싶었어요.',
    review: '내 강아지 사진이 내가 만든 사이트에 떠 있는 게 너무 좋아요 🥹',
    likes: 312,
    comments: 48,
    thumbKind: 'petdiary',
    day: 5,
    when: '3일 전',
    role: '디자이너 정민서',
  },
  {
    id: 5,
    name: '한지호',
    grade: '2학년',
    title: '팀 회고 모음 사이트',
    motiv: '팀 회고가 노션에 흩어져서 누구도 안 보고 있었어요.',
    review:
      'PM인데 처음으로 우리 팀에 직접 도구를 만들어줬어요. 동료들이 신기해해요.',
    likes: 178,
    comments: 29,
    thumbKind: 'retros',
    day: 4,
    when: '5일 전',
    role: 'PM 한지호',
  },
  {
    id: 6,
    name: '최유진',
    grade: '빌더',
    title: '엄마 카페 메뉴판',
    motiv: '엄마 카페에 메뉴판이 종이라서 자주 바뀔 때 힘드셨어요.',
    review:
      '엄마가 "내 딸이 만든 거"라고 손님들한테 자랑하시는 게 제일 큰 보상이에요.',
    likes: 524,
    comments: 71,
    thumbKind: 'cafemenu',
    day: 5,
    when: '1주 전',
    role: '디자이너 최유진',
  },
];

export const GRADE_BADGE_STYLES: Record<Grade, { bg: string; color: string }> =
  {
    빌더: { bg: '#FFE4E8', color: '#89123E' },
    '1학년': { bg: '#D1E9FF', color: '#194185' },
    '2학년': { bg: '#D1FADF', color: '#054F31' },
    '3학년': { bg: '#FEF0C7', color: '#7A2E0E' },
    '4학년': { bg: '#FECDD6', color: '#A11043' },
    펠로우: { bg: '#181D27', color: '#FFFFFF' },
    운영자: { bg: '#F63D68', color: '#FFFFFF' },
  };
