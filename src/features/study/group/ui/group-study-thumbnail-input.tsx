'use client';

import Image from 'next/image';
import { useState, DragEvent, ChangeEvent, useRef } from 'react';
import Button from '@/components/ui/button';

const inputStyles = {
  base: 'rounded-100 flex w-full flex-col items-center justify-center rounded-lg border-2 p-500',
  dragging: 'border-border-brand bg-fill-brand-subtle-hover',
  notDragging: 'border-gray-300 border-gray-300 border-dashed',
};

export default function GroupStudyThumbnailInput({
  image,
  onChangeImage,
}: {
  image?: string;
  onChangeImage: (file: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const [isDragging, setIsDragging] = useState(false);

  // 영역 안에 드래그 들어왔을 때
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  // 영역 밖으로 드래그 나갈 때
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  // 영역 안에서 드래그 중일 때
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files) {
      setIsDragging(true);
    }
  };
  // 영역 안에서 drop 했을 때
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0]; // 1장만 허용

    if (file && file.type.startsWith('image/')) {
      onChangeImage(file);
    }
  };

  // 파일 업로드 버튼으로 파일 선택했을 때 preview 설정
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type.startsWith('image/')) {
      onChangeImage(file);
    }
  };

  const handleRemove = () => {
    onChangeImage(undefined);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      className={`${inputStyles.base} ${isDragging ? inputStyles.dragging : inputStyles.notDragging}`}
    >
      {!image ? (
        <div className="flex flex-col items-center justify-center gap-300">
          <div className="flex flex-col items-center justify-center gap-150">
            <Image
              src="/icons/camera.svg"
              width={32}
              height={32}
              alt="파일 업로드"
            />
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
            className="bg-background-dimmer border-border-inverse text-text-inverse absolute top-0 right-0 flex h-[36px] w-[36px] translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-black"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
