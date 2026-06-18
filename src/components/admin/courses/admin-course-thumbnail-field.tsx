'use client';

import Image from 'next/image';
import { type ChangeEvent, memo, useEffect, useRef, useState } from 'react';
import Button from '@/components/common/ui/button';

const THUMBNAIL_MIN_WIDTH = 240;
const THUMBNAIL_MAX_WIDTH = 900;

interface AdminCourseThumbnailFieldProps {
  accept: string;
  canClear?: boolean;
  fileName?: string;
  isUploading?: boolean;
  previewUrl?: string;
  statusText?: string;
  width: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangeWidth: (width: number) => void;
  onClear: () => void;
}

function AdminCourseThumbnailField({
  accept,
  canClear = false,
  fileName,
  isUploading = false,
  previewUrl,
  statusText,
  width,
  onChange,
  onChangeWidth,
  onClear,
}: AdminCourseThumbnailFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    width: number;
  } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  }>();
  const displayHeight = Math.round((width * 9) / 16);

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      const dragStart = dragStartRef.current;
      if (!dragStart) return;

      const nextWidth = Math.min(
        THUMBNAIL_MAX_WIDTH,
        Math.max(
          THUMBNAIL_MIN_WIDTH,
          dragStart.width + event.clientX - dragStart.pointerX,
        ),
      );
      onChangeWidth(Math.round(nextWidth));
    };

    const handlePointerUp = () => {
      dragStartRef.current = null;
      setIsResizing(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isResizing, onChangeWidth]);

  return (
    <div className="border-border-default bg-background-subtlest rounded-100 flex flex-col gap-100 border p-125">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
      />
      <div className="flex flex-wrap items-center gap-75">
        <Button
          color="secondary"
          size="small"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          썸네일 선택
        </Button>
        {canClear && (
          <Button
            color="outlined"
            size="small"
            disabled={isUploading}
            onClick={onClear}
          >
            선택 해제
          </Button>
        )}
        <span className="font-designer-12r text-text-subtle">
          {isUploading
            ? '썸네일을 업로드하는 중입니다.'
            : statusText || fileName || '선택된 파일이 없습니다.'}
        </span>
      </div>
      {previewUrl ? (
        <div className="border-border-subtle bg-background-default rounded-100 overflow-auto border p-100">
          <div
            className="relative aspect-video max-w-full overflow-hidden rounded-75"
            style={{ width }}
          >
            <Image
              src={previewUrl}
              alt="코스 썸네일 미리보기"
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              unoptimized
              className="object-cover"
              onLoad={(event) => {
                const imageElement = event.currentTarget;
                setNaturalSize({
                  width: imageElement.naturalWidth,
                  height: imageElement.naturalHeight,
                });
              }}
            />
            <button
              type="button"
              aria-label="썸네일 이미지 크기 조절"
              disabled={isUploading}
              className="border-background-default bg-text-default absolute right-0 bottom-0 h-200 w-200 cursor-nwse-resize rounded-full border-2 disabled:cursor-not-allowed disabled:opacity-50"
              onPointerDown={(event) => {
                if (isUploading) return;
                event.preventDefault();
                dragStartRef.current = {
                  pointerX: event.clientX,
                  width,
                };
                setIsResizing(true);
              }}
            />
          </div>
          <p className="font-designer-12r text-text-subtlest mt-75">
            오른쪽 아래 핸들을 드래그해 편집 영역의 썸네일 표시 크기를 조절할 수
            있습니다. 가로세로 비율은 유지됩니다.
          </p>
          <p className="font-designer-12r text-text-subtle mt-50">
            표시 크기: {width} × {displayHeight} px
            {naturalSize
              ? ` · 원본 크기: ${naturalSize.width} × ${naturalSize.height} px`
              : ''}
          </p>
        </div>
      ) : (
        <div className="border-border-subtle bg-background-default rounded-100 flex aspect-video w-full items-center justify-center border border-dashed">
          <span className="font-designer-13r text-text-subtle">
            썸네일 이미지를 선택하면 이 영역에 표시됩니다.
          </span>
        </div>
      )}
    </div>
  );
}

export default memo(AdminCourseThumbnailField);
