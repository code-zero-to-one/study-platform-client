import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type {
  CourseDetailResponse,
  CourseCurriculumResponse,
  CourseJourneyMapLessonResponse,
  CourseProgressResponse,
} from '../../src/types/api/course.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const COURSE_ID = 1;
const LESSON_FREE_ID = 101;
const LESSON_LOCKED_ID = 102;
const LESSON_OPTION_ID = 103;
const LESSON_UNLOCKED_ID = 104;
const LESSON_FREE_TITLE = '기초 세팅';
const LESSON_OPTION_TITLE = 'Option 보너스';
const PAGE_PATH = '/class/vibe-intro/home';
const AUTH_FILE = 'e2e/fixtures/auth.json';

// ─── Global beforeEach: localhost auth cookie injection ───────────────────────
// auth.json cookies are domain-scoped to test.zeroone.it.kr.
// When running against localhost, re-map them so the Next.js server reads the
// accessToken cookie and hydrates isAuthenticated=true.

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

function makeCourseDetail(overrides: Partial<CourseDetailResponse> = {}): {
  content: CourseDetailResponse;
} {
  const base: CourseDetailResponse = {
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
    plans: [
      {
        planCode: 'ALL_IN_ONE',
        name: '올인원',
        subtitle: '모든 강의',
        items: [],
        totalPrice: 39900,
        discountPrice: 39900,
        regularPrice: 59900,
        discountRate: 33,
      },
    ],
    earlyBirdEndsAt: null,
    canFreeEnroll: null,
    isFreeEnrolled: true,
    freeLessonCount: 3,
    journeyMapAvailable: true,
    hasFullAccess: false,
    isPaidEnrolled: false,
    canPurchase: true,
  };
  return { content: { ...base, ...overrides } };
}

function makeCurriculum(): { content: CourseCurriculumResponse } {
  return {
    content: {
      courseId: COURSE_ID,
      durationDays: 30,
      totalChapters: 1,
      totalLessons: 3,
      chapters: [
        {
          chapterId: 10,
          order: 1,
          chapterNumber: 1,
          title: '시작하기',
          description: null,
          estimatedMinutes: 54,
          lessons: [
            {
              lessonId: LESSON_FREE_ID,
              order: 1,
              title: LESSON_FREE_TITLE,
              description: null,
              isFree: true,
              isLocked: false,
              estimatedMinutes: 18,
            },
            {
              lessonId: LESSON_LOCKED_ID,
              order: 2,
              title: '심화 레슨',
              description: null,
              isFree: false,
              isLocked: true,
              estimatedMinutes: 18,
            },
            {
              lessonId: LESSON_OPTION_ID,
              order: 3,
              title: LESSON_OPTION_TITLE,
              description: null,
              isFree: true,
              isLocked: false,
              estimatedMinutes: 18,
            },
          ],
        },
      ],
    },
  };
}

function makeCurriculumWithBadges(): { content: CourseCurriculumResponse } {
  return {
    content: {
      courseId: COURSE_ID,
      durationDays: 30,
      totalChapters: 1,
      totalLessons: 3,
      chapters: [
        {
          chapterId: 10,
          order: 1,
          chapterNumber: 1,
          title: '시작하기',
          description: null,
          estimatedMinutes: 54,
          lessons: [
            {
              lessonId: LESSON_FREE_ID,
              order: 1,
              title: LESSON_FREE_TITLE,
              description: null,
              isFree: true,
              isLocked: false,
              estimatedMinutes: 18,
            },
            {
              lessonId: LESSON_LOCKED_ID,
              order: 2,
              title: '심화 레슨',
              description: null,
              isFree: false,
              isLocked: true,
              estimatedMinutes: 18,
            },
            {
              lessonId: LESSON_UNLOCKED_ID,
              order: 3,
              title: '결제 완료 레슨',
              description: null,
              isFree: false,
              isLocked: false,
              estimatedMinutes: 18,
            },
          ],
        },
      ],
    },
  };
}

