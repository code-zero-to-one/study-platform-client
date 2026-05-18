import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type {
  CourseDetailResponse,
  CoursePaymentConfirmResponse,
} from '../../src/types/api/course.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_FILE = 'e2e/fixtures/auth.json';
const SLUG = 'vibe-intro';
const COURSE_ID = 1;
const SUCCESS_PATH =
  `/class/${SLUG}/payment/success` +
  `?paymentId=1&paymentKey=test_pk_D5GePAmors8Z&orderId=order-vibe-001&amount=99000`;

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

function makeCourseDetail(): { content: CourseDetailResponse } {
  return {
    content: {
      courseId: COURSE_ID,
      slug: SLUG,
      viewerStatus: 'PAID',
      title: '바이브 코딩 인트로',
      description: null,
      thumbnailUrl: null,
      learnerCount: 42,
      durationDays: 30,
      completionCount: 0,
      exploringCount: 0,
      plans: [],
      earlyBirdEndsAt: null,
      canFreeEnroll: null,
      isFreeEnrolled: false,
      freeLessonCount: 3,
      journeyMapAvailable: true,
      hasFullAccess: true,
      isPaidEnrolled: true,
      canPurchase: null,
    },
  };
}

function makeConfirmSuccess(
  overrides: Partial<CoursePaymentConfirmResponse> = {},
): { content: CoursePaymentConfirmResponse } {
  return {
    content: {
      paymentId: 1,
      courseId: COURSE_ID,
      planId: null,
      planCode: 'ALL_IN_ONE',
      amount: 99000,
      status: 'SUCCESS',
      paymentMethod: 'CARD',
      paidAt: '2026-05-18T09:00:00.000Z',
      tossReceiptUrl: null,
      virtualAccountNumber: null,
      virtualAccountDueDate: null,
      virtualAccountHolderName: null,
      ...overrides,
    },
  };
}

function makeConfirmVirtualAccount(): {
  content: CoursePaymentConfirmResponse;
} {
  return makeConfirmSuccess({
    status: 'WAITING_FOR_DEPOSIT',
    paymentMethod: 'VIRTUAL_ACCOUNT',
    virtualAccountNumber: '1234567890',
    virtualAccountDueDate: '2026-05-19T23:59:59.000Z',
    virtualAccountHolderName: '(주)제로원',
  });
}

// ─── Route Mock Helpers ───────────────────────────────────────────────────────

async function mockCourseDetailApi(page: Page) {
  await page.route(/\/courses\/vibe-intro$/, async (route) => {
    await route.fulfill({ json: makeCourseDetail() });
  });
}

async function mockConfirmApi(page: Page, json: object, status = 200) {
  await page.route(/\/courses\/\d+\/payments\/toss\/confirm/, async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status, json });
    } else {
      await route.continue();
    }
  });
}

// waitForResponse handlers must be registered before goto to catch cascaded
// requests: courseId resolves from detail response, then confirm fires.
async function gotoSuccessPage(page: Page) {
  await Promise.all([
    page.waitForResponse((r) => /\/courses\/vibe-intro$/.test(r.url())),
    page.waitForResponse((r) => r.url().includes('/payments/toss/confirm')),
    page.goto(SUCCESS_PATH, { waitUntil: 'load' }),
  ]);
}

// ─── Chunk 1: CARD 결제 성공 @auth ───────────────────────────────────────────
// payment.spec.ts Chunk 6 already covers: basic heading, amount, CTA links,
// error state text + navigation. Tests here cover unchecked specifics only.

test.describe('결제 성공 — CARD @auth', () => {
  test('결제 수단 "신용카드" + 금액 "99,000원" 표시', async ({ page }) => {
    await mockCourseDetailApi(page);
    await mockConfirmApi(page, makeConfirmSuccess());
    await gotoSuccessPage(page);

    await expect(page.getByText('신용카드')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('99,000원').first()).toBeVisible();
  });

  test('tossReceiptUrl 있을 때 "영수증 보기" 링크 표시', async ({ page }) => {
    await mockCourseDetailApi(page);
    await mockConfirmApi(
      page,
      makeConfirmSuccess({ tossReceiptUrl: 'https://receipt.toss.im/test' }),
    );
    await gotoSuccessPage(page);

    const receiptLink = page.getByRole('link', { name: '영수증 보기' });
    await expect(receiptLink).toBeVisible({ timeout: 10000 });
    await expect(receiptLink).toHaveAttribute(
      'href',
      'https://receipt.toss.im/test',
    );
  });
});

// ─── Chunk 2: 가상계좌 입금 대기 @auth ───────────────────────────────────────

test.describe('결제 성공 — 가상계좌 입금 대기 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockCourseDetailApi(page);
    await mockConfirmApi(page, makeConfirmVirtualAccount());
  });

  test('입금 대기 화면 — 계좌번호·금액 표시', async ({ page }) => {
    await gotoSuccessPage(page);

    await expect(page.getByText('입금 대기 중입니다.')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('1234567890')).toBeVisible();
    await expect(page.getByText('99,000원')).toBeVisible();
  });

  test('"결제 관리로 가기" 링크 → /my-page?tab=payment', async ({ page }) => {
    await gotoSuccessPage(page);
    await expect(page.getByText('입금 대기 중입니다.')).toBeVisible({
      timeout: 10000,
    });

    const link = page.getByRole('link', { name: '결제 관리로 가기' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/my-page?tab=payment');
  });

  test('"결제 취소" 클릭 → cancel API 호출 → /class/vibe-intro/home 이동', async ({
    page,
  }) => {
    // POST /courses/{courseId}/payments/{paymentId}/cancel
    await page.route(/\/courses\/\d+\/payments\/\d+\/cancel/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, json: {} });
      } else {
        await route.continue();
      }
    });

    await gotoSuccessPage(page);
    await expect(page.getByText('입금 대기 중입니다.')).toBeVisible({
      timeout: 10000,
    });

    const [cancelResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/cancel') && r.request().method() === 'POST',
      ),
      page.getByRole('button', { name: '결제 취소' }).click(),
    ]);

    expect(cancelResponse.status()).toBe(200);
    await page.waitForURL('**/class/vibe-intro/home', { timeout: 5000 });
    expect(page.url()).toContain('/class/vibe-intro/home');
  });
});

// ─── Chunk 3: PAY202 — 이미 완료된 결제 @auth ─────────────────────────────────
// isApiError() duck-type guard requires all four fields:
// statusCode, errorCode, errorName, message.

test.describe('결제 성공 — PAY202 (이미 완료된 결제) @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockCourseDetailApi(page);
    await mockConfirmApi(
      page,
      {
        statusCode: 400,
        errorCode: 'PAY202',
        errorName: 'DuplicatePayment',
        message: '이미 완료된 결제입니다.',
      },
      400,
    );
  });

  test('"이미 완료된 결제입니다." 텍스트 표시', async ({ page }) => {
    await gotoSuccessPage(page);

    await expect(page.getByText('이미 완료된 결제입니다.')).toBeVisible({
      timeout: 10000,
    });
  });

  test('"학습 홈으로 이동" 버튼 → /class/vibe-intro/home', async ({ page }) => {
    await gotoSuccessPage(page);
    await expect(
      page.getByRole('button', { name: '학습 홈으로 이동' }),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: '학습 홈으로 이동' }).click();
    await page.waitForURL('**/class/vibe-intro/home', { timeout: 5000 });
    expect(page.url()).toContain('/class/vibe-intro/home');
  });
});
