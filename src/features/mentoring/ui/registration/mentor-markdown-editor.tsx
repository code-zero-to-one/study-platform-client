'use client';

import {
  Bold,
  Code2,
  Heading2,
  Image,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Strikethrough,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import {
  requestMentorMarkdownImageUploadTicket,
  uploadMentorMarkdownImageFile,
} from '@/features/mentoring/model/mentor-markdown-image-upload';
import {
  extractMarkdownImageUrls,
  getFileExtension,
  isAllowedMarkdownImageExtension,
  MENTOR_MARKDOWN_MAX_IMAGE_COUNT,
  MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE,
} from '@/types/mentoring/markdown';

interface MentorMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

const DEFAULT_ALLOWED_IMAGE_HOSTS = [
  'cdn.zeroone.it.kr',
  'www.zeroone.it.kr',
  'zeroone.it.kr',
] as const;
const IMAGE_URL_ACCEPT_HINT = 'https://cdn.example.com/images/mentor.png';

const toMarkdownAltText = (fileName: string) => {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '').trim();
  const sanitized = withoutExtension.replace(/[[\]()]/g, '').trim();

  return sanitized.length > 0 ? sanitized : '업로드 이미지';
};

const toAllowedImageHostSet = () => {
  const hosts = new Set<string>(DEFAULT_ALLOWED_IMAGE_HOSTS);
  const customHosts = process.env.NEXT_PUBLIC_MARKDOWN_IMAGE_ALLOWED_HOSTS;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  customHosts
    ?.split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0)
    .forEach((host) => hosts.add(host));

  if (apiBaseUrl) {
    try {
      const apiHost = new URL(apiBaseUrl).hostname.toLowerCase();
      hosts.add(apiHost);
    } catch {
      // NEXT_PUBLIC_API_BASE_URL 이 비정상 값이면 무시
    }
  }

  if (typeof window !== 'undefined') {
    hosts.add(window.location.hostname.toLowerCase());
  }

  return hosts;
};

const getImageUrlValidationError = (rawUrl: string) => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return '이미지 URL 형식이 올바르지 않습니다.';
  }

  if (parsedUrl.protocol !== 'https:') {
    return '이미지 URL은 https만 허용됩니다.';
  }

  const fileExtension = getFileExtension(parsedUrl.pathname);
  if (!isAllowedMarkdownImageExtension(fileExtension)) {
    return '이미지는 jpg/png/webp/gif 확장자만 허용됩니다.';
  }

  const allowedHosts = toAllowedImageHostSet();
  const hostname = parsedUrl.hostname.toLowerCase();
  const isOwnImagesPath =
    typeof window !== 'undefined' &&
    hostname === window.location.hostname.toLowerCase() &&
    parsedUrl.pathname.startsWith('/images/');

  if (!isOwnImagesPath && !allowedHosts.has(hostname)) {
    return '허용된 이미지 도메인(CDN 또는 자체 /images/**)만 사용할 수 있습니다.';
  }

  return undefined;
};

const insertableBlocks = [
  {
    label: '소제목',
    icon: Heading2,
    onInsert: (
      insertSnippet: (snippet: string, cursorShift?: number) => void,
    ) => insertSnippet('\n## 소제목\n', 1),
  },
  {
    label: '굵게',
    icon: Bold,
    onInsert: (
      _insertSnippet: (snippet: string, cursorShift?: number) => void,
      wrapSelection: (
        prefix: string,
        suffix: string,
        placeholderText: string,
      ) => void,
    ) => wrapSelection('**', '**', '강조 텍스트'),
  },
  {
    label: '기울임',
    icon: Italic,
    onInsert: (
      _insertSnippet: (snippet: string, cursorShift?: number) => void,
      wrapSelection: (
        prefix: string,
        suffix: string,
        placeholderText: string,
      ) => void,
    ) => wrapSelection('*', '*', '기울임 텍스트'),
  },
  {
    label: '취소선',
    icon: Strikethrough,
    onInsert: (
      _insertSnippet: (snippet: string, cursorShift?: number) => void,
      wrapSelection: (
        prefix: string,
        suffix: string,
        placeholderText: string,
      ) => void,
    ) => wrapSelection('~~', '~~', '취소선 텍스트'),
  },
  {
    label: '목록',
    icon: List,
    onInsert: (
      insertSnippet: (snippet: string, cursorShift?: number) => void,
    ) => insertSnippet('\n- 항목 1\n- 항목 2\n', 1),
  },
  {
    label: '번호목록',
    icon: ListOrdered,
    onInsert: (
      insertSnippet: (snippet: string, cursorShift?: number) => void,
    ) => insertSnippet('\n1. 항목 1\n2. 항목 2\n', 1),
  },
  {
    label: '인용',
    icon: Quote,
    onInsert: (
      insertSnippet: (snippet: string, cursorShift?: number) => void,
    ) => insertSnippet('\n> 인용문을 입력하세요.\n', 1),
  },
  {
    label: '코드',
    icon: Code2,
    onInsert: (
      insertSnippet: (snippet: string, cursorShift?: number) => void,
    ) => insertSnippet('\n```ts\n// 코드 블록\n```\n', 4),
  },
  {
    label: '링크',
    icon: Link2,
    onInsert: (
      _insertSnippet: (snippet: string, cursorShift?: number) => void,
      wrapSelection: (
        prefix: string,
        suffix: string,
        placeholderText: string,
      ) => void,
    ) => wrapSelection('[', '](https://example.com)', '링크 텍스트'),
  },
] as const;

