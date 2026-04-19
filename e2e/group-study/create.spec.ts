import { test, expect } from '@playwright/test';
import {
  openCreateModal,
  openPremiumStudyModal,
  fillStep1,
  fillStep2,
  fillStep3,
  assertCreationSuccess,
} from '../support/study-helpers';

test.describe('그룹스터디 개설', () => {
  test('3단계 위저드 전체 플로우 — 제출 성공', async ({ page }) => {
    await openCreateModal(page);
    await fillStep1(page, 'PROJECT');
    await page.getByRole('button', { name: '다음' }).click();

    const title = `[E2E] 그룹스터디 ${Date.now()}`;
    await fillStep2(page, title);
    await page.getByRole('button', { name: '다음' }).click();

    await fillStep3(page);
    await page.getByRole('button', { name: '제출' }).click();

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

test.describe('멘토스터디 개설', () => {
  test('PREMIUM_STUDY 가격 필드 포함 전체 제출', async ({ page }) => {
    await openPremiumStudyModal(page);
    await fillStep1(page);

    const priceInput = page.locator(
      'input[name="price"], input[placeholder*="10,000"]',
    );
    if (await priceInput.isVisible().catch(() => false)) {
      await priceInput.fill('50000');
    }

    await page.getByRole('button', { name: '다음' }).click();

    const title = `[E2E] 멘토스터디 ${Date.now()}`;
    await fillStep2(page, title);
    await page.getByRole('button', { name: '다음' }).click();

    await fillStep3(page);
    await page.getByRole('button', { name: '제출' }).click();

    await assertCreationSuccess(
      page,
      title,
      '그룹 스터디 개설이 완료되었습니다.',
    );
  });
});

test.describe('비로그인 UI', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('개설 버튼 미표시 확인', async ({ page }) => {
    await page.goto('/group-study', { waitUntil: 'load' });
    await page.waitForSelector('nav');
    await page.waitForTimeout(1500);

    const btn = page.getByRole('button', { name: '스터디 개설하기' });
    await expect(btn).toBeHidden({ timeout: 15000 });

    await expect(
      page.getByRole('button', { name: '로그인 / 회원가입' }).first(),
    ).toBeVisible();
  });
});
