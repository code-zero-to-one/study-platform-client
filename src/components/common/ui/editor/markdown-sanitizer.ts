import type { Config as DOMPurifyConfig } from 'dompurify';
import { clampImageWidth } from './image-utils';
import { resolveMarkdownAssetUrl } from './markdown-content-assets';

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
    'img',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strong',
    'u',
    'ul',
  ],
  ALLOWED_ATTR: ['alt', 'class', 'href', 'src', 'title', 'width'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:https?:\/\/|mailto:|tel:|\/images\/|#)/i,
};

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

  return document.body.innerHTML;
};
