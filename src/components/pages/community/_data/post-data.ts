import { type Grade } from '@/components/pages/class/_data/feed-data';
import { COMMUNITY_ME_DISPLAY_NAME } from '@/components/pages/community/_data/community-dummy-assets';

export type PostBoardKind = 'tech' | 'free';

export interface PostComment {
  id: string;
  author: string;
  grade: Grade;
  body: string;
  when: string;
}

export interface CommunityPost {
  id: string;
  board: PostBoardKind;
  author: string;
  grade: Grade;
  title: string;
  body: string;
  views: number;
  likes: number;
  when: string;
  comments: PostComment[];
  images?: string[];
}

export const POST_CURRENT_USER = COMMUNITY_ME_DISPLAY_NAME;

export const TECH_POSTS: CommunityPost[] = [
  {
    id: '1',
    board: 'tech',
    author: '도현모닝',
    grade: '3학년',
    title: 'Cursor에서 Claude 4.5 Sonnet 잘 활용하는 5가지 팁',
    body: `Cursor를 6개월간 매일 쓰면서 Claude 4.5와 함께 일을 잘 하는 패턴을 발견했어요.

1. **컨텍스트는 짧게, 명확하게**
긴 프롬프트는 오히려 헛돕니다. 무엇을 만들고, 어떤 제약이 있는지 5줄 이내로 적어요.

2. **작은 단위로 자주 검증**
한 번에 모든 걸 시키지 말고, 함수 하나씩 만들고 바로 실행해보세요.

3. **에러는 그대로 붙여넣기**
"안 돼요" 하지 말고 에러 메시지 통째로 복붙. 5줄짜리 스택 트레이스가 100줄짜리 설명보다 정확해요.

4. **컨벤션은 README에 박아두기**
프로젝트 루트에 \`AGENTS.md\` 만들고 코드 컨벤션 적어두면 매번 같은 스타일 유지가 됩니다.

5. **실패한 시도도 기록**
'이렇게 했는데 안 됐어요'를 그대로 전달하면 같은 시도를 반복하지 않아요.

이 5가지만 지켜도 작업 속도가 2배 빨라져요.`,
    views: 1289,
    likes: 87,
    when: '3일 전',
    comments: [
      {
        id: '1-c1',
        author: '서연코덕',
        grade: '빌더',
        body: '진짜 공감... 컨벤션 박아두기는 진짜 신세계였어요',
        when: '2일 전',
      },
      {
        id: '1-c2',
        author: '지호클로버',
        grade: '2학년',
        body: '실패한 시도 기록 부분이 인상깊네요. 시도해볼게요!',
        when: '1일 전',
      },
    ],
  },
  {
    id: '2',
    board: 'tech',
    author: '제로운영',
    grade: '운영자',
    title: '바이브코딩이 처음이라면? 첫 1주일에 꼭 해야 할 것들',
    body: `바이브코딩 처음 시작하시는 분들에게 가장 많이 받는 질문 정리.

## Day 1: 환경부터 잡기
- Cursor 설치 (Mac/Windows 둘 다)
- GitHub 계정 + git 기초 (\`commit\`, \`push\`만 알아도 OK)
- 작업 폴더 정리 (\`~/work/\` 같은 곳)

## Day 2-3: 가장 작은 결과물 만들기
이력서 한 페이지짜리 사이트 정도가 딱입니다.
- HTML 한 파일로 시작
- 텍스트 + 사진 1장
- 배경색만 골라봐도 충분해요

## Day 4-5: 배포까지 가기
Vercel 무료 플랜으로 1분만에 끝냅니다.
- GitHub에 push
- vercel.com에서 import
- 끝.

## Day 6-7: 욕심내기 전에 정리
처음엔 "더 멋지게"보다 "다시 봐도 이해되는 코드"에 집중하세요.

질문 있으면 [질문답변](/community/qna)에 남겨주세요!`,
    views: 3421,
    likes: 234,
    when: '1주 전',
    comments: [
      {
        id: '2-c1',
        author: POST_CURRENT_USER,
        grade: '빌더',
        body: '시작하시는 분들에게 진짜 도움 많이 될 것 같아요.',
        when: '5일 전',
      },
    ],
  },
  {
    id: '3',
    board: 'tech',
    author: '하은타입',
    grade: '2학년',
    title: 'React 19 useTransition 실전 사용기',
    body: `React 19에서 useTransition이 한 단계 진화했어요.

기존 useTransition은 isPending 상태와 startTransition만 줬는데, 19부터는 form action과도 매끄럽게 연동돼요.

\`\`\`tsx
const [isPending, startTransition] = useTransition();

const handleSubmit = (formData: FormData) => {
  startTransition(async () => {
    await submitForm(formData);
  });
};
\`\`\`

화면 깜빡임 없이 부드럽게 처리되는 게 진짜 신기해요.`,
    views: 567,
    likes: 41,
    when: '2일 전',
    comments: [],
  },
  {
    id: '4',
    board: 'tech',
    author: '민준스택',
    grade: '1학년',
    title: 'Vercel 무료 플랜으로 어디까지 갈 수 있을까?',
    body: `사이드 프로젝트 3개를 모두 Vercel 무료 플랜으로 운영 중이에요.

월 100GB 대역폭, 100GB-hour 함수 실행 시간을 줘서 일반적인 사이트는 충분합니다.

다만 이미지가 많은 사이트면 Cloudflare R2 같은 외부 스토리지 붙이는 게 안전해요.`,
    views: 892,
    likes: 56,
    when: '4일 전',
    comments: [
      {
        id: '4-c1',
        author: '서진라이트',
        grade: '빌더',
        body: 'Cloudflare R2 가성비 짱이죠ㅎㅎ',
        when: '3일 전',
      },
    ],
  },
];

