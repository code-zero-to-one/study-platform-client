'use client';

import {
  ArrowDown,
  ArrowUp,
  FilePlus2,
  ImagePlus,
  Link2,
  TextCursorInput,
  Trash2,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import {
  createMentoringRequestFileBlock,
  createMentoringRequestImageBlock,
  createMentoringRequestLinkBlock,
  createMentoringRequestParagraphBlock,
  type MentoringRequestContentBlock,
} from '@/features/mentoring/model/request-content';

interface MentoringRequestEditorProps {
  value: MentoringRequestContentBlock[];
  onChange: (next: MentoringRequestContentBlock[]) => void;
}

const MAX_BLOCK_COUNT = 40;

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

const getBlockTypeLabel = (type: MentoringRequestContentBlock['type']) => {
  if (type === 'paragraph') return '텍스트';
  if (type === 'image') return '이미지';
  if (type === 'file') return '첨부파일';

  return '링크';
};

export default function MentoringRequestEditor({
  value,
  onChange,
}: MentoringRequestEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState('');

  const canAddMoreBlocks = value.length < MAX_BLOCK_COUNT;

  const linkValues = useMemo(() => {
    return new Set(
      value.filter((block) => block.type === 'link').map((block) => block.url),
    );
  }, [value]);

  const appendBlock = (block: MentoringRequestContentBlock) => {
    if (!canAddMoreBlocks) {
      return;
    }

    onChange([...value, block]);
  };

  const appendParagraphBlock = () => {
    appendBlock(createMentoringRequestParagraphBlock());
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= value.length) {
      return;
    }

    const next = [...value];
    const [target] = next.splice(index, 1);
    next.splice(targetIndex, 0, target);
    onChange(next);
  };

  const removeBlock = (blockId: string) => {
    const next = value.filter((block) => block.id !== blockId);
    onChange(next.length > 0 ? next : [createMentoringRequestParagraphBlock()]);
  };

  const updateParagraph = (blockId: string, text: string) => {
    onChange(
      value.map((block) => {
        if (block.type !== 'paragraph' || block.id !== blockId) {
          return block;
        }

        return {
          ...block,
          text,
        };
      }),
    );
  };

  const updateLink = (blockId: string, url: string) => {
    onChange(
      value.map((block) => {
        if (block.type !== 'link' || block.id !== blockId) {
          return block;
        }

        return {
          ...block,
          url,
        };
      }),
    );
  };

  const handleFileInsert = (
    files: FileList | null,
    blockType: 'image' | 'file',
  ) => {
    const nextFiles = Array.from(files ?? []);
    if (nextFiles.length === 0 || !canAddMoreBlocks) {
      return;
    }

    const remainCount = MAX_BLOCK_COUNT - value.length;
    const selectedFiles = nextFiles.slice(0, remainCount);
    const nextBlocks = selectedFiles.map((file) => {
      if (blockType === 'image') {
        return createMentoringRequestImageBlock({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
      }

      return createMentoringRequestFileBlock({
        fileName: file.name,
        fileSize: file.size,
      });
    });

    onChange([...value, ...nextBlocks]);
  };

  const handleAddLink = () => {
    const raw = linkInput.trim();
    if (!raw) {
      return;
    }

    if (!canAddMoreBlocks) {
      setLinkError('최대 블록 수를 초과했습니다.');

      return;
    }

    const normalized =
      raw.startsWith('http://') || raw.startsWith('https://')
        ? raw
        : `https://${raw}`;

    try {
      const parsed = new URL(normalized);
      const nextLink = parsed.toString();

      if (linkValues.has(nextLink)) {
        setLinkError('이미 추가된 링크입니다.');

        return;
      }

      appendBlock(createMentoringRequestLinkBlock(nextLink));
      setLinkInput('');
      setLinkError('');
    } catch {
      setLinkError('올바른 링크 형식으로 입력해주세요.');
    }
  };

  return (
    <div className="space-y-150">
      <div className="flex flex-wrap gap-75">
        <Button
          type="button"
          color="secondary"
          size="small"
          onClick={appendParagraphBlock}
          disabled={!canAddMoreBlocks}
        >
          <TextCursorInput className="mr-50 h-14 w-14" />
          텍스트 추가
        </Button>
        <Button
          type="button"
          color="secondary"
          size="small"
          onClick={() => imageInputRef.current?.click()}
          disabled={!canAddMoreBlocks}
        >
          <ImagePlus className="mr-50 h-14 w-14" />
          이미지 추가
        </Button>
        <Button
          type="button"
          color="secondary"
          size="small"
          onClick={() => fileInputRef.current?.click()}
          disabled={!canAddMoreBlocks}
        >
          <FilePlus2 className="mr-50 h-14 w-14" />
          첨부파일 추가
        </Button>
      </div>

      <div className="flex flex-col gap-100 sm:flex-row">
        <input
          value={linkInput}
          onChange={(event) => {
            setLinkInput(event.target.value);
            if (linkError) {
              setLinkError('');
            }
          }}
          className={cn(
            'font-designer-13r rounded-100 border-border-subtle bg-background-default',
            'text-text-default w-full border px-125 py-100',
            'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
          )}
          placeholder="https://github.com/... 또는 참고 링크"
        />
        <Button
          type="button"
          color="secondary"
          size="small"
          className="shrink-0"
          onClick={handleAddLink}
          disabled={!canAddMoreBlocks}
        >
          <Link2 className="mr-50 h-14 w-14" />
          링크 추가
        </Button>
      </div>

      {linkError && (
        <p className="font-designer-12r text-text-error">{linkError}</p>
      )}

      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          handleFileInsert(event.target.files, 'image');
          event.target.value = '';
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFileInsert(event.target.files, 'file');
          event.target.value = '';
        }}
      />

      <div className="space-y-100">
        {value.map((block, index) => (
          <article
            key={block.id}
            className="rounded-125 border-border-subtle bg-background-alternative border p-125"
          >
            <div className="mb-75 flex items-center justify-between gap-75">
              <p className="font-designer-12r text-text-subtle">
                {index + 1}. {getBlockTypeLabel(block.type)} 블록
              </p>
              <div className="flex items-center gap-25">
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'up')}
                  className="text-text-subtle hover:text-text-default rounded-100 p-50"
                  disabled={index === 0}
                  aria-label="위로 이동"
                >
                  <ArrowUp className="h-14 w-14" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 'down')}
                  className="text-text-subtle hover:text-text-default rounded-100 p-50"
                  disabled={index === value.length - 1}
                  aria-label="아래로 이동"
                >
                  <ArrowDown className="h-14 w-14" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="text-text-subtle hover:text-text-error rounded-100 p-50"
                  aria-label="블록 삭제"
                >
                  <Trash2 className="h-14 w-14" />
                </button>
              </div>
            </div>

            {block.type === 'paragraph' && (
              <textarea
                value={block.text}
                onChange={(event) =>
                  updateParagraph(block.id, event.target.value)
                }
                className={cn(
                  'font-designer-14r rounded-100 border-border-subtle bg-background-default',
                  'text-text-default min-h-[120px] w-full resize-y border px-125 py-100',
                  'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
                )}
                placeholder="멘토에게 전달할 내용을 작성해주세요."
              />
            )}

            {block.type === 'image' && (
              <div className="rounded-100 border-border-subtle bg-background-default border px-125 py-100">
                <p className="font-designer-13b text-text-default truncate">
                  {block.fileName}
                </p>
                <p className="font-designer-12r text-text-subtle mt-25">
                  {formatFileSize(block.fileSize)}
                </p>
              </div>
            )}

            {block.type === 'file' && (
              <div className="rounded-100 border-border-subtle bg-background-default border px-125 py-100">
                <p className="font-designer-13b text-text-default truncate">
                  {block.fileName}
                </p>
                <p className="font-designer-12r text-text-subtle mt-25">
                  {formatFileSize(block.fileSize)}
                </p>
              </div>
            )}

            {block.type === 'link' && (
              <input
                value={block.url}
                onChange={(event) => updateLink(block.id, event.target.value)}
                className={cn(
                  'font-designer-13r rounded-100 border-border-subtle bg-background-default',
                  'text-text-default w-full border px-125 py-100',
                  'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
                )}
                placeholder="https://..."
              />
            )}
          </article>
        ))}
      </div>

      <p className="font-designer-12r text-text-subtlest">
        블록은 최대 {MAX_BLOCK_COUNT}개까지 추가할 수 있습니다.
      </p>
    </div>
  );
}
