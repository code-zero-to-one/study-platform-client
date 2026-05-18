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

async function mockFeedListApis(page: Page, feeds: FeedItem[] = []) {
  await page.route(/\/courses\//, async (route) => {
    const url = route.request().url();
    if (url.includes('/courses/vibe-intro/curriculum')) {
      await route.fulfill({
        json: {
          content: {
            courseId: COURSE_ID,
            durationDays: 30,
            totalChapters: 1,
            totalLessons: 1,
            chapters: [],
          },
        },
      });
    } else if (url.includes('/builder-feeds')) {
      await route.fulfill({ json: makeFeedList(feeds) });
    } else if (url.includes('/courses/vibe-intro')) {
      await route.fulfill({ json: makeCourseDetail() });
    } else {
      await route.continue();
    }
  });
}

async function mockFeedDetailApis(page: Page) {
  // Intercept builder-feeds/* routes first (more specific)
  await page.route(/\/builder-feeds\//, async (route) => {
    const url = route.request().url();
    if (url.includes('/comments')) {
      await route.fulfill({ json: makeComments() });
    } else if (url.includes('/like')) {
      await route.fulfill({
        json: { content: { feedId: FEED_ID, isLiked: true, likeCount: 6 } },
      });
    } else {
      await route.fulfill({ json: makeFeedDetail() });
    }
  });
  // Intercept /courses/* for "더 많은 피드" and course detail
  await page.route(/\/courses\//, async (route) => {
    const url = route.request().url();
    if (url.includes('/builder-feeds')) {
      await route.fulfill({ json: makeFeedList([]) });
    } else if (url.includes('/courses/vibe-intro')) {
      await route.fulfill({ json: makeCourseDetail() });
    } else {
      await route.continue();
    }
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('빌더 피드 목록 @auth', () => {
  test('피드 목록 렌더링 — 피드 내용·작성자·좋아요 수 표시', async ({
    page,
  }) => {
    await mockFeedListApis(page, [makeFeedItem(FEED_ID)]);
    await page.goto(FEED_LIST_PATH, { waitUntil: 'load' });

    await expect(page.getByText(/테스트 피드 내용/)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('테스터').first()).toBeVisible();
  });

  test('피드 없음 → "아직 등록된 피드가 없어요." 빈 상태 표시', async ({
    page,
  }) => {
    await mockFeedListApis(page, []);
    await page.goto(FEED_LIST_PATH, { waitUntil: 'load' });

    await expect(page.getByText('아직 등록된 피드가 없어요.')).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('빌더 피드 상세 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockFeedDetailApis(page);
  });

  test('피드 상세 렌더링 — 내용·댓글 표시', async ({ page }) => {
    await page.goto(FEED_DETAIL_PATH, { waitUntil: 'load' });

    await expect(page.getByText('피드 상세 내용입니다.')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('멋진 피드네요!')).toBeVisible({
      timeout: 5000,
    });
  });

  test('좋아요 버튼 클릭 → POST /builder-feeds/{id}/like 호출 확인', async ({
    page,
  }) => {
    await page.goto(FEED_DETAIL_PATH, { waitUntil: 'load' });
    await expect(page.getByText('피드 상세 내용입니다.')).toBeVisible({
      timeout: 10000,
    });

    // Like button is the first action button (Heart icon + likeCount)
    const [likeResponse] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes(`/builder-feeds/${FEED_ID}/like`) &&
          r.request().method() === 'POST',
      ),
      page.locator('button').filter({ hasText: '5' }).first().click(),
    ]);

    expect(likeResponse.status()).toBe(200);
  });
});
