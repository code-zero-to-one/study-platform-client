import { test, expect, type BrowserContext } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import {
  openCreateModal,
  openPremiumStudyModal,
  fillStep1,
  fillStep2,
  fillStep3,
  assertCreationSuccess,
  mockThumbnailUpload,
  API_BASE,
} from '../support/study-helpers';

const AUTH_FILE = 'e2e/fixtures/auth.json';

interface AuthCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

async function injectAuthCookies(
  context: BrowserContext,
  baseURL: string | undefined,
) {
  if (!existsSync(AUTH_FILE)) return;
  const { cookies } = JSON.parse(readFileSync(AUTH_FILE, 'utf-8')) as {
    cookies: AuthCookie[];
  };
  if (baseURL?.startsWith('http://localhost')) {
    await context.addCookies(
      cookies.map((c) => ({ ...c, domain: 'localhost', secure: false })),
    );
  } else {
    const tokenCookie = cookies.find((c) => c.name === 'accessToken');
    if (tokenCookie && baseURL) {
      await context.addCookies([
        {
          ...tokenCookie,
          domain: new URL(baseURL).hostname,
          expires: Math.floor(Date.now() / 1000) + 3600,
        },
      ]);
    }
  }
}

// ── 그룹스터디 개설 ──────────────────────────────────────────────
test.describe('그룹스터디 개설 @auth', () => {
  let createdStudyId: number | null = null;

  test.beforeEach(async ({ page, context, baseURL }) => {
    await injectAuthCookies(context, baseURL);
    await mockThumbnailUpload(page);
  });

  test.afterEach(async ({ request }) => {
    const idToDelete = createdStudyId; // ① 로컬에 캡처
    createdStudyId = null; // ② 동기적으로 즉시 초기화 (require-atomic-updates 해결)
    if (idToDelete !== null) {
      try {
        await request.delete(`${API_BASE}/api/v1/group-studies/${idToDelete}`);
      } catch {
        // best-effort: 이미 삭제됐거나 권한 없는 경우 무시
      }
    }
  });

  test('3단계 위저드 전체 플로우 — 제출 성공', async ({ page }) => {
    await openCreateModal(page);
    await fillStep1(page, 'PROJECT');
    await page.getByRole('button', { name: '다음' }).click();

    const title = `[E2E] 그룹스터디 ${Date.now()}`;
    await fillStep2(page, title);
    await page.getByRole('button', { name: '다음' }).click();

    await fillStep3(page);

    // 제출 클릭과 동시에 생성 API 응답을 캡처해 groupStudyId 확보
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('group-studies') &&
          res.request().method() === 'POST',
        { timeout: 15000 },
      ),
      page.getByRole('button', { name: '제출' }).click(),
    ]);

    try {
      const body = await response.json();
      createdStudyId = body?.content?.groupStudyId ?? body?.content?.id ?? null;
    } catch {
      throw new Error('Failed to parse JSON response');
    }

    await assertCreationSuccess(
      page,
      title,
      '그룹 스터디 개설이 완료되었습니다.',
    );
  });

  test('빈 폼 — 다음 버튼 비활성화 확인', async ({ page }) => {
    await openCreateModal(page);
    await expect(page.getByRole('button', { name: '다음' })).toBeDisabled();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });
});

// ── 멘토스터디 개설 ──────────────────────────────────────────────
test.describe('멘토스터디 개설 @auth', () => {
  let createdStudyId: number | null = null;

  test.beforeEach(async ({ page, context, baseURL }) => {
    await injectAuthCookies(context, baseURL);
    await mockThumbnailUpload(page);
  });

  test.afterEach(async ({ request }) => {
    const idToDelete = createdStudyId;
    createdStudyId = null;
    if (idToDelete !== null) {
      try {
        await request.delete(`${API_BASE}/api/v1/group-studies/${idToDelete}`);
      } catch {
        // best-effort: 이미 삭제됐거나 권한 없는 경우 무시
      }
    }
  });

  test('PREMIUM_STUDY 가격 필드 포함 전체 제출', async ({ page }) => {
    await openPremiumStudyModal(page);
    await fillStep1(page);

    const priceInput = page.getByPlaceholder('10,000');
    await priceInput.fill('50000');

    await page.getByRole('button', { name: '다음' }).click();

    const title = `[E2E] 멘토스터디 ${Date.now()}`;
    await fillStep2(page, title);
    await page.getByRole('button', { name: '다음' }).click();

    await fillStep3(page);

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('group-studies') &&
          res.request().method() === 'POST',
        { timeout: 15000 },
      ),
      page.getByRole('button', { name: '제출' }).click(),
    ]);

    try {
      const body = await response.json();
      createdStudyId = body?.content?.groupStudyId ?? body?.content?.id ?? null;
    } catch {
      throw new Error('Failed to parse JSON response');
    }

    await assertCreationSuccess(
      page,
      title,
      '그룹 스터디 개설이 완료되었습니다.',
    );
  });
});

// ── 비로그인 UI ────────────────────────────────────────────────
test.describe('비로그인 UI', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('개설 버튼 미표시 확인', async ({ page }) => {
    await page.goto('/group-study', { waitUntil: 'load' });
    await page.waitForSelector('nav');

    await expect(
      page.getByRole('button', { name: '스터디 개설하기' }),
    ).toBeHidden({ timeout: 15000 });

    await expect(
      page.getByRole('button', { name: '로그인 / 회원가입' }).first(),
    ).toBeVisible();
  });
});
