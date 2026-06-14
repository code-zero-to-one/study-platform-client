import {
  type Editor,
  Extension,
  Node,
  mergeAttributes,
  textblockTypeInputRule,
  type NodeViewRendererProps,
} from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import ImageExtension from '@tiptap/extension-image';
import {
  Table as TableExtension,
  TableCell,
  TableHeader,
  TableRow,
} from '@tiptap/extension-table';
import type { Mark, Node as ProseMirrorNode } from '@tiptap/pm/model';
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
import {
  clampImageWidth,
  parseImageWidth,
  MARKDOWN_IMAGE_DEFAULT_WIDTH,
} from './image-utils';
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

/**
 * WYSIWYG 표 편집을 위한 TipTap 표 확장 묶음입니다.
 * 컬럼 리사이즈는 비활성화해 저장 HTML에 colwidth/style 같은 추가 속성이 끼지 않도록 합니다
 * (정화기 통과 및 미리보기/상세 렌더 일관성 유지).
 */
export const MarkdownTableExtensions = [
  TableExtension.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
];

const INSTANT_CODE_BLOCK_INPUT_REGEX = /^```$/;

const RESIZABLE_IMAGE_CLASS_NAME = 'tiptap-resizable-image';
const RESIZABLE_IMAGE_SELECTED_CLASS_NAME = 'tiptap-resizable-image-selected';
const RESIZABLE_IMAGE_HANDLE_CLASS_NAME = 'tiptap-resizable-image-handle';

const applyImageElementAttributes = (
  imageElement: HTMLImageElement,
  sizeLabelElement: HTMLElement,
  attrs: Record<string, unknown>,
) => {
  const src = typeof attrs.src === 'string' ? attrs.src : '';
  const alt = typeof attrs.alt === 'string' ? attrs.alt : '';
  const title = typeof attrs.title === 'string' ? attrs.title : '';
  const width = parseImageWidth(attrs.width);

  imageElement.src = src;
  imageElement.alt = alt;
  imageElement.title = title;
  imageElement.width = width;
  imageElement.style.width = `${width}px`;
  imageElement.style.height = 'auto';
  sizeLabelElement.textContent = `표시 크기: ${width}px × auto`;
};

const updateImageNodeWidth = (
  props: NodeViewRendererProps,
  nextWidth: number,
) => {
  const pos = props.getPos();
  if (typeof pos !== 'number') {
    return;
  }

  const currentNode = props.view.state.doc.nodeAt(pos);
  if (!currentNode) {
    return;
  }

  props.view.dispatch(
    props.view.state.tr.setNodeMarkup(pos, undefined, {
      ...currentNode.attrs,
      width: clampImageWidth(nextWidth),
    }),
  );
};

const isCursorAtEndOfLink = (editor: Editor) => {
  const { selection, doc, schema } = editor.state;
  const linkMarkType = schema.marks.link;
  if (!selection.empty || !linkMarkType) {
    return false;
  }

  const cursorMarks = selection.$from.marks();
  const isInsideLink = cursorMarks.some(
    (mark: Mark) => mark.type === linkMarkType,
  );
  if (!isInsideLink) {
    return false;
  }

  const nextNode = doc.nodeAt(selection.from);
  if (!nextNode) {
    return true;
  }

  return !nextNode.marks.some((mark: Mark) => mark.type === linkMarkType);
};

const createResizableImageNodeView = (props: NodeViewRendererProps) => {
  const wrapperElement = document.createElement('span');
  const imageElement = document.createElement('img');
  const resizeHandleElement = document.createElement('span');
  const sizeLabelElement = document.createElement('span');
  let currentWidth = parseImageWidth(props.node.attrs.width);
  let removePointerListeners: (() => void) | undefined;

  wrapperElement.className = RESIZABLE_IMAGE_CLASS_NAME;
  wrapperElement.contentEditable = 'false';
  wrapperElement.style.width = `${currentWidth}px`;

  resizeHandleElement.className = RESIZABLE_IMAGE_HANDLE_CLASS_NAME;
  resizeHandleElement.setAttribute('role', 'presentation');
  sizeLabelElement.className = 'tiptap-resizable-image-size';

  applyImageElementAttributes(imageElement, sizeLabelElement, props.node.attrs);
  imageElement.addEventListener('load', () => {
    sizeLabelElement.textContent = `표시 크기: ${currentWidth}px × auto · 원본 크기: ${imageElement.naturalWidth} × ${imageElement.naturalHeight} px`;
  });
  wrapperElement.append(imageElement, resizeHandleElement, sizeLabelElement);

  resizeHandleElement.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = currentWidth;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = clampImageWidth(
        startWidth + moveEvent.clientX - startX,
      );
      currentWidth = nextWidth;
      wrapperElement.style.width = `${nextWidth}px`;
      imageElement.width = nextWidth;
      imageElement.style.width = `${nextWidth}px`;
      sizeLabelElement.textContent = `표시 크기: ${nextWidth}px × auto · 원본 크기: ${imageElement.naturalWidth} × ${imageElement.naturalHeight} px`;
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      handlePointerMove(upEvent);
      updateImageNodeWidth(props, currentWidth);
      removePointerListeners?.();
      removePointerListeners = undefined;
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp, { once: true });
    removePointerListeners = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  });

  return {
    dom: wrapperElement,
    update: (nextNode: ProseMirrorNode) => {
      if (nextNode.type !== props.node.type) {
        return false;
      }

      currentWidth = parseImageWidth(nextNode.attrs.width);
      wrapperElement.style.width = `${currentWidth}px`;
      applyImageElementAttributes(
        imageElement,
        sizeLabelElement,
        nextNode.attrs,
      );

      return true;
    },
    selectNode: () => {
      wrapperElement.classList.add(RESIZABLE_IMAGE_SELECTED_CLASS_NAME);
    },
    deselectNode: () => {
      wrapperElement.classList.remove(RESIZABLE_IMAGE_SELECTED_CLASS_NAME);
    },
    stopEvent: (event: Event) => {
      return event.target === resizeHandleElement;
    },
    destroy: () => {
      removePointerListeners?.();
    },
  };
};

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

  addNodeView() {
    return (props) => createResizableImageNodeView(props);
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
 * 링크 끝에서 Space를 누르면 링크 mark를 종료하고 일반 텍스트 입력으로 전환합니다.
 */
export const LinkExitOnSpaceExtension = Extension.create({
  addKeyboardShortcuts() {
    return {
      Space: () => {
        if (!isCursorAtEndOfLink(this.editor)) {
          return false;
        }

        return this.editor.chain().unsetMark('link').insertContent(' ').run();
      },
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
