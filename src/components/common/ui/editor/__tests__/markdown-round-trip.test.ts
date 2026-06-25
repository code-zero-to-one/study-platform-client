// @vitest-environment jsdom
import { generateJSON, getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { buildLessonEditorExtensions } from '@/components/common/ui/editor/extensions';
import { serializeProseMirrorDocToMarkdown } from '@/components/common/ui/editor/markdown-serializer';
import { markdownToEditorHtml } from '@/components/common/ui/editor/markdown-to-editor-html';
import { renderLessonContentToSafeHtml } from '@/lib/rich-text/render-lesson-content';

const extensions = buildLessonEditorExtensions();
const schema = getSchema(extensions);

/**
 * 저장 무손실 계약 검증용 round-trip.
 * markdown → 에디터 HTML → ProseMirror doc → markdown
 */
const roundTrip = (markdown: string): string => {
  const html = markdownToEditorHtml(markdown);
  const json = generateJSON(html, extensions);
  const doc = Node.fromJSON(schema, json);
  return serializeProseMirrorDocToMarkdown(doc);
};

/** 공백/줄바꿈 cosmetic만 정규화한다. 내용·파이프·이모티콘·URL은 건드리지 않는다. */
const normalize = (value: string): string =>
  value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\\\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

describe('lesson markdown round-trip', () => {
  // 공유 setup(vitest.unit.setup)이 afterEach마다 window/document를 삭제하므로
  // jsdom 전역을 캡처해 매 테스트 전에 복원한다(generateJSON은 DOM이 필요).
  let domWindow: typeof globalThis.window;
  let domDocument: typeof globalThis.document;

  beforeAll(() => {
    domWindow = globalThis.window;
    domDocument = globalThis.document;
  });

  beforeEach(() => {
    globalThis.window = domWindow;
    globalThis.document = domDocument;
  });

  it('preserves canonical GFM through parse → serialize', () => {
    const fixtures: Record<string, string> = {
      heading: '# 제목\n\n본문 문단입니다.',
      headingLevels: '# 1단계\n\n## 2단계\n\n### 3단계',
      emphasis: '**굵게** 그리고 *기울임* 그리고 ~~취소선~~ 입니다.',
      boldFollowedByParticle: '**중요**합니다.',
      // 한글+구두점 인접: 마크다운 `**`가 깨지는 케이스 → HTML 폴백으로 보존
      boldPunctCJK: '<strong>연 매출 5억+</strong>를 올렸죠.',
      underline: '<u>밑줄</u> 텍스트입니다.',
      bulletList: '- 첫째\n- 둘째\n- 셋째',
      orderedList: '1. 하나\n2. 둘\n3. 셋',
      blockquote: '> 인용문입니다.',
      codeBlock: '```js\nconst a = 1;\n```',
      link: '[링크](https://example.com/)',
      emoticon: ':welcome_xxl:',
      emoticonInline: '환영합니다 :okay: 잘 오셨어요.',
      table: '| 항목 | 설명 |\n| --- | --- |\n| 예시 | 내용 |',
      imageDefault: '![대체텍스트](images/lesson-content/a.png)',
    };

    const mismatches: string[] = [];
    for (const [name, md] of Object.entries(fixtures)) {
      const actual = normalize(roundTrip(md));
      const expected = normalize(md);
      if (actual !== expected) {
        mismatches.push(
          `\n[${name}]\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
        );
      }
    }

    expect(mismatches.join('')).toBe('');
  });

  it('preserves structural invariants for HTML fallbacks', () => {
    const imageWithWidth = roundTrip(
      '<img src="images/lesson-content/a.png" alt="설명" width="250" />',
    );
    expect(imageWithWidth).toContain('width="250"');
    expect(imageWithWidth).toContain('images/lesson-content/a.png');
    expect(imageWithWidth).toContain('alt="설명"');

    const youtube = roundTrip('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(youtube).toContain('watch?v=dQw4w9WgXcQ');
  });

  it('renders bold in both markdown and HTML-fallback forms', () => {
    // 정상 케이스: 순수 마크다운 `**`로 직렬화되고 렌더 시 <strong>
    const normal = roundTrip('**중요**합니다.');
    expect(normal).toContain('**중요**');
    expect(renderLessonContentToSafeHtml(normal)).toContain(
      '<strong>중요</strong>',
    );

    // 한글+구두점 깨짐 케이스: HTML 폴백으로 직렬화되고 렌더 시에도 <strong>
    const cjk = roundTrip('<strong>연 매출 5억+</strong>를 올렸죠.');
    expect(cjk).toContain('<strong>연 매출 5억+</strong>');
    expect(cjk).not.toMatch(/\*\*연 매출/);
    expect(renderLessonContentToSafeHtml(cjk)).toContain(
      '<strong>연 매출 5억+</strong>',
    );

    // 혼합(마크다운 `**` + 인라인 HTML 폴백 `<strong>`)이 한 본문에 있어도
    // 둘 다 볼드로 렌더돼야 한다(블록 HTML 아니므로 marked 경로).
    const mixed =
      '## 제목\n\n<strong>5억+</strong>를 벌고 **바이브 코딩**이라는 영역.';
    const mixedHtml = renderLessonContentToSafeHtml(mixed);
    expect(mixedHtml).toContain('<strong>5억+</strong>');
    expect(mixedHtml).toContain('<strong>바이브 코딩</strong>');
    expect(mixedHtml).toContain('<h2');
    expect(mixedHtml).not.toContain('**바이브 코딩**');
  });
});
