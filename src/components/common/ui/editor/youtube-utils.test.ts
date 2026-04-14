import { describe, expect, it } from 'vitest';
import {
  buildYouTubeEmbedAttrs,
  createYouTubeEmbedHtml,
  extractYouTubeEmbedInfo,
  isSingleYouTubeUrlText,
  normalizeYouTubeEmbedSource,
  replaceStandaloneYouTubeLinksWithEmbeds,
} from './youtube-utils';

describe('extractYouTubeEmbedInfo', () => {
  it('normalizes watch urls into youtube-nocookie embed urls', () => {
    const result = extractYouTubeEmbedInfo(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );

    expect(result).toEqual({
      videoId: 'dQw4w9WgXcQ',
      originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      startAt: undefined,
    });
  });

  it('supports youtu.be and shorts urls with start times', () => {
    const shortUrl = extractYouTubeEmbedInfo(
      'https://youtu.be/dQw4w9WgXcQ?t=90',
    );
    const shortsUrl = extractYouTubeEmbedInfo(
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    );

    expect(shortUrl?.embedUrl).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=90',
    );
    expect(shortUrl?.startAt).toBe(90);
    expect(shortsUrl?.embedUrl).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });

  it('ignores non-video youtube urls and invalid ids', () => {
    expect(
      extractYouTubeEmbedInfo('https://www.youtube.com/playlist?list=PL123'),
    ).toBeUndefined();
    expect(
      extractYouTubeEmbedInfo('https://example.com/video'),
    ).toBeUndefined();
    expect(
      extractYouTubeEmbedInfo('https://youtu.be/not-valid'),
    ).toBeUndefined();
  });
});

describe('replaceStandaloneYouTubeLinksWithEmbeds', () => {
  it('replaces standalone markdown youtube urls with iframe html', () => {
    const content = [
      '소개 문단입니다.',
      '',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      '',
      '마무리 문단입니다.',
    ].join('\n');

    const result = replaceStandaloneYouTubeLinksWithEmbeds(content);

    expect(result).toContain('<iframe');
    expect(result).toContain('class="youtube-embed"');
    expect(result).toContain(
      'src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"',
    );
    expect(result).toContain('소개 문단입니다.');
    expect(result).toContain('마무리 문단입니다.');
  });

  it('replaces standalone html anchor paragraphs with iframe html', () => {
    const content =
      '<p>앞 문장</p><p><a href="https://youtu.be/dQw4w9WgXcQ">링크</a></p><p>뒷 문장</p>';

    const result = replaceStandaloneYouTubeLinksWithEmbeds(content);

    expect(result).toContain(
      'src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"',
    );
    expect(result).toContain('<p>앞 문장</p>');
    expect(result).toContain('<p>뒷 문장</p>');
  });

  it('keeps inline youtube links untouched', () => {
    const content =
      '추천 영상은 https://www.youtube.com/watch?v=dQw4w9WgXcQ 입니다.';

    expect(replaceStandaloneYouTubeLinksWithEmbeds(content)).toBe(content);
  });
});

describe('youtube embed helpers', () => {
  it('returns iframe attrs only for valid youtube urls', () => {
    expect(
      buildYouTubeEmbedAttrs('https://www.youtube.com/embed/dQw4w9WgXcQ'),
    ).toMatchObject({
      class: 'youtube-embed',
      title: 'YouTube video player',
    });
    expect(
      buildYouTubeEmbedAttrs('https://example.com/embed/video'),
    ).toBeUndefined();
  });

  it('normalizes embed sources and single pasted youtube urls', () => {
    expect(
      normalizeYouTubeEmbedSource(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=43',
      ),
    ).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=43');
    expect(
      isSingleYouTubeUrlText('https://youtu.be/dQw4w9WgXcQ')?.videoId,
    ).toBe('dQw4w9WgXcQ');
    expect(
      isSingleYouTubeUrlText('https://youtu.be/dQw4w9WgXcQ now'),
    ).toBeUndefined();
  });

  it('creates iframe html for valid youtube urls only', () => {
    expect(createYouTubeEmbedHtml('https://youtu.be/dQw4w9WgXcQ')).toContain(
      '<iframe',
    );
    expect(createYouTubeEmbedHtml('https://example.com/video')).toBeUndefined();
  });
});
