import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type {
  CourseDrawerResponse,
  LessonDetailResponse,
  LessonRetrospectiveCreateResponse,
} from '../../src/types/api/course.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const COURSE_ID = 1;
const LESSON_ID = 101;
const AUTH_FILE = 'e2e/fixtures/auth.json';

// ─── Global beforeEach: localhost auth cookie injection ───────────────────────

test.beforeEach(async ({ context, baseURL }) => {
  if (!existsSync(AUTH_FILE)) return;
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
  if (baseURL?.startsWith('http://localhost')) {
    await context.addCookies(
      cookies.map((c) => ({ ...c, domain: 'localhost', secure: false })),
    );
  } else {
    const tokenCookie = cookies.find((c) => c.name === 'accessToken');
    if (tokenCookie && baseURL) {
      await context.addCookies([
        {
          ...tokenCookie,
          domain: new URL(baseURL).hostname,
          expires: Math.floor(Date.now() / 1000) + 3600,
        },
      ]);
    }
  }
});

// ─── Mock Factories ───────────────────────────────────────────────────────────

function makeDrawer(): { content: CourseDrawerResponse } {
  return {
    content: {
      courseId: COURSE_ID,
      courseTitle: '바이브 코딩 인트로',
      chapters: [
        {
          chapterId: 10,
          order: 1,
          title: '시작하기',
          description: null,
          isDefaultExpanded: true,
          lessons: [
            {
              lessonId: LESSON_ID,
              order: 1,
              title: '기초 세팅',
              isFree: true,
              isLocked: false,
              status: 'IN_PROGRESS',
              isCurrentLesson: true,
            },
          ],
        },
      ],
    },
  };
}

function makeLesson(overrides: Partial<LessonDetailResponse> = {}): {
  content: LessonDetailResponse;
} {
  return {
    content: {
      lessonId: LESSON_ID,
      courseId: COURSE_ID,
      courseSlug: 'vibe-intro',
      courseTitle: '바이브 코딩 인트로',
      title: '기초 세팅',
      description: null,
      isFree: true,
      estimatedMinutes: 18,
      videoUrl: null,
      learnerCount: 10,
      viewCount: 0,
      retrospectivePurpose: 'PRACTICE_PROOF',
      retrospectivePrompt: '',
      artifactSubmissionRequired: false,
      contentMarkdown: '',
      progressStatus: 'IN_PROGRESS',
      retrospectiveSubmitted: false,
      ...overrides,
    },
  };
}

function makeRetroResponse(isCourseCompleted = false): {
  content: LessonRetrospectiveCreateResponse;
} {
  return {
    content: {
      retrospectiveId: 1,
      feedId: 1,
      isLessonCompleted: true,
      nextAccessibleLessonId: isCourseCompleted ? null : 102,
      isCourseCompleted,
    },
  };
}

// ─── Route Mock + Navigation ──────────────────────────────────────────────────

async function mockAndNavigate(
  page: Page,
  lessonOverrides: Partial<LessonDetailResponse> = {},
  retroResponse: {
    content: LessonRetrospectiveCreateResponse;
  } = makeRetroResponse(false),
): Promise<void> {
  await page.route(/\/courses\//, async (route) => {
    const url = route.request().url();
    if (/\/courses\/\d+\/drawer/.test(url)) {
      await route.fulfill({ json: makeDrawer() });
    } else if (url.includes('/courses/vibe-intro')) {
      await route.fulfill({
        json: {
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
        },
      });
    } else {
      await route.continue();
    }
  });

  await page.route(/\/lessons\//, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (/\/lessons\/\d+\/retrospective/.test(url) && method === 'POST') {
      await route.fulfill({ json: retroResponse });
    } else if (/\/lessons\/\d+$/.test(url)) {
      await route.fulfill({ json: makeLesson(lessonOverrides) });
    } else {
      // qnas/sidebar, builder-feeds/preview — return empty
      await route.fulfill({ json: { content: null } });
    }
  });

  await Promise.all([
    page.waitForResponse((r) => /\/courses\/\d+\/drawer/.test(r.url())),
    page.goto(`/class/vibe-intro/lesson/${LESSON_ID}`, { waitUntil: 'load' }),
  ]);
}

