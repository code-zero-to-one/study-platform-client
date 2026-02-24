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
  Pencil,
  Quote,
  Strikethrough,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';

interface MentorMarkdownEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB (blob URL 방식은 에디터 텍스트 크기와 무관)
const MAX_IMAGE_FILE_COUNT = 3;

const toMarkdownAltText = (fileName: string) => {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '').trim();
  const sanitized = withoutExtension.replace(/[[\]()]/g, '').trim();

  return sanitized.length > 0 ? sanitized : '업로드 이미지';
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
  {
    label: '이미지 URL',
    icon: Image,
    onInsert: (
      insertSnippet: (snippet: string, cursorShift?: number) => void,
    ) => insertSnippet('\n![이미지 설명](https://image-url)\n', 1),
  },
] as const;

export default function MentorMarkdownEditor({
  value,
  onChange,
  placeholder,
}: MentorMarkdownEditorProps) {
  const [imageInsertError, setImageInsertError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  // 생성한 blob URL 추적 → 언마운트 시 메모리 해제
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    const imagesToUpload = selectedFiles.slice(0, MAX_IMAGE_FILE_COUNT);
    const failedFileNames: string[] = [];
    const uploadedImageSnippets: string[] = [];

    for (const file of imagesToUpload) {
      if (!file.type.startsWith('image/')) {
        failedFileNames.push(`${file.name}(이미지 파일 아님)`);
        continue;
      }

      if (file.size > MAX_IMAGE_FILE_SIZE) {
        failedFileNames.push(`${file.name}(5MB 초과)`);
        continue;
      }

      try {
        // blob URL: 에디터에 짧은 URL만 삽입 → 에디터가 무거워지지 않음
        // 나중에 API 연동 시 blob URL → 실제 서버 URL로 교체
        const blobUrl = URL.createObjectURL(file);
        blobUrlsRef.current.push(blobUrl);
        uploadedImageSnippets.push(
          `![${toMarkdownAltText(file.name)}](${blobUrl})`,
        );
      } catch {
        failedFileNames.push(`${file.name}(읽기 실패)`);
      }
    }

    if (uploadedImageSnippets.length > 0) {
      insertSnippet(`\n${uploadedImageSnippets.join('\n\n')}\n`, 1);
    }

    if (failedFileNames.length > 0) {
      setImageInsertError(
        `일부 이미지를 삽입하지 못했습니다: ${failedFileNames.join(', ')}`,
      );

      return;
    }

    if (selectedFiles.length > MAX_IMAGE_FILE_COUNT) {
      setImageInsertError(
        `이미지는 한 번에 최대 ${MAX_IMAGE_FILE_COUNT}장까지 삽입할 수 있습니다.`,
      );

      return;
    }

    setImageInsertError('');
  };

  return (
    <div className="rounded-125 border-border-subtle bg-background-default border">
      <div className="border-border-subtle bg-background-alternative flex flex-wrap items-center justify-between gap-100 border-b px-150 py-100">
        <span className="font-designer-12r bg-fill-brand-subtle-default text-text-brand rounded-100 px-100 py-50">
          <Pencil className="mr-50 inline h-12 w-12" />
          작성
        </span>
        <p className="font-designer-12r text-text-subtle">
          마크다운 + 이미지 업로드를 지원합니다. (최대 3장, 각 5MB)
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
          onClick={() => imageInputRef.current?.click()}
        >
          <ImagePlus className="mr-50 h-12 w-12" />
          이미지 업로드
        </Button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
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