type JourneyLessonInput = Omit<
  CourseJourneyMapLessonResponse,
  'chapterId' | 'chapterNumber' | 'estimatedMinutes'
> &
  Partial<
    Pick<
      CourseJourneyMapLessonResponse,
      'chapterId' | 'chapterNumber' | 'estimatedMinutes'
    >
  >;

function makeJourneyMap(lessons: JourneyLessonInput[]): {
  content: {
    courseId: number;
    courseTitle: string;
    viewerStatus: string;
    learnerCount: number;
    lessons: CourseJourneyMapLessonResponse[];
  };
} {
  return {
    content: {
      courseId: COURSE_ID,
      courseTitle: '바이브 코딩 인트로',
      viewerStatus: 'FREE_ENROLLED',
      learnerCount: 24,
      lessons: lessons.map((l) => ({
        chapterId: 1,
        chapterNumber: 1,
        estimatedMinutes: 18,
        ...l,
      })),
    },
  };
}

function makeProgress(
  completedLessons: number,
  totalLessons = 3,
): { content: CourseProgressResponse } {
  return {
    content: {
      courseId: COURSE_ID,
      totalLessons,
      completedLessons,
      progressRate:
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
      isCourseCompleted: completedLessons >= totalLessons,
    },
  };
}

// ─── Route Mock Helper ────────────────────────────────────────────────────────

const DEFAULT_JOURNEY = makeJourneyMap([
  {
    lessonId: LESSON_FREE_ID,
    order: 1,
    title: LESSON_FREE_TITLE,
    isFree: true,
    status: 'IN_PROGRESS',
    isAccessible: true,
  },
  {
    lessonId: LESSON_LOCKED_ID,
    order: 2,
    title: '심화 레슨',
    isFree: false,
    status: 'LOCKED',
    isAccessible: false,
  },
  {
    lessonId: LESSON_OPTION_ID,
    order: 3,
    title: LESSON_OPTION_TITLE,
    isFree: true,
    status: 'IN_PROGRESS',
    isAccessible: true,
  },
]);

async function mockApis(
  page: Page,
  {
    detail = makeCourseDetail(),
    journey = DEFAULT_JOURNEY,
    progress = makeProgress(0),
  }: {
    detail?: ReturnType<typeof makeCourseDetail>;
    journey?: ReturnType<typeof makeJourneyMap>;
    progress?: ReturnType<typeof makeProgress>;
  } = {},
) {
  await page.route(/\/courses\//, async (route) => {
    const url = route.request().url();

    if (url.includes('/courses/vibe-intro/curriculum')) {
      await route.fulfill({ json: makeCurriculum() });
    } else if (/\/courses\/\d+\/journey-map/.test(url)) {
      await route.fulfill({ json: journey });
    } else if (/\/courses\/\d+\/progress/.test(url)) {
      await route.fulfill({ json: progress });
    } else if (url.includes('/courses/vibe-intro')) {
      await route.fulfill({ json: detail });
    } else {
      await route.continue();
    }
  });
}

// Navigates and waits for all 4 API mocks to respond before returning.
// TanStack Query fires detail first, then journey-map + progress after courseId
// resolves — all listeners must be registered before goto to avoid missing them.
async function gotoAndWaitForData(page: Page): Promise<void> {
  await Promise.all([
    page.waitForResponse((r) => /\/courses\/vibe-intro$/.test(r.url())),
    page.waitForResponse((r) =>
      r.url().includes('/courses/vibe-intro/curriculum'),
    ),
    page.waitForResponse((r) => /\/courses\/\d+\/journey-map$/.test(r.url())),
    page.waitForResponse((r) => /\/courses\/\d+\/progress$/.test(r.url())),
    page.goto(PAGE_PATH, { waitUntil: 'load' }),
  ]);
}

// ─── Chunk 1: 안내창 State 렌더링 ─────────────────────────────────────────────