// Fills all required form fields for a valid submission
async function fillReviewForm(page: Page) {
  // Star rating (aria-label from lesson-rating-box.tsx)
  await page.getByRole('button', { name: '3점' }).click();

  // Q1 — MarkdownEditor (tiptap, contenteditable)
  // document.execCommand('insertText') dispatches a trusted beforeinput event
  // that ProseMirror processes through its transaction system, firing onUpdate.
  // CDP-based methods (keyboard.insertText, pressSequentially) do not dispatch
  // trusted beforeinput in headless Chromium, so onUpdate never fires.
  await page.locator('.tiptap-editor [contenteditable]').first().click();
  await page.evaluate(() => {
    const el = document.querySelector(
      '.tiptap-editor [contenteditable]',
    ) as HTMLElement | null;
    el?.focus();
    document.execCommand('insertText', false, '신기한 코드');
  });
  await expect(
    page.locator('.tiptap-editor [contenteditable]').first(),
  ).toContainText('신기한 코드', { timeout: 3000 });

  // Q2 — plain textarea
  await page.getByPlaceholder(/코드 한 줄만/).fill('의외의 순간');

  // Chips — need >=2 (from lesson-review-form.tsx POSITIVE_CHIPS)
  await page.getByRole('button', { name: '설명이 이해하기 쉬웠어요' }).click();
  await page.getByRole('button', { name: '실습이 재밌었어요' }).click();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('레슨 돌아보기 폼 렌더링 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockAndNavigate(page);
    // Drawer auto-opens for 2s on mount; wait for it to close
    const drawerCloseBtn = page
      .getByRole('button', { name: '커리큘럼 닫기' })
      .first();
    await drawerCloseBtn
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    await expect(drawerCloseBtn).not.toBeVisible({ timeout: 5000 });
  });

  test('"레슨 돌아보기" 섹션 헤딩 표시', async ({ page }) => {
    await expect(page.getByText('레슨 돌아보기').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('별점 버튼 5개 표시', async ({ page }) => {
    for (const n of [1, 2, 3, 4, 5]) {
      await expect(page.getByRole('button', { name: `${n}점` })).toBeVisible();
    }
  });

  test('Q1 textarea placeholder 표시', async ({ page }) => {
    await expect(
      page.locator('.tiptap-editor [contenteditable]').first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('Q2 textarea placeholder 표시', async ({ page }) => {
    await expect(page.getByPlaceholder(/코드 한 줄만/)).toBeVisible({
      timeout: 5000,
    });
  });

  test('칩 6개 전체 표시', async ({ page }) => {
    for (const chip of [
      '설명이 이해하기 쉬웠어요',
      '실습이 재밌었어요',
      '만들어졌다는 게 신기했어요',
      '실습이 막혔어요',
      '설명이 어려웠어요',
      '뭘 하는 건지 모르겠어요',
    ]) {
      await expect(page.getByRole('button', { name: chip })).toBeVisible();
    }
  });

  test('초기 상태 — 제출 버튼 비활성화', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: '제출하고 다음 Lesson 하러 가기' }),
    ).toBeDisabled();
  });
});

test.describe('이미 제출 상태 @auth', () => {
  test('버튼 "이미 제출했어요" + 비활성화', async ({ page }) => {
    await mockAndNavigate(page, { retrospectiveSubmitted: true });
    await expect(
      page.getByRole('button', { name: '이미 제출했어요' }),
    ).toBeDisabled({ timeout: 5000 });
  });
});

test.describe('제출 버튼 활성화 조건 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockAndNavigate(page);
    const drawerCloseBtn = page
      .getByRole('button', { name: '커리큘럼 닫기' })
      .first();
    await drawerCloseBtn
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    await expect(drawerCloseBtn).not.toBeVisible({ timeout: 5000 });
  });

  test('모든 필드 입력 → 버튼 활성화', async ({ page }) => {
    await fillReviewForm(page);
    await expect(
      page.getByRole('button', { name: '제출하고 다음 Lesson 하러 가기' }),
    ).not.toBeDisabled({ timeout: 3000 });
  });

  test('칩 1개만 선택 → 버튼 여전히 비활성화', async ({ page }) => {
    await page.getByRole('button', { name: '3점' }).click();
    await page.locator('.tiptap-editor [contenteditable]').first().click();
    await page.keyboard.type('신기한 코드');
    await page.getByPlaceholder(/코드 한 줄만/).fill('의외의 순간');
    await page
      .getByRole('button', { name: '설명이 이해하기 쉬웠어요' })
      .click();
    // Only 1 chip selected — submitDisabled still true
    await expect(
      page.getByRole('button', { name: '제출하고 다음 Lesson 하러 가기' }),
    ).toBeDisabled();
  });
});

