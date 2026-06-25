import { Marked, type Tokens } from 'marked';
import { replaceStandaloneYouTubeLinksWithEmbeds } from './youtube-utils';

type TableAlign = 'center' | 'left' | 'right' | null;

const alignToSeparatorCell = (align: TableAlign): string => {
  switch (align) {
    case 'left':
      return ':---';
    case 'center':
      return ':---:';
    case 'right':
      return '---:';
    default:
      return '---';
  }
};

const toPipeRow = (cells: Tokens.TableCell[]): string =>
  `| ${cells.map((cell) => cell.text).join(' | ')} |`;

/**
 * 에디터 로드 전용 마크다운→HTML 변환기.
 *
 * 학생 렌더러와 달리, 에디터는 표를 위한 PM 노드가 없으므로 GFM 표를
 * `<table>`이 아니라 **각 행이 별개 `<p>` 파이프-행**이 되도록 복원한다
 * (`insertMarkdownTable`의 표현과 일치 → 직렬화 round-trip 보존).
 * 이모티콘 `:name:`은 텍스트로 그대로 둔다(에디터에 이모티콘 노드 없음).
 */
const editorMarked = new Marked({ gfm: true, breaks: true });
editorMarked.use({
  renderer: {
    table(token: Tokens.Table): string {
      const headerLine = toPipeRow(token.header);
      const separatorLine = `| ${token.align
        .map(alignToSeparatorCell)
        .join(' | ')} |`;
      const bodyLines = token.rows.map(toPipeRow);

      return [headerLine, separatorLine, ...bodyLines]
        .map((line) => `<p>${line}</p>`)
        .join('');
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