test.describe('안내창 상태 렌더링 @auth', () => {
  test('State 1 — FREE_ENROLLED, 학습 미시작 → 무료 코스 안내 표시', async ({
    page,
  }) => {
    await mockApis(page, {
      detail: makeCourseDetail({
        viewerStatus: 'FREE_ENROLLED',
        freeLessonCount: 3,
        canPurchase: null,
      }),
      progress: makeProgress(0),
    });

    await gotoAndWaitForData(page);

    await expect(
      page.getByText('Chapter3까지 무료 코스! 마음껏 학습하세요.'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '결제하기' }),
    ).not.toBeVisible();
  });

  test('State 2 — FREE_ENROLLED, 무료 레슨 완료 → 결제 CTA 표시', async ({
    page,
  }) => {
    await mockApis(page, {
      detail: makeCourseDetail({
        viewerStatus: 'FREE_ENROLLED',
        freeLessonCount: 2,
        canPurchase: true,
      }),
      journey: makeJourneyMap([
        {
          lessonId: LESSON_FREE_ID,
          order: 1,
          title: LESSON_FREE_TITLE,
          isFree: true,
          status: 'COMPLETED',
          isAccessible: true,
        },
        {
          lessonId: LESSON_LOCKED_ID,
          order: 2,
          title: '심화 레슨',
          isFree: false,
          status: 'LOCKED',
          isAccessible: false,
        },
      ]),
      progress: makeProgress(2, 2),
    });

    await gotoAndWaitForData(page);

    await expect(
      page.getByText(/이어서 공부를 원하시면 결제를 진행해주세요/),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '결제하기' }).first(),
    ).toBeVisible();
  });

  test('State 3 — FREE_ENROLLED, 진행 중 → 다음 레슨 카드 표시', async ({
    page,
  }) => {
    await mockApis(page, {
      detail: makeCourseDetail({
        viewerStatus: 'FREE_ENROLLED',
        freeLessonCount: 3,
        canPurchase: null,
      }),
      journey: makeJourneyMap([
        {
          lessonId: LESSON_FREE_ID,
          order: 1,
          title: LESSON_FREE_TITLE,
          isFree: true,
          status: 'COMPLETED',
          isAccessible: true,
        },
        {
          lessonId: LESSON_LOCKED_ID,
          order: 2,
          title: '심화 레슨',
          isFree: false,
          status: 'IN_PROGRESS',
          isAccessible: true,
        },
      ]),
      progress: makeProgress(1, 3),
    });

    await gotoAndWaitForData(page);

    await expect(page.getByText(/NEXT → Lesson 02/)).toBeVisible();
    await expect(page.getByText('Chapter3까지 무료 코스!')).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: '결제하기' }),
    ).not.toBeVisible();
  });

  test('State 3 — PAID → 다음 레슨 카드 표시', async ({ page }) => {
    await mockApis(page, {
      detail: makeCourseDetail({
        viewerStatus: 'PAID',
        freeLessonCount: null,
        isFreeEnrolled: false,
        isPaidEnrolled: true,
        hasFullAccess: true,
        canPurchase: null,
      }),
      journey: makeJourneyMap([
        {
          lessonId: LESSON_FREE_ID,
          order: 1,
          title: LESSON_FREE_TITLE,
          isFree: true,
          status: 'IN_PROGRESS',
          isAccessible: true,
        },
      ]),
      progress: makeProgress(0),
    });

    await gotoAndWaitForData(page);

    await expect(page.getByText(/NEXT → Lesson 01/)).toBeVisible();
    await expect(page.getByText('Chapter3까지 무료 코스!')).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: '결제하기' }),
    ).not.toBeVisible();
  });

  test('canPurchase=false, FREE_ENROLLED, 무료 완료 → 결제 CTA 숨김', async ({
    page,
  }) => {
    await mockApis(page, {
      detail: makeCourseDetail({
        viewerStatus: 'FREE_ENROLLED',
        freeLessonCount: 2,
        canPurchase: false,
      }),
      progress: makeProgress(2, 2),
    });
    await gotoAndWaitForData(page);

    await expect(
      page.getByRole('button', { name: '결제하기' }),
    ).not.toBeVisible();
  });

  test('LOGIN_ONLY → 결제 CTA 숨김', async ({ page }) => {
    await mockApis(page, {
      detail: makeCourseDetail({
        viewerStatus: 'LOGIN_ONLY',
        canPurchase: true,
        freeLessonCount: 0,
      }),
      progress: makeProgress(0),
    });
    await gotoAndWaitForData(page);

    await expect(
      page.getByRole('button', { name: '결제하기' }),
    ).not.toBeVisible();
  });

  test('freeLessonCount=0, completedLessons=0, canPurchase=true → 결제 CTA 즉시 표시', async ({
    page,
  }) => {
    await mockApis(page, {
      detail: makeCourseDetail({
        viewerStatus: 'FREE_ENROLLED',
        freeLessonCount: 0,
        canPurchase: true,
      }),
      progress: makeProgress(0),
    });
    await gotoAndWaitForData(page);

    // Sticky payment CTA shows when canPurchase=true regardless of freeLessonCount
    await expect(
      page.getByRole('button', { name: '결제하기' }).first(),
    ).toBeVisible();
  });
});