test.describe('제출 성공 흐름 @auth', () => {
  test('isCourseCompleted: false → /class/vibe-intro/home 이동', async ({
    page,
  }) => {
    await mockAndNavigate(page, {}, makeRetroResponse(false));
    const drawerCloseBtn = page
      .getByRole('button', { name: '커리큘럼 닫기' })
      .first();
    await drawerCloseBtn
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    await expect(drawerCloseBtn).not.toBeVisible({ timeout: 5000 });

    await fillReviewForm(page);
    await expect(
      page.getByRole('button', { name: '제출하고 다음 Lesson 하러 가기' }),
    ).not.toBeDisabled({ timeout: 5000 });

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          /\/lessons\/\d+\/retrospective/.test(r.url()) &&
          r.request().method() === 'POST',
      ),
      page
        .getByRole('button', { name: '제출하고 다음 Lesson 하러 가기' })
        .click(),
    ]);

    expect(response.status()).toBe(200);
    await expect(page.getByText('제출이 완료되었어요!')).toBeVisible({
      timeout: 5000,
    });
    await page.waitForURL('**/class/vibe-intro/home', { timeout: 5000 });
  });

  test('isCourseCompleted: true → /class/vibe-intro/complete 이동', async ({
    page,
  }) => {
    await mockAndNavigate(page, {}, makeRetroResponse(true));
    const drawerCloseBtn = page
      .getByRole('button', { name: '커리큘럼 닫기' })
      .first();
    await drawerCloseBtn
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    await expect(drawerCloseBtn).not.toBeVisible({ timeout: 5000 });

    await fillReviewForm(page);
    await expect(
      page.getByRole('button', { name: '제출하고 다음 Lesson 하러 가기' }),
    ).not.toBeDisabled({ timeout: 5000 });

    await Promise.all([
      page.waitForResponse(
        (r) =>
          /\/lessons\/\d+\/retrospective/.test(r.url()) &&
          r.request().method() === 'POST',
      ),
      page
        .getByRole('button', { name: '제출하고 다음 Lesson 하러 가기' })
        .click(),
    ]);

    await page.waitForURL('**/class/vibe-intro/complete', { timeout: 5000 });
  });
});

test.describe('artifactSubmissionRequired @auth', () => {
  test('"오늘의 프로젝트 완성 알리기" 섹션 + "스크린샷 첨부" 버튼 표시', async ({
    page,
  }) => {
    await mockAndNavigate(page, { artifactSubmissionRequired: true });
    const drawerCloseBtn = page
      .getByRole('button', { name: '커리큘럼 닫기' })
      .first();
    await drawerCloseBtn
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    await expect(drawerCloseBtn).not.toBeVisible({ timeout: 5000 });

    await expect(page.getByText('오늘의 프로젝트 완성 알리기')).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByRole('button', { name: '스크린샷 첨부' }),
    ).toBeVisible();
  });

  test('이미지 미첨부 상태 — 나머지 다 입력해도 버튼 비활성화', async ({
    page,
  }) => {
    await mockAndNavigate(page, { artifactSubmissionRequired: true });
    const drawerCloseBtn = page
      .getByRole('button', { name: '커리큘럼 닫기' })
      .first();
    await drawerCloseBtn
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    await expect(drawerCloseBtn).not.toBeVisible({ timeout: 5000 });

    await fillReviewForm(page);
    // artifactImageUrl is still null — isFormValid is false
    await expect(
      page.getByRole('button', { name: '제출하고 다음 Lesson 하러 가기' }),
    ).toBeDisabled();
  });
});
