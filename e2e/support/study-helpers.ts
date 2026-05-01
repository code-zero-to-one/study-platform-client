import { expect, type Page } from '@playwright/test';

export function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function clickStudyCreateButton(page: Page) {
  const trigger = page.getByRole('button', { name: '스터디 개설하기' });
  await trigger.waitFor({ state: 'visible', timeout: 15000 });
  await trigger.click();
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
}

export async function openCreateModal(page: Page) {
  await page.goto('/group-study', { waitUntil: 'load' });
  await page.waitForSelector('nav', { timeout: 10000 });
  await clickStudyCreateButton(page);
}

export async function openPremiumStudyModal(page: Page) {
  await page.goto('/premium-study', { waitUntil: 'load' });
  await page.waitForSelector('nav', { timeout: 10000 });
  await clickStudyCreateButton(page);
}

type StudyType =
  | 'PROJECT'
  | 'MENTORING'
  | 'SEMINAR'
  | 'CHALLENGE'
  | 'BOOK_STUDY'
  | 'LECTURE_STUDY';

export async function fillStep1(page: Page, type: StudyType = 'PROJECT') {
  // Radio type: click associated label (id="study-type-${type}")
  await page.locator(`label[for="study-type-${type}"]`).click();

  // targetRoles — first [role="group"][aria-label="toggle-group"]
  await page
    .locator('[aria-label="toggle-group"]')
    .nth(0)
    .getByRole('button', { name: '백엔드' })
    .click();

  // maxMembersCount — SingleDropdown with placeholder "선택해주세요"
  await page.getByRole('button', { name: '선택해주세요' }).click();
  await page.getByRole('menuitem', { name: '5명', exact: true }).click();

  // experienceLevels — second toggle group
  await page
    .locator('[aria-label="toggle-group"]')
    .nth(1)
    .getByRole('button', { name: '주니어' })
    .click();

  // 진행 기간 — startDate and endDate
  await page.locator('input[type="date"]').nth(0).fill(addDays(7));
  await page.locator('input[type="date"]').nth(1).fill(addDays(42));
}

const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ' +
    'AAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

export async function fillStep2(page: Page, title: string) {
  await page.setInputFiles('input[type="file"]', {
    name: 'test-image.png',
    mimeType: 'image/png',
    buffer: PNG_1x1,
  });
  await page.locator('input[placeholder*="제목"]').fill(title);
  await page
    .locator('input[placeholder*="요약"], textarea[placeholder*="요약"]')
    .fill('E2E 자동화 테스트 스터디입니다.');
  const editor = page
    .locator('[contenteditable="true"], textarea[placeholder*="소개"]')
    .first();
  if (await editor.isVisible().catch(() => false)) {
    await editor.click();
    await editor.type('Playwright E2E 테스트용 스터디 소개입니다.');
  }
}

export async function fillStep3(page: Page) {
  const q = page.locator('input[placeholder*="지원동기"]').first();
  if (await q.isVisible().catch(() => false)) {
    await q.fill('지원 동기와 목표를 작성해 주세요.');
  }
}

export async function assertCreationSuccess(
  page: Page,
  studyTitle: string,
  toastMessage: string,
) {
  await expect(page.getByText(toastMessage)).toBeVisible({ timeout: 10000 });
  await expect(page.locator('[role="dialog"]')).toBeHidden({
    timeout: 10000,
  });
  await expect(
    page.getByRole('heading', { name: studyTitle, level: 3 }),
  ).toBeVisible({ timeout: 12000 });
}

// e2e/support/study-helpers.ts 상단에 추가
export const API_BASE =
  process.env.E2E_API_BASE_URL ?? 'https://test.zeroone.it.kr';
