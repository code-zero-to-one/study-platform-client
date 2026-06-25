import { Marked, type Tokens } from 'marked';
import { replaceStandaloneYouTubeLinksWithEmbeds } from './youtube-utils';

const escapeHtmlText = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const toCellHtml = (tag: 'th' | 'td', cell: Tokens.TableCell): string =>
  `<${tag}>${escapeHtmlText(cell.text)}</${tag}>`;

/**
 * 에디터 로드 전용 마크다운→HTML 변환기.
 *
 * - 표: 실제 `<table>`(TipTap WYSIWYG table 노드)로 변환하되, **셀에는 원문
 *   마크다운 텍스트를 리터럴로** 넣는다(`**bold**` 보존). main의
 *   `renderMarkdownTablesInHtml`과 동일한 "셀=리터럴 텍스트" 규약 → 저장 시
 *   직렬화기가 `cell.textContent`로 GFM 표를 무손실 복원한다.
 * - 이모티콘 `:name:`은 텍스트로 둔다(에디터에 이모티콘 노드 없음).
 * - 단독 유튜브 URL은 `<iframe>`으로 바꿔 youtubeEmbed 노드로 파싱되게 한다.
 */
const editorMarked = new Marked({ gfm: true, breaks: true });
editorMarked.use({
  renderer: {
    table(token: Tokens.Table): string {
      const headerCells = token.header
        .map((cell) => toCellHtml('th', cell))
        .join('');
      const bodyRows = token.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => toCellHtml('td', cell)).join('')}</tr>`,
        )
        .join('');

      return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    },
  },
});

export const markdownToEditorHtml = (markdown: string): string => {
  if (!markdown || !markdown.trim()) {
    return '';
  }

  const withEmbeds = replaceStandaloneYouTubeLinksWithEmbeds(markdown);
  const rendered = editorMarked.parse(withEmbeds, { async: false });

  return typeof rendered === 'string' ? rendered : '';
};
