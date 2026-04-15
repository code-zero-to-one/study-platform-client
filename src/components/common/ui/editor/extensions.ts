import {
  Extension,
  Node,
  mergeAttributes,
  textblockTypeInputRule,
} from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import ImageExtension from '@tiptap/extension-image';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import dart from 'highlight.js/lib/languages/dart';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import kotlin from 'highlight.js/lib/languages/kotlin';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import { common, createLowlight } from 'lowlight';
import { parseImageWidth, MARKDOWN_IMAGE_DEFAULT_WIDTH } from './image-utils';
import {
  buildYouTubeEmbedAttrs,
  extractYouTubeEmbedInfo,
  YOUTUBE_IFRAME_TITLE,
} from './youtube-utils';

export const lowlight = createLowlight(common);
const LOWLIGHT_LANGUAGES = [
  ['kotlin', kotlin],
  ['sql', sql],
  ['java', java],
  ['python', python],
  ['cpp', cpp],
  ['c', c],
  ['go', go],
  ['rust', rust],
  ['swift', swift],
  ['dart', dart],
] as const;

LOWLIGHT_LANGUAGES.forEach(([name, language]) => {
  lowlight.register(name, language);
});

const INSTANT_CODE_BLOCK_INPUT_REGEX = /^```$/;

/**
 * 이미지 너비 속성을 지원하는 ResizableImage 확장입니다.
 */
export const ResizableImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: MARKDOWN_IMAGE_DEFAULT_WIDTH,
        parseHTML: (element: HTMLElement) =>
          parseImageWidth(element.getAttribute('width')),
        renderHTML: (attributes: Record<string, unknown>) => ({
          width: String(parseImageWidth(attributes.width)),
        }),
      },
    };
  },
});

/**
 * ```. 입력으로 자동 코드블록 생성을 지원합니다.
 */
export const InstantCodeBlockExtension = CodeBlockLowlight.extend({
  addInputRules() {
    const parentInputRules = this.parent?.() ?? [];

    return [
      textblockTypeInputRule({
        find: INSTANT_CODE_BLOCK_INPUT_REGEX,
        type: this.type,
        getAttributes: () => ({
          language: 'plaintext',
        }),
      }),
      ...parentInputRules,
    ];
  },
});

/**
 * Mod+Y 키보드 단축키로 다시실행(Redo) 기능을 추가합니다.
 */
export const MarkdownHistoryShortcutsExtension = Extension.create({
  addKeyboardShortcuts() {
    return {
      'Mod-y': () => this.editor.commands.redo(),
    };
  },
});

/**
 * 유튜브 임베드 iframe을 안전한 블록 노드로 관리합니다.
 */
export const YouTubeEmbedExtension = Node.create({
  name: 'youtubeEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          return extractYouTubeEmbedInfo(element.getAttribute('src') ?? '')
            ?.embedUrl;
        },
      },
      title: {
        default: YOUTUBE_IFRAME_TITLE,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[src]',
        getAttrs: (node) => {
          const element = node instanceof HTMLElement ? node : null;
          const src = extractYouTubeEmbedInfo(
            element?.getAttribute('src') ?? '',
          )?.embedUrl;

          if (!src) {
            return false;
          }

          return {
            src,
            title:
              element?.getAttribute('title')?.trim() || YOUTUBE_IFRAME_TITLE,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = buildYouTubeEmbedAttrs(HTMLAttributes.src ?? '');
    // 에디터에서 노드가 생성됐지만 src가 비어있거나 손상된 경우
    // 외부에서 복사된 HTML에 <iframe> 태그가 있지만 YouTube URL이 아닌 경우
    if (!attrs) {
      return ['p'];
    }

    return ['iframe', mergeAttributes(attrs)];
  },
});
