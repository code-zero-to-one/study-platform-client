import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type {
  CourseDetailResponse,
  LessonQnaListResponse,
  LessonQnaDetailResponse,
} from '../../src/types/api/course.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTH_FILE = 'e2e/fixtures/auth.json';
const COURSE_ID = 1;
const QNA_ID = 77;
const QNA_LIST_PATH = '/class/vibe-intro/home?tab=qna';
const QNA_DETAIL_PATH = `/class/vibe-intro/qa/${QNA_ID}`;

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

type QnaItem = LessonQnaListResponse['qnas'][number];

function makeQnaItem(qnaId: number): QnaItem {
  return {
    qnaId,
    lessonId: 101,
    lessonTitle: '기초 세팅',
    title: '테스트 질문 제목',
    previewText: '질문 미리보기 내용입니다.',
    answerStatus: 'ANSWER_WAITING',
    curiousCount: 3,
    usefulCount: 2,
    author: { memberId: 1, nickname: '질문자', role: 'STUDENT' },
    createdAt: '2025-05-01T10:00:00.000Z',
  };
}

function makeQnaList(qnas: QnaItem[] = []): { content: LessonQnaListResponse } {
  return {
    content: { qnas, totalCount: qnas.length },
  };
}

function makeQnaDetail(): { content: LessonQnaDetailResponse } {
  return {
    content: {
      qnaId: QNA_ID,
      courseId: COURSE_ID,
      courseTitle: '바이브 코딩 인트로',
      lessonId: 101,
      lessonTitle: '기초 세팅',
      title: '테스트 질문 제목',
      content: '<p>질문 상세 내용입니다.</p>',
      imageUrls: [],
      author: { memberId: 1, nickname: '질문자', role: 'STUDENT' },
      createdAt: '2025-05-01T10:00:00.000Z',
      viewCount: 10,
      usefulCount: 2,
      curiousCount: 3,
      canEdit: false,
      canDelete: false,
      canReport: true,
      answers: [
        {
          answerId: 1,
          content: '<p>답변 내용입니다.</p>',
          imageUrls: [],
          author: { memberId: 99, nickname: '운영진', role: '운영진' },
          createdAt: '2025-05-01T11:00:00.000Z',
          helpfulCount: 5,
          notHelpfulCount: 0,
          canEdit: false,
          canDelete: false,
        },
      ],
    },
  };
}

// ─── Route Mock Helpers ───────────────────────────────────────────────────────

// QnA tab depends on courseId from detail response before fetching qnas.
// Both mocks must be registered before navigation.
async function mockQnaListApis(page: Page, qnas: QnaItem[] = []) {
  await page.route(/\/courses\//, async (route) => {
    const url = route.request().url();
    if (/\/courses\/\d+\/qnas/.test(url)) {
      await route.fulfill({ json: makeQnaList(qnas) });
    } else if (url.includes('/courses/vibe-intro')) {
      await route.fulfill({ json: makeCourseDetail() });
    } else {
      await route.continue();
    }
  });
}

async function mockQnaDetailApis(page: Page) {
  await page.route(/\/qnas\//, async (route) => {
    const url = route.request().url();
    if (/\/qnas\/\d+$/.test(url) && route.request().method() === 'GET') {
      await route.fulfill({ json: makeQnaDetail() });
    } else {
      await route.continue();
    }
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('QnA 목록', () => {
  test('질문 목록 렌더링 — 제목·레슨·상태 표시', async ({ page }) => {
    await mockQnaListApis(page, [makeQnaItem(QNA_ID)]);
    await Promise.all([
      page.waitForResponse((r) => /\/courses\/vibe-intro$/.test(r.url())),
      page.goto(QNA_LIST_PATH, { waitUntil: 'load' }),
    ]);

    await expect(page.getByText('테스트 질문 제목')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText('기초 세팅').first()).toBeVisible();
    // '답변 대기' appears both as a filter chip and the card status badge —
    // scope to the question card to assert the status badge specifically.
    await expect(
      page
        .getByRole('button', { name: /테스트 질문 제목/ })
        .getByText('답변 대기'),
    ).toBeVisible();
  });

  test('질문 없음 → "아직 등록된 질문이 없어요." 빈 상태 표시', async ({
    page,
  }) => {
    await mockQnaListApis(page, []);
    await Promise.all([
      page.waitForResponse((r) => /\/courses\/vibe-intro$/.test(r.url())),
      page.goto(QNA_LIST_PATH, { waitUntil: 'load' }),
    ]);

    await expect(page.getByText('아직 등록된 질문이 없어요.')).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('QnA 상세', () => {
  test.beforeEach(async ({ page }) => {
    await mockQnaDetailApis(page);
  });

  test('질문 상세 렌더링 — 제목·내용·답변 표시', async ({ page }) => {
    await Promise.all([
      page.waitForResponse(
        (r) => /\/qnas\/\d+$/.test(r.url()) && r.request().method() === 'GET',
      ),
      page.goto(QNA_DETAIL_PATH, { waitUntil: 'load' }),
    ]);

    await expect(page.getByText('테스트 질문 제목')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText('질문 상세 내용입니다.')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText('답변 내용입니다.')).toBeVisible({
      timeout: 5000,
    });
  });

  test('1개 답변 → "1개의 답변이 있어요" 표시', async ({ page }) => {
    await Promise.all([
      page.waitForResponse(
        (r) => /\/qnas\/\d+$/.test(r.url()) && r.request().method() === 'GET',
      ),
      page.goto(QNA_DETAIL_PATH, { waitUntil: 'load' }),
    ]);

    await expect(page.getByText('1개의 답변이 있어요')).toBeVisible({
      timeout: 5000,
    });
  });

  test('질문목록 돌아가기 링크 → /class/vibe-intro/home?tab=qna', async ({
    page,
  }) => {
    await Promise.all([
      page.waitForResponse(
        (r) => /\/qnas\/\d+$/.test(r.url()) && r.request().method() === 'GET',
      ),
      page.goto(QNA_DETAIL_PATH, { waitUntil: 'load' }),
    ]);

    await page.getByRole('link', { name: '질문답변 목록' }).click();
    await page.waitForURL('**/class/vibe-intro/home**', { timeout: 5000 });
    expect(page.url()).toContain('tab=qna');
  });
});
