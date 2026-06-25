import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { replaceEmoticonShortcodes } from '@/components/common/ui/editor/emoticon-shortcode';
import {
  applyPostSanitizeAttributes,
  SANITIZE_OPTIONS,
} from '@/components/common/ui/editor/markdown-sanitizer';
import { renderMarkdownTablesInHtml } from '@/components/common/ui/editor/markdown-table-utils';
import { replaceStandaloneYouTubeLinksWithEmbeds } from '@/components/common/ui/editor/youtube-utils';

/**
 * 레거시 "순수 HTML" 본문 판별. **블록 레벨** 태그가 있으면 통째로 HTML로 보고
 * 패스스루한다(기존 운영 본문·커뮤니티/피드 = TipTap getHTML).
 *
 * 마크다운 본문은 `<strong>`/`<em>`/`<u>`/`<s>`/`<img>` 같은 **인라인** HTML 폴백을
 * 포함할 수 있는데(한글+구두점 강조, 밑줄, 이미지 너비), 이때는 블록 태그가 없으므로
 * marked 경로로 간다. marked는 인라인 HTML을 통과시키면서 `**`·`##` 등 마크다운을
 * 함께 처리하므로 "마크다운 + 인라인 HTML 혼합"이 정상 렌더된다.
 */
const BLOCK_HTML_TAG_PATTERN =
  /<\/?(?:p|h[1-6]|ul|ol|li|blockquote|pre|table|thead|tbody|tr|td|th|hr|div)\b/i;

const isLegacyHtmlContent = (content: string): boolean =>
  BLOCK_HTML_TAG_PATTERN.test(content);

/**
 * 레슨 본문(마크다운 또는 레거시 HTML)을 학생 화면과 동일한 안전한 HTML 문자열로 변환한다.
 *
 * 미리보기(admin)와 학생 화면이 **반드시 동일하게** 렌더되도록, 두 컴포넌트
 * (`MarkdownContent`, `MarkdownContentCore`)는 이 단일 함수를 공유한다.
 * 변환은 항상 `소스 → HTML` 단방향이며 손실이 없다.
 *
 * 파이프라인:
 * 1. 이모티콘/단독 유튜브 URL을 임베드로 치환
 * 2. HTML이면 파이프-문단 표를 `<table>`로 언랩, 마크다운이면 `marked`로 변환
 * 3. DOMPurify 정화 → 이미지 src 해석·width 복원·youtube 속성 등 후처리
 *
 * 코드 하이라이팅(hljs)과 mermaid 다이어그램 렌더는 DOM 변형이 필요하므로
 * 각 컴포넌트의 `useEffect`에서 이 함수의 결과 위에 적용한다.
 */
export function renderLessonContentToSafeHtml(content: string): string {
  if (!content || content.trim().length === 0) {
    return '';
  }

  const isOriginalHtml = isLegacyHtmlContent(content);
  const contentWithEmbeds = replaceEmoticonShortcodes(
    replaceStandaloneYouTubeLinksWithEmbeds(content),
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

  const sanitized = String(DOMPurify.sanitize(html, SANITIZE_OPTIONS));

  return applyPostSanitizeAttributes({
    originalHtml: html,
    sanitizedHtml: sanitized,
  });
}
