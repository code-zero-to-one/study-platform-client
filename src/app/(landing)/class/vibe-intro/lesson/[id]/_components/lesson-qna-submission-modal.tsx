'use client';

import { ChevronDown, ImageIcon, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useCreateLessonQna } from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';
import { analyzeError } from '@/utils/error-handler';

interface Props {
  lessonId: number;
  open: boolean;
  onClose: () => void;
}

export function LessonQnaSubmissionModal({ lessonId, open, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cautionOpen, setCautionOpen] = useState(false);
  const showToast = useToastStore((s) => s.showToast);
  const createQna = useCreateLessonQna();

  if (!open) return null;

  function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      showToast('제목과 내용을 입력해주세요.', 'error');
      return;
    }
    createQna.mutate(
      {
        lessonId,
        request: {
          title: title.trim(),
          content: content.trim(),
          imageUrls: [], // TODO: wire file upload API
        },
      },
      {
        onSuccess: () => {
          showToast('질문이 등록되었어요!');
          setTitle('');
          setContent('');
          onClose();
        },
        onError: (error) => {
          const { userMessage } = analyzeError(error);
          showToast(userMessage, 'error');
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-1000/40" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-[800px] flex-col rounded-200 bg-background-default shadow-3 mx-400">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-400 py-350">
          <h2 className="font-designer-28b text-gray-800">궁금한 게 있어요!</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800"
          >
            <X className="h-300 w-300" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-300 overflow-y-auto px-400 py-350">
          {/* Title input */}
          <div>
            <p className="mb-150 font-designer-16b text-gray-800">질문 제목</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="질문 제목을 입력해 주세요."
              className="w-full rounded-100 border border-border-default px-300 py-200 font-designer-16m text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
            />
          </div>

          {/* Content textarea */}
          <div>
            <p className="mb-150 font-designer-16b text-gray-800">질문 내용</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="어떤 부분에서 막히셨나요? 자세히 적어주실수록 빠르게 도움드릴 수 있어요."
              className="h-[200px] w-full resize-none rounded-100 border border-border-default px-300 py-200 font-designer-16m text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
            />
          </div>

          {/* Image upload */}
          <div>
            <div className="mb-150 flex items-center justify-between">
              <p className="font-designer-16b text-gray-800">이미지 첨부</p>
              <p className="font-designer-14r text-gray-400">최대 10장</p>
            </div>
            <div className="flex gap-200">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex h-[100px] w-[100px] items-center justify-center rounded-100 border border-dashed border-border-default bg-gray-100 text-gray-400"
                >
                  <ImageIcon className="h-300 w-300" />
                </div>
              ))}
            </div>
            {/* TODO: wire file upload API */}
          </div>

          {/* Caution accordion */}
          <div className="rounded-100 border border-border-subtle">
            <button
              type="button"
              onClick={() => setCautionOpen((v) => !v)}
              className="flex w-full items-center justify-between px-300 py-200"
            >
              <p className="font-designer-14b text-gray-800">질문시 유의사항</p>
              <ChevronDown
                className={cn(
                  'h-250 w-250 text-gray-500 transition-transform',
                  cautionOpen && 'rotate-180',
                )}
              />
            </button>
            {cautionOpen && (
              <div className="border-t border-border-subtle px-300 py-200">
                <ul className="list-disc pl-300 font-designer-14r text-gray-600 space-y-75">
                  <li>
                    욕설, 비방, 개인정보가 포함된 질문은 삭제될 수 있어요.
                  </li>
                  <li>비슷한 질문이 있다면 먼저 검색해 보세요.</li>
                  <li>질문 내용이 구체적일수록 빠른 답변을 받을 수 있어요.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-200 border-t border-border-subtle px-400 py-300">
          <button
            type="button"
            onClick={onClose}
            className="rounded-100 border border-border-default px-400 py-200 font-designer-16b text-gray-800 hover:bg-gray-100"
          >
            임시저장
            {/* TODO: localStorage draft save */}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createQna.isPending}
            className={cn(
              'rounded-100 px-400 py-200 font-designer-16b text-text-inverse transition-opacity',
              createQna.isPending
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-rose-500 hover:opacity-90',
            )}
          >
            {createQna.isPending ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
