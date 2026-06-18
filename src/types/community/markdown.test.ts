import { describe, expect, it } from 'vitest';
import {
  normalizeCommunityMarkdownImageSourcesForStorage,
  toCommunityContentImagePath,
} from './markdown';

describe('community markdown image storage normalization', () => {
  it('extracts an internal image path from a signed public URL', () => {
    expect(
      toCommunityContentImagePath(
        'https://uploaded-files.32cd2fa416bea795bf67cbf65411103b.r2.cloudflarestorage.com/images/community-post-content/cover.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=abc123',
      ),
    ).toBe('images/community-post-content/cover.png');
  });

  it('keeps community image paths canonical without a leading slash or query', () => {
    expect(
      toCommunityContentImagePath(
        '/images/community-post-content/cover.png?version=1',
      ),
    ).toBe('images/community-post-content/cover.png');
  });

  it('normalizes image src attributes before storage', () => {
    const normalized = normalizeCommunityMarkdownImageSourcesForStorage(
      '<p>본문</p><img src="https://api.zeroone.it.kr/images/community-post-content/cover.png?expires=1" alt="cover">',
    );

    expect(normalized).toBe(
      '<p>본문</p><img src="images/community-post-content/cover.png" alt="cover">',
    );
  });

  it('leaves non-community image sources unchanged for backend validation', () => {
    expect(
      normalizeCommunityMarkdownImageSourcesForStorage(
        '<img src="https://example.com/external.png" alt="external">',
      ),
    ).toBe('<img src="https://example.com/external.png" alt="external">');
  });
});
