'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useToastStore } from '@/stores/use-toast-store';

interface LessonLinkProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}

export function LessonLinkModal({ open, onClose, onConfirm }: LessonLinkProps) {
  const [url, setUrl] = useState('');
  const showToast = useToastStore((s) => s.showToast);

  if (!open) return null;

  function handleConfirm() {
    const trimmed = url.trim();
    if (!trimmed) {
      showToast('링크를 입력해주세요.', 'error');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      showToast(
        'http:// 또는 https://로 시작하는 URL을 입력해주세요.',
        'error',
      );
      return;
    }
    onConfirm(trimmed);
    setUrl('');
    onClose();
  }

  function handleClose() {
    setUrl('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-1000/40" onClick={handleClose} />
      <div className="relative z-10 mx-400 w-full max-w-5000 rounded-200 bg-background-default">
        <div className="flex items-center justify-between px-500 pb-300 pt-500">
          <h2 className="font-designer-20b text-gray-800">링크 입력</h2>
          <button type="button" onClick={handleClose} aria-label="닫기">
            <X className="h-300 w-300 text-gray-400 hover:text-gray-800" />
          </button>
        </div>

        <div className="px-500 pb-300">
          <p className="mb-200 font-designer-14r text-gray-500">
            만든 결과물의 링크를 붙여넣어 주세요.
          </p>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-150 border border-gray-300 px-300 py-200 font-designer-16m text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
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
            className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
