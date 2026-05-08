'use client';

import Image from 'next/image';
import { type ChangeEvent, memo, useRef } from 'react';
import Button from '@/components/common/ui/button';

interface AdminCourseThumbnailFieldProps {
  accept: string;
  canClear?: boolean;
  fileName?: string;
  isUploading?: boolean;
  previewUrl?: string;
  statusText?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

function AdminCourseThumbnailField({
  accept,
  canClear = false,
  fileName,
  isUploading = false,
  previewUrl,
  statusText,
  onChange,
  onClear,
}: AdminCourseThumbnailFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
          {statusText || fileName || '선택된 파일이 없습니다.'}
        </span>
      </div>
      {previewUrl ? (
        <div className="border-border-subtle bg-background-default rounded-100 overflow-hidden border">
          <Image
            src={previewUrl}
            alt="코스 썸네일 미리보기"
            width={1200}
            height={630}
            unoptimized
            className="h-auto max-h-400 w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}

export default memo(AdminCourseThumbnailField);
