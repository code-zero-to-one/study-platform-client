import { describe, expect, it } from 'vitest';
import { normalizeAdminCourseMarkdownContent } from './admin-course-markdown';

const signedImageUrl =
  'https://uploaded-files-qa.32cd2fa416bea795bf67cbf65411103b.r2.cloudflarestorage.com/images/lesson-content/a9e80c53.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc123';

describe('normalizeAdminCourseMarkdownContent', () => {
  it('converts imported raw markdown into editor-safe HTML', () => {
    const normalized = normalizeAdminCourseMarkdownContent(
      [`### 제목`, '', `![image.png](${signedImageUrl})`].join('\n'),
    );

    expect(normalized).toContain('<h3>');
    expect(normalized).toContain('<img');
    expect(normalized).toContain(signedImageUrl);
  });

  it('repairs TipTap-degraded markdown paragraph HTML', () => {
    const normalized = normalizeAdminCourseMarkdownContent(
      `<p>### 제목</p><p>![image.png](${signedImageUrl})</p>`,
    );

    expect(normalized).toContain('<h3>');
    expect(normalized).toContain('<img');
    expect(normalized).toContain(signedImageUrl);
  });

  it('keeps markdown parsing when lesson text includes HTML examples in code fences', () => {
    const normalized = normalizeAdminCourseMarkdownContent(
      [
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
      ].join('\n'),
    );

    expect(normalized).toContain('<h3>');
    expect(normalized).toContain('<pre><code>');
    expect(normalized).toContain('&lt;h1&gt;Hello, Zero-One!&lt;/h1&gt;');
    expect(normalized).toContain('<img');
    expect(normalized).toContain(signedImageUrl);
  });

  it('strips editor-breaking attributes from rendered markdown HTML', () => {
    const normalized = normalizeAdminCourseMarkdownContent(
      [
        '### 제목',
        '',
        '<span class="external" data-node="x" onclick="alert(1)">본문</span>',
      ].join('\n'),
    );

    expect(normalized).toContain('<h3>제목</h3>');
    expect(normalized).toContain('<span>본문</span>');
    expect(normalized).not.toContain('class=');
    expect(normalized).not.toContain('data-node=');
    expect(normalized).not.toContain('onclick=');
  });

  it('keeps normal editor HTML as HTML while stripping unsafe attributes', () => {
    const normalized = normalizeAdminCourseMarkdownContent(
      '<p class="external" onclick="alert(1)">본문</p><img src="https://example.com/a.png" style="width:100px">',
    );

    expect(normalized).toBe('<p>본문</p><img src="https://example.com/a.png">');
  });
});
