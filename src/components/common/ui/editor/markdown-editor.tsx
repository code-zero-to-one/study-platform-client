'use client';

import 'highlight.js/styles/github.css';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import { normalizeMarkdownContent } from '@/utils/markdown-content';
import {
  InstantCodeBlockExtension,
  lowlight,
  MarkdownHistoryShortcutsExtension,
  ResizableImageExtension,
} from './extensions';
import {
  type MarkdownEditorImageConfig,
  clampImageWidth,
  hasClipboardImageHint,
  MARKDOWN_IMAGE_DEFAULT_ALLOWED_EXTENSIONS,
  MARKDOWN_IMAGE_DEFAULT_MAX_COUNT,
  MARKDOWN_IMAGE_DEFAULT_MAX_FILE_SIZE,
  MARKDOWN_IMAGE_DEFAULT_WIDTH,
  MARKDOWN_IMAGE_MAX_WIDTH,
  MARKDOWN_IMAGE_MIN_WIDTH,
  MARKDOWN_IMAGE_WIDTH_STEP,
  parseImageWidth,
  toImageInputAccept,
} from './image-utils';
import { CODE_LANGUAGES, HEADING_OPTIONS, ToolbarButton } from './toolbar';
import { useImageUpload } from './use-image-upload';

export type { MarkdownEditorImageConfig } from './image-utils';

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

  const {
    imageInsertError,
    isUploadingImages,
    setImageInsertError,
    handleImageFiles,
    handleClipboardPaste,
  } = useImageUpload(resolvedImageConfig);

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
      handlePaste: (_, event) => {
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
      handleDrop: (_, event) => {
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
          <span className="font-designer-12r text-text-default min-w-600">
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