// ─── Chunk 2: 레슨 스탬프 인터랙션 ───────────────────────────────────────────

test.describe('레슨 스탬프 인터랙션 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockApis(page, { progress: makeProgress(0) });
    await gotoAndWaitForData(page);
  });

  test('접근 가능 스탬프 클릭 → 프리뷰 모달 열림', async ({ page }) => {
    // Accessible stamps render as <button>; locked stamps as <div aria-disabled>
    const accessibleStamps = page
      .getByRole('button')
      .filter({ hasText: /Lesson/ });
    await accessibleStamps.first().click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText(LESSON_FREE_TITLE);
  });

  test('Option bonus 레슨 모달 → 건너뛰기 visible, 일반 레슨에서는 없음', async ({
    page,
  }) => {
    const accessibleStamps = page
      .getByRole('button')
      .filter({ hasText: /Lesson/ });

    // First stamp (regular lesson) → no 건너뛰기
    await accessibleStamps.first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('button', { name: '건너뛰기' }),
    ).not.toBeVisible();
    await page.keyboard.press('Escape');

    // Second accessible stamp (option lesson) → 건너뛰기 visible
    await accessibleStamps.nth(1).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('button', { name: '건너뛰기' })).toBeVisible();
  });

  test('Locked 스탬프 → aria-disabled, 모달 미열림', async ({ page }) => {
    const lockedStamp = page.locator('[aria-disabled="true"]').first();
    await expect(lockedStamp).toBeVisible();

    await lockedStamp.click({ force: true });
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});

// ─── Chunk 3: 모달 내비게이션 ─────────────────────────────────────────────────

test.describe('시작하기 내비게이션 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockApis(page, {
      journey: makeJourneyMap([
        {
          lessonId: LESSON_FREE_ID,
          order: 1,
          title: LESSON_FREE_TITLE,
          isFree: true,
          status: 'IN_PROGRESS',
          isAccessible: true,
        },
        {
          lessonId: LESSON_OPTION_ID,
          order: 2,
          title: LESSON_OPTION_TITLE,
          isFree: true,
          status: 'IN_PROGRESS',
          isAccessible: true,
        },
      ]),
      progress: makeProgress(0),
    });
    await gotoAndWaitForData(page);

    const accessibleStamps = page
      .getByRole('button')
      .filter({ hasText: /Lesson/ });
    await accessibleStamps.first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('시작하기 클릭 → 레슨 페이지로 이동', async ({ page }) => {
    await page.getByRole('button', { name: '시작하기' }).click();
    await page.waitForURL(`**/class/vibe-intro/lesson/${LESSON_FREE_ID}`);
    expect(page.url()).toContain(`/class/vibe-intro/lesson/${LESSON_FREE_ID}`);
  });
});

