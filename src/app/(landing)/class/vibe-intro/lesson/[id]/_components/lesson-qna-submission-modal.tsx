'use client';

import { ImageIcon, Info, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import { useCreateLessonQna } from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';
import { analyzeError } from '@/utils/error-handler';

interface Props {
  lessonId: number;
  courseId: number;
  open: boolean;
  onClose: () => void;
}

interface AttachedImage {
  previewUrl: string;
  key: string;
}

export function LessonQnaSubmissionModal({
  lessonId,
  courseId,
  open,
  onClose,
}: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [autoVisible, setAutoVisible] = useState(false);
  const [hoverVisible, setHoverVisible] = useState(false);
  const noticeVisible = autoVisible || hoverVisible;
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showToast = useToastStore((s) => s.showToast);
  const createQna = useCreateLessonQna();

  useEffect(() => {
    if (!open) {
      setAutoVisible(false);
      setHoverVisible(false);
      return;
    }
    setAutoVisible(true);
    const timer = setTimeout(() => setAutoVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const draft = localStorage.getItem(`lesson-qna-draft-${lessonId}`);
    if (!draft) return;
    try {
      const { title: t, content: c } = JSON.parse(draft);
      setTitle(t ?? '');
      setContent(c ?? '');
    } catch {
      // malformed draft — ignore
    }
  }, [open, lessonId]);

  if (!open) return null;

  async function handleImageAdd(file: File) {
    if (images.length >= 10) {
      showToast('최대 10장까지 첨부 가능합니다.', 'error');
      return;
    }
    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadCommunityMarkdownImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, { previewUrl, key: publicUrl }]);
    } catch {
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleImageRemove(index: number) {
    setImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
  }

  function handleDraftSave() {
    localStorage.setItem(
      `lesson-qna-draft-${lessonId}`,
      JSON.stringify({ title, content }),
    );
    showToast('임시저장되었습니다.');
  }

  function handleSubmit() {
    if (!title.trim()) {
      showToast('제목을 입력해주세요.', 'error');
      return;
    }
    if (!content.trim() || content.trim() === '<p></p>') {
      showToast('내용을 입력해주세요.', 'error');
      return;
    }
    createQna.mutate(
      {
        courseId,
        request: {
          lessonId,
          title: title.trim(),
          content: content.trim(),
          imageKeys: images.map((img) => img.key),
        },
      },
      {
        onSuccess: () => {
          showToast('질문이 등록되었어요!');
          localStorage.removeItem(`lesson-qna-draft-${lessonId}`);
          setTitle('');
          setContent('');
          setImages([]);
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
      <div className="relative z-10 mx-400 flex max-h-modal w-full max-w-10000 flex-col overflow-hidden rounded-200 bg-background-default shadow-3">
        {/* Header */}
        <div className="relative flex shrink-0 items-center px-750 py-500">
          <div className="flex items-center gap-150">
            <h2 className="font-designer-28b text-gray-800">
              궁금한 게 있어요!
            </h2>
            <button
              type="button"
              aria-label="유의사항 보기"
              onMouseEnter={() => setHoverVisible(true)}
              onMouseLeave={() => setHoverVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Info className="h-250 w-250" />
            </button>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute right-350 top-350 text-gray-400 hover:text-gray-800"
          >
            <X className="h-300 w-300" />
          </button>
        </div>

        {/* Body */}
        <div className="relative flex flex-1 flex-col gap-300 overflow-y-auto px-750 pb-500">
          {noticeVisible && (
            <div className="absolute left-2500 right-750 top-0 z-20 rounded-200 border border-border-subtle bg-background-default px-300 py-250 pr-500">
              <button
                type="button"
                aria-label="유의사항 닫기"
                onClick={() => {
                  setAutoVisible(false);
                  setHoverVisible(false);
                }}
                className="absolute right-200 top-200 text-gray-400 hover:text-gray-600"
              >
                <X className="h-200 w-200" />
              </button>
              <p className="mb-150 font-designer-14b text-gray-500">
                질문 시 유의사항
              </p>
              <ul className="list-disc space-y-75 pl-300 font-designer-13r text-gray-400">
                <li>
                  질문 후 답변이 달리기 전까지는 수정 및 삭제가 자유롭습니다.
                </li>
                <li>
                  답변을 받은 후에는 수정 및 삭제가 어려우니 유의해주시기
                  바랍니다.
                </li>
              </ul>
            </div>
          )}

          {/* Title */}
          <div>
            <p className="mb-150 font-designer-16b text-gray-800">
              제목 <span className="text-rose-500">*</span>
            </p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="질문 제목을 입력해주세요."
              className="w-full rounded-150 border border-border-default px-300 py-200 font-designer-16m text-gray-800 outline-none placeholder:text-gray-400 focus:border-rose-400"
            />
          </div>

          {/* Content */}
          <div>
            <p className="mb-150 font-designer-16b text-gray-800">내용</p>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="어떤 부분에서 막히셨나요? 자세히 적어주실수록 빠르게 도움드릴 수 있어요."
              uploadImage={uploadCommunityMarkdownImage}
            />
          </div>

          {/* Image attachment */}
          <div>
            <div className="mb-150 flex items-center gap-150">
              <p className="font-designer-16b text-gray-800">이미지 첨부</p>
              <p className="font-designer-14r text-gray-400">
                최대 10장 첨부 가능합니다.
              </p>
            </div>
            <div className="flex items-center gap-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage || images.length >= 10}
                className={cn(
                  'flex h-1250 w-1250 shrink-0 flex-col items-center justify-center gap-75 rounded-150 border border-dashed border-border-default font-designer-12r text-gray-400',
                  isUploadingImage || images.length >= 10
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:border-rose-400 hover:text-rose-400',
                )}
              >
                <ImageIcon className="h-300 w-300" />
                <span>{images.length}/10</span>
              </button>
              {images.map((img, i) => (
                <div key={img.key} className="relative shrink-0">
                  <Image
                    src={img.previewUrl}
                    alt={`첨부 이미지 ${i + 1}`}
                    width={100}
                    height={100}
                    unoptimized
                    className="h-1250 w-1250 rounded-150 object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`이미지 ${i + 1} 삭제`}
                    onClick={() => handleImageRemove(i)}
                    className="absolute -right-75 -top-75 flex h-200 w-200 items-center justify-center rounded-full bg-gray-800 text-background-default"
                  >
                    <X className="h-125 w-125" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const target = e.target;
                const file = target.files?.[0];
                if (file) await handleImageAdd(file);
                target.value = '';
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-200 border-t border-border-subtle px-750 py-300">
          <button
            type="button"
            onClick={handleDraftSave}
            className="rounded-100 border border-rose-400 px-400 py-200 font-designer-16b text-rose-500 hover:opacity-80"
          >
            임시저장
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
