'use client';

import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Paperclip,
  Quote,
  Strikethrough,
  Underline,
} from 'lucide-react';
import {
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BaseEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Range,
  Transforms,
  createEditor,
} from 'slate';
import {
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  ReactEditor,
  Slate,
  useSlate,
  withReact,
} from 'slate-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import {
  createMentoringRequestRichTextBlock,
  parseMentoringRequestRichTextDocument,
  type MentoringRequestContentBlock,
  type MentoringRequestRichTextBlock,
  type MentoringRequestRichTextNode,
} from '@/features/mentoring/model/request-content';

type FontSizeMark = 'sm' | 'md' | 'lg' | 'xl';
type MarkFormat = 'bold' | 'italic' | 'underline' | 'strikethrough';
type BlockFormat =
  | 'heading-two'
  | 'heading-three'
  | 'block-quote'
  | 'bulleted-list'
  | 'numbered-list';

interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: FontSizeMark;
}

interface LinkElement {
  type: 'link';
  url: string;
  children: CustomText[];
}

interface ParagraphElement {
  type: 'paragraph';
  children: Array<CustomText | LinkElement>;
}

interface HeadingTwoElement {
  type: 'heading-two';
  children: Array<CustomText | LinkElement>;
}

interface HeadingThreeElement {
  type: 'heading-three';
  children: Array<CustomText | LinkElement>;
}

interface BlockQuoteElement {
  type: 'block-quote';
  children: Array<CustomText | LinkElement>;
}

interface ListItemElement {
  type: 'list-item';
  children: Array<CustomText | LinkElement>;
}

interface BulletedListElement {
  type: 'bulleted-list';
  children: ListItemElement[];
}

interface NumberedListElement {
  type: 'numbered-list';
  children: ListItemElement[];
}

interface ImageElement {
  type: 'image';
  fileName: string;
  fileSize: number;
  mimeType?: string;
  children: [CustomText];
}

interface FileElement {
  type: 'file';
  fileName: string;
  fileSize: number;
  mimeType?: string;
  children: [CustomText];
}

type CustomElement =
  | ParagraphElement
  | HeadingTwoElement
  | HeadingThreeElement
  | BlockQuoteElement
  | ListItemElement
  | BulletedListElement
  | NumberedListElement
  | LinkElement
  | ImageElement
  | FileElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface MentoringRequestEditorProps {
  value: MentoringRequestContentBlock[];
  onChange: (next: MentoringRequestContentBlock[]) => void;
}

const LIST_TYPES: Array<'bulleted-list' | 'numbered-list'> = [
  'bulleted-list',
  'numbered-list',
];

const FONT_SIZE_OPTIONS: Array<{ label: string; value: FontSizeMark }> = [
  { label: '작게', value: 'sm' },
  { label: '기본', value: 'md' },
  { label: '크게', value: 'lg' },
  { label: '아주 크게', value: 'xl' },
];

const FONT_SIZE_STYLE_MAP: Record<FontSizeMark, number> = {
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
};

const MAX_MEDIA_BLOCK_COUNT = 20;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isRichTextBlock = (
  block: MentoringRequestContentBlock,
): block is MentoringRequestRichTextBlock => {
  return block.type === 'richText';
};

const createEmptyText = (): CustomText => ({ text: '' });

const createParagraphElement = (text = ''): ParagraphElement => ({
  type: 'paragraph',
  children: [{ text }],
});

const createDefaultEditorValue = (): Descendant[] => {
  return [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];
};

const formatFileSize = (fileSize: number) => {
  if (fileSize < 1024) {
    return `${fileSize}B`;
  }

  const kb = fileSize / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)}KB`;
  }

  return `${(kb / 1024).toFixed(1)}MB`;
};

const normalizeUrl = (raw: string): string => {
  const source = raw.trim();
  const prefixed =
    source.startsWith('http://') || source.startsWith('https://')
      ? source
      : `https://${source}`;

  return new URL(prefixed).toString();
};

const withMentoringEditor = (editor: BaseEditor & ReactEditor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => {
    if (SlateElement.isElement(element) && element.type === 'link') {
      return true;
    }

    return isInline(element);
  };

  editor.isVoid = (element) => {
    if (
      SlateElement.isElement(element) &&
      (element.type === 'image' || element.type === 'file')
    ) {
      return true;
    }

    return isVoid(element);
  };

  return editor;
};

