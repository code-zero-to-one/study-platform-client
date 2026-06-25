import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { normalizeMarkdownContent } from '@/utils/markdown-content-normalize';
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
 * 레거시 "순수 HTML" 본문 판별. **블록 레벨** 태그가 있으면 통째로 HTML로 보고
 * 패스스루(+표 변환)한다(TipTap getHTML로 저장된 기존 본문·커뮤니티/피드).
 *
 * 마크다운 본문은 `<strong>`/`<em>`/`<u>`/`<s>`/`<img>` 같은 **인라인** HTML 폴백을
 * 포함할 수 있는데(한글+구두점 강조·밑줄·이미지 너비), 이때는 블록 태그가 없으므로
 * marked 경로로 간다. marked는 인라인 HTML을 통과시키면서 `**`·`##` 등 마크다운을
 * 함께 처리하므로 "마크다운 + 인라인 HTML 혼합"이 정상 렌더된다.
 */
const BLOCK_HTML_TAG_PATTERN =
  /<\/?(?:p|h[1-6]|ul|ol|li|blockquote|pre|table|thead|tbody|tr|td|th|hr|div)\b/i;

const isLegacyHtmlContent = (content: string): boolean =>
  BLOCK_HTML_TAG_PATTERN.test(content);

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

  const isOriginalHtml = isLegacyHtmlContent(normalizedContent);
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
