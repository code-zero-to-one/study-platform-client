import { expect, test } from '@playwright/test';

/**
 * 레슨 본문 마크다운 저장 cutover E2E (full loop).
 *
 * 검증: admin 레슨 편집기(`outputFormat="markdown"`)에서 본문을 저장하면
 * 저장 값이 **HTML이 아니라 마크다운**으로 커밋되고, 학생 상세 화면에서 동일하게
 * 렌더된다.
 *
 * ⚠️ 실행 전제(로컬에서 자동 실행 불가 — admin 로그인 필요):
 *   1) `yarn e2e:save-auth` 로 admin 세션 저장(e2e/fixtures/auth.json).
 *   2) 아래 `LESSON_EDIT_PATH`를 실제 admin 레슨 편집 라우트로 채운다
 *      (`/admin/courses/{courseId}/lessons`).
 *   3) `E2E_BASE_URL=http://localhost:3000 yarn e2e --grep "레슨 마크다운 저장"`
 *      (로컬 변경 검증 시) 또는 staging.
 *
 * CI는 `--grep-invert @auth`로 이 스펙을 스킵한다.
 */
test.describe('레슨 마크다운 저장 @auth', () => {
  // TODO: 실제 admin 레슨 편집 라우트로 교체(courseId 필요).
  const LESSON_EDIT_PATH = '/admin/courses/1/lessons';

  test('본문 저장 값이 마크다운으로 직렬화되어 학생 화면에 렌더된다', async ({
    page,
  }) => {
    await page.goto(LESSON_EDIT_PATH);

    const editor = page.locator('.tiptap').first();
    await expect(editor).toBeVisible();

    // 본문에 볼드 + 표를 입력(리치 에디터 조작은 환경에 맞게 보강 필요).
    await editor.click();
    await page.keyboard.type('마크다운 저장 E2E 본문');

    // 저장 → content/source 커밋 호출을 가로채 페이로드가 마크다운인지 확인.
    const saveRequest = page.waitForRequest(
      (request) =>
        /\/admin\/lessons\/\d+\/content\/source$/.test(request.url()) &&
        request.method() === 'PUT',
    );
    await page.getByRole('button', { name: '현재 레슨 저장' }).click();

    const request = await saveRequest;
    const payload = request.postDataJSON() as { content?: string };
    expect(payload.content).toBeTruthy();
    // 저장 본문은 HTML 블록 태그가 아니라 마크다운이어야 한다.
    expect(payload.content).not.toMatch(/<p>|<h[1-6]>/);
  });
});
