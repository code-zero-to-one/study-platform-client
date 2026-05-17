import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'fs';
import type {
  CourseDetailResponse,
  CourseCurriculumResponse,
} from '../../src/types/api/course.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const COURSE_ID = 1;
const LESSON_ID = 101;
const AUTH_FILE = 'e2e/fixtures/auth.json';
const QNA_WRITE_PATH = '/class/vibe-intro/qa/write';

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
      isFreeEnrolled: true,
      freeLessonCount: null,
      journeyMapAvailable: true,
      hasFullAccess: true,
      isPaidEnrolled: true,
      canPurchase: null,
    },
  };
}

function makeCurriculum(): { content: CourseCurriculumResponse } {
  return {
    content: {
      courseId: COURSE_ID,
      durationDays: 30,
      totalChapters: 1,
      totalLessons: 1,
      chapters: [
        {
          chapterId: 10,
          order: 1,
          chapterNumber: 1,
          title: '시작하기',
          description: null,
          estimatedMinutes: 18,
          lessons: [
            {
              lessonId: LESSON_ID,
              order: 1,
              title: '기초 세팅',
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

// ─── Route Mock + Navigation ──────────────────────────────────────────────────

async function mockAndNavigate(page: Page): Promise<void> {
  await page.route(/\/courses\//, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (/\/courses\/\d+\/qnas/.test(url) && method === 'POST') {
      await route.fulfill({ json: { content: { qnaId: 1 } } });
    } else if (url.includes('/courses/vibe-intro/curriculum')) {
      await route.fulfill({ json: makeCurriculum() });
    } else if (url.includes('/courses/vibe-intro')) {
      await route.fulfill({ json: makeCourseDetail() });
    } else {
      await route.continue();
    }
  });

  await Promise.all([
    page.waitForResponse((r) => /\/courses\/vibe-intro$/.test(r.url())),
    page.goto(QNA_WRITE_PATH, { waitUntil: 'load' }),
  ]);
}

// Selects a lesson from the dropdown
async function selectLesson(page: Page) {
  await page.getByRole('button', { name: /Lesson 선택/ }).click();
  await page.getByRole('button', { name: 'Lesson 01. 기초 세팅' }).click();
}

// Types content into the tiptap MarkdownEditor
async function fillEditor(page: Page, text: string) {
  const editor = page.locator('.tiptap-editor [contenteditable]').first();
  await editor.click();
  await page.keyboard.type(text);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('QnA 작성 폼 렌더링 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockAndNavigate(page);
  });

  test('레슨 드롭다운 표시', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Lesson 선택/ })).toBeVisible(
      { timeout: 5000 },
    );
  });

  test('레슨 선택 후 드롭다운에 "Lesson 01. 기초 세팅" 옵션 존재', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Lesson 선택/ }).click();
    await expect(
      page.getByRole('button', { name: 'Lesson 01. 기초 세팅' }),
    ).toBeVisible({ timeout: 5000 });
  });

  test('에디터 영역 표시', async ({ page }) => {
    await expect(
      page.locator('.tiptap-editor [contenteditable]').first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('"등록하기" 버튼 표시', async ({ page }) => {
    await expect(page.getByRole('button', { name: '등록하기' })).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('QnA 유효성 검증 @auth', () => {
  test.beforeEach(async ({ page }) => {
    await mockAndNavigate(page);
  });

  test('레슨 미선택 → "레슨을 선택해주세요." toast', async ({ page }) => {
    await page.getByRole('button', { name: '등록하기' }).click();
    await expect(page.getByText('레슨을 선택해주세요.')).toBeVisible({
      timeout: 5000,
    });
  });

  test('레슨 선택 + 내용 미입력 → "내용을 입력해주세요." toast', async ({
    page,
  }) => {
    await selectLesson(page);
    await page.getByRole('button', { name: '등록하기' }).click();
    await expect(page.getByText('내용을 입력해주세요.')).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('QnA 제출 성공 @auth', () => {
  test('레슨 + 내용 입력 → POST /courses/1/qnas + toast', async ({ page }) => {
    await mockAndNavigate(page);
    await selectLesson(page);
    await fillEditor(page, '질문 내용입니다.');

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) =>
          /\/courses\/\d+\/qnas/.test(r.url()) &&
          r.request().method() === 'POST',
      ),
      page.getByRole('button', { name: '등록하기' }).click(),
    ]);

    expect(response.status()).toBe(200);
    await expect(page.getByText('질문이 등록되었어요!')).toBeVisible({
      timeout: 5000,
    });
  });
});
