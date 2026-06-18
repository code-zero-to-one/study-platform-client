'use client';

import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { normalizeImageFileForUpload } from '@/components/common/ui/editor/image-utils';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import { useToastStore } from '@/stores/use-toast-store';

const MAX_IMAGES = 5;

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (imageUrls: string[], previewUrls: string[]) => void;
}

interface ImageEntry {
  imageUrl: string;
  previewUrl: string;
}

export function LessonScreenshotModal({ open, onClose, onConfirm }: Props) {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showToast = useToastStore((s) => s.showToast);

  if (!open) return null;

  async function handleFileSelect(file: File) {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast(
        `이미지 파일 크기는 5MB 이하만 첨부할 수 있어요. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        'error',
      );
      return;
    }
    setUploading(true);
    try {
      const normalizedFile = await normalizeImageFileForUpload(file);
      const url = await uploadCommunityMarkdownImage(normalizedFile);
      const preview = URL.createObjectURL(normalizedFile);
      setImages((prev) => [...prev, { imageUrl: url, previewUrl: preview }]);
    } catch {
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleConfirm() {
    if (images.length === 0) return;
    onConfirm(
      images.map((e) => e.imageUrl),
      images.map((e) => e.previewUrl),
    );
    setImages([]);
    onClose();
  }

  function handleClose() {
    images.forEach((e) => URL.revokeObjectURL(e.previewUrl));
    setImages([]);
    onClose();
  }

  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-gray-1000/40"
        onClick={handleClose}
      />
      <div className="relative z-10 mx-400 w-full max-w-6750 rounded-200 bg-background-default">
        <div className="flex items-center justify-between px-500 pb-300 pt-500">
          <div className="flex flex-col gap-50">
            <h2 className="font-designer-20b text-gray-800">
              스크린샷 첨부해 보세요
            </h2>
            <p className="font-designer-14r text-gray-500">
              이미지 첨부 / 최대 {MAX_IMAGES}장 첨부 가능합니다.
            </p>
          </div>
          <button type="button" onClick={handleClose} aria-label="닫기">
            <X className="size-300 text-gray-400 hover:text-gray-800" />
          </button>
        </div>

        <div className="px-500 pb-300">
          <div className="flex gap-200 overflow-x-auto scrollbar-hide pt-100 pr-100 pb-100">
            {images.map((entry, index) => (
              <div key={entry.previewUrl} className="relative w-1500 shrink-0">
                <Image
                  src={entry.previewUrl}
                  alt={`첨부 스크린샷 ${index + 1}`}
                  width={160}
                  height={120}
                  unoptimized
                  className="h-1500 w-full rounded-150 object-cover"
                />
                <button
                  type="button"
                  aria-label="이미지 삭제"
                  onClick={() => handleRemove(index)}
                  className="absolute -right-75 -top-75 flex size-250 items-center justify-center rounded-full bg-gray-800 text-background-default"
                >
                  <X className="size-150" />
                </button>
              </div>
            ))}
            {canAddMore && (
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex h-1500 w-1500 shrink-0 flex-col items-center justify-center gap-100 rounded-150 border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-border-brand hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImagePlus className="size-400" />
                <span className="font-designer-14m text-center whitespace-nowrap">
                  {uploading ? '업로드 중...' : '이미지 추가'}
                </span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            aria-label="이미지 첨부"
            className="hidden"
            onChange={async (e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (file) await handleFileSelect(file);
              input.value = '';
            }}
          />
        </div>

        <div className="px-500 pb-500">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={images.length === 0}
            className="flex h-700 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:bg-gray-300"
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
