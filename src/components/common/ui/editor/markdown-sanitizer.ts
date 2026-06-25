import type { Config as DOMPurifyConfig } from 'dompurify';
import { clampImageWidth } from './image-utils';
import { resolveMarkdownAssetUrl } from './markdown-content-assets';
import { applyYouTubeIframeAttributes } from './youtube-utils';

export const SANITIZE_OPTIONS: DOMPurifyConfig = {
  ALLOWED_TAGS: [
    'a',
    'blockquote',
    'br',
    'code',
    'del',
    'em',
    'h1',
    'h2',
    'h3',
    'hr',
    'iframe',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strong',
    'table',
    'tbody',
    'td',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
  ],
  ALLOWED_ATTR: [
    'allow',
    'allowfullscreen',
    'alt',
    'class',
    'frameborder',
    'height',
    'href',
    'loading',
    'referrerpolicy',
    'src',
    'title',
    'width',
  ],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP:
    /^(?:https?:\/\/|mailto:|tel:|\/images\/|\/emoticon\/|#|blob:)/i,
};

/**
 * 문자열 형태의 픽셀 값을 숫자로 파싱합니다.
 * 정상 범위를 벗어나면 undefined을 반환합니다.
 * @param value 파싱할 픽셀 값 문자열
 * @returns 파싱된 픽셀 값 또는 undefined (범위 초과 시)
 * @example
 * parseSanitizedImageWidth('250') // 250
 * parseSanitizedImageWidth('50') // 80 (최소값으로 조정)
 * parseSanitizedImageWidth('abc') // undefined
 */
const parseSanitizedImageWidth = (
  value: string | undefined,
): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return clampImageWidth(parsed);
};

/**
 * 정화된 HTML에 원본에서 추출한 이미지 속성들을 적용합니다.
 * 보안상 제거된 width, src 등을 원본에서 가져와 복원합니다.
 * @param originalHtml 정화 전 원본 HTML
 * @param sanitizedHtml DOMPurify로 정화된 HTML
 * @returns 속성이 복원된 HTML 문자열
 * @example
 * const result = applyPostSanitizeAttributes({
 *   originalHtml: '<img src="safe.jpg" width="250">',
 *   sanitizedHtml: '<img>'
 * })
 * // 반환: '<img src="safe.jpg" width="250" target="_blank" rel="noreferrer">'
 */
export const applyPostSanitizeAttributes = ({
  originalHtml,
  sanitizedHtml,
}: {
  originalHtml: string;
  sanitizedHtml: string;
}) => {
  if (typeof window === 'undefined') {
    return sanitizedHtml;
  }

  const originalDocument = new window.DOMParser().parseFromString(
    originalHtml,
    'text/html',
  );

  const document = new window.DOMParser().parseFromString(
    sanitizedHtml,
    'text/html',
  );

  document.querySelectorAll('a[href]').forEach((anchor) => {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noreferrer');
  });

  const originalImages = Array.from(originalDocument.querySelectorAll('img'));
  const sanitizedImages = Array.from(document.querySelectorAll('img'));

  sanitizedImages.forEach((imageElement, index) => {
    imageElement.setAttribute('loading', 'lazy');
    imageElement.setAttribute('decoding', 'async');

    const originalImage = originalImages[index];
    if (!originalImage) {
      return;
    }

    const resolvedSrc = resolveMarkdownAssetUrl(
      originalImage.getAttribute('src') ?? '',
    );

    if (resolvedSrc) {
      imageElement.setAttribute('src', resolvedSrc);
    }

    const width = parseSanitizedImageWidth(
      originalImage.getAttribute('width') ?? undefined,
    );
    if (width === undefined) {
      return;
    }

    imageElement.setAttribute('width', String(width));
  });

  applyYouTubeIframeAttributes(document);

  return document.body.innerHTML;
};
