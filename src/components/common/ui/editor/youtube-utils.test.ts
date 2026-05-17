import { describe, expect, it } from 'vitest';
import {
  buildYouTubeEmbedAttrs,
  createYouTubeEmbedHtml,
  extractYouTubeEmbedInfo,
  isSingleYouTubeUrlText,
  replaceStandaloneYouTubeLinksWithEmbeds,
} from './youtube-utils';

describe('extractYouTubeEmbedInfo', () => {
  it('watch URL을 youtube-nocookie 임베드 URL로 정규화한다', () => {
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

  it('youtu.be 및 shorts URL과 재생 시작 시간을 지원한다', () => {
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

  it('비디오가 아닌 유튜브 URL과 유효하지 않은 id를 무시한다', () => {
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
  it('단독 마크다운 유튜브 URL을 iframe HTML로 교체한다', () => {
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

  it('단독 HTML anchor 단락을 iframe HTML로 교체한다', () => {
    const content =
      '<p>앞 문장</p><p><a href="https://youtu.be/dQw4w9WgXcQ">링크</a></p><p>뒷 문장</p>';

    const result = replaceStandaloneYouTubeLinksWithEmbeds(content);

    expect(result).toContain(
      'src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"',
    );
    expect(result).toContain('<p>앞 문장</p>');
    expect(result).toContain('<p>뒷 문장</p>');
  });

  it('인라인 유튜브 링크는 변경하지 않는다', () => {
    const content =
      '추천 영상은 https://www.youtube.com/watch?v=dQw4w9WgXcQ 입니다.';

    expect(replaceStandaloneYouTubeLinksWithEmbeds(content)).toBe(content);
  });
});

describe('유튜브 임베드 헬퍼', () => {
  it('유효한 유튜브 URL에만 iframe 속성을 반환한다', () => {
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

  it('임베드 소스 및 단독 붙여넣기 유튜브 URL을 정규화한다', () => {
    expect(
      extractYouTubeEmbedInfo(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=43',
      )?.embedUrl,
    ).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=43');
    expect(
      isSingleYouTubeUrlText('https://youtu.be/dQw4w9WgXcQ')?.videoId,
    ).toBe('dQw4w9WgXcQ');
    expect(
      isSingleYouTubeUrlText('https://youtu.be/dQw4w9WgXcQ now'),
    ).toBeUndefined();
  });

  it('유효한 유튜브 URL에만 iframe HTML을 생성한다', () => {
    expect(createYouTubeEmbedHtml('https://youtu.be/dQw4w9WgXcQ')).toContain(
      '<iframe',
    );
    expect(createYouTubeEmbedHtml('https://example.com/video')).toBeUndefined();
  });
});
