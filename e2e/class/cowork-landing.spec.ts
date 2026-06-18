import { test, expect } from '@playwright/test';

// 코워크 상세 랜딩(/class/claude-cowork)은 완전 정적 — API 0개, 인증 불필요.
// (landing) 그룹 = public(미들웨어 미차단). 신규 라우트라 로컬 서버 대상 실행 필요.
// 실행: E2E_BASE_URL=http://localhost:3000 yarn e2e cowork-landing

const COWORK_PATH = '/class/claude-cowork';
const START_HREF = '/class/vibe-intro-claude-code';

test.describe('코워크 랜딩 — 비로그인 UI', () => {
  // 명시적 비인증 — 저장된 세션 무시(e2e-testing.md 컨벤션).
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto(COWORK_PATH, { waitUntil: 'load' });
  });

  test('Hero h1 "코딩없이 AI한테 일 맡기는 방법" 노출', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: '코딩없이 AI한테 일 맡기는 방법',
      }),
    ).toBeVisible({ timeout: 5000 });
  });

  test('핵심 섹션 문자열 노출 — result 제목 · 커리큘럼 Ch01', async ({
    page,
  }) => {
    await expect(
      page.getByText('코스가 끝나면, 자동화는 더 이상 어렵지 않아요'),
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText('Chapter 01. 왜 위임인가 - 이해와 준비'),
    ).toBeVisible();
  });

  test('FAQ 항목 클릭 → 답변 펼쳐짐', async ({ page }) => {
    // Q1은 기본 펼침(openIndex=0) → 닫혀 있는 Q2로 아코디언 동작 검증.
    const q2 = page.getByRole('button', { name: /Q2\. 어떤 준비물이/ });
    await expect(q2).toBeVisible({ timeout: 5000 });
    await q2.click();
    await expect(
      page.getByText('노트북과 Claude Desktop 앱이면 시작할 수 있어요', {
        exact: false,
      }),
    ).toBeVisible();
  });

  test('Sticky CTA "바로 시작하기" → href /class/vibe-intro-claude-code', async ({
    page,
  }) => {
    const cta = page.getByRole('link', { name: '바로 시작하기' });
    await expect(cta).toBeVisible({ timeout: 5000 });
    expect(await cta.getAttribute('href')).toBe(START_HREF);
  });

  test('모바일 뷰포트(375px) — Hero + CTA 노출(반응형)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(COWORK_PATH, { waitUntil: 'load' });

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: '코딩없이 AI한테 일 맡기는 방법',
      }),
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByRole('link', { name: '바로 시작하기' }),
    ).toBeVisible();
  });
});
