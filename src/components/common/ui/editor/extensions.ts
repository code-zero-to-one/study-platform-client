import { Extension, textblockTypeInputRule } from '@tiptap/core';
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
import { common, createLowlight } from 'lowlight'; // eslint-disable-line import/order
import { parseImageWidth, MARKDOWN_IMAGE_DEFAULT_WIDTH } from './image-utils';

export const lowlight = createLowlight(common);
lowlight.register('kotlin', kotlin);
lowlight.register('sql', sql);
lowlight.register('java', java);
lowlight.register('python', python);
lowlight.register('cpp', cpp);
lowlight.register('c', c);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('swift', swift);
lowlight.register('dart', dart);

const INSTANT_CODE_BLOCK_INPUT_REGEX = /^```$/;

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

export const MarkdownHistoryShortcutsExtension = Extension.create({
  addKeyboardShortcuts() {
    return {
      'Mod-y': () => this.editor.commands.redo(),
    };
  },
});
