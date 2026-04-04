import {
  COMMUNITY_BOARD,
  COMMUNITY_FEED_FILTER,
  COMMUNITY_FEED_VIEW,
  COMMUNITY_MEMBER_ROLE,
  type CommunityComment,
  type CommunityBoardOption,
  type CommunityFeedFilterOption,
  type CommunityFeedViewOption,
  type CommunityPost,
} from '@/types/community/domain';

export const COMMUNITY_FEED_FILTER_OPTIONS: readonly CommunityFeedFilterOption[] =
  [
    {
      id: COMMUNITY_FEED_FILTER.ALL,
      label: '전체',
    },
    {
      id: COMMUNITY_FEED_FILTER.QNA,
      label: '질문답변',
    },
    {
      id: COMMUNITY_FEED_FILTER.FREE,
      label: '자유',
    },
    {
      id: COMMUNITY_FEED_FILTER.ACHIEVEMENT,
      label: '자랑거리',
    },
    {
      id: COMMUNITY_FEED_FILTER.KNOWLEDGE,
      label: 'IT 지식',
    },
  ] as const;

export const COMMUNITY_BOARD_OPTIONS: readonly CommunityBoardOption[] = [
  {
    id: COMMUNITY_BOARD.QNA,
    label: '질문답변',
  },
  {
    id: COMMUNITY_BOARD.FREE,
    label: '자유',
  },
  {
    id: COMMUNITY_BOARD.ACHIEVEMENT,
    label: '자랑거리',
  },
  {
    id: COMMUNITY_BOARD.KNOWLEDGE,
    label: 'IT 지식',
  },
] as const;

export const COMMUNITY_FEED_VIEW_OPTIONS: readonly CommunityFeedViewOption[] = [
  {
    id: COMMUNITY_FEED_VIEW.LIST,
    label: '리스트형',
  },
  {
    id: COMMUNITY_FEED_VIEW.CARD,
    label: '카드형',
  },
] as const;

export const COMMUNITY_DISCORD_URL = 'https://discord.gg/6JGu7G4F';

export const COMMUNITY_MOCK_AUTHOR = {
  memberId: 101,
  name: '개발러버',
  image: '/images/community-avatar-1.svg',
  intro: '루틴을 다시 잡고 있는 프론트엔드 취업 준비생입니다.',
  role: COMMUNITY_MEMBER_ROLE.NEWCOMER,
} as const;

const DEVELOPER_COMMENT_AUTHOR = {
  name: '김도현',
  image: '/images/community-avatar-2.svg',
  role: COMMUNITY_MEMBER_ROLE.DEVELOPER,
} as const;

const MENTOR_COMMENT_AUTHOR = {
  name: '박민준',
  image: '/images/community-avatar-3.svg',
  role: COMMUNITY_MEMBER_ROLE.MENTOR,
} as const;

const NEWCOMER_COMMENT_AUTHOR = {
  name: '정하은',
  image: '/images/community-avatar-4.svg',
  role: COMMUNITY_MEMBER_ROLE.NEWCOMER,
} as const;

const createComment = ({
  id,
  authorName,
  authorImage,
  authorRole,
  content,
  createdAt,
  isAuthor = false,
  isEdited = false,
  likeCount = 0,
  dislikeCount = 0,
  viewerReaction,
  replies = [],
}: {
  id: number;
  authorName: string;
  authorImage: string;
  authorRole: (typeof COMMUNITY_MEMBER_ROLE)[keyof typeof COMMUNITY_MEMBER_ROLE];
  content: string;
  createdAt: string;
  isAuthor?: boolean;
  isEdited?: boolean;
  likeCount?: number;
  dislikeCount?: number;
  viewerReaction?: CommunityComment['viewerReaction'];
  replies?: readonly CommunityComment[];
}): CommunityComment => ({
  id,
  authorName,
  authorImage,
  authorRole,
  content,
  createdAt,
  isAuthor,
  isEdited,
  likeCount,
  dislikeCount,
  viewerReaction,
  replies,
});

