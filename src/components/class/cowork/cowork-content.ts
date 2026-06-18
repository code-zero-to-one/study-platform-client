// Cowork 상세 랜딩 정적 콘텐츠 (Figma: 클래스 > cowork 상세랜딩 3338:8519).
// 마케팅 정적 페이지 — API 없음. 문구 변경은 Figma 기준으로 이 파일만 수정.

export const COWORK_START_HREF = '/class/claude-cowork-intro';

/** Pain Point — 직무별 반복 업무 카드 */
export const PAIN_POINTS = [
  {
    role: '마케터',
    body: '매주 GA·광고·SNS 지표 따로 긁어 리포트 만들고,\n캠페인 끝날 때마다 반나절 날려요',
    tags: ['#리포트', '#캠페인분석', '#데이터취합'],
  },
  {
    role: '인사담당자',
    body: '채용 공고, 이력서 검토, 온보딩 자료까지 매번\n새 문서로 처음부터 다시 써요',
    tags: ['#채용공고', '#이력서검토', '#온보딩'],
  },
  {
    role: '경영·기획',
    body: '회의록 쓰고 액션아이템 뽑느라 회의 끝나도\n일이 안 끝나요',
    tags: ['#회의록', '#보고서취합', '#액션아이템'],
  },
  {
    role: '콘텐츠 크리에이터',
    body: '기획안부터 채널별 변환까지, 매번 처음부터\n포맷 잡는 데 시간을 많이 써요',
    tags: ['#기획안', '#콘텐츠변환', '#포맷팅'],
  },
] as const;

/** Before / After — 같은 업무, 달라지는 결과 */
export const BEFORE_AFTER = [
  {
    before: '보고서 취합에 매주 2시간',
    after: '3분, 프롬프트 한 줄로 초안 완성',
  },
  { before: '회의록 정리하다 야근 +1시간', after: '액션아이템까지 자동 추출' },
  {
    before: '포맷 맞추는 데만 매번 30분',
    after: '스킬 한 번 설정으로 영구 자동 적용',
  },
  {
    before: '채널별 변환에 채널당 20분씩',
    after: '한 번에 모든 포맷 자동 변환',
  },
] as const;

export const BEFORE_AFTER_STATS = [
  { label: '작업시간 단축', value: '88%' },
  { label: '연간 회수 시간', value: '100h+' },
  { label: '주간 보고서', value: '2h → 5min' },
] as const;

/** Difference — 다른 코스와 다른 이유 */
export const DIFFERENCES = [
  {
    title: 'Anthropic 공식 커리큘럼 기반',
    body: "검증된 내용이라 신뢰할 수 있어요.\n'Introduction to Claude Cowork'를 토대로,\n실제로 검증된 방식 그대로 배웁니다.",
  },
  {
    title: '보는 코스가 아니라 하는 코스',
    body: '텍스트 강의만 보고 끝나는 게 아니라,\n직접 만들고 제출해야 다음 레슨이 열려요.\n끝까지 따라오면, 손에 결과물이 남습니다.',
  },
  {
    title: '입문자 전용 한국어',
    body: '개발자를 위한 코스가 아니에요.\n문서와 데이터를 매일 다루는 직장인의 눈높이에 맞춰,\n한국어로 차근차근 설명합니다.',
  },
  {
    title: '완전 무료',
    body: '카드 등록도 필요 없어요.\n시작하는 데 잃을 게 없습니다.\nCh1까지는 누구나 무료로 경험할 수 있어요.',
  },
] as const;

