import {
  decodeHtmlEntities,
  isHtmlContent,
} from '@/utils/markdown-content-shared';

export const YOUTUBE_IFRAME_TITLE = 'YouTube video player';
const YOUTUBE_IFRAME_CLASS = 'youtube-embed';
const YOUTUBE_IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
const YOUTUBE_IFRAME_REFERRER_POLICY = 'strict-origin-when-cross-origin';
const YOUTUBE_VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;
const MARKDOWN_STANDALONE_YOUTUBE_URL_REGEX =
  /(^|\n)([^\S\n]*)((?:https?:\/\/|www\.)[^\s<]+)(?=\n|$)/g;
const MARKDOWN_STANDALONE_YOUTUBE_LINK_REGEX =
  /(^|\n)([^\S\n]*)\[[^\]]+\]\(([^)\s]+)\)(?=\n|$)/g;
const HTML_STANDALONE_YOUTUBE_ANCHOR_REGEX =
  /<p>(?:\s|&nbsp;|<br\s*\/?>)*<a\b[^>]*href=(["'])(.*?)\1[^>]*>.*?<\/a>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi;
const HTML_STANDALONE_YOUTUBE_TEXT_REGEX =
  /<p>(?:\s|&nbsp;|<br\s*\/?>)*((?:https?:\/\/|www\.)[^<\s]+)(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi;

export interface YouTubeEmbedInfo {
  videoId: string;
  originalUrl: string;
  embedUrl: string;
  startAt?: number;
}

const removeYouTubeSubdomainPrefix = (host: string) => {
  return host.replace(/^(?:www\.|m\.)/i, '').toLowerCase();
};

const normalizeUrlCandidate = (value: string) => {
  const trimmed = decodeHtmlEntities(value).trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (
    /^(?:https?:\/\/)/i.test(trimmed) ||
    /^(?:www\.)?(?:m\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(
      trimmed,
    )
  ) {
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }

  return undefined;
};

const extractVideoIdFromPath = (pathname: string, prefix: string) => {
  const path = pathname.replace(/\/+$/, '');
  const segment = path.startsWith(prefix)
    ? path.slice(prefix.length).split('/')[0]
    : '';

  return YOUTUBE_VIDEO_ID_REGEX.test(segment) ? segment : undefined;
};

const parseYouTubeStartAt = (raw: string | undefined) => {
  if (!raw) {
    return undefined;
  }

  const decoded = decodeHtmlEntities(raw).trim();
  if (!decoded) {
    return undefined;
  }

  if (/^\d+$/.test(decoded)) {
    const seconds = Number.parseInt(decoded, 10);

    return seconds > 0 ? seconds : undefined;
  }

  const match = decoded.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);

  if (!match) {
    return undefined;
  }

  const hours = Number.parseInt(match[1] ?? '0', 10);
  const minutes = Number.parseInt(match[2] ?? '0', 10);
  const seconds = Number.parseInt(match[3] ?? '0', 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds > 0 ? totalSeconds : undefined;
};

const getHashSearchParams = (hash: string) => {
  const trimmedHash = hash.replace(/^#/, '');

  if (!trimmedHash) {
    return undefined;
  }

  return new URLSearchParams(trimmedHash);
};

const buildYouTubeEmbedUrl = ({
  videoId,
  startAt,
}: Pick<YouTubeEmbedInfo, 'videoId' | 'startAt'>) => {
  const url = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);

  if (startAt) {
    url.searchParams.set('start', String(startAt));
  }

  return url.toString();
};

export const extractYouTubeEmbedInfo = (
  value: string,
): YouTubeEmbedInfo | undefined => {
  const normalizedUrl = normalizeUrlCandidate(value);

  if (!normalizedUrl) {
    return undefined;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return undefined;
  }

  const host = removeYouTubeSubdomainPrefix(parsedUrl.hostname);
  const pathname = parsedUrl.pathname.replace(/\/+$/, '');
  let videoId: string | undefined;

  if (host === 'youtu.be') {
    videoId = pathname.replace(/^\/+/, '').split('/')[0] || undefined;
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (pathname === '/watch') {
      videoId = parsedUrl.searchParams.get('v') ?? undefined;
    } else {
      videoId =
        extractVideoIdFromPath(pathname, '/shorts/') ??
        extractVideoIdFromPath(pathname, '/live/') ??
        extractVideoIdFromPath(pathname, '/embed/') ??
        extractVideoIdFromPath(pathname, '/v/');
    }
  }

  if (!videoId || !YOUTUBE_VIDEO_ID_REGEX.test(videoId)) {
    return undefined;
  }

  const hashParams = getHashSearchParams(parsedUrl.hash);
  const startAt =
    parseYouTubeStartAt(parsedUrl.searchParams.get('start')) ??
    parseYouTubeStartAt(parsedUrl.searchParams.get('t')) ??
    parseYouTubeStartAt(hashParams?.get('start') ?? undefined) ??
    parseYouTubeStartAt(hashParams?.get('t') ?? undefined);

  return {
    videoId,
    originalUrl: parsedUrl.toString(),
    embedUrl: buildYouTubeEmbedUrl({ videoId, startAt }),
    startAt,
  };
};

export const normalizeYouTubeEmbedSource = (value: string) => {
  return extractYouTubeEmbedInfo(value)?.embedUrl;
};

export const buildYouTubeEmbedAttrs = (
  value: string | YouTubeEmbedInfo,
): Record<string, string> | undefined => {
  const info =
    typeof value === 'string' ? extractYouTubeEmbedInfo(value) : value;

  if (!info) {
    return undefined;
  }

  return {
    src: info.embedUrl,
    class: YOUTUBE_IFRAME_CLASS,
    title: YOUTUBE_IFRAME_TITLE,
    width: '560',
    height: '315',
    frameborder: '0',
    allow: YOUTUBE_IFRAME_ALLOW,
    loading: 'lazy',
    referrerpolicy: YOUTUBE_IFRAME_REFERRER_POLICY,
    allowfullscreen: 'true',
  };
};

export const createYouTubeEmbedHtml = (value: string | YouTubeEmbedInfo) => {
  const attrs = buildYouTubeEmbedAttrs(value);

  if (!attrs) {
    return undefined;
  }

  // Attribute values originate from buildYouTubeEmbedAttrs (validated YouTube URL
  // constants only). Do not pass untrusted strings here — values are not HTML-escaped.
  const serializedAttrs = Object.entries(attrs)
    .map(([key, attrValue]) => `${key}="${attrValue}"`)
    .join(' ');

  return `<iframe ${serializedAttrs}></iframe>`;
};

/**
 * Validates and re-applies standard YouTube embed attributes to all iframes
 * in the given Document. Removes any iframe whose src is not a valid YouTube URL.
 * Called as a post-sanitize step in both editor and viewer rendering pipelines.
 */
export const applyYouTubeIframeAttributes = (doc: Document): void => {
  doc.querySelectorAll('iframe').forEach((iframeElement) => {
    const attrs = buildYouTubeEmbedAttrs(
      iframeElement.getAttribute('src') ?? '',
    );

    if (!attrs) {
      iframeElement.remove();
      return;
    }

    Object.entries(attrs).forEach(([key, value]) => {
      iframeElement.setAttribute(key, value);
    });
  });
};

const replaceStandaloneMarkdownYoutubeLinks = (content: string) => {
  const replaceBlock = (
    match: string,
    prefix: string,
    indent: string,
    candidateUrl: string,
  ) => {
    const embedHtml = createYouTubeEmbedHtml(candidateUrl);

    if (!embedHtml) {
      return match;
    }

    return `${prefix}${indent}${embedHtml}`;
  };

  return content
    .replace(
      MARKDOWN_STANDALONE_YOUTUBE_LINK_REGEX,
      (match, prefix: string, indent: string, candidateUrl: string) =>
        replaceBlock(match, prefix, indent, candidateUrl),
    )
    .replace(
      MARKDOWN_STANDALONE_YOUTUBE_URL_REGEX,
      (match, prefix: string, indent: string, candidateUrl: string) =>
        replaceBlock(match, prefix, indent, candidateUrl),
    );
};

const replaceStandaloneHtmlYoutubeLinks = (content: string) => {
  return content
    .replace(
      HTML_STANDALONE_YOUTUBE_ANCHOR_REGEX,
      (match, _quote: string, href: string) => {
        return createYouTubeEmbedHtml(href) ?? match;
      },
    )
    .replace(
      HTML_STANDALONE_YOUTUBE_TEXT_REGEX,
      (match, candidateUrl: string) => {
        return createYouTubeEmbedHtml(candidateUrl) ?? match;
      },
    );
};

export const replaceStandaloneYouTubeLinksWithEmbeds = (content: string) => {
  if (!content.trim()) {
    return content;
  }

  return isHtmlContent(content)
    ? replaceStandaloneHtmlYoutubeLinks(content)
    : replaceStandaloneMarkdownYoutubeLinks(content);
};

export const isSingleYouTubeUrlText = (value: string) => {
  const trimmed = decodeHtmlEntities(value).trim();

  if (!trimmed || /\s/.test(trimmed)) {
    return undefined;
  }

  return extractYouTubeEmbedInfo(trimmed);
};
