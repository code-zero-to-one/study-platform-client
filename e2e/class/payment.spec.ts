import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type {
  CourseDetailResponse,
  CoursePlanResponse,
  CoursePaymentPrepareResponse,
  CoursePaymentConfirmResponse,
} from '../../src/types/api/course.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const COURSE_ID = 1;
const PAYMENT_PAGE = '/class/vibe-intro/payment?planCode=ALL_IN_ONE';
const SUCCESS_PAGE_BASE = '/class/vibe-intro/payment/success';
const AUTH_FILE = 'e2e/fixtures/auth.json';

// ─── Localhost auth cookie injection ─────────────────────────────────────────
// auth.json cookies are domain-scoped to test.zeroone.it.kr.
// When running against localhost, re-map them so Next.js reads accessToken.

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

function makePlan(
  overrides: Partial<CoursePlanResponse> = {},
): CoursePlanResponse {
  return {
    planCode: 'ALL_IN_ONE',
    name: '올인원',
    subtitle: '모든 강의 + 커뮤니티',
    items: [],
    totalPrice: 39900,
    discountPrice: 39900,
    regularPrice: 59900,
    discountRate: 33,
    ...overrides,
  };
}

function makeCourseDetail(overrides: Partial<CourseDetailResponse> = {}): {
  content: CourseDetailResponse;
} {
  return {
    content: {
      courseId: COURSE_ID,
      slug: 'vibe-intro',
      viewerStatus: 'FREE_ENROLLED',
      title: '바이브 코딩 인트로',
      description: null,
      thumbnailUrl: null,
      learnerCount: 42,
      durationDays: 30,
      completionCount: 0,
      exploringCount: 0,
      plans: [makePlan()],
      earlyBirdEndsAt: null,
      canFreeEnroll: null,
      isFreeEnrolled: true,
      freeLessonCount: 3,
      journeyMapAvailable: true,
      hasFullAccess: false,
      isPaidEnrolled: false,
      canPurchase: true,
      ...overrides,
    },
  };
}

function makePaymentPrepare(
  overrides: Partial<CoursePaymentPrepareResponse> = {},
): { content: CoursePaymentPrepareResponse } {
  return {
    content: {
      paymentId: 999,
      courseId: COURSE_ID,
      planId: null,
      planCode: 'ALL_IN_ONE',
      amount: 39900,
      tossOrderId: 'test-order-id-abc123',
      orderName: '바이브 코딩 인트로 — 올인원',
      ...overrides,
    },
  };
}

function makePaymentConfirm(
  overrides: Partial<CoursePaymentConfirmResponse> = {},
): { content: CoursePaymentConfirmResponse } {
  return {
    content: {
      paymentId: 999,
      courseId: COURSE_ID,
      planId: null,
      planCode: 'ALL_IN_ONE',
      amount: 39900,
      status: 'SUCCESS',
      paymentMethod: 'CARD',
      paidAt: '2025-05-16T12:00:00.000Z',
      tossReceiptUrl: null,
      virtualAccountNumber: null,
      virtualAccountDueDate: null,
      virtualAccountHolderName: null,
      ...overrides,
    },
  };
}

// ─── Route Mock Helper ────────────────────────────────────────────────────────
// prepare/confirm accept null to simulate a 500 failure.

async function mockCourseApis(
  page: Page,
  opts: {
    detail?: ReturnType<typeof makeCourseDetail>;
    prepare?: ReturnType<typeof makePaymentPrepare> | null;
    confirm?: ReturnType<typeof makePaymentConfirm> | null;
  } = {},
) {
  const detail = opts.detail ?? makeCourseDetail();
  const prepare = 'prepare' in opts ? opts.prepare : makePaymentPrepare();
  const confirm = 'confirm' in opts ? opts.confirm : makePaymentConfirm();

  await page.route(/\/courses\//, async (route) => {
    const url = route.request().url();

    if (url.includes('/payments/toss/confirm')) {
      if (confirm === null) {
        await route.fulfill({
          status: 500,
          json: { message: 'confirm failed' },
        });
      } else {
        await route.fulfill({ json: confirm });
      }
    } else if (url.includes('/payments/prepare')) {
      if (prepare === null) {
        await route.fulfill({
          status: 500,
          json: { message: 'prepare failed' },
        });
      } else {
        await route.fulfill({ json: prepare });
      }
    } else if (url.includes('/courses/vibe-intro')) {
      await route.fulfill({ json: detail });
    } else {
      await route.continue();
    }
  });
}

