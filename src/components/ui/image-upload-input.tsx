'use client';

import Image from 'next/image';
import { useState, DragEvent, ChangeEvent, useRef } from 'react';
import Button from '@/components/ui/button';

const inputStyles = {
  base: 'rounded-100 flex w-full flex-col items-center justify-center border-2 p-500',
  dragging: 'border-border-brand bg-fill-brand-subtle-hover',
  notDragging: 'border-gray-300 border-dashed',
};

export default function ImageUploadInput({
  image,
  onChangeImage,
}: {
  image?: string;
  onChangeImage: (file: File | undefined) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    if (file && file.type.startsWith('image/')) {
      onChangeImage(file);
    }
  };

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
            className="bg-background-dimmer border-border-inverse text-text-inverse absolute top-0 right-0 flex h-[36px] w-[36px] translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
