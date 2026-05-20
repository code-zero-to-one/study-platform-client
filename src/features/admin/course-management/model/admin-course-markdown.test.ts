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

  it('keeps normal editor HTML as HTML while stripping unsafe attributes', () => {
    const normalized = normalizeAdminCourseMarkdownContent(
      '<p class="external" onclick="alert(1)">본문</p><img src="https://example.com/a.png" style="width:100px">',
    );

    expect(normalized).toBe('<p>본문</p><img src="https://example.com/a.png">');
  });
});