const isMarkActive = (editor: Editor, format: MarkFormat) => {
  const marks = Editor.marks(editor) as Partial<CustomText> | null;

  return marks?.[format] === true;
};

const toggleMark = (editor: Editor, format: MarkFormat) => {
  if (isMarkActive(editor, format)) {
    Editor.removeMark(editor, format);

    return;
  }

  Editor.addMark(editor, format, true);
};

const getActiveFontSize = (editor: Editor): FontSizeMark => {
  const marks = Editor.marks(editor) as Partial<CustomText> | null;
  const value = marks?.fontSize;

  if (value === 'sm' || value === 'lg' || value === 'xl') {
    return value;
  }

  return 'md';
};

const applyFontSize = (editor: Editor, fontSize: FontSizeMark) => {
  if (fontSize === 'md') {
    Editor.removeMark(editor, 'fontSize');

    return;
  }

  Editor.addMark(editor, 'fontSize', fontSize);
};

const isBlockActive = (editor: Editor, format: BlockFormat) => {
  const { selection } = editor;
  if (!selection) {
    return false;
  }

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (node) => {
        return (
          !Editor.isEditor(node) &&
          SlateElement.isElement(node) &&
          node.type === format
        );
      },
    }),
  );

  return match !== undefined;
};

const toggleBlock = (editor: Editor, format: BlockFormat) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format as (typeof LIST_TYPES)[number]);

  Transforms.unwrapNodes(editor, {
    match: (node) => {
      return (
        !Editor.isEditor(node) &&
        SlateElement.isElement(node) &&
        LIST_TYPES.includes(node.type as (typeof LIST_TYPES)[number])
      );
    },
    split: true,
  });

  const nextType: CustomElement['type'] = isActive
    ? 'paragraph'
    : isList
      ? 'list-item'
      : format;

  Transforms.setNodes(editor, { type: nextType } as Partial<CustomElement>, {
    match: (node) => {
      return (
        !Editor.isEditor(node) &&
        SlateElement.isElement(node) &&
        node.type !== 'link' &&
        node.type !== 'image' &&
        node.type !== 'file' &&
        Editor.isBlock(editor, node)
      );
    },
  });

  if (!isActive && isList) {
    const listNode: BulletedListElement | NumberedListElement =
      format === 'bulleted-list'
        ? { type: 'bulleted-list', children: [] }
        : { type: 'numbered-list', children: [] };

    Transforms.wrapNodes(editor, listNode);
  }
};

const isLinkActive = (editor: Editor) => {
  const [match] = Array.from(
    Editor.nodes(editor, {
      match: (node) => {
        return (
          !Editor.isEditor(node) &&
          SlateElement.isElement(node) &&
          node.type === 'link'
        );
      },
    }),
  );

  return match !== undefined;
};

const unwrapLink = (editor: Editor) => {
  Transforms.unwrapNodes(editor, {
    match: (node) => {
      return (
        !Editor.isEditor(node) &&
        SlateElement.isElement(node) &&
        node.type === 'link'
      );
    },
  });
};

const wrapLink = (editor: Editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const linkNode: LinkElement = {
    type: 'link',
    url,
    children: [{ text: url }],
  };

  if (!selection) {
    Transforms.insertNodes(editor, {
      type: 'paragraph',
      children: [{ type: 'link', url, children: [{ text: url }] }],
    } satisfies ParagraphElement);

    return;
  }

  if (Range.isCollapsed(selection)) {
    Transforms.insertNodes(editor, linkNode);
    Transforms.move(editor);

    return;
  }

  Transforms.wrapNodes(
    editor,
    {
      type: 'link',
      url,
      children: [],
    },
    { split: true },
  );
  Transforms.collapse(editor, { edge: 'end' });
};

const insertImageBlock = (editor: Editor, file: File) => {
  const nextNode: ImageElement = {
    type: 'image',
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || undefined,
    children: [createEmptyText()],
  };

  Transforms.insertNodes(editor, nextNode);
  Transforms.insertNodes(editor, createParagraphElement());
};

const insertFileBlock = (editor: Editor, file: File) => {
  const nextNode: FileElement = {
    type: 'file',
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || undefined,
    children: [createEmptyText()],
  };

  Transforms.insertNodes(editor, nextNode);
  Transforms.insertNodes(editor, createParagraphElement());
};