export const COMMUNITY_POSTS: readonly CommunityPost[] = [
  {
    id: 1,
    board: COMMUNITY_BOARD.QNA,
    title: '면접 준비를 다시 시작하는데 CS를 어떤 순서로 복습하는 게 좋을까요?',
    summary:
      '운영진 인사이트 글은 읽었는데 실제로 어떤 순서로 복습해야 할지 감이 안 잡힙니다. 비슷한 경험 있던 분들의 루틴이 궁금해요.',
    content: [
      '이직 준비를 다시 시작하면서 CS를 처음부터 전부 다시 파기보다는, 면접에서 자주 끊기는 주제부터 순서를 잡는 방식이 더 낫다는 이야기를 많이 들었습니다. 저도 자료를 펼쳐보니 범위가 너무 넓어서 시작점부터 막히더라고요.',
      '지금 생각하는 후보 순서는 운영체제, 네트워크, 데이터베이스, 자료구조 정도인데, 실제 면접에서는 어느 지점에서 질문이 가장 많이 이어졌는지 궁금합니다. 특히 단순 개념 암기보다 답변 흐름을 어떻게 가져갔는지 공유해주시면 도움이 될 것 같습니다.',
      '혼자 복습하다 보면 계속 범위를 넓히기만 하고 정리를 못 끝내는 경우가 많아서, 이번에는 루틴을 더 짧고 선명하게 잡고 싶습니다. 비슷하게 준비했던 분들이 어떤 순서와 단위로 끊었는지 듣고 싶어요.',
    ],
    previewImage: '/images/community-post-routine.svg',
    previewImageAlt: '공부 루틴 메모와 할 일 정리 이미지',
    authorMemberId: 101,
    authorName: '개발러버',
    authorImage: '/images/community-avatar-1.svg',
    authorIntro:
      '백엔드 취업 준비를 다시 시작하면서 루틴을 재정비하고 있습니다.',
    role: COMMUNITY_MEMBER_ROLE.NEWCOMER,
    viewCount: 594,
    reactionCount: 18,
    commentCount: 12,
    createdAt: '2시간 전',
    isTrending: true,
  },
  {
    id: 2,
    board: COMMUNITY_BOARD.ACHIEVEMENT,
    title:
      '기상스터디 21일 연속 성공했고, 포트폴리오 메인 페이지도 배포했습니다.',
    summary:
      '작게라도 계속 공개 기록을 남기니까 중간에 흐름이 안 끊겼습니다. 오늘은 화면 구조를 처음부터 다시 잡아봤어요.',
    content: [
      '처음에는 아침 루틴을 공개하는 게 부담스러웠는데, 하루하루 짧게라도 기록을 남기니까 중간에 흐름이 끊기는 횟수가 확실히 줄었습니다. 누가 봐주기 때문이라기보다 내가 놓치지 않기 위한 체크포인트가 생긴 느낌이었습니다.',
      '포트폴리오 메인 페이지는 기존에 섹션이 너무 많아서 읽는 사람이 어디부터 봐야 할지 애매했는데, 이번에는 소개, 문제 정의, 해결 방식, 결과 순서로 구조를 다시 잡았습니다. 완성도보다도 읽히는 순서를 먼저 정리한 게 제일 컸어요.',
      '작게라도 계속 올려보자는 마음으로 적는 글인데, 비슷하게 루틴을 이어가는 분들한테도 조금은 자극이 됐으면 좋겠습니다. 다음 목표는 상세 프로젝트 설명까지 같은 흐름으로 정리하는 겁니다.',
    ],
    previewImage: '/images/community-post-portfolio.svg',
    previewImageAlt: '포트폴리오 메인 페이지 시안 이미지',
    authorMemberId: 102,
    authorName: '코드킹',
    authorImage: '/images/community-avatar-2.svg',
    authorIntro:
      '현업 프론트엔드 개발자로 일하면서 개인 작업물을 꾸준히 정리하고 있습니다.',
    role: COMMUNITY_MEMBER_ROLE.DEVELOPER,
    viewCount: 407,
    reactionCount: 31,
    commentCount: 9,
    createdAt: '4시간 전',
    isTrending: true,
  },
  {
    id: 3,
    board: COMMUNITY_BOARD.KNOWLEDGE,
    title:
      '프로젝트가 커질수록 page를 얇게 두어야 하는 이유를 Next.js 기준으로 정리했습니다.',
    summary:
      '라우팅과 서버 경계는 app에 두고, 상호작용 로직은 feature client entry로 내려야 유지보수성이 좋아집니다.',
    content: [
      '처음에는 page 파일에서 데이터를 가져오고, 조건 분기하고, 화면까지 한 번에 그리는 방식이 빠르다고 느꼈습니다. 그런데 라우트가 늘어나고 클라이언트 상호작용이 붙기 시작하면 어디가 서버 경계이고 어디가 화면 로직인지 금방 섞였습니다.',
      '정리해보니 page는 params 정규화, metadata, notFound 같은 서버 경계 책임만 남기고 실제 렌더와 상호작용은 feature의 page-client로 내리는 구조가 훨씬 안정적이었습니다. 그래야 테스트할 때도 UI 조각과 라우팅 책임을 분리해서 볼 수 있었습니다.',
      '결국 핵심은 파일을 잘게 쪼개는 게 아니라, 어떤 파일이 왜 바뀌는지를 분명히 만드는 것 같습니다. page 하나가 데이터 소스와 화면 상태를 동시에 쥐고 있으면 나중에 리뷰도 어려워집니다.',
    ],
    authorMemberId: 123,
    authorName: '개발자',
    authorImage: '/images/community-avatar-3.svg',
    authorIntro:
      '팀 단위 프론트엔드 아키텍처와 코드 리뷰를 주로 다루는 멘토입니다.',
    role: COMMUNITY_MEMBER_ROLE.MENTOR,
    viewCount: 1600,
    reactionCount: 26,
    commentCount: 7,
    createdAt: '어제',
    isTrending: false,
  },
  {
    id: 4,
    board: COMMUNITY_BOARD.QNA,
    title:
      '첫 사이드 프로젝트를 혼자 끝까지 해본 분들은 일정 관리를 어떻게 하셨나요?',
    summary:
      '주중에는 퇴근하고 나면 집중이 끊겨서 자꾸 미뤄집니다. 개인 프로젝트를 완주한 분들의 루틴이 궁금해요.',
    content: [
      '사이드 프로젝트를 몇 번 시작해봤는데, 항상 초반 아이디어 정리까지만 빠르게 나가고 실제 구현 단계로 들어가면 속도가 확 떨어졌습니다. 특히 퇴근 후에는 체력이 애매해서 오늘 할 일을 정하는 데만 시간을 쓰게 되더라고요.',
      '지금은 주 5일 모두 뭔가를 하겠다는 생각보다, 차라리 주 3회라도 끝까지 지키는 방식이 맞지 않을까 고민 중입니다. 혼자서 프로젝트를 완주한 분들은 어떤 기준으로 작업량을 쪼갰는지 궁금합니다.',
      '기능 목록을 세우는 것보다 흐름을 유지하는 루틴을 먼저 배우고 싶습니다. 캘린더를 쓰셨는지, 주간 회고를 했는지 같은 아주 실무적인 방법도 궁금해요.',
    ],
    authorMemberId: 104,
    authorName: '디벨로퍼',
    authorImage: '/images/community-avatar-4.svg',
    authorIntro:
      '비전공자로 전향 중이고, 작은 프로젝트를 끝까지 만드는 힘을 키우고 있습니다.',
    role: COMMUNITY_MEMBER_ROLE.NEWCOMER,
    viewCount: 717,
    reactionCount: 22,
    commentCount: 15,
    createdAt: '어제',
    isTrending: true,
  },
  {
    id: 5,
    board: COMMUNITY_BOARD.KNOWLEDGE,
    title:
      'RAG 첫 설계에서 데이터 정합성이 깨지는 지점을 체크리스트로 정리했습니다.',
    summary:
      '검색 품질보다 먼저 봐야 하는 건 source of truth, 정리 로직, 캐시 오염이었습니다. 실무 기준으로 정리해봤어요.',
    content: [
      '처음에는 검색 품질만 높이면 RAG가 자연스럽게 좋아질 줄 알았는데, 실제로는 데이터가 어디서 생성되고 언제 갱신되는지가 더 먼저였습니다. 원본이 바뀌었는데 임베딩만 남거나, 삭제된 문서가 인덱스에 남는 순간부터 결과가 급격히 흔들렸습니다.',
      '그래서 이번 체크리스트는 검색 성능 최적화보다도 source of truth, 동기화 순서, 캐시 폐기, 실패 시 롤백 여부를 먼저 점검하는 흐름으로 잡았습니다. 시스템이 커질수록 이 기본 정리가 더 중요해지는 것 같았습니다.',
      '혹시 현업에서 RAG를 붙여보신 분들이 있다면, 초기에 가장 많이 놓쳤던 정합성 포인트가 무엇이었는지도 같이 듣고 싶습니다. 체크리스트를 더 실전적으로 다듬어보려고 합니다.',
    ],
    previewImage: '/images/community-post-checklist.svg',
    previewImageAlt: 'RAG 설계 체크리스트와 흐름 정리 이미지',
    authorMemberId: 103,
    authorName: '테크러버',
    authorImage: '/images/community-avatar-2.svg',
    authorIntro:
      '실무에서 AI 기능을 붙이며 데이터 정합성과 운영 안정성을 계속 점검하고 있습니다.',
    role: COMMUNITY_MEMBER_ROLE.DEVELOPER,
    viewCount: 1100,
    reactionCount: 34,
    commentCount: 11,
    createdAt: '2일 전',
    isTrending: true,
  },
  {
    id: 6,
    board: COMMUNITY_BOARD.ACHIEVEMENT,
    title:
      '이번 주에는 SQL 5문제, 네트워크 복습 3회, 이력서 1차 수정까지 끝냈습니다.',
    summary:
      '완벽한 결과보다 주간 리듬을 유지하는 데 집중했습니다. 다음 주에는 기술면접 답변 정리까지 이어가보려 합니다.',
    content: [
      '요즘은 한 번에 큰 목표를 잡기보다, 이번 주 안에 체크 가능한 단위로만 계획을 세우고 있습니다. SQL 문제 풀이, 네트워크 복습, 이력서 수정처럼 성격이 다른 작업을 섞어두니 오히려 한쪽에 질리지 않고 계속 이어갈 수 있었습니다.',
      '특히 이력서는 한 번에 완성하려고 하면 손도 못 대는 경우가 많아서, 이번에는 표현 어색한 부분만 고친다는 식으로 범위를 줄였습니다. 덕분에 완성은 아니어도 이전보다 훨씬 덜 막혔습니다.',
      '다음 주 목표는 기술면접 답변을 글로 정리하는 것입니다. 계속 주간 리듬을 이어가면서, 결과보다 흐름을 먼저 만들자는 기준으로 가보려고 합니다.',
    ],
    authorMemberId: 121,
    authorName: '프로그래머',
    authorImage: '/images/community-avatar-1.svg',
    authorIntro:
      '매주 작은 완료를 쌓는 방식으로 취업 준비 리듬을 만들고 있습니다.',
    role: COMMUNITY_MEMBER_ROLE.NEWCOMER,
    viewCount: 478,
    reactionCount: 14,
    commentCount: 5,
    createdAt: '2일 전',
    isTrending: false,
  },
  {
    id: 7,
    board: COMMUNITY_BOARD.FREE,
    title: '코딩테스트 복기할 때 오답노트까지 남기는 편인가요?',
    summary:
      '문제만 다시 푸는 방식이랑 풀이 이유까지 적는 방식 중에 뭐가 더 오래 남는지 궁금합니다.',
    content: [
      '예전에는 틀린 문제를 다시 풀기만 해도 충분하다고 생각했는데, 시간이 지나면 같은 포인트에서 또 막히는 경우가 많았습니다. 그래서 요즘은 아예 풀이 과정까지 짧게 적어둘지 고민하고 있습니다.',
      '다만 오답노트를 너무 길게 쓰기 시작하면 금방 지치고, 반대로 너무 짧으면 나중에 다시 봤을 때 도움이 안 되는 것 같아서 적정선이 궁금합니다. 실전에서는 어떤 정도까지 남겨두는지 듣고 싶어요.',
      '반복해서 자주 틀리는 유형을 기록하는 방식이 더 나은지, 아니면 매번 풀었던 사고 흐름까지 적는 게 더 오래 남는지도 같이 궁금합니다.',
    ],
    authorMemberId: 122,
    authorName: '코더',
    authorImage: '/images/community-avatar-4.svg',
    authorIntro:
      '알고리즘과 자료구조를 다시 다지면서 학습 기록을 체계화하고 있습니다.',
    role: COMMUNITY_MEMBER_ROLE.DEVELOPER,
    viewCount: 629,
    reactionCount: 19,
    commentCount: 8,
    createdAt: '3일 전',
    isTrending: false,
  },
  {
    id: 8,
    board: COMMUNITY_BOARD.KNOWLEDGE,
    title:
      '이력서 프로젝트 설명에서 결과보다 문제 정의를 먼저 써야 하는 이유를 정리했습니다.',
    summary:
      '무엇을 만들었는지보다 어떤 문제를 풀었는지부터 써야 면접에서 질문이 덜 흔들렸습니다. 실제 예시 문장도 같이 적었습니다.',
    content: [
      '프로젝트 설명을 쓸 때 기능 목록부터 적으면 얼핏 풍부해 보이지만, 정작 면접에서 왜 이 기능을 넣었는지 질문이 들어오면 답변 흐름이 약해지는 경우가 많았습니다. 그래서 이번에는 문제 정의를 먼저 쓰는 구조로 문장을 다시 정리했습니다.',
      '무엇을 구현했는지보다 어떤 문제를 보고 어떤 판단으로 해결했는지부터 드러나면, 면접관도 질문을 더 구체적으로 하게 되고 이야기의 중심이 흔들리지 않았습니다. 결과 수치나 기술 스택은 그 다음에 붙여도 충분했습니다.',
      '실제로 문장을 바꿔보니 같은 프로젝트라도 훨씬 선명하게 읽혔습니다. 비슷하게 이력서 설명 문장을 다듬고 있는 분들한테 작은 참고가 되면 좋겠습니다.',
    ],
    previewImage: '/images/community-post-portfolio.svg',
    previewImageAlt: '프로젝트 설명 구조를 정리한 화면 이미지',
    authorMemberId: 104,
    authorName: '디벨로퍼',
    authorImage: '/images/community-avatar-3.svg',
    authorIntro: '이력서와 면접 답변 흐름을 함께 보는 커리어 멘토입니다.',
    role: COMMUNITY_MEMBER_ROLE.MENTOR,
    viewCount: 852,
    reactionCount: 29,
    commentCount: 13,
    createdAt: '3일 전',
    isTrending: true,
  },
] as const;

