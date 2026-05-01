import { test, expect } from '@playwright/test';
import {
  openCreateModal,
  openPremiumStudyModal,
  fillStep1,
  fillStep2,
  fillStep3,
  assertCreationSuccess,
  API_BASE,
} from '../support/study-helpers';

// ── 그룹스터디 개설 ──────────────────────────────────────────────
test.describe('그룹스터디 개설 @auth', () => {
  let createdStudyId: number | null = null;

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

    const priceInput = page.getByLabel('참가비');
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
    await page.waitForTimeout(1500);

    await expect(
      page.getByRole('button', { name: '스터디 개설하기' }),
    ).toBeHidden({ timeout: 15000 });

    await expect(
      page.getByRole('button', { name: '로그인 / 회원가입' }).first(),
    ).toBeVisible();
  });
});