const getMediaBlockCount = (document: Descendant[]) => {
  const stack: unknown[] = [...document];
  let count = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!isRecord(current)) {
      continue;
    }

    const currentType = current.type;
    if (currentType === 'image' || currentType === 'file') {
      count += 1;
    }

    const children = current.children;
    if (Array.isArray(children)) {
      stack.push(...children);
    }
  }

  return count;
};

const toSlateDocumentFromLegacyBlocks = (
  blocks: MentoringRequestContentBlock[],
): Descendant[] => {
  const converted: Descendant[] = [];

  blocks.forEach((block) => {
    if (block.type === 'paragraph') {
      converted.push({
        type: 'paragraph',
        children: [{ text: block.text }],
      } satisfies ParagraphElement);

      return;
    }

    if (block.type === 'image') {
      converted.push({
        type: 'image',
        fileName: block.fileName,
        fileSize: block.fileSize,
        mimeType: block.mimeType,
        children: [createEmptyText()],
      } satisfies ImageElement);
      converted.push(createParagraphElement());

      return;
    }

    if (block.type === 'file') {
      converted.push({
        type: 'file',
        fileName: block.fileName,
        fileSize: block.fileSize,
        children: [createEmptyText()],
      } satisfies FileElement);
      converted.push(createParagraphElement());

      return;
    }

    if (block.type === 'link') {
      converted.push({
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: block.url,
            children: [{ text: block.url }],
          },
          { text: '' },
        ],
      } satisfies ParagraphElement);
    }
  });

  return converted.length > 0 ? converted : createDefaultEditorValue();
};

const toInitialSlateDocument = (
  blocks: MentoringRequestContentBlock[],
): Descendant[] => {
  const richTextBlock = blocks.find(isRichTextBlock);
  if (richTextBlock) {
    const parsed = parseMentoringRequestRichTextDocument(
      richTextBlock.document,
    );
    if (parsed.length > 0) {
      return parsed as unknown as Descendant[];
    }
  }

  return toSlateDocumentFromLegacyBlocks(blocks);
};

const RichTextElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  if (element.type === 'heading-two') {
    return (
      <h2
        {...attributes}
        className="font-designer-20b text-text-strong mt-175 mb-75"
      >
        {children}
      </h2>
    );
  }

  if (element.type === 'heading-three') {
    return (
      <h3
        {...attributes}
        className="font-designer-18b text-text-default mt-150 mb-75"
      >
        {children}
      </h3>
    );
  }

  if (element.type === 'block-quote') {
    return (
      <blockquote
        {...attributes}
        className="rounded-100 bg-background-alternative border-border-subtle border-l-[3px] px-125 py-100"
      >
        <p className="font-designer-14r text-text-subtle leading-relaxed">
          {children}
        </p>
      </blockquote>
    );
  }

  if (element.type === 'bulleted-list') {
    return (
      <ul {...attributes} className="mb-100 list-disc space-y-50 pl-250">
        {children}
      </ul>
    );
  }

  if (element.type === 'numbered-list') {
    return (
      <ol {...attributes} className="mb-100 list-decimal space-y-50 pl-250">
        {children}
      </ol>
    );
  }

  if (element.type === 'list-item') {
    return (
      <li {...attributes} className="font-designer-14r text-text-default">
        {children}
      </li>
    );
  }

  if (element.type === 'link') {
    return (
      <a
        {...attributes}
        href={element.url}
        target="_blank"
        rel="noreferrer"
        className="text-text-brand underline"
      >
        {children}
      </a>
    );
  }

  if (element.type === 'image') {
    return (
      <div {...attributes}>
        <div
          contentEditable={false}
          className="rounded-100 border-border-subtle bg-background-alternative my-100 border px-125 py-100"
        >
          <p className="font-designer-13b text-text-default truncate">
            {element.fileName}
          </p>
          <p className="font-designer-12r text-text-subtle mt-50">
            이미지 · {formatFileSize(element.fileSize)}
          </p>
        </div>
        {children}
      </div>
    );
  }

  if (element.type === 'file') {
    return (
      <div {...attributes}>
        <div
          contentEditable={false}
          className="rounded-100 border-border-subtle bg-background-alternative my-100 border px-125 py-100"
        >
          <p className="font-designer-13b text-text-default truncate">
            {element.fileName}
          </p>
          <p className="font-designer-12r text-text-subtle mt-50">
            첨부파일 · {formatFileSize(element.fileSize)}
          </p>
        </div>
        {children}
      </div>
    );
  }

  return (
    <p
      {...attributes}
      className="font-designer-14r text-text-default my-50 leading-relaxed"
    >
      {children}
    </p>
  );
};

const RichTextLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  const fontSize = FONT_SIZE_STYLE_MAP[leaf.fontSize ?? 'md'];

  return (
    <span
      {...attributes}
      className={cn(
        'text-text-default',
        leaf.bold && 'font-bold',
        leaf.italic && 'italic',
        leaf.underline && 'underline',
        leaf.strikethrough && 'line-through',
      )}
      style={{ fontSize }}
    >
      {children}
    </span>
  );
};

interface ToolbarButtonProps {
  isActive: boolean;
  label: string;
  onMouseDown: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  Icon: ComponentType<{ className?: string }>;
}

const ToolbarButton = ({
  isActive,
  label,
  onMouseDown,
  Icon,
}: ToolbarButtonProps) => {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      className={cn(
        'font-designer-12r rounded-100 border px-100 py-75',
        'inline-flex items-center gap-50 transition-colors',
        isActive
          ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
          : 'border-border-subtle bg-background-default text-text-subtle hover:text-text-default',
      )}
      aria-label={label}
    >
      <Icon className="h-14 w-14" />
      {label}
    </button>
  );
};

const MarkButton = ({
  format,
  label,
  icon: Icon,
}: {
  format: MarkFormat;
  label: string;
  icon: ComponentType<{ className?: string }>;
}) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  return (
    <ToolbarButton
      isActive={isActive}
      label={label}
      Icon={Icon}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    />
  );
};

const BlockButton = ({
  format,
  label,
  icon: Icon,
}: {
  format: BlockFormat;
  label: string;
  icon: ComponentType<{ className?: string }>;
}) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, format);

  return (
    <ToolbarButton
      isActive={isActive}
      label={label}
      Icon={Icon}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    />
  );
};

