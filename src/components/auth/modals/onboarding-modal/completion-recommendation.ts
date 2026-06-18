// 온보딩 완료 모달 코스 추천 분기.
// 관심분야(goals) 응답 → 추천 코스 variant 매핑 (Figma 온보딩_완료 모달 1·2·3).
// 우선순위: 업무 자동화(Cowork) > 수익화(준비중) > 입문자(기본).

export interface CompletionRecommendation {
  /** 추천 헤드라인 (코스 추천 문구 1줄째) */
  heading: string;
  /** 보조 설명 (코스 추천 문구 2줄째) */
  sub: string;
  /** CTA 버튼 라벨 */
  ctaLabel: string;
  /** CTA 이동 경로 (정적 라우트) */
  href: string;
}

/** Figma 완료 모달 1 — 바이브 코딩 입문자 코스 CTA (기본) */
const RECO_BEGINNER: CompletionRecommendation = {
  heading: '바이브 코딩 입문자 코스를 추천드려요!',
  sub: 'AI를 활용하여 나만의 웹사이트 제작 기본기를 다져보세요.',
  ctaLabel: '바이브 코딩 입문자 코스 둘러보기',
  href: '/class/vibe-intro-claude-code',
};

/** Figma 완료 모달 2 — Cowork 입문자 코스 CTA (업무 자동화 목표) */
const RECO_COWORK: CompletionRecommendation = {
  heading: 'Cowork 입문자 코스를 추천드려요!',
  sub: 'AI를 활용하여 나만의 업무 생산성을 확보할 기본기를 다져보세요.',
  ctaLabel: 'Cowork 입문자 코스 둘러보기',
  href: '/class/claude-cowork',
};

/** Figma 완료 모달 3 — 수익화 트랙 준비중 + 입문자 코스 먼저 (수익화 목표) */
const RECO_MONETIZATION: CompletionRecommendation = {
  heading: 'ZERO-ONE에서 바이브 코딩 수익화 트랙을 준비하고 있어요.',
  sub: '먼저 AI를 활용하여 나만의 웹사이트 제작 기본기를 다져보세요.',
  ctaLabel: '바이브 코딩 입문자 코스 둘러보기',
  href: '/class/vibe-intro-claude-code',
};

// step-3-goals.tsx GOAL_OPTIONS 키와 동일해야 함.
const GOAL_COWORK = '업무 자동화 도구';
const GOAL_MONETIZATION = '수익화 서비스(창업, 부업)';

export function resolveCompletionRecommendation(
  goals: string[],
): CompletionRecommendation {
  if (goals.includes(GOAL_COWORK)) return RECO_COWORK;
  if (goals.includes(GOAL_MONETIZATION)) return RECO_MONETIZATION;
  return RECO_BEGINNER;
}
