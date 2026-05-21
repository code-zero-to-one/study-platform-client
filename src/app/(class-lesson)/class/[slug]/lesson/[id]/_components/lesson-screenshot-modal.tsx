'use client';

import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import { useToastStore } from '@/stores/use-toast-store';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (imageUrl: string, previewUrl: string) => void;
}

export function LessonScreenshotModal({ open, onClose, onConfirm }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
      const url = await uploadCommunityMarkdownImage(file);
      const preview = URL.createObjectURL(file);
      setImageUrl(url);
      setPreviewUrl(preview);
    } catch {
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setUploading(false);
    }
  }

  function handleConfirm() {
    if (!imageUrl || !previewUrl) return;
    onConfirm(imageUrl, previewUrl);
    setPreviewUrl(null);
    setImageUrl(null);
    onClose();
  }

  function handleClose() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageUrl(null);
    onClose();
  }

  function handleRemoveImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageUrl(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-1000/40" onClick={handleClose} />
      <div className="relative z-10 mx-400 w-full max-w-6750 rounded-200 bg-background-default">
        <div className="flex items-center justify-between px-500 pb-300 pt-500">
          <h2 className="font-designer-20b text-gray-800">스크린샷 첨부</h2>
          <button type="button" onClick={handleClose} aria-label="닫기">
            <X className="h-300 w-300 text-gray-400 hover:text-gray-800" />
          </button>
        </div>

        <div className="px-500 pb-300">
          {previewUrl ? (
            <div className="relative">
              <Image
                src={previewUrl}
                alt="첨부 스크린샷"
                width={540}
                height={280}
                unoptimized
                className="h-3500 w-full rounded-150 object-contain"
              />
              <button
                type="button"
                aria-label="이미지 삭제"
                onClick={handleRemoveImage}
                className="absolute -right-75 -top-75 flex h-250 w-250 items-center justify-center rounded-full bg-gray-800 text-background-default"
              >
                <X className="h-150 w-150" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex h-2500 w-full flex-col items-center justify-center gap-200 rounded-150 border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-border-brand hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImagePlus className="h-500 w-500" />
              <span className="font-designer-16m">
                {uploading ? '업로드 중...' : '클릭하여 이미지 첨부'}
              </span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (file) await handleFileSelect(file);
              input.value = '';
            }}
          />
        </div>

        <div className="flex gap-200 px-500 pb-500">
          <button
            type="button"
            onClick={handleClose}
            className="flex h-700 flex-1 items-center justify-center rounded-100 border border-border-default font-designer-16m text-gray-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!imageUrl}
            className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:bg-gray-300"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