async function gotoPaymentPage(page: Page): Promise<void> {
  await Promise.all([
    page.waitForResponse((r) => /\/courses\/vibe-intro$/.test(r.url())),
    page.goto(PAYMENT_PAGE, { waitUntil: 'load' }),
  ]);
}

// ─── Chunk 1: 결제 페이지 렌더링 @auth ───────────────────────────────────────

test.describe('결제 페이지 렌더링 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockCourseApis(page);
    await gotoPaymentPage(page);
  });

  test('주요 섹션 전체 렌더링 확인', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '결제하기' })).toBeVisible();
    await expect(page.getByText('구매자 정보')).toBeVisible();
    await expect(page.getByPlaceholder('이름을 입력해주세요')).toBeVisible();
    await expect(page.getByPlaceholder('이메일을 입력해주세요')).toBeVisible();
    await expect(page.getByText('결제 수단')).toBeVisible();
    await expect(page.getByText('신용카드 결제')).toBeVisible();
    await expect(page.getByText('이용약관 동의 (필수)')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /39,900원 결제하기/ }),
    ).toBeVisible();
  });

  test('plan 이름 + 결제 금액 표시', async ({ page }) => {
    await expect(page.getByText('올인원')).toBeVisible();
    // discountPrice shown on submit button
    await expect(
      page.getByRole('button', { name: /39,900원 결제하기/ }),
    ).toBeVisible();
  });

  test('무통장 입금 옵션 활성화', async ({ page }) => {
    await expect(
      page.locator('input[type="radio"][value="VIRTUAL_ACCOUNT"]'),
    ).not.toBeDisabled();
  });

  test('이용약관 "보기" 클릭 → TOS 모달 열림', async ({ page }) => {
    await page.getByRole('button', { name: '보기' }).click();
    await expect(page.getByText('ZeroOne IT 서비스 이용약관')).toBeVisible();
    await expect(page.getByText('결제 및 서비스 제공')).toBeVisible();
  });

  test('TOS 모달 "확인" 클릭 → 모달 닫힘', async ({ page }) => {
    await page.getByRole('button', { name: '보기' }).click();
    await expect(page.getByText('ZeroOne IT 서비스 이용약관')).toBeVisible();
    await page.getByRole('button', { name: '확인' }).click();
    await expect(
      page.getByText('ZeroOne IT 서비스 이용약관'),
    ).not.toBeVisible();
  });
});

// ─── Chunk 2: 결제 정보 로드 오류 @auth ──────────────────────────────────────

test.describe('결제 정보 로드 오류 @auth', () => {
  test('코스 플랜 없음 → "결제 정보를 불러올 수 없습니다." 표시', async ({
    page,
  }) => {
    await mockCourseApis(page, { detail: makeCourseDetail({ plans: null }) });
    await Promise.all([
      page.waitForResponse((r) => /\/courses\/vibe-intro$/.test(r.url())),
      page.goto(PAYMENT_PAGE, { waitUntil: 'load' }),
    ]);
    await expect(page.getByText('결제 정보를 불러올 수 없습니다.')).toBeVisible(
      { timeout: 10000 },
    );
  });
});

// ─── Chunk 3: 결제 버튼 유효성 검사 @auth ─────────────────────────────────────