export const FREE_POSTS: CommunityPost[] = [
  {
    id: '1',
    board: 'free',
    author: '민서위크',
    grade: '1학년',
    title: '오늘 처음으로 내가 만든 사이트가 배포됐어요!!',
    body: `5일 동안 매일 2시간씩 끄적였는데, 진짜 URL이 생기니까 너무 신기해요.

도메인 받자마자 가족 단톡에 자랑했더니 다들 "오 멋지다" 해주더라고요. 코딩 시작하길 잘한 것 같아요!

다음 코스도 빨리 열렸으면 좋겠어요 🥹`,
    views: 234,
    likes: 28,
    when: '6시간 전',
    comments: [
      {
        id: '1-c1',
        author: '지호클로버',
        grade: '2학년',
        body: '축하해요!! 처음 배포한 그 느낌 잊지 못함ㅋㅋ',
        when: '5시간 전',
      },
      {
        id: '1-c2',
        author: POST_CURRENT_USER,
        grade: '빌더',
        body: '와 너무 멋지네요!',
        when: '3시간 전',
      },
    ],
  },
  {
    id: '2',
    board: 'free',
    author: POST_CURRENT_USER,
    grade: '빌더',
    title: '디자이너에서 개발자로 전향 중인데 다들 어떻게 공부하셨어요?',
    body: `디자이너 5년차인데 요즘 코딩에 푹 빠졌어요.

낮엔 디자인하고 밤엔 ZERO-ONE 강의 듣는데 시간 조절이 너무 어려워요.

비슷한 경험 있으신 분들 어떻게 하셨는지 공유 부탁드려요!`,
    views: 412,
    likes: 19,
    when: '1일 전',
    comments: [
      {
        id: '2-c1',
        author: '도현모닝',
        grade: '3학년',
        body: '저도 마케터 출신이에요. 처음 3개월이 제일 빡셌어요. 주말에 몰아서 하지 마시고 매일 1시간씩이 답이에요.',
        when: '20시간 전',
      },
    ],
  },
  {
    id: '3',
    board: 'free',
    author: '유진모각코',
    grade: '빌더',
    title: '혹시 모각코 같이 하실 분 계신가요?',
    body: `매주 토요일 오전에 카페에서 작업하고 있어요.
혼자 하니까 자꾸 딴짓해서 모각코 그리워서요...

지역은 강남/잠실 쪽이면 좋을 것 같아요!`,
    views: 178,
    likes: 12,
    when: '2일 전',
    comments: [],
  },
  {
    id: '4',
    board: 'free',
    author: '서연코덕',
    grade: '빌더',
    title: '코딩 공부할 때 듣는 음악 추천',
    body: `Lo-fi beats 듣다가 너무 졸려서 새 플레이리스트 찾는 중인데, 다들 추천해주세요!

저는 요즘 'Synthwave Programming Mix' 자주 들어요.`,
    views: 89,
    likes: 7,
    when: '3일 전',
    comments: [
      {
        id: '4-c1',
        author: '하은타입',
        grade: '2학년',
        body: '저는 무음으로 합니다 ㅎㅎ 음악도 방해되더라고요',
        when: '2일 전',
      },
    ],
  },
  {
    id: '5',
    board: 'free',
    author: '지호클로버',
    grade: '2학년',
    title: '스벨트 vs 리액트 둘 다 배워보신 분?',
    body: `리액트는 어느 정도 익숙해졌는데, 스벨트가 요즘 핫하다고 해서 궁금해서요.
실제로 둘 다 써보신 분들 의견 부탁드려요!`,
    views: 245,
    likes: 14,
    when: '4일 전',
    comments: [],
  },
];

export const ALL_POSTS = [...TECH_POSTS, ...FREE_POSTS];

export function getPostById(
  id: string,
  board?: PostBoardKind,
): CommunityPost | undefined {
  if (board) return ALL_POSTS.find((p) => p.id === id && p.board === board);
  return ALL_POSTS.find((p) => p.id === id);
}
