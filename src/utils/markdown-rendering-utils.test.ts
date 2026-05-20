import { describe, expect, it } from 'vitest';
import {
  hasRenderableMarkdownSyntax,
  recoverMarkdownTextFromTextOnlyHtml,
  renderMarkdownToHtml,
  shouldRenderMarkdownAsMarkdown,
} from './markdown-rendering-utils';

const signedImageUrl =
  'https://uploaded-files-qa.32cd2fa416bea795bf67cbf65411103b.r2.cloudflarestorage.com/images/lesson-content/a9e80c53.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc123';

describe('markdown-rendering-utils', () => {
  it('signed URL markdown images become HTML images without losing the URL', () => {
    const html = renderMarkdownToHtml(`![image.png](${signedImageUrl})`);

    expect(html).toContain('<img');
    expect(html).toContain('alt="image.png"');
    expect(html).toContain(
      'src="https://uploaded-files-qa.32cd2fa416bea795bf67cbf65411103b.r2.cloudflarestorage.com/images/lesson-content/a9e80c53.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc123"',
    );
  });

  it('detects the markdown structures used by lesson clipboard content', () => {
    const markdown = [
      '### 1단계. Live Server 확장',
      '',
      '> localhost — 내 컴퓨터를 가리키는 임시 주소.',
      '',
      '1. Cursor 좌측 아이콘 클릭',
      '',
      '```markdown',
      '내 index.html을 정리해줘.',
      '```',
      '',
      `![image.png](${signedImageUrl})`,
      '',
      '| 일반 코딩 | 바이브코딩 |',
      '| --- | --- |',
      '| deterministic | non-deterministic |',
    ].join('\n');

    expect(hasRenderableMarkdownSyntax(markdown)).toBe(true);

    const html = renderMarkdownToHtml(markdown);

    expect(html).toContain('<h3>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<ol>');
    expect(html).toContain('<pre><code class="language-markdown">');
    expect(html).toContain('<img');
    expect(html).toContain('<table>');
  });

  it('recovers markdown text from TipTap-degraded paragraph HTML', () => {
    const recovered = recoverMarkdownTextFromTextOnlyHtml(
      `<p>### 제목</p><p>![image.png](${signedImageUrl})</p>`,
    );

    expect(recovered).toBe(`### 제목\n\n![image.png](${signedImageUrl})`);
  });

  it('does not treat real rich HTML as degraded markdown text', () => {
    expect(
      recoverMarkdownTextFromTextOnlyHtml(
        `<p>본문</p><img src="${signedImageUrl}">`,
      ),
    ).toBeUndefined();
  });

  it('treats HTML examples inside fenced code blocks as markdown content', () => {
    const markdown = [
      '#IDE #Cursor #HTML',
      '',
      '### 5단계. 첫 웹페이지 띄우기',
      '',
      '```markdown',
      '<h1>Hello, Zero-One!</h1>',
      '<h2>I am a Vibe Coder</h2>',
      '<h3>Future Frontier</h3>',
      '```',
      '',
      `![image.png](${signedImageUrl})`,
    ].join('\n');

    expect(shouldRenderMarkdownAsMarkdown(markdown)).toBe(true);

    const html = renderMarkdownToHtml(markdown);

    expect(html).toContain('<h3>');
    expect(html).toContain('<pre><code class="language-markdown">');
    expect(html).toContain('&lt;h1&gt;Hello, Zero-One!&lt;/h1&gt;');
    expect(html).toContain('<img');
  });

  it('keeps normal editor HTML classified as HTML even if it has text', () => {
    expect(
      shouldRenderMarkdownAsMarkdown('<p>본문</p><img src="/images/a.png">'),
    ).toBe(false);
  });
});