const FontSizeSelector = () => {
  const editor = useSlate();
  const activeFontSize = getActiveFontSize(editor);

  return (
    <label className="font-designer-12r text-text-subtle inline-flex items-center gap-50">
      글자 크기
      <select
        value={activeFontSize}
        onChange={(event) => {
          applyFontSize(editor, event.target.value as FontSizeMark);
        }}
        className={cn(
          'font-designer-12r rounded-100 border-border-subtle bg-background-default',
          'text-text-default border px-100 py-75',
          'focus:border-border-brand focus:outline-none',
        )}
      >
        {FONT_SIZE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

interface EditorToolbarProps {
  mediaBlockCount: number;
  onInsertLink: () => void;
  onOpenImagePicker: () => void;
  onOpenFilePicker: () => void;
}

const EditorToolbar = ({
  mediaBlockCount,
  onInsertLink,
  onOpenImagePicker,
  onOpenFilePicker,
}: EditorToolbarProps) => {
  return (
    <div className="border-border-subtle bg-background-alternative rounded-125 mb-125 border px-125 py-100">
      <div className="mb-75 flex flex-wrap items-center gap-75">
        <MarkButton format="bold" label="굵게" icon={Bold} />
        <MarkButton format="italic" label="기울임" icon={Italic} />
        <MarkButton format="underline" label="밑줄" icon={Underline} />
        <MarkButton
          format="strikethrough"
          label="취소선"
          icon={Strikethrough}
        />
        <BlockButton format="heading-two" label="소제목" icon={Heading2} />
        <BlockButton format="heading-three" label="중제목" icon={Heading3} />
        <BlockButton format="bulleted-list" label="목록" icon={List} />
        <BlockButton
          format="numbered-list"
          label="번호 목록"
          icon={ListOrdered}
        />
        <BlockButton format="block-quote" label="인용" icon={Quote} />
      </div>

      <div className="flex flex-wrap items-center gap-75">
        <FontSizeSelector />
        <Button
          type="button"
          color="secondary"
          size="small"
          onMouseDown={(event) => {
            event.preventDefault();
            onInsertLink();
          }}
        >
          <Link2 className="h-14 w-14" />
          링크
        </Button>
        <Button
          type="button"
          color="secondary"
          size="small"
          onClick={onOpenImagePicker}
        >
          <ImagePlus className="h-14 w-14" />
          이미지
        </Button>
        <Button
          type="button"
          color="secondary"
          size="small"
          onClick={onOpenFilePicker}
        >
          <Paperclip className="h-14 w-14" />
          첨부파일
        </Button>
        <span className="font-designer-12r text-text-subtle">
          이미지/첨부파일 {mediaBlockCount}/{MAX_MEDIA_BLOCK_COUNT}
        </span>
      </div>
    </div>
  );
};

export default function MentoringRequestEditor({
  value,
  onChange,
}: MentoringRequestEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editor = useMemo(
    () => withMentoringEditor(withReact(createEditor())),
    [],
  );
  const existingRichTextBlock = useMemo(
    () => value.find(isRichTextBlock),
    [value],
  );
  const richTextBlockIdRef = useRef(
    existingRichTextBlock?.id ?? createMentoringRequestRichTextBlock().id,
  );
  const initialValueRef = useRef<Descendant[]>(toInitialSlateDocument(value));

  const [editorError, setEditorError] = useState('');
  const [mediaBlockCount, setMediaBlockCount] = useState(() => {
    return getMediaBlockCount(initialValueRef.current);
  });

  const toDocumentPayload = (
    document: Descendant[],
  ): MentoringRequestRichTextNode[] => {
    return document as unknown as MentoringRequestRichTextNode[];
  };

  const handleMediaInsert = (
    files: FileList | null,
    type: 'image' | 'file',
  ) => {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    const remainCount = MAX_MEDIA_BLOCK_COUNT - mediaBlockCount;
    if (remainCount <= 0) {
      setEditorError(
        `이미지/첨부파일은 최대 ${MAX_MEDIA_BLOCK_COUNT}개까지 추가할 수 있습니다.`,
      );

      return;
    }

    const filesToInsert = selectedFiles.slice(0, remainCount);
    filesToInsert.forEach((file) => {
      if (type === 'image') {
        insertImageBlock(editor, file);

        return;
      }

      insertFileBlock(editor, file);
    });

    if (selectedFiles.length > filesToInsert.length) {
      setEditorError(
        `일부 파일은 제외되었습니다. 최대 ${MAX_MEDIA_BLOCK_COUNT}개까지만 지원합니다.`,
      );

      return;
    }

    setEditorError('');
  };

  const handleInsertLink = () => {
    const raw = window.prompt('추가할 링크 URL을 입력해주세요.', 'https://');
    if (raw === null || raw.trim() === '') {
      return;
    }

    try {
      const normalizedUrl = normalizeUrl(raw);
      wrapLink(editor, normalizedUrl);
      setEditorError('');
    } catch {
      setEditorError('올바른 링크 형식으로 입력해주세요.');
    }
  };

  return (
    <div className="space-y-100">
      <Slate
        editor={editor}
        initialValue={initialValueRef.current}
        onChange={(nextValue) => {
          const hasContentChange = editor.operations.some((operation) => {
            return operation.type !== 'set_selection';
          });

          if (!hasContentChange) {
            return;
          }

          setMediaBlockCount(getMediaBlockCount(nextValue));
          onChange([
            createMentoringRequestRichTextBlock(
              toDocumentPayload(nextValue),
              richTextBlockIdRef.current,
            ),
          ]);
        }}
      >
        <div className="rounded-125 border-border-subtle bg-background-default border p-125">
          <EditorToolbar
            mediaBlockCount={mediaBlockCount}
            onInsertLink={handleInsertLink}
            onOpenImagePicker={() => imageInputRef.current?.click()}
            onOpenFilePicker={() => fileInputRef.current?.click()}
          />

          <Editable
            renderElement={(props) => <RichTextElement {...props} />}
            renderLeaf={(props) => <RichTextLeaf {...props} />}
            placeholder="멘토에게 전달할 질문과 배경을 블로그 글처럼 작성해주세요."
            className={cn(
              'font-designer-14r rounded-125 border-border-subtle bg-background-default',
              'text-text-default min-h-[280px] border px-150 py-125 outline-none',
            )}
          />
        </div>
      </Slate>

      <p className="font-designer-12r text-text-subtlest">
        서식(글자 크기, 강조, 목록, 인용), 이미지, 첨부파일, 링크를 한 번에
        작성할 수 있습니다.
      </p>

      {editorError && (
        <p className="font-designer-12r text-text-error">{editorError}</p>
      )}

      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          handleMediaInsert(event.target.files, 'image');
          event.target.value = '';
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          handleMediaInsert(event.target.files, 'file');
          event.target.value = '';
        }}
      />
    </div>
  );
}
