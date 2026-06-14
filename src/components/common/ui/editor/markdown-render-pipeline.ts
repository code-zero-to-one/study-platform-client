import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { normalizeMarkdownContent } from '@/utils/markdown-content-normalize';
import { isHtmlContent } from '@/utils/markdown-content-shared';
import { replaceEmoticonShortcodes } from './emoticon-shortcode';
import hljs from './hljs-setup';
import {
  applyPostSanitizeAttributes,
  SANITIZE_OPTIONS,
} from './markdown-sanitizer';
import { renderMarkdownTablesInHtml } from './markdown-table-utils';
import { isMermaidCodeBlock, renderMermaidBlocks } from './mermaid-renderer';
import { replaceStandaloneYouTubeLinksWithEmbeds } from './youtube-utils';

/**
 * 내용이 없는 빈 단락(`<p></p>`)을 줄바꿈이 보이는 `<p><br></p>`로 복원합니다.
 * TipTap 에디터는 빈 줄을 빈 단락으로 직렬화하는데, 렌더 단계에서 빈 단락은
 * margin collapse로 사라져 에디터에서 보이던 줄바꿈이 미리보기/상세에서 누락됩니다.
 * 에디터-미리보기-상세의 줄바꿈을 동일하게 맞추기 위해 사용합니다.
 */
const EMPTY_PARAGRAPH_PATTERN = /<p\b[^>]*>(?:\s|&nbsp;|&#160;|&#xa0;)*<\/p>/gi;

export const restoreEmptyParagraphsAsLineBreaks = (html: string): string =>
  html.replace(EMPTY_PARAGRAPH_PATTERN, '<p><br></p>');

/**
 * 마크다운/HTML 콘텐츠를 정화된 안전한 HTML로 변환하는 단일 파이프라인입니다.
 * admin 미리보기(MarkdownContent)와 레슨 상세·피드·커뮤니티(MarkdownContentCore)가
 * 모두 이 함수를 사용해 동일한 결과를 보장합니다(에디터-미리보기-상세 동기화).
 *
 * 처리 순서: 정규화 → 이모티콘/유튜브 임베드 치환 →
 * (HTML이면 파이프 단락→표 변환, 마크다운이면 marked 파싱) →
 * 빈 단락→줄바꿈 복원 → DOMPurify 정화 → 정화 후 속성 복원(이미지 URL/폭, 링크 target 등).
 */
export const renderMarkdownToSafeHtml = (content: unknown): string => {
  const normalizedContent = normalizeMarkdownContent(content);
  if (normalizedContent.length === 0) {
    return '';
  }

  const isOriginalHtml = isHtmlContent(normalizedContent);
  const contentWithEmbeds = replaceEmoticonShortcodes(
    replaceStandaloneYouTubeLinksWithEmbeds(normalizedContent),
  );

  let html: string;

  if (isOriginalHtml) {
    html = renderMarkdownTablesInHtml(contentWithEmbeds);
  } else {
    const rendered = marked.parse(contentWithEmbeds, {
      breaks: true,
      gfm: true,
    });
    html = typeof rendered === 'string' ? rendered : '';
  }

  html = restoreEmptyParagraphsAsLineBreaks(html);

  const sanitized = String(DOMPurify.sanitize(html, SANITIZE_OPTIONS));

  return applyPostSanitizeAttributes({
    originalHtml: html,
    sanitizedHtml: sanitized,
  });
};

/**
 * 렌더된 마크다운 컨테이너에 클라이언트 사이드 후처리를 적용합니다.
 * 코드 블록 신택스 하이라이팅(mermaid 코드 블록은 제외)과 mermaid 다이어그램 렌더링을 수행합니다.
 * 렌더 전략(dangerouslySetInnerHTML vs innerHTML)과 무관하게 동일한 결과를 보장합니다.
 */
export const enhanceRenderedMarkdown = (container: HTMLElement): void => {
  container.querySelectorAll('pre code').forEach((block) => {
    if (isMermaidCodeBlock(block)) {
      return;
    }

    hljs.highlightElement(block as HTMLElement);
  });

  renderMermaidBlocks(container).catch((): undefined => undefined);
};
