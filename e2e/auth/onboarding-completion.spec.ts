import { test, expect, type Page } from '@playwright/test';

// 온보딩 완료모달 목표기반 추천 CTA 검증.
// OAuth 우회 — 4개 엔드포인트를 page.route로 목킹해 모달 플로우를 구동(인증 세션 불필요).
// 신규 분기 로직(completion-recommendation.ts)이 staging 미배포 → 로컬 서버 대상 실행 필요.
// 실행: E2E_BASE_URL=http://localhost:3000 yarn e2e onboarding-completion
//
// 분기(step3 목표 → CTA): 업무자동화 > 수익화 > 기본(그 외)
//   업무 자동화 도구          → /class/claude-cowork
//   수익화 서비스(창업, 부업) → /class/vibe-intro-claude-code
//   그 외(내 포트폴리오 등)   → /class/vibe-intro-claude-code

const ONBOARDING_PATH = '/class?onboarding=true';

// ─── Route Mocks ────────────────────────────────────────────────────────────

// 모든 요청은 origin 무관 — path 기준 substring 정규식으로 매칭.
async function mockOnboardingApis(page: Page): Promise<void> {
  await page.route(/\/nicknames\/check/, (route) =>
    route.fulfill({ json: { content: { available: true } } }),
  );
  await page.route(/\/careers(\?|$)/, (route) =>
    route.fulfill({
      json: { content: [{ career: 'STUDENT', description: '학생' }] },
    }),
  );
  await page.route(/\/jobs(\?|$)/, (route) =>
    route.fulfill({
      json: { content: [{ job: 'OFFICE_WORKER', description: '직장인' }] },
    }),
  );
  await page.route(
    /\/members(\?|$)/,
    (route) =>
      route.fulfill({
        json: { content: { accessToken: 'e2e-token', uploadUrl: null } },
      }),
    { times: 1 },
  );
}

// step1~3 공통 구동 → step4(완료) 화면 진입.
async function driveToCompletion(page: Page, goalLabel: string): Promise<void> {
  await mockOnboardingApis(page);
  await page.goto(ONBOARDING_PATH, { waitUntil: 'load' });

  // ── step1: 닉네임 + 약관 + 경력 ──
  const nicknameInput = page.getByLabel('닉네임');
  await expect(nicknameInput).toBeVisible({ timeout: 10000 });
  await nicknameInput.fill('테스트빌더');
  await page.getByRole('button', { name: '중복확인' }).click();
  await expect(page.getByText('사용 가능한 닉네임이에요')).toBeVisible({
    timeout: 5000,
  });
  await page.getByRole('button', { name: '[필수] 이용약관 동의' }).click();
  await page
    .getByRole('button', { name: '[필수] 개인정보 처리방침 동의' })
    .click();
  await page.getByRole('button', { name: '학생' }).click();
  await page.getByRole('button', { name: '다음' }).click();

  // ── step2: 직무 + 경력 ──
  await page.getByRole('button', { name: '직장인' }).click();
  await page.getByRole('button', { name: '학생' }).click();
  await page.getByRole('button', { name: '다음' }).click();

  // ── step3: 목표 ──
  await page.getByRole('button', { name: goalLabel, exact: true }).click();
  await page.getByRole('button', { name: '다음' }).click();
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('온보딩 완료모달 추천 CTA', () => {
  // 인증 세션 불필요 → @auth 태그 없음(CI에서도 실행).
  test.use({ storageState: { cookies: [], origins: [] } });

  test('목표 "업무 자동화 도구" → Cowork 코스 추천 + /class/claude-cowork 이동', async ({
    page,
  }) => {
    await driveToCompletion(page, '업무 자동화 도구');

    await expect(
      page.getByText('Cowork 입문자 코스를 추천드려요!'),
    ).toBeVisible({ timeout: 5000 });
    const cta = page.getByRole('button', {
      name: 'Cowork 입문자 코스 둘러보기',
    });
    await expect(cta).toBeVisible();

    await Promise.all([
      page.waitForResponse(
        (r) =>
          /\/members(\?|$)/.test(r.url()) && r.request().method() === 'POST',
      ),
      cta.click(),
    ]);
    await page.waitForURL('**/class/claude-cowork', { timeout: 5000 });
  });

  test('목표 "수익화 서비스(창업, 부업)" → 수익화 트랙 준비중 + /class/vibe-intro-claude-code 이동', async ({
    page,
  }) => {
    await driveToCompletion(page, '수익화 서비스(창업, 부업)');

    await expect(
      page.getByText('ZERO-ONE에서 바이브 코딩 수익화 트랙을 준비하고 있어요.'),
    ).toBeVisible({ timeout: 5000 });
    await page
      .getByRole('button', { name: '바이브 코딩 입문자 코스 둘러보기' })
      .click();
    await page.waitForURL('**/class/vibe-intro-claude-code', { timeout: 5000 });
  });

  test('목표 "내 포트폴리오 사이트"(기본) → 바이브 코딩 입문자 추천 + /class/vibe-intro-claude-code 이동', async ({
    page,
  }) => {
    await driveToCompletion(page, '내 포트폴리오 사이트');

    await expect(
      page.getByText('바이브 코딩 입문자 코스를 추천드려요!'),
    ).toBeVisible({ timeout: 5000 });
    await page
      .getByRole('button', { name: '바이브 코딩 입문자 코스 둘러보기' })
      .click();
    await page.waitForURL('**/class/vibe-intro-claude-code', { timeout: 5000 });
  });
});
