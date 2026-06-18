export type Tab =
  | 'roadmap'
  | 'builder-feed'
  | 'curriculum'
  | 'benefits'
  | 'faq';

export const TABS: { id: Tab; label: string }[] = [
  { id: 'roadmap', label: '로드맵 소개' },
  { id: 'builder-feed', label: '빌더 피드' },
  { id: 'curriculum', label: '커리큘럼' },
  { id: 'benefits', label: '혜택' },
  { id: 'faq', label: 'FAQ' },
];

export const INTRO_STATS: { value: string; unit?: string; label: string }[] = [
  { value: '10', unit: '일', label: '소요 일자' },
  { value: '10', unit: '개', label: '레슨 수량' },
  { value: '입문자', label: '난이도' },
  { value: '1~2', unit: '시간', label: '하루 평균 학습 시간' },
];

export type TargetAudienceIcon =
  | 'code'
  | 'rocket'
  | 'palette'
  | 'clipboard'
  | 'bulb'
  | 'briefcase';

export const TARGET_AUDIENCE: {
  title: string;
  desc: string;
  icon: TargetAudienceIcon;
  badgeClass: string;
}[] = [
  {
    title: '코딩 쌩초보',
    desc: '코드 한 줄 몰라도 AI와 대화하며\n완성하는 첫 웹사이트',
    icon: 'code',
    badgeClass: 'bg-rose-300',
  },
  {
    title: '바이브 코딩 관심자',
    desc: "AI와 함께라면 5일 만에\n첫 배포까지 '무조건' 성공",
    icon: 'rocket',
    badgeClass: 'bg-[#f8c84c]',
  },
  {
    title: '디자이너',
    desc: '피그마 시안을 실제 움직이는\n웹으로 만드는 경험',
    icon: 'palette',
    badgeClass: 'bg-[#feae70]',
  },
  {
    title: '기획자/마케터',
    desc: '개발자와의 소통 장벽을\n허무는 가장 빠른 방법',
    icon: 'clipboard',
    badgeClass: 'bg-[#92cd51]',
  },
  {
    title: '1인 창업가',
    desc: '외주 없이 내 손으로 직접 만드는\n랜딩페이지',
    icon: 'bulb',
    badgeClass: 'bg-[#7db1ec]',
  },
  {
    title: '직장인',
    desc: '퇴근 후 1시간, 나만의 기술 자산을\n쌓는 짜릿한 성취감',
    icon: 'briefcase',
    badgeClass: 'bg-[#9986ea]',
  },
];

export const INTRO_RESULTS: {
  category: string;
  duration: string;
  title: string;
}[] = [
  { category: '디자이너', duration: '3일', title: '포트폴리오 사이트' },
  { category: '디자이너', duration: '3일', title: '포트폴리오 사이트' },
  { category: '디자이너', duration: '3일', title: '포트폴리오 사이트' },
  { category: '디자이너', duration: '3일', title: '포트폴리오 사이트' },
];

export const INTRO_BEFORE_ITEMS = [
  '무엇을 어떻게 만들지 방법을 모름',
  'GPT, Claude한테 물어봐도 결국 안 됨',
  '포트폴리오 = PDF,노션',
  '막히면 혼자 검색하다 포기',
];

export const INTRO_AFTER_ITEMS: { normal: string; bold: string }[] = [
  { normal: '아이디어를 ', bold: '직접 만들어 테스트' },
  { normal: 'AI 부려서 ', bold: '실제 웹 완성' },
  { normal: '포트폴리오 = ', bold: '내가 배포한 URL' },
  { normal: '막힐시 운영진에게 ', bold: '질문으로 해결' },
];

export const DIFF_COLUMNS = ['ZERO-ONE', 'A 경쟁사', 'B 경쟁사', 'C 경쟁사'];

export const DIFF_ROWS: { label: string; values: boolean[] }[] = [
  {
    label: '핵심 개념을 why 기반으로 체화',
    values: [true, false, false, false],
  },
  {
    label: '데일리 러닝메이트 알림톡 시스템',
    values: [true, false, false, false],
  },
  {
    label: '결과를 만드는 3중 학습 구조',
    values: [true, false, false, false],
  },
  {
    label: '빌더 간 상호 팔로우/피드백',
    values: [true, false, false, false],
  },
];

export interface DiffStep {
  step: string;
  label: string;
  desc: string;
  pillClass: string;
  textClass: string;
  badgeClass: string;
}

export const DIFF_STEPS: DiffStep[] = [
  {
    step: 'STEP 01',
    label: '학습',
    desc: '개념 이해하기',
    pillClass: 'bg-rose-200',
    textClass: 'text-rose-500',
    badgeClass: 'bg-rose-500',
  },
  {
    step: 'STEP 02',
    label: '실습',
    desc: '따라하며 직접 만들기',
    pillClass: 'bg-mint-50',
    textClass: 'text-[#009f75]',
    badgeClass: 'bg-[#00c9a7]',
  },
  {
    step: 'STEP 03',
    label: '피드백',
    desc: '오늘 발견한 것 기록',
    pillClass: 'bg-blue-100',
    textClass: 'text-blue-600',
    badgeClass: 'bg-blue-500',
  },
];

export interface RoadmapStep {
  label: string;
  title: string;
  desc: string;
  activeBgClass: string;
}

