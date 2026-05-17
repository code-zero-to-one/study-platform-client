import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type {
  CourseDetailResponse,
  CourseCompletionRecapResponse,
} from '../../src/types/api/course.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const COURSE_ID = 1;
const AUTH_FILE = 'e2e/fixtures/auth.json';
const COMPLETE_PATH = '/class/vibe-intro/complete';

// ─── Global beforeEach: localhost auth cookie injection ───────────────────────

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
      slug: 'vibe-intro',
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
      freeLessonCount: null,
      journeyMapAvailable: true,
      hasFullAccess: true,
      isPaidEnrolled: true,
      canPurchase: null,
    },
  };
}

function makeRecap(): { content: CourseCompletionRecapResponse } {
  return {
    content: {
      latestCompletedLessonCount: 20,
      studyDays: 7,
      siteUrlCount: 3,
      completedAt: '2025-05-17T12:00:00.000Z',
      operatorMessage: null,
    },
  };
}

// ─── Route Mock + Navigation ──────────────────────────────────────────────────

async function mockApis(page: Page): Promise<void> {
  await page.route(/\/courses\//, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (/\/courses\/\d+\/next-plan/.test(url) && method === 'POST') {
      await route.fulfill({ json: { content: null } });
    } else if (/\/courses\/\d+\/completion-recap/.test(url)) {
      await route.fulfill({ json: makeRecap() });
    } else if (url.includes('/courses/vibe-intro')) {
      await route.fulfill({ json: makeCourseDetail() });
    } else {
      await route.continue();
    }
  });
}

async function gotoComplete(page: Page): Promise<void> {
  await mockApis(page);
  // Pre-register before navigation — mocked response fires right after courseId resolves
  const recapResponse = page.waitForResponse(
    (r) => /\/courses\/\d+\/completion-recap/.test(r.url()),
    { timeout: 10000 },
  );
  await Promise.all([
    page.waitForResponse((r) => /\/courses\/vibe-intro$/.test(r.url())),
    page.goto(COMPLETE_PATH, { waitUntil: 'load' }),
  ]);
  await recapResponse;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('코스 완주 recap 렌더링 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await gotoComplete(page);
  });

  test('"축하합니다. 드디어 해내셨어요!" 헤딩 표시', async ({ page }) => {
    await expect(page.getByText('축하합니다. 드디어 해내셨어요!')).toBeVisible({
      timeout: 5000,
    });
  });

  test('studyDays stat "7" 표시', async ({ page }) => {
    // studyDays appears in both the stat card and the message card
    await expect(page.getByText('7').first()).toBeVisible({ timeout: 5000 });
  });

  test('latestCompletedLessonCount "20" 표시', async ({ page }) => {
    await expect(page.getByText('20').first()).toBeVisible({ timeout: 5000 });
  });

  test('siteUrlCount "3" 표시', async ({ page }) => {
    await expect(page.getByText('3').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('CTA 내비게이션 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await gotoComplete(page);
  });

  test('"빌더들의 바이브 보기" → /class/vibe-intro/home?tab=feed', async ({
    page,
  }) => {
    const link = page.getByRole('link', { name: '빌더들의 바이브 보기' });
    await expect(link).toBeVisible({ timeout: 5000 });
    const href = await link.getAttribute('href');
    expect(href).toContain('/class/vibe-intro/home');
    expect(href).toContain('tab=feed');
  });

  test('"내 빌더 필드 모아보기" → /my-page', async ({ page }) => {
    const link = page.getByRole('link', { name: '내 빌더 필드 모아보기' });
    await expect(link).toBeVisible({ timeout: 5000 });
    expect(await link.getAttribute('href')).toBe('/my-page');
  });

  test('"건너뛰기" → /class', async ({ page }) => {
    const link = page.getByRole('link', { name: '건너뛰기' });
    await expect(link).toBeVisible({ timeout: 5000 });
    expect(await link.getAttribute('href')).toBe('/class');
  });
});

test.describe('다음 계획 제출 @auth', () => {
  test('textarea 입력 후 링크 클릭 → POST /courses/1/next-plan 호출', async ({
    page,
  }) => {
    await gotoComplete(page);

    await page.getByPlaceholder(/포트폴리오 사이트/).fill('AI 챗봇 만들어보기');

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          /\/courses\/\d+\/next-plan/.test(r.url()) &&
          r.request().method() === 'POST',
      ),
      page.getByRole('link', { name: '빌더들의 바이브 보기' }).click(),
    ]);

    expect(response.status()).toBe(200);
  });
});
