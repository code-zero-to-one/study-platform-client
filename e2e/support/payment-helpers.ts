import {
  expect,
  type APIRequestContext,
  type Page,
  type Route,
} from '@playwright/test';
import { addDays } from './study-helpers';

// Backend API URL — direct REST calls bypass the frontend
const API_BACKEND =
  process.env.E2E_API_BACKEND_URL ?? 'https://test-api.zeroone.it.kr';

function mockJsonResponse(data: unknown, statusCode = 200) {
  return {
    status: statusCode,
    contentType: 'application/json',
    body: JSON.stringify(data),
  };
}

// Refresh the access token using the .zeroone.it.kr refresh_token cookie.
// auth.json has a wildcard .zeroone.it.kr cookie, so Playwright sends it to
// test-api.zeroone.it.kr automatically.
async function refreshAccessToken(request: APIRequestContext): Promise<string> {
  const res = await request.get(
    `${API_BACKEND}/api/v1/auth/access-token/refresh`,
  );
  if (!res.ok()) {
    throw new Error(
      `Token refresh failed: ${res.status()} ${await res.text()}`,
    );
  }
  const body = await res.json();
  const token = body?.content?.accessToken;
  if (!token) throw new Error('No accessToken in refresh response');
  return token;
}

export async function createPremiumStudyViaApi(
  request: APIRequestContext,
): Promise<number> {
  const accessToken = await refreshAccessToken(request);

  const response = await request.post(`${API_BACKEND}/api/v1/group-studies`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      basicInfo: {
        classification: 'PREMIUM_STUDY',
        type: 'PROJECT',
        targetRoles: ['BACKEND'],
        maxMembersCount: 5,
        experienceLevels: ['JUNIOR'],
        method: 'ONLINE',
        regularMeeting: 'WEEKLY',
        location: '',
        startDate: addDays(7),
        endDate: addDays(42),
        price: 10000,
        studyLeaderParticipation: true,
      },
      detailInfo: {
        title: `[E2E] 멘토스터디 ${Date.now()}`,
        description: 'Playwright E2E 테스트용 스터디 소개입니다.',
        summary: 'E2E 자동화 테스트용 멘토스터디입니다.',
        thumbnailExtension: 'DEFAULT',
      },
      interviewPost: { interviewPost: ['E2E 테스트 질문입니다.'] },
      thumbnailExtension: 'DEFAULT',
    },
  });

  if (!response.ok()) {
    throw new Error(
      `Study creation failed: ${response.status()} ${await response.text()}`,
    );
  }

  const body = await response.json();
  const studyId = body?.content?.groupStudyId ?? body?.content?.id;
  if (!studyId) throw new Error('Study ID not found in response');
  return studyId;
}

