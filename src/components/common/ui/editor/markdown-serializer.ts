import type { Editor } from '@tiptap/core';
import type { Mark, MarkType, Node as ProseMirrorNode } from '@tiptap/pm/model';
import {
  defaultMarkdownSerializer,
  MarkdownSerializer,
  type MarkdownSerializerState,
} from 'prosemirror-markdown';
import {
  MARKDOWN_IMAGE_DEFAULT_WIDTH,
  MARKDOWN_IMAGE_MIN_WIDTH,
  parseImageWidth,
} from './image-utils';
import { extractYouTubeEmbedInfo } from './youtube-utils';

/**
 * 표는 에디터에서 PM table 노드가 아니라 `|`를 포함한 **텍스트 문단**의 연속으로
 * 저장된다(`insertMarkdownTable`). 표 행으로 추정되는 문단은 trim 후 `|`로 시작한다.
 */
const isTableRowParagraph = (node: ProseMirrorNode): boolean => {
  if (node.type.name !== 'paragraph') {
    return false;
  }

  return node.textContent.trim().startsWith('|');
};

const isFollowedByTableRow = (
  parent: ProseMirrorNode | undefined,
  index: number,
): boolean => {
  if (!parent || index + 1 >= parent.childCount) {
    return false;
  }

  return isTableRowParagraph(parent.child(index + 1));
};

// --- 한글+마크다운 강조(flanking) 처리 ---------------------------------------
// 마크다운 `**`/`*`/`~~`는 CommonMark flanking 규칙을 따르며 GitHub·marked 모두
// 동일하다. 강조가 구두점으로 끝나고 바로 공백 아닌 글자(한글 조사 등)가 오면
// 닫는 구분자가 무효가 돼 볼드가 렌더되지 않는다. 그 케이스만 HTML 폴백
// (`<strong>`/`<em>`/`<s>`)으로 직렬화해 repo preview·웹 양쪽에서 항상 보이게 한다.
const ASCII_PUNCTUATION = /[!-/:-@[-`{-~]/;
const isPunctuationChar = (ch: string): boolean =>
  !!ch && (ASCII_PUNCTUATION.test(ch) || /\p{P}/u.test(ch));
const isWhitespaceChar = (ch: string): boolean => !!ch && /\s/.test(ch);

const textEdgeChar = (
  node: ProseMirrorNode | undefined,
  side: 'first' | 'last',
): string => {
  if (!node || !node.isText || !node.text) {
    return '';
  }
  return side === 'first' ? node.text[0] : node.text[node.text.length - 1];
};

/** index가 속한, markType를 가진 연속 텍스트 노드 구간 [start, end)를 구한다. */
const markRunBounds = (
  parent: ProseMirrorNode,
  index: number,
  markType: MarkType,
  direction: 'forward' | 'backward',
): { start: number; end: number } => {
  const has = (i: number): boolean =>
    i >= 0 &&
    i < parent.childCount &&
    parent.child(i).marks.some((m) => m.type === markType);

  if (direction === 'forward') {
    let end = index;
    while (has(end)) {
      end += 1;
    }
    return { start: index, end };
  }

  let start = index - 1;
  while (has(start)) {
    start -= 1;
  }
  return { start: start + 1, end: index };
};

/** 해당 강조 구간이 마크다운 구분자로도 정상 렌더되는지(flanking 유효) 판정. */
const emphasisRendersAsMarkdown = (
  parent: ProseMirrorNode,
  start: number,
  end: number,
): boolean => {
  const firstChar = textEdgeChar(parent.child(start), 'first');
  const lastChar = textEdgeChar(parent.child(end - 1), 'last');
  const beforeChar = textEdgeChar(
    start > 0 ? parent.child(start - 1) : undefined,
    'last',
  );
  const afterChar = textEdgeChar(
    end < parent.childCount ? parent.child(end) : undefined,
    'first',
  );

  const openValid =
    !!firstChar &&
    !isWhitespaceChar(firstChar) &&
    (!isPunctuationChar(firstChar) ||
      !beforeChar ||
      isWhitespaceChar(beforeChar) ||
      isPunctuationChar(beforeChar));

  const closeValid =
    !!lastChar &&
    !isWhitespaceChar(lastChar) &&
    (!isPunctuationChar(lastChar) ||
      !afterChar ||
      isWhitespaceChar(afterChar) ||
      isPunctuationChar(afterChar));

  return openValid && closeValid;
};

/**
 * 마크다운 구분자가 정상 렌더될 때만 구분자를, 아니면 HTML 태그를 쓰는 마크.
 * open/close가 동일 구간을 보고 같은 판정을 하므로 항상 짝이 맞는다.
 */
const flankingAwareMark = (delimiter: string, htmlTag: string) => ({
  mixable: true,
  expelEnclosingWhitespace: true,
  open: (
    _state: MarkdownSerializerState,
    mark: Mark,
    parent: ProseMirrorNode,
    index: number,
  ): string => {
    const { start, end } = markRunBounds(parent, index, mark.type, 'forward');
    return emphasisRendersAsMarkdown(parent, start, end)
      ? delimiter
      : `<${htmlTag}>`;
  },
  close: (
    _state: MarkdownSerializerState,
    mark: Mark,
    parent: ProseMirrorNode,
    index: number,
  ): string => {
    const { start, end } = markRunBounds(parent, index, mark.type, 'backward');
    return emphasisRendersAsMarkdown(parent, start, end)
      ? delimiter
      : `</${htmlTag}>`;
  },
});

const escapeHtmlAttribute = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const serializeImage = (
  state: MarkdownSerializerState,
  node: ProseMirrorNode,
) => {
  const src = typeof node.attrs.src === 'string' ? node.attrs.src : '';
  const alt = typeof node.attrs.alt === 'string' ? node.attrs.alt : '';
  const title = typeof node.attrs.title === 'string' ? node.attrs.title : '';
  const width = parseImageWidth(node.attrs.width);

  // "자연 너비"(마크다운 `![]()`에서 로드 시 부여되는 200, 에디터 삽입 기본 480)는
  // 명시적 리사이즈가 아니므로 마크다운 형식으로 둔다. 그 외 너비만 HTML `<img>`
  // 폴백으로 보존한다(sanitizer 허용 태그 + 렌더 시 너비 복원).
  const isNaturalWidth =
    width === MARKDOWN_IMAGE_DEFAULT_WIDTH ||
    width === MARKDOWN_IMAGE_MIN_WIDTH;

  if (src && !isNaturalWidth) {
    const titleAttribute = title
      ? ` title="${escapeHtmlAttribute(title)}"`
      : '';
    state.write(
      `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(
        alt,
      )}" width="${width}"${titleAttribute} />`,
    );
  } else {
    const titlePart = title ? ` ${JSON.stringify(title)}` : '';
    state.write(`![${state.esc(alt)}](${src}${titlePart})`);
  }

  if (!node.type.isInline) {
    state.closeBlock(node);
  }
};

