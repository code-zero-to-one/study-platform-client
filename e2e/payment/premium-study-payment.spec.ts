import { test, expect } from '@playwright/test';
import {
  createPremiumStudyViaApi,
  deletePremiumStudyViaApi,
  fillAndSubmitApplyModal,
  mockTossPaymentAndConfirm,
  setupMocksForNonLeaderFlow,
} from '../support/payment-helpers';

test.describe('멘토스터디 신청 + 결제', () => {
  let studyId: number | null = null;

  test.beforeAll(async ({ request }) => {
    studyId = await createPremiumStudyViaApi(request);
  });

  test.afterAll(async ({ request }) => {
    if (studyId !== null) {
      await deletePremiumStudyViaApi(request, studyId);
    }
  });

  test('신청서 제출 → 카드 결제 → 결제 완료', async ({ page }) => {
    if (!studyId) throw new Error('studyId not set by beforeAll');

    // Patch RSC HTML + mock client APIs so memberId=2 appears as non-leader
    await setupMocksForNonLeaderFlow(page, studyId);

    // Mock Toss payment redirect + confirm API
    await mockTossPaymentAndConfirm(page, studyId);

    // 1. Navigate to premium study detail page
    // waitForResponse must be registered before goto — the /members/status fetch
    // fires during client-side hydration, which completes before waitUntil:'load'.
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(`/group-studies/${studyId}/members/status`) &&
          res.status() === 200,
        { timeout: 10000 },
      ),
      page.goto(`/premium-study/${studyId}`, { waitUntil: 'load' }),
    ]);

    // 2. Click the apply trigger button
    const applyTrigger = page.getByRole('button', { name: '신청하기' }).first();
    await applyTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await applyTrigger.click();

    // 3. Fill apply modal and capture POST response simultaneously
    const [applyResponse] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes('/apply') && res.request().method() === 'POST',
        { timeout: 15000 },
      ),
      fillAndSubmitApplyModal(page),
    ]);

    expect(applyResponse.ok()).toBe(true);

    // 4. Verify success toast
    await expect(page.getByText('스터디 신청이 완료되었습니다.')).toBeVisible({
      timeout: 10000,
    });

    // 5. Modal closes → "결제하기" appears after query invalidation
    await expect(page.locator('[role="dialog"]')).toBeHidden({
      timeout: 10000,
    });
    const payButton = page.getByRole('button', { name: '결제하기' });
    await payButton.waitFor({ state: 'visible', timeout: 10000 });
    await payButton.click();

    // 6. Verify navigation to payment checkout page
    await page.waitForURL(`**/payment/${studyId}`, { timeout: 10000 });

    // 7. Check terms agreement (label wraps hidden input — click label)
    await page.locator('label[for="term-agree"]').click();

    // 8. CARD is default paymentMethod — click pay button directly
    await page.getByRole('button', { name: '결제하기' }).click();

    // 9. Toss SDK v2 renders an in-page overlay widget (not a pay.toss.im redirect).
    //    Simulate Toss completion by navigating directly to the success URL with
    //    fake params — confirm API mock handles the server-side verification.
    await page.evaluate((id) => {
      window.location.href = `/payment/success?paymentId=1&paymentKey=tpaytest_e2e&orderId=order_e2e_${id}&amount=10000&method=CARD`;
    }, studyId);

    // 10. Confirm API mocked → success page renders "결제가 완료되었습니다."
    await page.waitForURL(/\/payment\/success/, { timeout: 15000 });
    await expect(
      page.getByRole('heading', { name: '결제가 완료되었습니다.' }),
    ).toBeVisible({ timeout: 15000 });
  });
});
