'use client';

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
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { common, createLowlight } from 'lowlight'; // eslint-disable-line import/order
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  requestMentorMarkdownImageUploadTicket,
  uploadMentorMarkdownImageFile,
} from '@/features/mentoring/model/mentor-markdown-image-upload';
import {
  extractImageUrls,
  getFileExtension,
  isAllowedMarkdownImageExtension,
  MENTOR_MARKDOWN_MAX_IMAGE_COUNT,
  MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE,
} from '@/types/mentoring/markdown';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';

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

const IMAGE_URL_PATTERN =
  /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?[^\s]*)?$/i;
const MENTOR_MARKDOWN_IMAGE_MIN_WIDTH = 80;
const MENTOR_MARKDOWN_IMAGE_DEFAULT_WIDTH = 200;
const MENTOR_MARKDOWN_IMAGE_MAX_WIDTH = 400;
const MENTOR_MARKDOWN_IMAGE_WIDTH_STEP = 10;

const isImageUrl = (text: string): boolean => {
  return IMAGE_URL_PATTERN.test(text.trim());
};

const clampImageWidth = (value: number) => {
  return Math.min(
    MENTOR_MARKDOWN_IMAGE_MAX_WIDTH,
    Math.max(MENTOR_MARKDOWN_IMAGE_MIN_WIDTH, Math.round(value)),
  );
};

const parseImageWidth = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return MENTOR_MARKDOWN_IMAGE_DEFAULT_WIDTH;
  }

  return clampImageWidth(parsed);
};

const MentorImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: MENTOR_MARKDOWN_IMAGE_DEFAULT_WIDTH,
        parseHTML: (element: HTMLElement) =>
          parseImageWidth(element.getAttribute('width')),
        renderHTML: (attributes: Record<string, unknown>) => ({
          width: String(parseImageWidth(attributes.width)),
        }),
      },
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

interface MentorMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

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