/** Curriculum — 4챕터 10레슨 */
export const CURRICULUM = [
  {
    chapter: 'Chapter 01. 왜 위임인가 - 이해와 준비',
    badge: '무료',
    badgeTone: 'free' as const,
    summary:
      'Cowork가 뭔지,\n왜 "일을 시킨다"가 게임체인저인지 이해하고,\n맡길 업무를 골라 작업실을 차려요.',
    lessons: [
      'L01 (무료) 왜 내 일을 AI에게 시켜야 하는가',
      'L02 (무료) 대화가 아니라 업무 위임 - Chat·Cowork·Code 구분',
      'L03 (무료, 마지막) 작업실 차리기 - Claude Desktop·폴더·커넥터',
    ],
  },
  {
    chapter: 'Chapter 02. 본격 위임 - Pro로 첫 작업',
    badge: 'Pro 필요',
    badgeTone: 'pro' as const,
    summary:
      '처음으로 Cowork에 맡겨 진짜 결과물\n파일을 손에 쥐고, 잘 되는 작업을\n자동 반복으로 만들어요',
    lessons: [
      'L04 (Pro) 첫 업무 위임 시키기 - Cowork 사용해보기',
      'L05 (Pro) 내 업무가 자고 일어나면 끝나 있다? - 예약 작업',
    ],
  },
  {
    chapter: 'Chapter 03. 더 잘 쓰기 - 내 것으로',
    badge: 'Pro 필요',
    badgeTone: 'pro' as const,
    summary:
      'Cowork가 나와 내 업무를 기억하고,\n내 반복 프로세스를 박제하고,\n화면 밖 웹·오피스까지 손을 뻗어요.',
    lessons: [
      'L06 (Pro) Cowork가 나를 기억하도록 - Global Instructions & Projects',
      'L07 (Pro) Cowork가 내 스타일대로 일하게 - Skill & Plugin',
      'L08 (Pro) Cowork를 Excel/Word/PPT로 - 오피스(M365) & Claude in Chrome',
    ],
  },
  {
    chapter: 'Chapter 04. 책임감 있게 & 다음 여정',
    badge: 'Pro 필요',
    badgeTone: 'pro' as const,
    summary:
      '안전하게 맡기는 법을 익히고,\n코스를 회고한 뒤 다음 여정을 안내해요.',
    lessons: [
      'L09 (Pro) 안심하고 일 맡기기 - Cowork 안전하게 쓰는 법',
      'L10 (Pro) 회고와 다음 여정 - 정리·단어 사전·후속 트랙',
    ],
  },
] as const;

/** Result — 직무별 결과물 */
export const RESULTS = [
  { role: '마케터', output: '자동 정리되는 캠페인 성과 리포트' },
  { role: '경영·기획', output: '자동 정리되는 회의록 + 액션아이템' },
  { role: '인사담당자', output: '포지션별 자동 생성 채용 공고' },
  { role: '콘텐츠', output: '채널별 자동 변환된 콘텐츠' },
] as const;

/** Q&A */
export const FAQS = [
  {
    q: 'Q1. 진짜 코드 한 줄도 안 치나요?',
    a: '네. 코드는 한 줄도 안 칩니다. 한국어로 "이 폴더 훑어서 주간 보고서 초안 만들어줘"처럼 일을 시키는 게 전부예요.',
  },
  {
    q: 'Q2. 어떤 준비물이 필요한가요?',
    a: '노트북과 Claude Desktop 앱이면 시작할 수 있어요. Ch1(무료 구간)은 Pro 없이 완주됩니다. Ch2부터는 Claude Pro가 필요해요.',
  },
  {
    q: 'Q3. 정말 무료인가요?',
    a: 'Ch1까지는 100% 무료예요. 카드 등록도 필요 없어요. 직접 작업실을 차리고 맡길 업무까지 골라보는 데까지 무료로 따라올 수 있어요.',
  },
  {
    q: 'Q4. Claude Pro가 꼭 필요한가요?',
    a: 'Ch2부터 실제로 업무를 맡기려면 Claude Pro가 필요해요. Pro 하나면 Cowork뿐 아니라 Claude Code까지 다 열려요.',
  },
  {
    q: 'Q5. 내 파일을 AI가 다 보는 거 아니에요?',
    a: '아니에요. Cowork는 여러분이 지정한 작은 전용 폴더 안에서만 일해요. 파일 지우기 전엔 항상 먼저 물어봐요.',
  },
  {
    q: 'Q6. 바이브코딩 입문자 코스와 뭐가 달라요?',
    a: '바이브코딩은 "내 웹사이트를 만들어 배포"하는 코스고, Cowork는 "내 반복 업무를 AI에게 맡겨 자동화"하는 코스예요.',
  },
] as const;