test.describe('결제 버튼 유효성 검사 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockCourseApis(page);
    await gotoPaymentPage(page);
  });

  test('약관 미동의 → "이용약관에 동의해주세요." 토스트', async ({ page }) => {
    await page.getByRole('button', { name: /결제하기/ }).click();
    await expect(
      page.getByRole('main').getByText('이용약관에 동의해주세요.'),
    ).toBeVisible({ timeout: 3000 });
  });

  test('약관 동의 + 휴대폰 미인증 → "휴대폰 인증을 완료해주세요." 토스트', async ({
    page,
  }) => {
    await page.locator('input[name="tosAgreed"]').check({ force: true });
    await page.getByPlaceholder('이름을 입력해주세요').fill('홍길동');
    await page.locator('#buyerEmail').fill('test@example.com');
    await page.getByPlaceholder('01012345678').fill('01012345678');
    await page.getByRole('button', { name: /결제하기/ }).click();
    await expect(page.getByText('휴대폰 인증을 완료해주세요.')).toBeVisible({
      timeout: 3000,
    });
  });

  test('결제 버튼 항상 활성화 (로딩 중 제외)', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /결제하기/ }),
    ).not.toBeDisabled();
  });
});

// ─── Chunk 4: 뒤로가기 가드 + 결제 중단 모달 @auth ───────────────────────────
// Navigation guard pushes a dummy history entry on mount.
// history.back() navigates from that duplicate entry to the previous one —
// same URL, so no actual page navigation — but fires popstate, which the
// guard intercepts to show the exit modal.

test.describe('뒤로가기 가드 + 결제 중단 모달 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockCourseApis(page);
    await gotoPaymentPage(page);
  });

  test('뒤로가기 → "결제를 중단하시겠어요?" 모달 표시', async ({ page }) => {
    await page.evaluate(() => window.history.back());
    await expect(page.getByText('결제를 중단하시겠어요?')).toBeVisible({
      timeout: 3000,
    });
    await expect(
      page.getByText('지금 페이지를 떠나면 입력하신 내용이 사라지고'),
    ).toBeVisible();
  });

  test('"계속 결제하기" → 모달 닫힘, 결제 페이지 URL 유지', async ({
    page,
  }) => {
    await page.evaluate(() => window.history.back());
    await expect(page.getByText('결제를 중단하시겠어요?')).toBeVisible();

    await page.getByRole('button', { name: '계속 결제하기' }).click();

    await expect(page.getByText('결제를 중단하시겠어요?')).not.toBeVisible();
    expect(page.url()).toContain('/class/vibe-intro/payment');
  });

  test('"결제 중단하기" → /class/vibe-intro/home 이동', async ({ page }) => {
    await page.evaluate(() => window.history.back());
    await expect(page.getByText('결제를 중단하시겠어요?')).toBeVisible();

    await page.getByRole('button', { name: '결제 중단하기' }).click();

    await page.waitForURL('**/class/vibe-intro/home', { timeout: 5000 });
    expect(page.url()).toContain('/class/vibe-intro/home');
  });
});

// ─── Chunk 5: 휴대폰 OTP 인증 흐름 @auth ─────────────────────────────────────

