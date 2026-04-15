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
import {
  type FormEvent,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import { normalizeMarkdownContent } from '@/utils/markdown-content-normalize';
import { getRichContentVisibleTextLength } from '@/utils/markdown-content-text';
import { hasClipboardImageHint } from './clipboard-utils';
import EditorVisibleTextCounter from './editor-visible-text-counter';
import {
  InstantCodeBlockExtension,
  lowlight,
  MarkdownHistoryShortcutsExtension,
  ResizableImageExtension,
  YouTubeEmbedExtension,
} from './extensions';
import {
  type MarkdownEditorImageConfig,
  clampImageWidth,
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
import { useActiveCodeBlockControl } from './use-active-code-block-control';
import { useImageUpload } from './use-image-upload';
import { isSingleYouTubeUrlText, YOUTUBE_IFRAME_TITLE } from './youtube-utils';

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
  visibleTextCounter?: {
    helperText?: string;
    maxLength: number;
  };
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/**
 * 마크다운 에디터 컴포넌트입니다.
 * 마크다운 문법, 이미지 업로드, 코드블록 등을 지원합니다.
 */
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
  visibleTextCounter,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: MarkdownEditorProps) {
  const [selectedImagePos, setSelectedImagePos] = useState<number | null>(null);
  const [, forceEditorRerender] = useState(0);
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorContentWrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const isInternalUpdate = useRef(false);
  const normalizedValue = normalizeContent(value);
  const currentVisibleTextLength = useMemo(() => {
    return getRichContentVisibleTextLength(normalizedValue);
  }, [normalizedValue]);

  /**
   * 유효한 에디터 인스턴스를 반환합니다.
   * null이거나 destroyed 상태이면 null을 반환합니다.
   */
  const getValidEditorInstance = (): Editor | null => {
    if (!editorRef.current || editorRef.current.isDestroyed) {
      return null;
    }
    return editorRef.current;
  };

  const insertYouTubeEmbed = (editorInstance: Editor, pastedText: string) => {
    const youtubeEmbed = isSingleYouTubeUrlText(pastedText);
    if (!youtubeEmbed || editorInstance.isActive('codeBlock')) {
      return false;
    }

    return editorInstance
      .chain()
      .focus()
      .insertContent([
        {
          type: 'youtubeEmbed',
          attrs: {
            src: youtubeEmbed.embedUrl,
            title: YOUTUBE_IFRAME_TITLE,
          },
        },
        { type: 'paragraph' },
      ])
      .run();
  };

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
      YouTubeEmbedExtension,
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
    onTransaction: () => {
      forceEditorRerender((prev) => prev + 1);
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
        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }

        const editorInstance = getValidEditorInstance();
        if (!editorInstance) {
          return false;
        }

        if (resolvedImageConfig && hasClipboardImageHint(clipboardData)) {
          event.preventDefault();
          handleClipboardPaste(editorInstance, clipboardData).catch(() => {
            setImageInsertError('이미지 붙여넣기에 실패했습니다.');
          });
          return true;
        }

        const pastedText = clipboardData.getData('text/plain');
        if (!insertYouTubeEmbed(editorInstance, pastedText)) {
          return false;
        }

        event.preventDefault();
        return true;
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
        const editorInstance = getValidEditorInstance();
        const onDropError = () =>
          setImageInsertError('이미지 드롭에 실패했습니다.');

        if (!editorInstance) {
          onDropError();
          return true;
        }

        handleImageFiles(editorInstance, imageFiles).catch(onDropError);

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

  const handleToggleLink = () => {
    if (!editor) {
      return;
    }

    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();

      return;
    }

    setLinkInputValue('https://');
    setIsLinkInputOpen(true);
  };

  /**
   * 링크 URL을 에디터에 적용합니다.
   */
  const handleLinkSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedUrl = linkInputValue.trim();
    if (editor && trimmedUrl) {
      editor.chain().focus().setLink({ href: trimmedUrl }).run();
    }
    setIsLinkInputOpen(false);
    setLinkInputValue('');
  };

  const handleLinkCancel = () => {
    setIsLinkInputOpen(false);
    setLinkInputValue('');
  };

  /**
   * 코드블록 토글 기능입니다.
   * 선택된 여러줄 텍스트를 코드블록으로 감쌀 수 있습니다.
   */
  const handleToggleCodeBlock = () => {
    if (!editor) {
      return;
    }

    const { selection, doc } = editor.state;
    const { from, to, empty } = selection;
    const isCodeBlockActive = editor.isActive('codeBlock');

    // 이미 코드블록이거나 선택이 없으면 간단히 토글
    if (isCodeBlockActive || empty) {
      editor.chain().focus().toggleCodeBlock().run();
      return;
    }

    const selectedText = doc.textBetween(from, to, '\n', '\n');
    const hasMultipleLines = selectedText.includes('\n');

    // 선택 텍스트가 한 줄이면 간단히 토글
    if (!hasMultipleLines) {
      editor.chain().focus().toggleCodeBlock().run();
      return;
    }

    // 여러 줄이면 선택 텍스트를 코드블록으로 감싸기
    const codeBlockContent = {
      type: 'text',
      text: selectedText,
    };
    const codeBlockNode = {
      type: 'codeBlock',
      attrs: {
        language: 'plaintext',
      },
      content: [codeBlockContent],
    };
    const insertCommand = editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, codeBlockNode)
      .setTextSelection(from + 1);

    insertCommand.run();
  };

  /**
   * 선택된 이미지의 너비를 변경합니다.
   */
  const handleImageWidthChange = (nextWidth: number) => {
    if (!editor || selectedImagePos === null) {
      return;
    }

    const selectedNode = editor.state.doc.nodeAt(selectedImagePos);
    if (!selectedNode || selectedNode.type.name !== 'image') {
      setSelectedImagePos(null);

      return;
    }

    const imageChain = editor
      .chain()
      .focus()
      .setNodeSelection(selectedImagePos)
      .updateAttributes('image', {
        width: clampImageWidth(nextWidth),
      });

    const didUpdate = imageChain.run();

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

  const activeCodeBlockControl = useActiveCodeBlockControl(
    editor,
    editorContentWrapperRef,
  );

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

      {isLinkInputOpen && (
        <form
          onSubmit={handleLinkSubmit}
          className="border-border-subtle flex items-center gap-100 border-b px-125 py-75"
        >
          <input
            type="url"
            value={linkInputValue}
            onChange={(e) => setLinkInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleLinkCancel();
            }}
            placeholder="https://"
            autoFocus
            aria-label="링크 URL 입력"
            className={cn(
              'font-designer-14r text-text-default bg-background-default',
              'min-w-0 flex-1 border-0 p-0 focus:outline-none',
            )}
          />
          <Button type="submit" color="primary" size="small">
            추가
          </Button>
          <Button
            type="button"
            color="secondary"
            size="small"
            onClick={handleLinkCancel}
          >
            취소
          </Button>
        </form>
      )}

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
            className="accent-background-brand-default flex-1"
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
            기본 480px
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

      {visibleTextCounter ? (
        <EditorVisibleTextCounter
          currentLength={currentVisibleTextLength}
          helperText={visibleTextCounter.helperText}
          maxLength={visibleTextCounter.maxLength}
        />
      ) : null}

      {imageInsertError && (
        <p className="font-designer-12r text-text-error px-150 pb-100">
          {imageInsertError}
        </p>
      )}
    </div>
  );
}

export default memo(MarkdownEditor);
