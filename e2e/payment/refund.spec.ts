import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type { UserTransactionListResponse } from '../../src/api/openapi/models';

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_FILE = 'e2e/fixtures/auth.json';
const PAYMENT_MANAGEMENT_PATH = '/payment-management';
const PAYMENT_ID = 100;

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
    groupStudyId: 1,
    groupStudyTitle: '바이브 스터디',
    groupStudyStartDate: '2026-06-01T00:00:00.000Z',
    paymentId: PAYMENT_ID,
    paymentCode: 'PAY-TEST-001',
    latestTransactionType: 'PAYMENT_SUCCESS',
    latestTransactionTypeDisplayName: '결제완료',
    latestTransactionAmount: 99000,
    paidAt: '2026-05-18T09:00:00.000Z',
    paymentMethod: 'CARD',
    paymentReceiptUrl: undefined,
    virtualAccountInfo: undefined,
    ...overrides,
  };
}

// useGetMyTransactions returns data.content (PageResponse), and the page reads
// paymentListData?.content (the array). Mock must use double-wrapped structure.
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
  await page.route(/\/mypage\/transactions/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: makeTransactionPage(transactions) });
    } else {
      await route.continue();
    }
  });
}

// POST /api/v1/payments/{paymentId}/refunds
async function mockRefundRequestApi(page: Page, status = 201) {
  await page.route(/\/payments\/\d+\/refunds$/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status,
        json: { content: { refundId: 1, refundCode: 'REF-001' } },
      });
    } else {
      await route.continue();
    }
  });
}

async function gotoPaymentManagement(page: Page) {
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/mypage/transactions')),
    page.goto(PAYMENT_MANAGEMENT_PATH, { waitUntil: 'load' }),
  ]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('결제 관리 — 환불 요청 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockTransactionsApi(page, [makeTransaction()]);
  });

  test('PAYMENT_SUCCESS → 스터디명·"결제완료" 배지·"환불 요청" 버튼 표시', async ({
    page,
  }) => {
    await gotoPaymentManagement(page);

    await expect(page.getByText('바이브 스터디').first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('결제완료').first()).toBeVisible();
    await expect(page.getByRole('button', { name: '환불 요청' })).toBeVisible();
  });

  test('"환불 요청" 클릭 → 모달 열림 + 참여 불가 경고 표시', async ({
    page,
  }) => {
    await gotoPaymentManagement(page);
    await expect(page.getByRole('button', { name: '환불 요청' })).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole('button', { name: '환불 요청' }).click();

    await expect(
      page.getByText('환불 요청 시 진행하시는 스터디에'),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('더 이상 참여할 수 없습니다.')).toBeVisible();
  });

  test('"환불 요청하기" → POST /payments/{id}/refunds → "환불 요청이 접수되었습니다." 토스트', async ({
    page,
  }) => {
    await mockRefundRequestApi(page);
    await gotoPaymentManagement(page);

    await page.getByRole('button', { name: '환불 요청' }).click();
    await expect(
      page.getByText('환불 요청 시 진행하시는 스터디에'),
    ).toBeVisible({ timeout: 5000 });

    const [refundResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/refunds') && r.request().method() === 'POST',
      ),
      page.getByRole('button', { name: '환불 요청하기' }).click(),
    ]);

    expect(refundResponse.status()).toBe(201);
    await expect(page.getByText('환불 요청이 접수되었습니다.')).toBeVisible({
      timeout: 5000,
    });
  });

  test('"아니오" 클릭 → 모달 닫힘, refund API 미호출', async ({ page }) => {
    await gotoPaymentManagement(page);

    await page.getByRole('button', { name: '환불 요청' }).click();
    await expect(
      page.getByText('환불 요청 시 진행하시는 스터디에'),
    ).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: '아니오' }).click();

    await expect(
      page.getByText('환불 요청 시 진행하시는 스터디에'),
    ).not.toBeVisible({ timeout: 3000 });
  });
});

test.describe('결제 관리 — REFUND_REQUESTED 상태 @auth', () => {
  test('"환불요청" 배지 표시, "환불 요청" 버튼 없음', async ({ page }) => {
    await mockTransactionsApi(page, [
      makeTransaction({
        latestTransactionType: 'REFUND_REQUESTED',
        refundId: 1,
        refundCode: 'REF-001',
      }),
    ]);
    await gotoPaymentManagement(page);

    await expect(page.getByText('환불요청').first()).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole('button', { name: '환불 요청' }),
    ).not.toBeVisible();
  });
});
