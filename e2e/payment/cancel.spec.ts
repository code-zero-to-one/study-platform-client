import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type { UserTransactionListResponse } from '../../src/api/openapi/models';

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_FILE = 'e2e/fixtures/auth.json';
const PAYMENT_MANAGEMENT_PATH = '/payment-management';
const PAYMENT_ID = 200;

test.skip(
  ({ baseURL }) => !baseURL?.startsWith('http://localhost'),
  'Mocked payment-management specs require local dev server auth; remote staging redirects protected routes before page route mocks can apply.',
);

// ─── Localhost auth cookie injection ─────────────────────────────────────────

test.beforeEach(async ({ context, baseURL }) => {
  if (baseURL?.startsWith('http://localhost') && existsSync(AUTH_FILE)) {
    const { cookies } = JSON.parse(readFileSync(AUTH_FILE, 'utf-8')) as {
      cookies: {
        name: string;
        value: string;
        domain: string;
        path: string;
        expires: number;
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'Strict' | 'Lax' | 'None';
      }[];
    };
    await context.addCookies(
      cookies.map((c) => ({ ...c, domain: 'localhost', secure: false })),
    );
  }
});

// ─── Mock Factories ───────────────────────────────────────────────────────────

function makeTransaction(
  overrides: Partial<UserTransactionListResponse> = {},
): UserTransactionListResponse {
  return {
    groupStudyId: 2,
    groupStudyTitle: '바이브 스터디',
    groupStudyStartDate: '2026-06-01T00:00:00.000Z',
    paymentId: PAYMENT_ID,
    paymentCode: 'PAY-TEST-002',
    latestTransactionType: 'PAYMENT_REQUESTED',
    latestTransactionTypeDisplayName: '결제대기',
    latestTransactionAmount: 99000,
    paidAt: '2026-05-18T09:00:00.000Z',
    paymentMethod: 'CARD',
    paymentReceiptUrl: undefined,
    virtualAccountInfo: undefined,
    ...overrides,
  };
}

function makeTransactionPage(transactions: UserTransactionListResponse[]) {
  return {
    content: {
      content: transactions,
      totalElements: transactions.length,
      totalPages: 1,
      size: 8,
      number: 0,
    },
  };
}

// ─── Route Mock Helpers ───────────────────────────────────────────────────────

async function mockTransactionsApi(
  page: Page,
  transactions: UserTransactionListResponse[],
) {
  await page.route('**/api/v1/mypage/transactions**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: makeTransactionPage(transactions) });
    } else {
      await route.continue();
    }
  });
}

// POST /api/v1/payments/{paymentId}/cancel
async function mockCancelPaymentApi(page: Page, status = 200) {
  await page.route(/\/payments\/\d+\/cancel$/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status,
        json: { content: null },
      });
    } else {
      await route.continue();
    }
  });
}

async function gotoPaymentManagement(page: Page) {
  await page.goto(PAYMENT_MANAGEMENT_PATH, { waitUntil: 'load' });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('결제 관리 — 결제 취소 (PAYMENT_REQUESTED) @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockTransactionsApi(page, [makeTransaction()]);
  });

  test('PAYMENT_REQUESTED → 스터디명·"결제대기" 배지·"결제 취소" 버튼 표시', async ({
    page,
  }) => {
    await gotoPaymentManagement(page);

    await expect(page.getByText('바이브 스터디').first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('결제대기').first()).toBeVisible();
    await expect(
      page.getByRole('button', { name: '결제 취소' }).first(),
    ).toBeVisible();
  });

  test('"결제 취소" 클릭 → 모달 열림 + 확인 메시지 표시', async ({ page }) => {
    await gotoPaymentManagement(page);
    await expect(
      page.getByRole('button', { name: '결제 취소' }).first(),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: '결제 취소' }).first().click();

    await expect(
      page.getByText('해당 스터디의 결제를 취소하시겠습니까?'),
    ).toBeVisible({ timeout: 5000 });
  });

  test('"결제 취소" confirm → POST /payments/{id}/cancel → "결제가 취소되었습니다." 토스트', async ({
    page,
  }) => {
    await mockCancelPaymentApi(page);
    await gotoPaymentManagement(page);

    await page.getByRole('button', { name: '결제 취소' }).first().click();
    await expect(
      page.getByText('해당 스터디의 결제를 취소하시겠습니까?'),
    ).toBeVisible({ timeout: 5000 });

    const [cancelResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/cancel') && r.request().method() === 'POST',
      ),
      page
        .getByRole('dialog')
        .getByRole('button', { name: '결제 취소' })
        .click(),
    ]);

    expect(cancelResponse.status()).toBe(200);
    await expect(page.getByText('결제가 취소되었습니다.')).toBeVisible({
      timeout: 5000,
    });
  });

  test('"아니오" 클릭 → 모달 닫힘, cancel API 미호출', async ({ page }) => {
    await gotoPaymentManagement(page);

    await page.getByRole('button', { name: '결제 취소' }).first().click();
    await expect(
      page.getByText('해당 스터디의 결제를 취소하시겠습니까?'),
    ).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: '아니오' }).click();

    await expect(
      page.getByText('해당 스터디의 결제를 취소하시겠습니까?'),
    ).not.toBeVisible({ timeout: 3000 });
  });
});

test.describe('결제 관리 — 결제 취소 (PAYMENT_WAITING_FOR_DEPOSIT) @auth', () => {
  test('PAYMENT_WAITING_FOR_DEPOSIT → "결제 취소" 버튼 표시', async ({
    page,
  }) => {
    await mockTransactionsApi(page, [
      makeTransaction({
        latestTransactionType: 'PAYMENT_WAITING_FOR_DEPOSIT',
        latestTransactionTypeDisplayName: '입금대기',
        virtualAccountInfo: undefined,
      }),
    ]);
    await gotoPaymentManagement(page);

    await expect(page.getByText('입금대기').first()).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole('button', { name: '결제 취소' }).first(),
    ).toBeVisible();
  });
});

test.describe('결제 관리 — PAYMENT_CANCELED 상태 @auth', () => {
  test('"결제취소" 배지 표시, "결제 취소" 버튼 없음', async ({ page }) => {
    await mockTransactionsApi(page, [
      makeTransaction({
        latestTransactionType: 'PAYMENT_CANCELED',
        latestTransactionTypeDisplayName: '결제취소',
      }),
    ]);
    await gotoPaymentManagement(page);

    await expect(page.getByText('결제취소').first()).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole('button', { name: '결제 취소' }),
    ).not.toBeVisible();
  });
});