export async function deletePremiumStudyViaApi(
  request: APIRequestContext,
  studyId: number,
): Promise<void> {
  try {
    const accessToken = await refreshAccessToken(request);
    await request.delete(`${API_BACKEND}/api/v1/group-studies/${studyId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // best-effort cleanup
  }
}

// Patch RSC HTML + mock client-side APIs so memberId=2 (study creator) appears as non-leader.
// Strategy:
//   1. Intercept the HTML document and replace leader.memberId 2→9999 in the dehydrated RSC payload.
//      RSC double-encodes JSON, so \"memberId\":2 appears as \\"memberId\\":2 in the raw HTML.
//   2. With isLeader=false on the client, members/status and transactions are fetched client-side
//      (not prefetched by SSR) — interceptable by page.route().
//   3. Mock apply POST so the leader account (memberId=2) can "apply" to their own study.
export async function setupMocksForNonLeaderFlow(
  page: Page,
  studyId: number,
): Promise<void> {
  let hasApplied = false;

  await page.route(
    new RegExp(`/premium-study/${studyId}([?#]|$)`),
    async (route: Route) => {
      if (route.request().resourceType() !== 'document') {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      const text = await response.text();
      const patched = text.replace(
        /\\"leader\\":\{\\"memberId\\":2/g,
        '\\"leader\\":{\\"memberId\\":9999',
      );
      if (patched === text) {
        throw new Error(
          'RSC leader patch did not match — check dehydrated payload encoding',
        );
      }
      const headers = { ...response.headers() };
      delete headers['content-encoding'];
      delete headers['content-length'];
      delete headers['transfer-encoding'];
      await route.fulfill({
        status: response.status(),
        headers,
        body: patched,
      });
    },
  );

  // 2. Mock members/status: NONE initially, PENDING after apply
  await page.route(
    `**/api/v1/group-studies/${studyId}/members/status`,
    async (route: Route) => {
      await route.fulfill(
        mockJsonResponse({
          content: { status: hasApplied ? 'PENDING' : 'NONE', reason: '' },
        }),
      );
    },
  );

  // 3. Mock transactions: empty → latestPaymentType === undefined → "결제하기" button
  await page.route(
    `**/api/v1/mypage/transactions/group-studies/${studyId}`,
    async (route: Route) => {
      await route.fulfill(mockJsonResponse({ content: [] }));
    },
  );

  // 4. Mock apply POST: leader account cannot self-apply, so mock success + flip flag
  await page.route(
    `**/api/v1/group-studies/${studyId}/apply`,
    async (route: Route) => {
      if (route.request().method() === 'POST') {
        hasApplied = true;
        await route.fulfill(
          mockJsonResponse({
            content: { applicationId: 1 },
            statusCode: 200,
            message: null,
            timestamp: new Date().toISOString(),
          }),
        );
      } else {
        await route.continue();
      }
    },
  );

  // 5. Mock prepare payment: real endpoint rejects (no real application record)
  //    Returns minimal StudyPaymentPrepareResponse for PaymentCheckoutPage to render
  await page.route(
    `**/api/v1/group-studies/${studyId}/payments/prepare`,
    async (route: Route) => {
      await route.fulfill(
        mockJsonResponse({
          content: {
            paymentId: 1,
            paymentCode: `pay_e2e_${studyId}`,
            groupStudyId: studyId,
            groupStudyTitle: '[E2E] 멘토스터디',
            groupStudyDescription: 'Playwright E2E 테스트용 스터디 소개입니다.',
            memberId: 2,
            memberName: 'E2E 테스트',
            groupStudyImage: {
              imageId: 1,
              resizedImages: [{ resizedImageId: 1, resizedImageUrl: '' }],
            },
            amount: 10000,
            currency: 'KRW',
            pgProvider: 'TOSS',
            tossOrderId: `order_e2e_${studyId}`,
          },
        }),
      );
    },
  );
}

export async function fillAndSubmitApplyModal(page: Page): Promise<void> {
  await expect(page.getByText('스터디 신청서 작성하기')).toBeVisible({
    timeout: 5000,
  });

  const textarea = page.locator('#question-0');
  if (await textarea.isVisible().catch(() => false)) {
    await textarea.fill('E2E 자동화 테스트 답변입니다.');
  }

  // Checkbox renders hidden <input id="agree"> — click the wrapping label
  await page.locator('label[for="agree"]').click();

  await page.locator('button[form="apply-group-study"]').click();
}

// Mock POST /api/v1/payments/toss/confirm so the success page renders.
// Toss SDK v2 uses an in-page overlay (not pay.toss.im redirect), so the test
// navigates directly to the success URL via page.evaluate() after clicking pay.
export async function mockTossPaymentAndConfirm(
  page: Page,
  studyId: number,
): Promise<void> {
  await page.route('**/api/v1/payments/toss/confirm', async (route: Route) => {
    await route.fulfill(
      mockJsonResponse({
        content: {
          paymentId: 1,
          groupStudyId: studyId,
          groupStudyTitle: '[E2E] 멘토스터디',
          amount: 10000,
          method: 'CARD',
          status: 'DONE',
        },
      }),
    );
  });
}
