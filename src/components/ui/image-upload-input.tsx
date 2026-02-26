'use client';

import { cva } from 'class-variance-authority';
import Image from 'next/image';
import { useState, DragEvent, ChangeEvent, useRef } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import CameraIcon from 'public/icons/camera.svg';

// 클라이언트에서 선제 차단하여 불필요한 413 에러 및 대용량 업로드 요청을 방지.
const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const dropzoneVariants = cva(
  'rounded-100 flex w-full flex-col items-center justify-center border-2 p-500',
  {
    variants: {
      dragging: {
        true: 'border-border-brand bg-fill-brand-subtle-hover',
        false: 'border-gray-300 border-dashed',
      },
    },
    defaultVariants: {
      dragging: false,
    },
  },
);

export default function ImageUploadInput({
  image,
  onChangeImage,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
}: {
  image?: string;
  onChangeImage: (file: File | undefined) => void;
  maxSizeBytes?: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const validateAndChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setSizeError(null);

      return;
    }
    if (file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / 1024 / 1024).toFixed(0);
      setSizeError(`이미지 파일 크기는 ${maxMb}MB 이하만 업로드할 수 있어요.`);

      return;
    }
    setSizeError(null);
    onChangeImage(file);
  };

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndChange(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndChange(file);
    e.target.value = ''; // 같은 파일 재업로드 허용을 위해 입력값 초기화
  };

  const handleRemove = () => {
    setSizeError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChangeImage(undefined);
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className={cn(dropzoneVariants({ dragging: isDragging }))}
      >
        {!image ? (
          <div className="flex flex-col items-center justify-center gap-300">
            <div className="flex flex-col items-center justify-center gap-150">
              <CameraIcon width={32} height={32} aria-hidden="true" />
              <span className="font-designer-18m text-text-default">
                드래그하여 파일 업로드
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={handleOpenFileDialog}
              color="primary"
              size="small"
              type="button"
            >
              파일 업로드
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Image
              src={image}
              alt="preview"
              width={240}
              height={180}
              className="rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              aria-label="이미지 삭제"
              className="bg-background-dimmer border-border-inverse text-text-inverse absolute top-0 right-0 flex h-[36px] w-[36px] translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
            >
              ✕
            </button>
          </div>
        )}
      </div>
      {sizeError && <p className="text-text-danger text-sm">{sizeError}</p>}
    </div>
  );
}
