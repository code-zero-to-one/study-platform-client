'use client';

import { ImagePlus, Info, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useReducer, useRef } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { normalizeImageFileForUpload } from '@/components/common/ui/editor/image-utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import { useCreateLessonQna } from '@/hooks/queries/course/course-queries';
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

interface QnaModalState {
  content: string;
  images: AttachedImage[];
  autoVisible: boolean;
  hoverVisible: boolean;
  isUploadingImage: boolean;
}

type QnaModalAction =
  | { type: 'setContent'; content: string }
  | { type: 'addImage'; image: AttachedImage }
  | { type: 'removeImage'; index: number }
  | { type: 'clearImages' }
  | { type: 'setUploading'; uploading: boolean }
  | { type: 'showAutoNotice' }
  | { type: 'hideAutoNotice' }
  | { type: 'setHover'; visible: boolean }
  | { type: 'dismissNotice' };

const INITIAL_QNA_MODAL: QnaModalState = {
  content: '',
  images: [],
  autoVisible: false,
  hoverVisible: false,
  isUploadingImage: false,
};

function qnaModalReducer(
  state: QnaModalState,
  action: QnaModalAction,
): QnaModalState {
  switch (action.type) {
    case 'setContent':
      return { ...state, content: action.content };
    case 'addImage':
      return { ...state, images: [...state.images, action.image] };
    case 'removeImage':
      return {
        ...state,
        images: state.images.filter((_, i) => i !== action.index),
      };
    case 'clearImages':
      return { ...state, images: [] };
    case 'setUploading':
      return { ...state, isUploadingImage: action.uploading };
    case 'showAutoNotice':
      return { ...state, autoVisible: true };
    case 'hideAutoNotice':
      return { ...state, autoVisible: false };
    case 'setHover':
      return { ...state, hoverVisible: action.visible };
    case 'dismissNotice':
      return { ...state, autoVisible: false, hoverVisible: false };
  }
}