/**
 * TipTap(v3) 문서를 GFM 마크다운으로 직렬화한다.
 *
 * `prosemirror-markdown`의 `MarkdownSerializer`를 사용해 ProseMirror 스키마
 * 기준으로 직렬화하므로 노드 attr(이미지 width, youtube src)이 1급으로 보존된다.
 * 노드/마크 이름은 TipTap 스키마 기준(camelCase)으로 매핑한다.
 */
export const lessonMarkdownSerializer = new MarkdownSerializer(
  {
    blockquote: defaultMarkdownSerializer.nodes.blockquote,
    heading: defaultMarkdownSerializer.nodes.heading,
    hardBreak: defaultMarkdownSerializer.nodes.hard_break,
    text: defaultMarkdownSerializer.nodes.text,

    horizontalRule(state, node) {
      state.write('---');
      state.closeBlock(node);
    },

    bulletList(state, node) {
      state.renderList(node, '  ', () => '- ');
    },

    orderedList(state, node) {
      const start = typeof node.attrs.start === 'number' ? node.attrs.start : 1;
      const maxWidth = String(start + node.childCount - 1).length;
      const space = ' '.repeat(maxWidth + 2);

      state.renderList(node, space, (index) => {
        const numberLabel = String(start + index);
        return `${' '.repeat(maxWidth - numberLabel.length)}${numberLabel}. `;
      });
    },

    listItem(state, node) {
      state.renderContent(node);
    },

    codeBlock(state, node) {
      const language =
        typeof node.attrs.language === 'string' &&
        node.attrs.language &&
        node.attrs.language !== 'plaintext'
          ? node.attrs.language
          : '';

      state.write(`\`\`\`${language}\n`);
      state.text(node.textContent, false);
      state.ensureNewLine();
      state.write('```');
      state.closeBlock(node);
    },

    paragraph(state, node, parent, index) {
      // 연속한 표-행 문단은 빈 줄 없이 붙여 GFM 표 블록을 형성한다.
      if (isTableRowParagraph(node)) {
        state.write(node.textContent);

        if (isFollowedByTableRow(parent, index)) {
          state.write('\n');
        } else {
          state.closeBlock(node);
        }

        return;
      }

      state.renderInline(node);
      state.closeBlock(node);
    },

    image: serializeImage,

    youtubeEmbed(state, node) {
      const src = typeof node.attrs.src === 'string' ? node.attrs.src : '';
      const info = extractYouTubeEmbedInfo(src);

      // src가 손상된 노드는 버린다(에디터 renderHTML도 동일하게 빈 노드 처리).
      if (!info) {
        return;
      }

      const startSuffix = info.startAt ? `&t=${info.startAt}s` : '';
      state.write(
        `https://www.youtube.com/watch?v=${info.videoId}${startSuffix}`,
      );
      state.closeBlock(node);
    },
  },
  {
    // 한글+구두점 인접 시 마크다운 구분자가 깨지므로 flanking 판정 후 HTML 폴백.
    bold: flankingAwareMark('**', 'strong'),
    italic: flankingAwareMark('*', 'em'),
    strike: flankingAwareMark('~~', 's'),
    code: defaultMarkdownSerializer.marks.code,
    link: defaultMarkdownSerializer.marks.link,
    // 마크다운에 밑줄 문법이 없어 항상 HTML 폴백을 쓴다(sanitizer가 <u> 허용).
    underline: {
      open: '<u>',
      close: '</u>',
      mixable: true,
      expelEnclosingWhitespace: true,
    },
  },
);

/**
 * ProseMirror 문서 노드를 마크다운으로 직렬화한다(헤드리스: 테스트·마이그레이션용).
 */
export const serializeProseMirrorDocToMarkdown = (
  doc: ProseMirrorNode,
): string => lessonMarkdownSerializer.serialize(doc, { tightLists: true });

/**
 * 에디터 인스턴스의 현재 문서를 마크다운으로 직렬화한다(저장 시 사용).
 */
export const serializeEditorToMarkdown = (editor: Editor): string =>
  serializeProseMirrorDocToMarkdown(editor.state.doc);