export const ROADMAP_STEPS: RoadmapStep[] = [
  {
    label: '학습',
    title: '탄탄한 기본기 다지기\n핵심을 꿰뚫는 레슨\nCore Concept',
    desc: '단순히 따라 치는 것을 넘어\n원리를 이해하는 과정.\n핵심 개념부터 명확하게 짚고\n넘어가며 진짜 실력의 기반을\n다집니다.',
    activeBgClass: 'bg-[#eff8ff]',
  },
  {
    label: '실습',
    title: '손으로 익히는 실전 감각\n바로 만들어보는 실습\nHands-on Practice',
    desc: '배운 개념을 즉시 코드로.\n직접 만들어보며 손에\n익히는 과정. 막히는 부분은\n그때그때 해결하며 진짜\n실력으로 굳힙니다.',
    activeBgClass: 'bg-[#ddf6f1]',
  },
  {
    label: '피드백',
    title: '성장을 가속하는 피드백\n혼자가 아닌 함께\nFeedback Loop',
    desc: '만든 결과물에 대한\n구체적인 피드백.\n빌더들과 서로의 코드를\n보며 더 나은 방향을\n함께 찾아갑니다.',
    activeBgClass: 'bg-[#ebe9fe]',
  },
  {
    label: '배포',
    title: '세상에 선보이는 순간\n나만의 결과물 배포\nDeploy & Ship',
    desc: '내가 만든 웹사이트를\n진짜 인터넷에 공개.\n포트폴리오가 되는 URL을\n손에 쥐고 다음 단계로\n나아갑니다.',
    activeBgClass: 'bg-[#ffe4e8]',
  },
];

export interface InstructorTeam {
  script: string;
  intro?: string;
  heading: string;
  outro: string;
  team: string;
  image: string;
  bgClass: string;
  headingClass: string;
  roundedClass: string;
  imageSide: 'left' | 'right';
}

export const INSTRUCTOR_TEAMS: InstructorTeam[] = [
  {
    script: 'Define the Vision',
    intro: 'ZERO-ONE 바이브코딩 입문자 클래스는',
    heading: '"바이브 코딩, 해보고 싶은데\n뭐부터 해야 할지 모르겠다"',
    outro: '는 질문에서부터 시작했어요.',
    team: 'ZERO-ONE 기획팀',
    image: '/class/기획팀.png',
    bgClass: 'bg-mint-50',
    headingClass: 'text-[#009f75]',
    roundedClass: 'rounded-750',
    imageSide: 'left',
  },
  {
    script: 'Build the Product',
    heading: '코스를 따라만 가도 바이브 코딩을\n할 수 있게끔 고민했어요.',
    outro:
      '우리도 처음엔 까만 터미널 앞에서 얼어붙었던 사람들이었어요.\n그때 겪은 시행착오를 압축해서 이 코스에 담았습니다.',
    team: 'ZERO-ONE 엔지니어팀',
    image: '/class/개발팀.png',
    bgClass: 'bg-blue-50',
    headingClass: 'text-blue-600',
    roundedClass: 'rounded-500',
    imageSide: 'right',
  },
  {
    script: 'Run the System',
    heading: '혼자가 아닌 디스코드에서 함께 공부하며\n동기부여를 받아요.',
    outro:
      '입문자분들을 위해 디스코드에서 모여\n공부하는 시스템으로 함께의 가치를 드리고 싶습니다.',
    team: 'ZERO-ONE 운영팀',
    image: '/class/운영팀.png',
    bgClass: 'bg-purple-50',
    headingClass: 'text-purple-600',
    roundedClass: 'rounded-750',
    imageSide: 'left',
  },
];

export const CHAPTERS = [
  {
    num: '01',
    title: '바이브 코딩이란?',
    desc: '바이브 코딩이란 무엇인지, 왜 이걸 만드는 건지 과정을 알아가는 시간입니다.',
    lessons: ['가나다라마바사아자차카타파하', '가나다라마바사아자차카타파하'],
  },
  {
    num: '02',
    title: '바이브 코딩이란?',
    desc: '바이브 코딩이란 무엇인지, 왜 이걸 만드는 건지 과정을 알아가는 시간입니다.',
    lessons: [],
  },
  {
    num: '03',
    title: '바이브 코딩이란?',
    desc: '바이브 코딩이란 무엇인지, 왜 이걸 만드는 건지 과정을 알아가는 시간입니다.',
    lessons: [],
  },
];

export const FAQS = [
  {
    question: '코딩을 전혀 몰라도 들을 수 있나요?',
    answer:
      '네, 이 코스는 코딩 경험이 전혀 없는 분들을 위해 설계되었어요. 기초부터 차근차근 알려드립니다.',
  },
  {
    question: '수강 기간은 얼마나 되나요?',
    answer:
      '수강 기간은 별도 제한 없이 커리큘럼을 모두 완료할 때까지 자유롭게 학습하실 수 있어요.',
  },
  {
    question: '결제 후 환불이 가능한가요?',
    answer:
      '결제 후 7일 이내, 강의 진도율 20% 미만인 경우 전액 환불 가능합니다.',
  },
  {
    question: '강의는 어떤 방식으로 진행되나요?',
    answer:
      '영상 강의와 실습 과제를 병행하며, 디스코드를 통해 멘토와 다른 수강생들과 소통할 수 있어요.',
  },
  {
    question: '수료증이 발급되나요?',
    answer: '모든 강의를 완료하면 ZERO-ONE 수료증을 발급해 드립니다.',
  },
];