const COMMUNITY_POST_COMMENTS: Record<number, readonly CommunityComment[]> = {
  1: [
    createComment({
      id: 101,
      authorName: DEVELOPER_COMMENT_AUTHOR.name,
      authorImage: DEVELOPER_COMMENT_AUTHOR.image,
      authorRole: DEVELOPER_COMMENT_AUTHOR.role,
      content:
        '저는 운영체제랑 네트워크를 먼저 묶어서 돌렸어요. 답변 흐름이 끊기는 지점을 먼저 메모해두면 범위가 훨씬 줄어듭니다.',
      createdAt: '1시간 전',
      likeCount: 7,
      replies: [
        createComment({
          id: 102,
          authorName: COMMUNITY_MOCK_AUTHOR.name,
          authorImage: COMMUNITY_MOCK_AUTHOR.image,
          authorRole: COMMUNITY_MOCK_AUTHOR.role,
          content:
            '운영체제와 네트워크를 묶어서 보는 방식이 좋네요. 질문이 자주 꼬이는 부분부터 정리해보겠습니다.',
          createdAt: '45분 전',
          isAuthor: true,
          likeCount: 2,
        }),
      ],
    }),
    createComment({
      id: 103,
      authorName: COMMUNITY_MOCK_AUTHOR.name,
      authorImage: COMMUNITY_MOCK_AUTHOR.image,
      authorRole: COMMUNITY_MOCK_AUTHOR.role,
      content:
        '저도 지금은 데이터베이스보다 운영체제부터 다시 잡는 쪽으로 기울고 있습니다. 비슷한 루틴 하신 분 더 있으면 듣고 싶어요.',
      createdAt: '28분 전',
      isAuthor: true,
      likeCount: 1,
    }),
    createComment({
      id: 104,
      authorName: MENTOR_COMMENT_AUTHOR.name,
      authorImage: MENTOR_COMMENT_AUTHOR.image,
      authorRole: MENTOR_COMMENT_AUTHOR.role,
      content:
        '순서보다도 답변 밀도를 먼저 맞추는 게 중요합니다. 한 주제당 1분 안에 설명할 문장을 먼저 고정해두세요.',
      createdAt: '15분 전',
      likeCount: 5,
    }),
  ],
  2: [
    createComment({
      id: 201,
      authorName: NEWCOMER_COMMENT_AUTHOR.name,
      authorImage: NEWCOMER_COMMENT_AUTHOR.image,
      authorRole: NEWCOMER_COMMENT_AUTHOR.role,
      content:
        '21일 연속 정말 대단하네요. 포트폴리오 메인 구조를 어떤 순서로 정리하셨는지 더 궁금합니다.',
      createdAt: '3시간 전',
      likeCount: 4,
    }),
    createComment({
      id: 202,
      authorName: COMMUNITY_MOCK_AUTHOR.name,
      authorImage: COMMUNITY_MOCK_AUTHOR.image,
      authorRole: COMMUNITY_MOCK_AUTHOR.role,
      content:
        '소개-문제-해결-결과 순서로 다시 잡았다는 부분이 특히 좋았습니다. 저도 이번 주에 같은 구조로 바꿔보려고요.',
      createdAt: '2시간 전',
      isAuthor: true,
      likeCount: 2,
    }),
  ],
  3: [
    createComment({
      id: 301,
      authorName: DEVELOPER_COMMENT_AUTHOR.name,
      authorImage: DEVELOPER_COMMENT_AUTHOR.image,
      authorRole: DEVELOPER_COMMENT_AUTHOR.role,
      content:
        'page에 비즈니스 로직이 붙기 시작하면 리뷰 포인트가 섞여서 힘들어지더라고요. feature client entry로 분리하는 데 공감합니다.',
      createdAt: '22시간 전',
      likeCount: 6,
    }),
    createComment({
      id: 302,
      authorName: COMMUNITY_MOCK_AUTHOR.name,
      authorImage: COMMUNITY_MOCK_AUTHOR.image,
      authorRole: COMMUNITY_MOCK_AUTHOR.role,
      content:
        '저도 page에서 데이터를 다 들고 있는 구조를 자주 만들었는데, 이 글 보고 어디서 경계를 끊어야 할지 감이 왔습니다.',
      createdAt: '20시간 전',
      isAuthor: true,
      isEdited: true,
      likeCount: 3,
    }),
  ],
  4: [
    createComment({
      id: 401,
      authorName: DEVELOPER_COMMENT_AUTHOR.name,
      authorImage: DEVELOPER_COMMENT_AUTHOR.image,
      authorRole: DEVELOPER_COMMENT_AUTHOR.role,
      content:
        '주 3회 고정이 오히려 오래 갑니다. 한 번에 욕심내면 프로젝트보다 일정이 먼저 무너지더라고요.',
      createdAt: '21시간 전',
      likeCount: 3,
    }),
    createComment({
      id: 402,
      authorName: COMMUNITY_MOCK_AUTHOR.name,
      authorImage: COMMUNITY_MOCK_AUTHOR.image,
      authorRole: COMMUNITY_MOCK_AUTHOR.role,
      content:
        '저도 주 5일을 채우려고 하다가 계속 끊겼어요. 차라리 고정 요일을 잡는 쪽으로 바꿔봐야겠습니다.',
      createdAt: '18시간 전',
      isAuthor: true,
      likeCount: 1,
    }),
  ],
  5: [
    createComment({
      id: 501,
      authorName: MENTOR_COMMENT_AUTHOR.name,
      authorImage: MENTOR_COMMENT_AUTHOR.image,
      authorRole: MENTOR_COMMENT_AUTHOR.role,
      content:
        'RAG는 검색 품질보다 삭제와 갱신 경계를 먼저 잡아야 한다는 말에 동의합니다. 운영 단계에서 제일 크게 터지는 부분이죠.',
      createdAt: '2일 전',
      likeCount: 8,
    }),
    createComment({
      id: 502,
      authorName: COMMUNITY_MOCK_AUTHOR.name,
      authorImage: COMMUNITY_MOCK_AUTHOR.image,
      authorRole: COMMUNITY_MOCK_AUTHOR.role,
      content:
        'source of truth와 캐시 폐기 순서를 같이 점검해야 한다는 부분이 인상적이었습니다.',
      createdAt: '2일 전',
      isAuthor: true,
      likeCount: 3,
    }),
  ],
  6: [
    createComment({
      id: 601,
      authorName: NEWCOMER_COMMENT_AUTHOR.name,
      authorImage: NEWCOMER_COMMENT_AUTHOR.image,
      authorRole: NEWCOMER_COMMENT_AUTHOR.role,
      content:
        '주간 리듬 유지에 집중했다는 말이 좋네요. 저도 큰 목표보다 작은 체크포인트로 가야겠어요.',
      createdAt: '2일 전',
      likeCount: 2,
    }),
  ],
  7: [
    createComment({
      id: 701,
      authorName: COMMUNITY_MOCK_AUTHOR.name,
      authorImage: COMMUNITY_MOCK_AUTHOR.image,
      authorRole: COMMUNITY_MOCK_AUTHOR.role,
      content:
        '오답 이유까지 한 줄로 적어두면 다음에 다시 봤을 때 훨씬 빨리 떠오르더라고요.',
      createdAt: '3일 전',
      isAuthor: true,
      likeCount: 2,
    }),
    createComment({
      id: 702,
      authorName: DEVELOPER_COMMENT_AUTHOR.name,
      authorImage: DEVELOPER_COMMENT_AUTHOR.image,
      authorRole: DEVELOPER_COMMENT_AUTHOR.role,
      content:
        '저는 시간 많이 쓰는 오답만 기록합니다. 모든 문제를 다 적기 시작하면 금방 지치더라고요.',
      createdAt: '3일 전',
      likeCount: 5,
    }),
  ],
  8: [
    createComment({
      id: 801,
      authorName: MENTOR_COMMENT_AUTHOR.name,
      authorImage: MENTOR_COMMENT_AUTHOR.image,
      authorRole: MENTOR_COMMENT_AUTHOR.role,
      content:
        '문제 정의부터 쓰면 면접 질문이 더 구체적으로 들어온다는 부분이 실무적으로 좋네요.',
      createdAt: '3일 전',
      likeCount: 4,
    }),
    createComment({
      id: 802,
      authorName: COMMUNITY_MOCK_AUTHOR.name,
      authorImage: COMMUNITY_MOCK_AUTHOR.image,
      authorRole: COMMUNITY_MOCK_AUTHOR.role,
      content:
        '기능 설명부터 쓰면 오히려 질문이 산으로 가는 경우가 많았는데, 이 구조가 더 선명한 것 같습니다.',
      createdAt: '3일 전',
      isAuthor: true,
      likeCount: 2,
    }),
  ],
};

export const getCommunityMockPostById = (postId: number) =>
  COMMUNITY_POSTS.find((post) => post.id === postId);

export const getCommunityMockCommentsByPostId = (
  postId: number,
): readonly CommunityComment[] => COMMUNITY_POST_COMMENTS[postId] ?? [];