function MentorMarkdownEditor({
  value,
  onChange,
  placeholder,
}: MentorMarkdownEditorProps) {
  const [imageInsertError, setImageInsertError] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [selectedImagePos, setSelectedImagePos] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isInternalUpdate = useRef(false);
  const [, setRenderKey] = useState(0);

  const uploadAndInsertFile = useCallback(
    async (editor: Editor, file: File) => {
      const ticket = await requestMentorMarkdownImageUploadTicket({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      await uploadMentorMarkdownImageFile({
        uploadUrl: ticket.uploadUrl,
        file,
      });

      editor
        .chain()
        .focus()
        .setImage({
          src: ticket.publicUrl,
          width: MENTOR_MARKDOWN_IMAGE_DEFAULT_WIDTH,
        })
        .run();
    },
    [],
  );

  const validateImageFile = (file: File): string | undefined => {
    if (!file.type.startsWith('image/')) {
      return `${file.name}: 이미지 파일이 아닙니다.`;
    }

    const extension = getFileExtension(file.name);
    if (
      extension &&
      extension !== 'blob' &&
      !isAllowedMarkdownImageExtension(extension)
    ) {
      return `${file.name}: 허용되지 않은 확장자입니다. (jpg/png/webp/gif)`;
    }

    if (file.size > MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE) {
      return `${file.name}: 5MB를 초과합니다.`;
    }

    return undefined;
  };

  const handleImageFiles = useCallback(
    async (editor: Editor, files: File[]) => {
      if (files.length === 0 || isUploadingImages) {
        return;
      }

      const existingCount = extractImageUrls(editor.getHTML()).length;
      const remaining = Math.max(
        0,
        MENTOR_MARKDOWN_MAX_IMAGE_COUNT - existingCount,
      );

      if (remaining === 0) {
        setImageInsertError(
          `이미지는 최대 ${MENTOR_MARKDOWN_MAX_IMAGE_COUNT}개까지만 등록할 수 있습니다.`,
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
            `이미지는 최대 ${MENTOR_MARKDOWN_MAX_IMAGE_COUNT}개까지 등록할 수 있습니다.`,
          );
        }

        if (errors.length > 0) {
          setImageInsertError(errors.join(' '));
        }
      } finally {
        setIsUploadingImages(false);
      }
    },
    [isUploadingImages, uploadAndInsertFile],
  );

  const handlePasteImageUrl = useCallback(
    async (editor: Editor, url: string) => {
      const existingCount = extractImageUrls(editor.getHTML()).length;
      if (existingCount >= MENTOR_MARKDOWN_MAX_IMAGE_COUNT) {
        setImageInsertError(
          `이미지는 최대 ${MENTOR_MARKDOWN_MAX_IMAGE_COUNT}개까지만 등록할 수 있습니다.`,
        );

        return;
      }

      setIsUploadingImages(true);
      setImageInsertError('');

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('이미지를 가져올 수 없습니다.');
        }

        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
          throw new Error('이미지 파일이 아닙니다.');
        }

        const ext = guessExtensionFromMime(blob.type);
        const file = toFileFromBlob(blob, `pasted-image.${ext}`);

        if (file.size > MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE) {
          setImageInsertError('이미지가 5MB를 초과합니다.');

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
    [uploadAndInsertFile],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noreferrer',
          target: '_blank',
        },
      }),
      MentorImageExtension,
      Placeholder.configure({
        placeholder: placeholder ?? '멘토 소개를 자유롭게 작성해주세요.',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor: updatedEditor }) => {
      isInternalUpdate.current = true;
      onChange(updatedEditor.getHTML());
    },
    onTransaction() {
      setRenderKey((prev) => prev + 1);
    },
    onSelectionUpdate: ({ editor: nextEditor }) => {
      if (nextEditor.isActive('image')) {
        setSelectedImagePos(nextEditor.state.selection.from);

        return;
      }

      if (nextEditor.isFocused) {
        setSelectedImagePos(null);
      }
    },
    editorProps: {
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }

        const imageFiles = Array.from(clipboardData.files).filter((file) =>
          file.type.startsWith('image/'),
        );

        if (imageFiles.length > 0) {
          event.preventDefault();
          const editorInstance = view.state
            ? (view as unknown as { editor?: Editor }).editor
            : undefined;

          if (editorInstance) {
            handleImageFiles(editorInstance, imageFiles).catch(() => {
              setImageInsertError('이미지 붙여넣기에 실패했습니다.');
            });
          }

          return true;
        }

        const pastedText = clipboardData.getData('text/plain').trim();
        if (pastedText && isImageUrl(pastedText)) {
          event.preventDefault();
          const editorInstance = (view as unknown as { editor?: Editor })
            .editor;

          if (editorInstance) {
            handlePasteImageUrl(editorInstance, pastedText).catch(() => {
              setImageInsertError('이미지 URL 처리에 실패했습니다.');
            });
          }

          return true;
        }

        return false;
      },
      handleDrop: (view, event) => {
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
        const editorInstance = (view as unknown as { editor?: Editor }).editor;

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
    if (!editor || editor.isDestroyed) {
      return;
    }

    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;

      return;
    }

    const currentHtml = editor.getHTML();
    if (currentHtml !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

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
    onChange(editor.getHTML());
  };

  const isImageActive = selectedImagePos !== null;
  const selectedImageWidth =
    editor && selectedImagePos !== null
      ? parseImageWidth(editor.state.doc.nodeAt(selectedImagePos)?.attrs.width)
      : MENTOR_MARKDOWN_IMAGE_DEFAULT_WIDTH;

  return (
    <div className="rounded-125 border-border-subtle bg-background-default border">
      <div className="border-border-subtle flex flex-wrap items-center gap-75 border-b px-125 py-100">
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
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        />
        {editor?.isActive('codeBlock') && (
          <select
            className={cn(
              'font-designer-12r text-text-default',
              'rounded-75 border-border-subtle bg-background-default',
              'border px-75 py-50',
            )}
            value={
              (editor.getAttributes('codeBlock').language as string) ??
              'plaintext'
            }
            onChange={(event) => {
              editor
                .chain()
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
        )}
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
      </div>

      {isImageActive && (
        <div className="border-border-subtle flex items-center gap-100 border-b px-150 py-100">
          <span className="font-designer-12r text-text-subtle">
            이미지 크기
          </span>
          <input
            type="range"
            min={MENTOR_MARKDOWN_IMAGE_MIN_WIDTH}
            max={MENTOR_MARKDOWN_IMAGE_MAX_WIDTH}
            step={MENTOR_MARKDOWN_IMAGE_WIDTH_STEP}
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
            onClick={() =>
              handleImageWidthChange(MENTOR_MARKDOWN_IMAGE_DEFAULT_WIDTH)
            }
          >
            기본 200px
          </Button>
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
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

      <EditorContent
        editor={editor}
        className={cn(
          'tiptap-editor',
          'bg-background-default',
          'min-h-[260px] w-full px-150 py-125',
        )}
      />

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

export default memo(MentorMarkdownEditor);
