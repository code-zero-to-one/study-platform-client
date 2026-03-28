'use client';

import 'highlight.js/styles/github.css';
import { Extension, textblockTypeInputRule } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { common, createLowlight } from 'lowlight'; // eslint-disable-line import/order
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import {
  extractHtmlImageUrls,
  extractImageUrls,
  getFileExtension,
  normalizeMarkdownContent,
} from '@/utils/markdown-content';

const lowlight = createLowlight(common);
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

const CODE_LANGUAGES = [
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Java', value: 'java' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Python', value: 'python' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Swift', value: 'swift' },
  { label: 'Dart', value: 'dart' },
  { label: 'SQL', value: 'sql' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'Bash', value: 'bash' },
] as const;
const HEADING_OPTIONS = [
  { icon: Heading1, label: 'H1', level: 1 },
  { icon: Heading2, label: 'H2', level: 2 },
  { icon: Heading3, label: 'H3', level: 3 },
] as const;

const IMAGE_URL_PATTERN =
  /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?[^\s]*)?$/i;
const REMOTE_URL_PATTERN = /^https?:\/\/\S+$/i;
const DATA_URL_PATTERN = /^data:image\/[a-z0-9.+-]+;base64,/i;
const INSTANT_CODE_BLOCK_INPUT_REGEX = /^```$/;
const MARKDOWN_IMAGE_MIN_WIDTH = 80;
const MARKDOWN_IMAGE_DEFAULT_WIDTH = 200;
const MARKDOWN_IMAGE_MAX_WIDTH = 400;
const MARKDOWN_IMAGE_WIDTH_STEP = 10;
const MARKDOWN_IMAGE_DEFAULT_MAX_COUNT = 3;
const MARKDOWN_IMAGE_DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;
const MARKDOWN_IMAGE_DEFAULT_ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
] as const;

export interface MarkdownEditorImageConfig {
  allowedImageExtensions: readonly string[];
  maxImageCount: number;
  maxImageFileSize: number;
  uploadImageFile: (file: File) => Promise<string>;
}

interface MarkdownEditorProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (next: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  uploadImage?: (file: File) => Promise<string>;
  normalizeContent?: (content: unknown) => string;
  imageConfig?: MarkdownEditorImageConfig;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

interface ToolbarButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const isImageUrl = (text: string): boolean => {
  return IMAGE_URL_PATTERN.test(text.trim());
};

const isRemoteUrl = (text: string): boolean => {
  return REMOTE_URL_PATTERN.test(text.trim());
};

const isDataImageUrl = (text: string): boolean => {
  return DATA_URL_PATTERN.test(text.trim());
};

const clampImageWidth = (value: number) => {
  return Math.min(
    MARKDOWN_IMAGE_MAX_WIDTH,
    Math.max(MARKDOWN_IMAGE_MIN_WIDTH, Math.round(value)),
  );
};

const parseImageWidth = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return MARKDOWN_IMAGE_DEFAULT_WIDTH;
  }

  return clampImageWidth(parsed);
};

const ResizableImageExtension = ImageExtension.extend({
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

const InstantCodeBlockExtension = CodeBlockLowlight.extend({
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

const MarkdownHistoryShortcutsExtension = Extension.create({
  addKeyboardShortcuts() {
    return {
      'Mod-y': () => this.editor.commands.redo(),
    };
  },
});

const toFileFromBlob = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};

const guessExtensionFromMime = (mimeType: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  return map[mimeType] ?? 'png';
};

const toImageInputAccept = (extensions: readonly string[]) => {
  return extensions.map((extension) => `.${extension}`).join(',');
};

const isAllowedImageExtension = (
  extension: string,
  allowedExtensions: readonly string[],
) => {
  return allowedExtensions.includes(extension);
};

const extractClipboardImageFiles = (clipboardData: DataTransfer): File[] => {
  const directImageFiles = Array.from(clipboardData.files).filter((file) =>
    file.type.startsWith('image/'),
  );

  if (directImageFiles.length > 0) {
    return directImageFiles;
  }

  return Array.from(clipboardData.items)
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
};

const extractClipboardImageSource = (clipboardData: DataTransfer) => {
  const pastedHtml = clipboardData.getData('text/html').trim();
  if (pastedHtml) {
    const imageSource = extractHtmlImageUrls(pastedHtml)[0]?.trim();

    if (
      imageSource &&
      (isDataImageUrl(imageSource) || isRemoteUrl(imageSource))
    ) {
      return imageSource;
    }
  }

  const pastedText = clipboardData.getData('text/plain').trim();
  if (pastedText && (isImageUrl(pastedText) || isDataImageUrl(pastedText))) {
    return pastedText;
  }

  return '';
};

const hasClipboardImageHint = (clipboardData: DataTransfer) => {
  if (extractClipboardImageFiles(clipboardData).length > 0) {
    return true;
  }

  if (
    Array.from(clipboardData.items).some((item) => item.type.includes('html'))
  ) {
    return clipboardData.getData('text/html').includes('<img');
  }

  const pastedText = clipboardData.getData('text/plain').trim();

  return isImageUrl(pastedText) || isDataImageUrl(pastedText);
};

function ToolbarButton({
  icon: Icon,
  label,
  isActive,
  disabled,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      color="secondary"
      size="small"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        isActive &&
          'bg-background-neutral-subtle border-border-brand text-text-brand',
      )}
    >
      <Icon className="mr-50 h-12 w-12" />
      {label}
    </Button>
  );
}

function MarkdownEditor({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  uploadImage,
  normalizeContent = normalizeMarkdownContent,
  imageConfig,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: MarkdownEditorProps) {
  const [imageInsertError, setImageInsertError] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [selectedImagePos, setSelectedImagePos] = useState<number | null>(null);
  const [, forceEditorRerender] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorContentWrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const isInternalUpdate = useRef(false);
  const normalizedValue = normalizeContent(value);
  const resolvedImageConfig = useMemo(() => {
    if (imageConfig) {
      return imageConfig;
    }

    if (!uploadImage) {
      return undefined;
    }

    return {
      allowedImageExtensions: MARKDOWN_IMAGE_DEFAULT_ALLOWED_EXTENSIONS,
      maxImageCount: MARKDOWN_IMAGE_DEFAULT_MAX_COUNT,
      maxImageFileSize: MARKDOWN_IMAGE_DEFAULT_MAX_FILE_SIZE,
      uploadImageFile: uploadImage,
    };
  }, [imageConfig, uploadImage]);

  const uploadAndInsertFile = useCallback(
    async (editor: Editor, file: File) => {
      if (!resolvedImageConfig) {
        return;
      }

      const publicUrl = await resolvedImageConfig.uploadImageFile(file);

      editor
        .chain()
        .focus()
        .setImage({
          src: publicUrl,
          width: MARKDOWN_IMAGE_DEFAULT_WIDTH,
        })
        .run();
    },
    [resolvedImageConfig],
  );

  const validateImageFile = useCallback(
    (file: File): string | undefined => {
      if (!resolvedImageConfig) {
        return '이미지 업로드를 지원하지 않습니다.';
      }

      if (!file.type.startsWith('image/')) {
        return `${file.name}: 이미지 파일이 아닙니다.`;
      }

      const extension = getFileExtension(file.name);
      if (
        extension &&
        extension !== 'blob' &&
        !isAllowedImageExtension(
          extension,
          resolvedImageConfig.allowedImageExtensions,
        )
      ) {
        return `${file.name}: 허용되지 않은 확장자입니다. (${resolvedImageConfig.allowedImageExtensions.join('/')})`;
      }

      if (file.size > resolvedImageConfig.maxImageFileSize) {
        return `${file.name}: ${Math.floor(resolvedImageConfig.maxImageFileSize / (1024 * 1024))}MB를 초과합니다.`;
      }

      return undefined;
    },
    [resolvedImageConfig],
  );

  const handleImageFiles = useCallback(
    async (editor: Editor, files: File[]) => {
      if (!resolvedImageConfig || files.length === 0 || isUploadingImages) {
        return;
      }

      const existingCount = extractImageUrls(editor.getHTML()).length;
      const remaining = Math.max(
        0,
        resolvedImageConfig.maxImageCount - existingCount,
      );

      if (remaining === 0) {
        setImageInsertError(
          `이미지는 최대 ${resolvedImageConfig.maxImageCount}개까지만 등록할 수 있습니다.`,
        );

        return;
      }

      const targetFiles = files.slice(0, remaining);
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of targetFiles) {
        const error = validateImageFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) {
        if (errors.length > 0) {
          setImageInsertError(errors.join(' '));
        }

        return;
      }

      setIsUploadingImages(true);
      setImageInsertError('');

      try {
        for (const file of validFiles) {
          try {
            await uploadAndInsertFile(editor, file);
          } catch {
            errors.push(`${file.name}: 업로드 실패`);
          }
        }

        if (files.length > remaining) {
          errors.push(
            `이미지는 최대 ${resolvedImageConfig.maxImageCount}개까지 등록할 수 있습니다.`,
          );
        }

        if (errors.length > 0) {
          setImageInsertError(errors.join(' '));
        }
      } finally {
        setIsUploadingImages(false);
      }
    },
    [
      isUploadingImages,
      resolvedImageConfig,
      uploadAndInsertFile,
      validateImageFile,
    ],
  );

  const handlePasteImageSource = useCallback(
    async (editor: Editor, source: string) => {
      if (!resolvedImageConfig) {
        return;
      }

      const existingCount = extractImageUrls(editor.getHTML()).length;
      if (existingCount >= resolvedImageConfig.maxImageCount) {
        setImageInsertError(
          `이미지는 최대 ${resolvedImageConfig.maxImageCount}개까지만 등록할 수 있습니다.`,
        );

        return;
      }

      setIsUploadingImages(true);
      setImageInsertError('');

      try {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error('이미지를 가져올 수 없습니다.');
        }

        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
          throw new Error('이미지 파일이 아닙니다.');
        }

        const ext = guessExtensionFromMime(blob.type);
        const file = toFileFromBlob(blob, `pasted-image.${ext}`);

        if (file.size > resolvedImageConfig.maxImageFileSize) {
          setImageInsertError(
            `이미지가 ${Math.floor(resolvedImageConfig.maxImageFileSize / (1024 * 1024))}MB를 초과합니다.`,
          );

          return;
        }

        await uploadAndInsertFile(editor, file);
      } catch {
        setImageInsertError(
          '이미지 URL을 가져올 수 없습니다. 이미지를 직접 복사(우클릭 → 이미지 복사)하거나 파일로 업로드해주세요.',
        );
      } finally {
        setIsUploadingImages(false);
      }
    },
    [resolvedImageConfig, uploadAndInsertFile],
  );

  const readClipboardImageFiles = useCallback(async () => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard ||
      typeof navigator.clipboard.read !== 'function'
    ) {
      return [];
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      const files: File[] = [];

      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find((type) =>
          type.startsWith('image/'),
        );

        if (!imageType) {
          continue;
        }

        const blob = await clipboardItem.getType(imageType);
        files.push(
          toFileFromBlob(
            blob,
            `pasted-image.${guessExtensionFromMime(blob.type)}`,
          ),
        );
      }

      return files;
    } catch {
      return [];
    }
  }, []);

  const handleClipboardPaste = useCallback(
    async (editor: Editor, clipboardData: DataTransfer) => {
      const directFiles = extractClipboardImageFiles(clipboardData);
      if (directFiles.length > 0) {
        await handleImageFiles(editor, directFiles);

        return;
      }

      const clipboardApiFiles = await readClipboardImageFiles();
      if (clipboardApiFiles.length > 0) {
        await handleImageFiles(editor, clipboardApiFiles);

        return;
      }

      const pastedImageSource = extractClipboardImageSource(clipboardData);
      if (pastedImageSource) {
        await handlePasteImageSource(editor, pastedImageSource);
      }
    },
    [handleImageFiles, handlePasteImageSource, readClipboardImageFiles],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      InstantCodeBlockExtension.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      MarkdownHistoryShortcutsExtension,
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noreferrer',
          target: '_blank',
        },
      }),
      ResizableImageExtension,
      Placeholder.configure({
        placeholder: placeholder ?? '내용을 자유롭게 작성해주세요.',
      }),
    ],
    content: normalizedValue || '',
    onUpdate: ({ editor: updatedEditor }) => {
      isInternalUpdate.current = true;
      onChange?.(normalizeContent(updatedEditor.getHTML()));
    },
    onTransaction() {
      forceEditorRerender((prev) => prev + 1);
    },
    onSelectionUpdate: ({ editor: nextEditor }) => {
      forceEditorRerender((prev) => prev + 1);

      if (nextEditor.isActive('image')) {
        setSelectedImagePos(nextEditor.state.selection.from);

        return;
      }

      if (nextEditor.isFocused) {
        setSelectedImagePos(null);
      }
    },
    editorProps: {
      attributes: {
        id: id ?? '',
        'data-name': name ?? '',
        spellcheck: 'true',
        autocorrect: 'on',
        autocapitalize: 'sentences',
        'aria-invalid': ariaInvalid ? 'true' : 'false',
        'aria-describedby': ariaDescribedBy ?? '',
      },
      handleDOMEvents: {
        blur: () => {
          onBlur?.();

          return false;
        },
      },
      handlePaste: (view, event) => {
        if (!resolvedImageConfig) {
          return false;
        }

        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }

        if (hasClipboardImageHint(clipboardData)) {
          event.preventDefault();
          const editorInstance =
            editorRef.current && !editorRef.current.isDestroyed
              ? editorRef.current
              : null;

          if (editorInstance) {
            handleClipboardPaste(editorInstance, clipboardData).catch(() => {
              setImageInsertError('이미지 붙여넣기에 실패했습니다.');
            });
          }

          return true;
        }

        return false;
      },
      handleDrop: (view, event) => {
        if (!resolvedImageConfig) {
          return false;
        }

        const dataTransfer = event.dataTransfer;
        if (!dataTransfer) {
          return false;
        }

        const imageFiles = Array.from(dataTransfer.files).filter((file) =>
          file.type.startsWith('image/'),
        );

        if (imageFiles.length === 0) {
          return false;
        }

        event.preventDefault();
        const editorInstance =
          editorRef.current && !editorRef.current.isDestroyed
            ? editorRef.current
            : null;

        if (editorInstance) {
          handleImageFiles(editorInstance, imageFiles).catch(() => {
            setImageInsertError('이미지 드롭에 실패했습니다.');
          });
        }

        return true;
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor ?? null;
  }, [editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;

      return;
    }

    const currentHtml = normalizeContent(editor.getHTML());
    if (currentHtml !== normalizedValue) {
      editor.commands.setContent(normalizedValue || '', { emitUpdate: false });
    }
  }, [editor, normalizeContent, normalizedValue]);

  useEffect(() => {
    const handleResize = () => {
      forceEditorRerender((prev) => prev + 1);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleToggleLink = () => {
    if (!editor) {
      return;
    }

    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();

      return;
    }

    const url = window.prompt('링크 URL을 입력해주세요.', 'https://');

    if (!url) {
      return;
    }

    editor.chain().focus().setLink({ href: url.trim() }).run();
  };

  const handleToggleCodeBlock = () => {
    if (!editor) {
      return;
    }

    const { selection, doc } = editor.state;
    const { from, to, empty } = selection;

    if (editor.isActive('codeBlock') || empty) {
      editor.chain().focus().toggleCodeBlock().run();

      return;
    }

    const selectedText = doc.textBetween(from, to, '\n', '\n');
    if (!selectedText.includes('\n')) {
      editor.chain().focus().toggleCodeBlock().run();

      return;
    }

    editor
      .chain()
      .focus()
      .insertContentAt(
        { from, to },
        {
          type: 'codeBlock',
          attrs: {
            language: 'plaintext',
          },
          content: [
            {
              type: 'text',
              text: selectedText,
            },
          ],
        },
      )
      .setTextSelection(from + 1)
      .run();
  };

  const handleImageWidthChange = (nextWidth: number) => {
    if (!editor || selectedImagePos === null) {
      return;
    }

    const selectedNode = editor.state.doc.nodeAt(selectedImagePos);
    if (!selectedNode || selectedNode.type.name !== 'image') {
      setSelectedImagePos(null);

      return;
    }

    const didUpdate = editor
      .chain()
      .focus()
      .setNodeSelection(selectedImagePos)
      .updateAttributes('image', {
        width: clampImageWidth(nextWidth),
      })
      .run();

    if (!didUpdate) {
      return;
    }

    // 이미지 width 변경은 onUpdate가 누락될 수 있어 폼 값을 직접 동기화한다.
    isInternalUpdate.current = true;
    onChange?.(normalizeContent(editor.getHTML()));
  };

  const isImageActive = selectedImagePos !== null;
  const selectedImageWidth =
    editor && selectedImagePos !== null
      ? parseImageWidth(editor.state.doc.nodeAt(selectedImagePos)?.attrs.width)
      : MARKDOWN_IMAGE_DEFAULT_WIDTH;
  const activeCodeBlockControl = (() => {
    if (!editor || !editor.isActive('codeBlock')) {
      return null;
    }

    const editorContentWrapper = editorContentWrapperRef.current;
    if (!editorContentWrapper) {
      return null;
    }

    const { $from } = editor.state.selection;
    if ($from.parent.type.name !== 'codeBlock') {
      return null;
    }

    const codeBlockPos = $from.before();
    const codeBlockNode = editor.view.nodeDOM(codeBlockPos);
    if (!(codeBlockNode instanceof HTMLElement)) {
      return null;
    }

    const wrapperRect = editorContentWrapper.getBoundingClientRect();
    const codeBlockRect = codeBlockNode.getBoundingClientRect();

    return {
      language:
        (editor.getAttributes('codeBlock').language as string | undefined) ??
        'plaintext',
      top: Math.max(6, codeBlockRect.top - wrapperRect.top + 6),
      left: Math.max(10, codeBlockRect.left - wrapperRect.left + 10),
    };
  })();

  return (
    <div className="rounded-125 border-border-subtle bg-background-default border">
      <div className="border-border-subtle flex flex-wrap items-center gap-75 border-b px-125 py-100">
        <ToolbarButton
          icon={Undo2}
          label="실행취소"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolbarButton
          icon={Redo2}
          label="다시실행"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        />
        {HEADING_OPTIONS.map(({ icon, label, level }) => (
          <ToolbarButton
            key={label}
            icon={icon}
            label={label}
            isActive={editor?.isActive('heading', { level })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level }).run()
            }
          />
        ))}
        <ToolbarButton
          icon={Bold}
          label="굵게"
          isActive={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label="기울임"
          isActive={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={UnderlineIcon}
          label="밑줄"
          isActive={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={Strikethrough}
          label="취소선"
          isActive={editor?.isActive('strike')}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          icon={Link2}
          label="링크"
          isActive={editor?.isActive('link')}
          onClick={handleToggleLink}
        />
        <ToolbarButton
          icon={List}
          label="목록"
          isActive={editor?.isActive('bulletList')}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="번호목록"
          isActive={editor?.isActive('orderedList')}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={Quote}
          label="인용"
          isActive={editor?.isActive('blockquote')}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={Code2}
          label="코드"
          isActive={editor?.isActive('codeBlock')}
          onClick={handleToggleCodeBlock}
        />
        {resolvedImageConfig && (
          <Button
            type="button"
            color="secondary"
            size="small"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImages}
          >
            {isUploadingImages ? (
              <Loader2 className="mr-50 h-12 w-12 animate-spin" />
            ) : (
              <ImagePlus className="mr-50 h-12 w-12" />
            )}
            {isUploadingImages ? '업로드 중...' : '이미지'}
          </Button>
        )}
      </div>

      {isImageActive && (
        <div className="border-border-subtle flex items-center gap-100 border-b px-150 py-100">
          <span className="font-designer-12r text-text-subtle">
            이미지 크기
          </span>
          <input
            type="range"
            min={MARKDOWN_IMAGE_MIN_WIDTH}
            max={MARKDOWN_IMAGE_MAX_WIDTH}
            step={MARKDOWN_IMAGE_WIDTH_STEP}
            value={selectedImageWidth}
            onChange={(event) => {
              handleImageWidthChange(Number(event.target.value));
            }}
            className="accent-background-brand-default w-[180px]"
          />
          <span className="font-designer-12r text-text-default min-w-[48px]">
            {selectedImageWidth}px
          </span>
          <Button
            type="button"
            color="secondary"
            size="small"
            onClick={() => handleImageWidthChange(MARKDOWN_IMAGE_DEFAULT_WIDTH)}
          >
            기본 200px
          </Button>
        </div>
      )}

      {resolvedImageConfig && (
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept={toImageInputAccept(
            resolvedImageConfig.allowedImageExtensions,
          )}
          className="hidden"
          onChange={(event) => {
            if (!editor) {
              return;
            }

            const files = Array.from(event.target.files ?? []);
            handleImageFiles(editor, files).catch(() => {
              setImageInsertError(
                '이미지 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
              );
            });
            event.target.value = '';
          }}
        />
      )}

      <div ref={editorContentWrapperRef} className="relative">
        {activeCodeBlockControl && (
          <div
            className="absolute z-10"
            style={{
              top: `${activeCodeBlockControl.top}px`,
              left: `${activeCodeBlockControl.left}px`,
            }}
          >
            <div className="rounded-75 border-border-subtle bg-background-default flex items-center border px-75 py-50">
              <select
                aria-label="코드 언어 선택"
                className={cn(
                  'font-designer-12r text-text-default bg-background-default',
                  'min-w-0 border-0 p-0',
                  'focus:outline-none',
                )}
                value={activeCodeBlockControl.language}
                onChange={(event) => {
                  editor
                    ?.chain()
                    .focus()
                    .updateAttributes('codeBlock', {
                      language: event.target.value,
                    })
                    .run();
                }}
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <EditorContent
          editor={editor}
          className={cn(
            'tiptap-editor',
            'bg-background-default',
            'min-h-260 w-full px-150 py-125',
          )}
        />
      </div>

      {isUploadingImages && (
        <div className="border-border-subtle flex items-center gap-75 border-t px-150 py-100">
          <Loader2 className="text-text-subtle h-12 w-12 animate-spin" />
          <p className="font-designer-12r text-text-subtle">
            이미지 업로드 중...
          </p>
        </div>
      )}

      {imageInsertError && (
        <p className="font-designer-12r text-text-error px-150 pb-100">
          {imageInsertError}
        </p>
      )}
    </div>
  );
}

export default memo(MarkdownEditor);