// ─── Chunk 4: 커리큘럼 레슨 카드 배지 렌더링 ──────────────────────────────────

test.describe('커리큘럼 레슨 카드 배지 렌더링 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/courses\//, async (route) => {
      const url = route.request().url();
      if (url.includes('/courses/vibe-intro/curriculum')) {
        await route.fulfill({ json: makeCurriculumWithBadges() });
      } else if (/\/courses\/\d+\/journey-map/.test(url)) {
        await route.fulfill({
          json: makeJourneyMap([
            {
              lessonId: LESSON_FREE_ID,
              order: 1,
              title: LESSON_FREE_TITLE,
              isFree: true,
              status: 'IN_PROGRESS',
              isAccessible: true,
            },
            {
              lessonId: LESSON_LOCKED_ID,
              order: 2,
              title: '심화 레슨',
              isFree: false,
              status: 'LOCKED',
              isAccessible: false,
            },
            {
              lessonId: LESSON_UNLOCKED_ID,
              order: 3,
              title: '결제 완료 레슨',
              isFree: false,
              status: 'IN_PROGRESS',
              isAccessible: true,
            },
          ]),
        });
      } else if (/\/courses\/\d+\/progress/.test(url)) {
        await route.fulfill({ json: makeProgress(0) });
      } else if (url.includes('/courses/vibe-intro')) {
        await route.fulfill({ json: makeCourseDetail() });
      } else {
        await route.continue();
      }
    });
    await gotoAndWaitForData(page);
  });

  test('isFree=true → 무료 배지 표시', async ({ page }) => {
    await expect(page.getByText('무료').first()).toBeVisible();
  });

  test('isFree=false, isAccessible=false → 잠금 배지 표시', async ({
    page,
  }) => {
    await expect(
      page.getByRole('img', { name: '잠금', exact: true }),
    ).toBeVisible();
  });

  test('isFree=false, isAccessible=true → 잠금 해제 배지 표시', async ({
    page,
  }) => {
    await expect(
      page.getByRole('img', { name: '잠금 해제', exact: true }),
    ).toBeVisible();
  });

  test('세 배지 동시 렌더링 — 상호 배타적', async ({ page }) => {
    await expect(page.getByText('무료').first()).toBeVisible();
    await expect(
      page.getByRole('img', { name: '잠금', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('img', { name: '잠금 해제', exact: true }),
    ).toBeVisible();
  });
});

test.describe('건너뛰기 내비게이션 @auth', () => {
  test('Option bonus 건너뛰기 → 맵 유지 및 토스트 표시', async ({ page }) => {
    await mockApis(page, {
      journey: makeJourneyMap([
        {
          lessonId: LESSON_FREE_ID,
          order: 1,
          title: LESSON_FREE_TITLE,
          isFree: true,
          status: 'IN_PROGRESS',
          isAccessible: true,
        },
        {
          lessonId: LESSON_OPTION_ID,
          order: 3,
          title: LESSON_OPTION_TITLE,
          isFree: true,
          status: 'IN_PROGRESS',
          isAccessible: true,
        },
        {
          lessonId: LESSON_LOCKED_ID,
          order: 4,
          title: '심화 레슨',
          isFree: false,
          status: 'LOCKED',
          isAccessible: false,
        },
      ]),
      progress: makeProgress(0),
    });
    await gotoAndWaitForData(page);

    // Click the option stamp (second accessible button)
    const accessibleStamps = page
      .getByRole('button')
      .filter({ hasText: /Lesson/ });
    await accessibleStamps.nth(1).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('button', { name: '건너뛰기' })).toBeVisible();

    await page.getByRole('button', { name: '건너뛰기' }).click();

    // Toast appears immediately after click — assert before dialog animation completes
    await expect(page.getByText('다음 레슨으로 이어가세요')).toBeVisible({
      timeout: 3000,
    });

    // Modal closes, URL stays on journey map
    await expect(page.getByRole('dialog')).not.toBeVisible();
    expect(page.url()).toContain(PAGE_PATH);
  });
});
