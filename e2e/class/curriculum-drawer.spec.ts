import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type {
  CourseDetailResponse,
  CourseDrawerResponse,
  LessonDetailResponse,
} from '../../src/types/api/course.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const COURSE_ID = 1;
const LESSON_ID = 101;
const AUTH_FILE = 'e2e/fixtures/auth.json';

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
          isDefaultExpanded: true, // must be true so lessons render without toggle
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
            {
              lessonId: 102,
              order: 2,
              title: '심화 레슨',
              isFree: false,
              isLocked: true,
              status: 'LOCKED',
              isCurrentLesson: false,
            },
            {
              lessonId: 103,
              order: 3,
              title: '결제 완료 레슨',
              isFree: false,
              isLocked: false,
              status: 'IN_PROGRESS',
              isCurrentLesson: false,
            },
          ],
        },
      ],
    },
  };
}

function makeMinimalLesson(): { content: LessonDetailResponse } {
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
    },
  };
}

// ─── Route Mock + Navigation ──────────────────────────────────────────────────

async function mockAndNavigate(page: Page): Promise<void> {
  await page.route(/\/courses\//, async (route) => {
    const url = route.request().url();
    if (/\/courses\/\d+\/drawer/.test(url)) {
      await route.fulfill({ json: makeDrawer() });
    } else if (url.includes('/courses/vibe-intro')) {
      await route.fulfill({ json: makeCourseDetail() });
    } else {
      await route.continue();
    }
  });

  await page.route(/\/lessons\//, async (route) => {
    const url = route.request().url();
    if (/\/lessons\/\d+$/.test(url)) {
      await route.fulfill({ json: makeMinimalLesson() });
    } else {
      // qnas/sidebar, builder-feeds/preview — return empty content
      await route.fulfill({ json: { content: null } });
    }
  });

  // Register waitForResponse before goto to avoid race
  await Promise.all([
    page.waitForResponse((r) => /\/courses\/\d+\/drawer/.test(r.url())),
    page.goto(`/class/vibe-intro/lesson/${LESSON_ID}`, { waitUntil: 'load' }),
  ]);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('커리큘럼 드로어 배지 렌더링 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockAndNavigate(page);
    // Page auto-opens the drawer for 2s on mount; wait for it to open then close
    const drawerCloseBtn = page
      .getByRole('button', { name: '커리큘럼 닫기' })
      .first();
    await drawerCloseBtn
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    await expect(drawerCloseBtn).not.toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: '커리큘럼', exact: true }).click();
    // Confirm drawer is open before badge assertions
    await expect(
      page.getByRole('button', { name: '커리큘럼 닫기' }).first(),
    ).toBeVisible();
  });

  test('isFree=true → 무료 배지 표시', async ({ page }) => {
    await expect(page.getByText('무료').first()).toBeVisible();
  });

  test('isFree=false, isLocked=true → 잠금 배지 표시', async ({ page }) => {
    const lessonLockBadge = page.getByRole('link', {
      name: '잠금 Lesson 02심화 레슨',
      exact: true,
    });
    await expect(
      lessonLockBadge.getByRole('img', { name: '잠금', exact: true }),
    ).toBeVisible();
  });

  test('isFree=false, isLocked=false → 잠금 해제 배지 표시', async ({
    page,
  }) => {
    const lessonUnlockBadge = page.getByRole('link', {
      name: '잠금 해제 Lesson 03결제 완료 레슨',
      exact: true,
    });
    await expect(
      lessonUnlockBadge.getByRole('img', { name: '잠금 해제', exact: true }),
    ).toBeVisible();
  });
});
