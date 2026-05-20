import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type {
  BuilderFeedListResponse,
  BuilderFeedDetailResponse,
  BuilderFeedCommentsResponse,
  CourseDetailResponse,
} from '../../src/types/api/course.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_FILE = 'e2e/fixtures/auth.json';
const COURSE_ID = 1;
const FEED_ID = 42;
const FEED_LIST_PATH = '/class/vibe-intro/home?tab=feed';
const FEED_DETAIL_PATH = `/class/vibe-intro/feed/${FEED_ID}`;

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
      slug: 'vibe-intro',
      viewerStatus: 'FREE_ENROLLED',
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
      isFreeEnrolled: true,
      freeLessonCount: 3,
      journeyMapAvailable: true,
      hasFullAccess: false,
      isPaidEnrolled: false,
      canPurchase: null,
    },
  };
}

type FeedItem = BuilderFeedListResponse['feeds'][number];

function makeFeedItem(feedId: number): FeedItem {
  return {
    feedId,
    lessonId: 101,
    content: `테스트 피드 내용 ${feedId}`,
    thumbnailUrl: null,
    author: { memberId: 1, nickname: '테스터', role: 'STUDENT' },
    likeCount: 5,
    commentCount: 2,
    isLiked: false,
    createdAt: '2025-05-01T12:00:00.000Z',
  };
}

function makeFeedList(feeds: FeedItem[] = []): {
  content: BuilderFeedListResponse;
} {
  return {
    content: {
      courseId: COURSE_ID,
      courseTitle: '바이브 코딩 인트로',
      feedCountLabel: `지금까지 ${feeds.length}개의 피드가 완성되었어요!`,
      weeklyTopBuilder: null,
      feeds,
      totalCount: feeds.length,
      hasNext: false,
      paywall: null,
    },
  };
}

function makeFeedDetail(): { content: BuilderFeedDetailResponse } {
  return {
    content: {
      feedId: FEED_ID,
      courseId: COURSE_ID,
      lessonId: 101,
      content: '피드 상세 내용입니다.',
      imageUrls: [],
      author: { memberId: 2, nickname: '테스터', role: 'STUDENT' },
      likeCount: 5,
      commentCount: 1,
      isLiked: false,
      createdAt: '2025-05-01T12:00:00.000Z',
    },
  };
}

function makeComments(): { content: BuilderFeedCommentsResponse } {
  return {
    content: {
      comments: [
        {
          commentId: 1,
          content: '멋진 피드네요!',
          author: { memberId: 3, nickname: '댓글러', role: 'STUDENT' },
          createdAt: '2025-05-01T13:00:00.000Z',
          replies: [],
        },
      ],
    },
  };
}

// ─── Route Mock Helpers ───────────────────────────────────────────────────────
//
// Use URL-object function predicates (url.pathname) rather than regex strings
// so cross-origin requests to test-api.zeroone.it.kr are matched precisely.
//
// Registration order follows LIFO (last registered = first evaluated), so
// more-specific handlers are registered last.

async function mockFeedListApis(page: Page, feeds: FeedItem[] = []) {
  // (1) course detail — single path segment after /courses/
  await page.route(
    (url) => /\/api\/v5\/courses\/[^/]+$/.test(url.pathname),
    async (route) => route.fulfill({ json: makeCourseDetail() }),
  );

  // (2) curriculum — /courses/{slug}/curriculum
  await page.route(
    (url) =>
      url.pathname.startsWith('/api/v5/courses/') &&
      url.pathname.endsWith('/curriculum'),
    async (route) =>
      route.fulfill({
        json: {
          content: {
            courseId: COURSE_ID,
            durationDays: 30,
            totalChapters: 1,
            totalLessons: 1,
            chapters: [],
          },
        },
      }),
  );

  // (3) builder-feeds list — /courses/{courseId}/builder-feeds (checked first via LIFO)
  await page.route(
    (url) =>
      url.pathname.startsWith('/api/v5/courses/') &&
      url.pathname.includes('/builder-feeds'),
    async (route) => route.fulfill({ json: makeFeedList(feeds) }),
  );
}

async function mockFeedDetailApis(page: Page) {
  // (1) course detail
  await page.route(
    (url) => /\/api\/v5\/courses\/[^/]+$/.test(url.pathname),
    async (route) => route.fulfill({ json: makeCourseDetail() }),
  );

  // (2) builder-feeds list on course (for "더 많은 피드" section)
  await page.route(
    (url) =>
      url.pathname.startsWith('/api/v5/courses/') &&
      url.pathname.includes('/builder-feeds'),
    async (route) => route.fulfill({ json: makeFeedList([]) }),
  );

  // (3) feed detail — /builder-feeds/{id} (exact numeric id, no sub-path)
  await page.route(
    (url) => /\/api\/v5\/builder-feeds\/\d+$/.test(url.pathname),
    async (route) => route.fulfill({ json: makeFeedDetail() }),
  );

  // (4) comments — /builder-feeds/{id}/comments
  await page.route(
    (url) =>
      url.pathname.startsWith('/api/v5/builder-feeds/') &&
      url.pathname.endsWith('/comments'),
    async (route) => route.fulfill({ json: makeComments() }),
  );

  // (5) like — POST /builder-feeds/{id}/like (checked first via LIFO)
  await page.route(
    (url) =>
      url.pathname.startsWith('/api/v5/builder-feeds/') &&
      url.pathname.endsWith('/like'),
    async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        json: { content: { feedId: FEED_ID, isLiked: true, likeCount: 6 } },
      });
    },
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('빌더 피드 목록 @auth', () => {
  test('피드 목록 렌더링 — 피드 내용·작성자·좋아요 수 표시', async ({
    page,
  }) => {
    await mockFeedListApis(page, [makeFeedItem(FEED_ID)]);
    await page.goto(FEED_LIST_PATH, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page.getByText(/테스트 피드 내용/)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('테스터').first()).toBeVisible();
  });

  test('피드 없음 → "아직 등록된 피드가 없어요." 빈 상태 표시', async ({
    page,
  }) => {
    await mockFeedListApis(page, []);
    await page.goto(FEED_LIST_PATH, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page.getByText('아직 등록된 피드가 없어요.')).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe('빌더 피드 상세 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockFeedDetailApis(page);
  });

  test('피드 상세 렌더링 — 내용·댓글 표시', async ({ page }) => {
    await page.goto(FEED_DETAIL_PATH, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page.getByText('피드 상세 내용입니다.')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('멋진 피드네요!')).toBeVisible({
      timeout: 10000,
    });
  });

  test('좋아요 버튼 클릭 → POST /builder-feeds/{id}/like 호출 확인', async ({
    page,
  }) => {
    await page.goto(FEED_DETAIL_PATH, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(page.getByText('피드 상세 내용입니다.')).toBeVisible({
      timeout: 15000,
    });

    const [likeResponse] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes(`/builder-feeds/${FEED_ID}/like`) &&
          r.request().method() === 'POST',
        { timeout: 15000 },
      ),
      page.locator('button').filter({ hasText: '5' }).first().click(),
    ]);

    expect(likeResponse.status()).toBe(200);
  });
});