test.describe('휴대폰 OTP 인증 흐름 @auth', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept phone verification endpoints (send + verify share same pattern).
    // Verify endpoint checks data.success — return true for happy path.
    await page.route(/\/phone/, async (route) => {
      await route.fulfill({
        status: 200,
        json: { content: { success: true } },
      });
    });
    await mockCourseApis(page);
    await gotoPaymentPage(page);
  });

  test('이름 비워두고 "인증하기" → "이름을 먼저 입력해주세요." 토스트', async ({
    page,
  }) => {
    await page.getByPlaceholder('이름을 입력해주세요').fill('');
    await page.getByRole('button', { name: '인증하기' }).click();
    await expect(page.getByText('이름을 먼저 입력해주세요.')).toBeVisible({
      timeout: 3000,
    });
  });

  test('이름 + 번호 입력 후 "인증하기" → OTP 입력란 노출 + 타이머 시작', async ({
    page,
  }) => {
    await page.getByPlaceholder('이름을 입력해주세요').fill('홍길동');
    await page.getByPlaceholder('01012345678').fill('01012345678');
    await page.getByRole('button', { name: '인증하기' }).click();

    await expect(page.getByPlaceholder('인증번호 6자리')).toBeVisible({
      timeout: 5000,
    });
    // Countdown timer shows 03:xx
    await expect(page.getByText(/03:\d\d/)).toBeVisible();
    // Button label switches to 재발송
    await expect(page.getByRole('button', { name: '재발송' })).toBeVisible();
  });

  test('OTP 입력 후 "확인" → 인증 완료 배지 + 휴대폰 필드 비활성화', async ({
    page,
  }) => {
    await page.getByPlaceholder('이름을 입력해주세요').fill('홍길동');
    await page.getByPlaceholder('01012345678').fill('01012345678');
    await page.getByRole('button', { name: '인증하기' }).click();

    await expect(page.getByPlaceholder('인증번호 6자리')).toBeVisible({
      timeout: 5000,
    });
    await page.getByPlaceholder('인증번호 6자리').fill('123456');
    await page.getByRole('button', { name: '확인' }).click();

    await expect(page.getByText('인증 완료')).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder('01012345678')).toBeDisabled();
  });
});

// ─── Chunk 6: 결제 성공 페이지 @auth ─────────────────────────────────────────
// Navigate directly to the success URL with query params Toss would provide.
// The page calls POST /courses/{id}/payments/toss/confirm on mount (after
// courseId resolves), so both the detail and confirm responses must be mocked.

test.describe('결제 성공 페이지 @auth', () => {
  const SUCCESS_URL =
    `${SUCCESS_PAGE_BASE}` +
    `?paymentId=999&paymentKey=test-key&orderId=test-order-id-abc123&amount=39900`;

  async function gotoSuccessWithMocks(
    page: Page,
    confirmResponse: ReturnType<typeof makePaymentConfirm> | null,
  ) {
    await page.route(/\/courses\//, async (route) => {
      const url = route.request().url();
      if (url.includes('/payments/toss/confirm')) {
        if (confirmResponse === null) {
          await route.fulfill({
            status: 500,
            json: { message: 'confirm failed' },
          });
        } else {
          await route.fulfill({ json: confirmResponse });
        }
      } else if (url.includes('/courses/vibe-intro')) {
        await route.fulfill({ json: makeCourseDetail() });
      } else {
        await route.continue();
      }
    });

    await Promise.all([
      page.waitForResponse((r) => /\/courses\/vibe-intro$/.test(r.url())),
      page.waitForResponse((r) => r.url().includes('/payments/toss/confirm')),
      page.goto(SUCCESS_URL, { waitUntil: 'load' }),
    ]);
  }

  test('confirm 성공 → 결제 완료 화면 + 금액 + CTA 표시', async ({ page }) => {
    await gotoSuccessWithMocks(page, makePaymentConfirm());

    await expect(page.getByText('결제가 완료되었습니다')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('결제 완료')).toBeVisible();
    // Amount row shows formatted price
    await expect(page.getByText('39,900원').first()).toBeVisible();
    // CTA links
    await expect(page.getByRole('link', { name: '마이클래스' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: '내 학습 여정 맵으로 가기' }),
    ).toBeVisible();
  });

  test('confirm API 500 → "결제 확인에 실패했습니다." + 홈 이동 버튼', async ({
    page,
  }) => {
    await gotoSuccessWithMocks(page, null);

    await expect(page.getByText('결제 확인에 실패했습니다.')).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole('button', { name: '학습 홈으로 이동' }),
    ).toBeVisible();
  });

  test('"학습 홈으로 이동" 버튼 → /class/vibe-intro/home', async ({ page }) => {
    await gotoSuccessWithMocks(page, null);
    await expect(
      page.getByRole('button', { name: '학습 홈으로 이동' }),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: '학습 홈으로 이동' }).click();

    await page.waitForURL('**/class/vibe-intro/home', { timeout: 5000 });
    expect(page.url()).toContain('/class/vibe-intro/home');
  });
});
