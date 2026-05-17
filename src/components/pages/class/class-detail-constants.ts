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

export const TARGET_AUDIENCE = [
  {
    title: '코딩 쌩초보',
    desc: '코드 한 줄 몰라도 AI와 대화하며\n완성하는 첫 웹사이트',
  },
  {
    title: '기획자',
    desc: '개발자와의 소통 장벽을\n허무는 가장 빠른 방법',
  },
  {
    title: '디자이너',
    desc: '피그마 시안을 실제 움직이는\n웹으로 만드는 경험',
  },
  {
    title: '바이브 코딩 관심자',
    desc: "AI와 함께라면 5일 만에\n첫 배포까지 '무조건' 성공",
  },
  {
    title: '1인 창업가',
    desc: '외주 없이 내 손으로\n직접 만드는 랜딩페이지',
  },
  {
    title: '직장인',
    desc: '퇴근 후 1시간, 나만의\n기술 자산을 쌓는 짜릿한 성취감',
  },
];

export const TEAM_MESSAGES = [
  {
    team: 'ZERO-ONE 기획팀',
    heading: '"바이브 코딩, 해보고 싶은데 뭐부터 해야 할지 모르겠다"',
    body: 'ZERO-ONE 바이브코딩 입문자 클래스는\n그 질문에서부터 시작했어요.',
  },
  {
    team: 'ZERO-ONE 엔지니어링팀',
    heading: '코스를 따라만 가도 바이브 코딩을 할 수 있게끔 고민했어요.',
    body: '우리도 처음엔 까만 터미널 앞에서 얼어붙었던 사람들이었어요.\n그때 겪은 시행착오를 압축해서 이 코스에 담았습니다.',
  },
  {
    team: 'ZERO-ONE 운영팀',
    heading: '혼자가 아닌 디스코드에서 함께 공부하며 동기부여 받아요.',
    body: '입문자분들을 위해 디스코드에서 모여 공부하는 시스템으로\n함께의 가치를 드리고 싶습니다.',
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