export function LessonQnaSubmissionModal({
  lessonId,
  courseId,
  open,
  onClose,
}: Props) {
  const [state, dispatch] = useReducer(qnaModalReducer, INITIAL_QNA_MODAL);
  const { content, images, autoVisible, hoverVisible, isUploadingImage } =
    state;
  const noticeVisible = autoVisible || hoverVisible;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageListRef = useRef<AttachedImage[]>([]);
  const showToast = useToastStore((s) => s.showToast);
  const createQna = useCreateLessonQna();

  useEffect(() => {
    if (!open) {
      dispatch({ type: 'dismissNotice' });
      return;
    }
    dispatch({ type: 'showAutoNotice' });
    const timer = setTimeout(() => dispatch({ type: 'hideAutoNotice' }), 2000);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const draft = localStorage.getItem(`lesson-qna-draft-${lessonId}`);
    if (!draft) return;
    try {
      const { content: c } = JSON.parse(draft);
      dispatch({ type: 'setContent', content: c ?? '' });
    } catch {
      // malformed draft — ignore
    }
  }, [open, lessonId]);

  useEffect(() => {
    imageListRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imageListRef.current.forEach((img) => {
        URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (!open) {
      clearImagePreviews();
    }
  }, [open]);

  if (!open) return null;

  async function handleImageAdd(file: File) {
    if (images.length >= 10) {
      showToast('최대 10장까지 첨부 가능합니다.', 'error');
      return;
    }
    dispatch({ type: 'setUploading', uploading: true });
    try {
      const normalizedFile = await normalizeImageFileForUpload(file);
      const publicUrl = await uploadCommunityMarkdownImage(normalizedFile);
      const key = new URL(publicUrl).pathname.slice(1);
      const previewUrl = URL.createObjectURL(normalizedFile);
      dispatch({ type: 'addImage', image: { previewUrl, key } });
    } catch {
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      dispatch({ type: 'setUploading', uploading: false });
    }
  }

  function clearImagePreviews() {
    imageListRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    dispatch({ type: 'clearImages' });
  }

  function handleImageRemove(index: number) {
    URL.revokeObjectURL(images[index].previewUrl);
    dispatch({ type: 'removeImage', index });
  }

  function handleDraftSave() {
    localStorage.setItem(
      `lesson-qna-draft-${lessonId}`,
      JSON.stringify({ content }),
    );
    showToast('임시저장되었습니다.');
  }

  function handleSubmit() {
    if (!content.trim() || content.trim() === '<p></p>') {
      showToast('내용을 입력해주세요.', 'error');
      return;
    }
    createQna.mutate(
      {
        courseId,
        request: {
          lessonId,
          content: content.trim(),
          imageKeys: images.map((img) => img.key),
        },
      },
      {
        onSuccess: () => {
          showToast('질문이 등록되었어요!');
          localStorage.removeItem(`lesson-qna-draft-${lessonId}`);
          dispatch({ type: 'setContent', content: '' });
          clearImagePreviews();
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
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-gray-1000/40"
        onClick={onClose}
      />
      <div className="relative z-10 mx-400 flex max-h-modal w-full max-w-10000 flex-col overflow-hidden rounded-200 bg-background-default shadow-3">
        {/* Header */}
        <div className="relative flex shrink-0 items-center px-750 pt-625 pb-160">
          <div className="flex items-center gap-100">
            <h2 className="font-designer-20b text-gray-800">
              궁금한 게 있어요!
            </h2>
            <button
              type="button"
              aria-label="유의사항 보기"
              onMouseEnter={() => dispatch({ type: 'setHover', visible: true })}
              onMouseLeave={() =>
                dispatch({ type: 'setHover', visible: false })
              }
              className="text-gray-400 hover:text-gray-600"
            >
              <Info className="size-250" />
            </button>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute right-350 top-350 text-gray-400 hover:text-gray-800"
          >
            <X className="size-300" />
          </button>
          {noticeVisible && (
            <div className="absolute left-2413 top-full z-20 h-1250 w-6750 overflow-hidden rounded-200 border border-border-subtle bg-background-default pl-275 pt-200 pr-500 pb-200">
              <button
                type="button"
                aria-label="유의사항 닫기"
                onClick={() => dispatch({ type: 'dismissNotice' })}
                className="absolute right-250 top-175 text-gray-400 hover:text-gray-600"
              >
                <X className="size-300" />
              </button>
              <p className="mb-75 font-designer-14b text-gray-500">
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
        </div>

        {/* Body */}
        <div className="relative flex flex-1 flex-col gap-300 overflow-y-auto px-750 pt-100 pb-500">
          {/* Content */}
          <div>
            <p className="mb-150 font-designer-18m text-gray-800">내용</p>
            <MarkdownEditor
              value={content}
              onChange={(value) =>
                dispatch({ type: 'setContent', content: value })
              }
              placeholder="어떤 부분에서 막히셨나요? 자세히 적어주실수록 빠르게 도움드릴 수 있어요."
              uploadImage={uploadCommunityMarkdownImage}
            />
          </div>

          {/* Image attachment */}
          <div>
            <div className="mb-250 flex flex-col items-start gap-75">
              <p className="font-designer-18b text-gray-800">이미지 첨부</p>
              <p className="font-designer-16r text-gray-800">
                최대 10장 첨부 가능합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage || images.length >= 10}
              className={cn(
                'flex h-550 w-2525 shrink-0 items-center justify-center gap-125 rounded-100 border border-border-default font-designer-16sb text-gray-800',
                isUploadingImage || images.length >= 10
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:border-rose-400 hover:text-rose-400',
              )}
            >
              <ImagePlus className="size-250" />
              <span>이미지 첨부</span>
            </button>
            {images.length > 0 && (
              <div className="mt-300 flex gap-250 overflow-x-auto">
                {images.map((img, i) => (
                  <div key={img.key} className="relative shrink-0">
                    <Image
                      src={img.previewUrl}
                      alt={`첨부 이미지 ${i + 1}`}
                      width={202}
                      height={202}
                      unoptimized
                      className="size-2525 rounded-150 object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`이미지 ${i + 1} 삭제`}
                      onClick={() => handleImageRemove(i)}
                      className="absolute -right-75 -top-75 flex size-200 items-center justify-center rounded-full bg-gray-800 text-background-default"
                    >
                      <X className="size-125" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              aria-label="이미지 첨부"
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
        <div className="flex shrink-0 items-center gap-200 px-750 py-300">
          <button
            type="button"
            onClick={handleDraftSave}
            className="flex h-700 flex-1 items-center justify-center rounded-100 border border-rose-400 font-designer-18b text-rose-500 hover:opacity-80"
          >
            임시저장
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createQna.isPending}
            className={cn(
              'flex h-700 flex-1 items-center justify-center rounded-100 font-designer-18b text-text-inverse transition-opacity',
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