export default function MentorMarkdownEditor({
  value,
  onChange,
  placeholder,
}: MentorMarkdownEditorProps) {
  const [imageInsertError, setImageInsertError] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const insertSnippet = (snippet: string, cursorShift = 0) => {
    const textarea = textareaRef.current;
    const sourceValue = textarea?.value ?? value;

    if (!textarea) {
      onChange(`${sourceValue}${snippet}`);

      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const nextValue =
      sourceValue.slice(0, selectionStart) +
      snippet +
      sourceValue.slice(selectionEnd);
    const nextCursorPosition =
      selectionStart + Math.max(0, snippet.length - cursorShift);

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  };

  const wrapSelection = (
    prefix: string,
    suffix: string,
    placeholderText: string,
  ) => {
    const textarea = textareaRef.current;
    const sourceValue = textarea?.value ?? value;

    if (!textarea) {
      onChange(`${sourceValue}${prefix}${placeholderText}${suffix}`);

      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText =
      sourceValue.slice(selectionStart, selectionEnd) || placeholderText;
    const replacement = `${prefix}${selectedText}${suffix}`;
    const nextValue =
      sourceValue.slice(0, selectionStart) +
      replacement +
      sourceValue.slice(selectionEnd);
    const selectStart = selectionStart + prefix.length;
    const selectEnd = selectStart + selectedText.length;

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectStart, selectEnd);
    });
  };

  const handleImageUpload = (files: FileList | null) => {
    void (async () => {
      const selectedFiles = Array.from(files ?? []);
      if (selectedFiles.length === 0 || isUploadingImages) {
        return;
      }

      const existingImageCount = extractMarkdownImageUrls(value).length;
      const remainingImageCount = Math.max(
        0,
        MENTOR_MARKDOWN_MAX_IMAGE_COUNT - existingImageCount,
      );

      if (remainingImageCount === 0) {
        setImageInsertError(
          `이미지는 최대 ${MENTOR_MARKDOWN_MAX_IMAGE_COUNT}개까지만 등록할 수 있습니다.`,
        );

        return;
      }

      const targetFiles = selectedFiles.slice(0, remainingImageCount);
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      for (const file of targetFiles) {
        const extension = getFileExtension(file.name);

        if (!file.type.startsWith('image/')) {
          validationErrors.push(`${file.name}(이미지 파일 아님)`);
          continue;
        }

        if (!isAllowedMarkdownImageExtension(extension)) {
          validationErrors.push(`${file.name}(허용되지 않은 확장자)`);
          continue;
        }

        if (file.size > MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE) {
          validationErrors.push(`${file.name}(5MB 초과)`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        if (selectedFiles.length > remainingImageCount) {
          validationErrors.push(
            `최대 ${MENTOR_MARKDOWN_MAX_IMAGE_COUNT}개까지만 등록할 수 있습니다.`,
          );
        }

        if (validationErrors.length > 0) {
          setImageInsertError(
            `이미지 검증 실패: ${validationErrors.join(', ')}`,
          );
        }

        return;
      }

      setIsUploadingImages(true);
      try {
        const uploadErrors: string[] = [];
        const uploadedImageSnippets: string[] = [];

        for (const file of validFiles) {
          try {
            const ticket = await requestMentorMarkdownImageUploadTicket({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            });
            const validationError = getImageUrlValidationError(
              ticket.publicUrl,
            );

            if (validationError) {
              uploadErrors.push(`${file.name}(${validationError})`);
              continue;
            }

            await uploadMentorMarkdownImageFile({
              uploadUrl: ticket.uploadUrl,
              file,
            });
            uploadedImageSnippets.push(
              `![${toMarkdownAltText(file.name)}](${ticket.publicUrl})`,
            );
          } catch {
            uploadErrors.push(`${file.name}(업로드 실패)`);
          }
        }

        if (uploadedImageSnippets.length > 0) {
          insertSnippet(`\n${uploadedImageSnippets.join('\n\n')}\n`, 1);
        }

        const messages: string[] = [];
        if (selectedFiles.length > remainingImageCount) {
          messages.push(
            `이미지는 최대 ${MENTOR_MARKDOWN_MAX_IMAGE_COUNT}개까지 등록할 수 있습니다.`,
          );
        }

        if (validationErrors.length > 0) {
          messages.push(`검증 실패: ${validationErrors.join(', ')}`);
        }

        if (uploadErrors.length > 0) {
          messages.push(`업로드 실패: ${uploadErrors.join(', ')}`);
        }

        setImageInsertError(messages.join(' '));
        if (messages.length === 0) {
          setImageInsertError('');
        }
      } finally {
        setIsUploadingImages(false);
      }
    })();
  };

  const handleInsertImageUrl = () => {
    const existingImageCount = extractMarkdownImageUrls(value).length;
    if (existingImageCount >= MENTOR_MARKDOWN_MAX_IMAGE_COUNT) {
      setImageInsertError(
        `이미지는 최대 ${MENTOR_MARKDOWN_MAX_IMAGE_COUNT}개까지만 등록할 수 있습니다.`,
      );

      return;
    }

    const rawUrl = window.prompt(
      '삽입할 이미지 URL을 입력해주세요. (https + 허용 도메인)',
      IMAGE_URL_ACCEPT_HINT,
    );

    if (!rawUrl) {
      return;
    }

    const imageUrl = rawUrl.trim();
    const validationError = getImageUrlValidationError(imageUrl);
    if (validationError) {
      setImageInsertError(validationError);

      return;
    }

    const rawAltText =
      window.prompt('이미지 설명(alt)을 입력해주세요.', '이미지 설명') ?? '';
    const altText = toMarkdownAltText(rawAltText);

    insertSnippet(`\n![${altText}](${imageUrl})\n`, 1);
    setImageInsertError('');
  };

  return (
    <div className="rounded-125 border-border-subtle bg-background-default border">
      <div className="border-border-subtle bg-background-alternative flex flex-wrap items-center gap-100 border-b px-150 py-100">
        <p className="font-designer-12r text-text-subtle">
          마크다운 원문 저장 + 이미지 업로드를 지원합니다. (최대{' '}
          {MENTOR_MARKDOWN_MAX_IMAGE_COUNT}장, 각 5MB)
        </p>
      </div>

      <div className="border-border-subtle flex flex-wrap gap-75 border-b px-125 py-100">
        {insertableBlocks.map((block) => {
          const Icon = block.icon;

          return (
            <Button
              key={block.label}
              type="button"
              color="secondary"
              size="small"
              onClick={() => block.onInsert(insertSnippet, wrapSelection)}
            >
              <Icon className="mr-50 h-12 w-12" />
              {block.label}
            </Button>
          );
        })}
        <Button
          type="button"
          color="secondary"
          size="small"
          onClick={handleInsertImageUrl}
          disabled={isUploadingImages}
        >
          <Image className="mr-50 h-12 w-12" />
          이미지 URL
        </Button>
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
          {isUploadingImages ? '업로드 중...' : '이미지 업로드'}
        </Button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          handleImageUpload(event.target.files);
          event.target.value = '';
        }}
      />

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'font-designer-14r bg-background-default text-text-default',
          'min-h-[260px] w-full resize-y px-150 py-125',
          'placeholder:text-text-subtlest focus:outline-none',
        )}
        placeholder={placeholder ?? '멘토 소개를 마크다운으로 작성해주세요.'}
      />
      {imageInsertError && (
        <p className="font-designer-12r text-text-error px-150 pb-100">
          {imageInsertError}
        </p>
      )}
    </div>
  );
}
