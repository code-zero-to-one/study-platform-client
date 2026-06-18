'use client';

import { ArrowLeft, ChevronDown, Plus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useReducer, useRef } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import {
  useCreateLessonQna,
  useGetCourseCurriculum,
  useGetCourseDetail,
} from '@/hooks/queries/course/course-queries';
import { useToastStore } from '@/stores/use-toast-store';

const QNA_NOTICE = [
  '질문 후 답변이 달리기 전까지는 수정 및 삭제가 자유롭습니다.',
  '답변을 받은 후에는 수정 및 삭제가 어려우니 유의해주시기 바랍니다.',
];

const MAX_IMAGE_COUNT = 10;

interface AttachedImage {
  previewUrl: string;
  key: string;
}

interface QnaWriteState {
  selectedLessonId: number | null;
  lessonOpen: boolean;
  text: string;
  images: AttachedImage[];
  isUploadingImage: boolean;
}

type QnaWriteAction =
  | { type: 'hydrateDraft'; text?: string; lessonId?: number }
  | { type: 'selectLesson'; lessonId: number }
  | { type: 'toggleLessonOpen' }
  | { type: 'setText'; text: string }
  | { type: 'addImage'; image: AttachedImage }
  | { type: 'removeImage'; index: number }
  | { type: 'setUploading'; uploading: boolean };

const INITIAL_QNA_WRITE: QnaWriteState = {
  selectedLessonId: null,
  lessonOpen: false,
  text: '',
  images: [],
  isUploadingImage: false,
};

function qnaWriteReducer(
  state: QnaWriteState,
  action: QnaWriteAction,
): QnaWriteState {
  switch (action.type) {
    case 'hydrateDraft':
      return {
        ...state,
        ...(action.text ? { text: action.text } : {}),
        ...(action.lessonId ? { selectedLessonId: action.lessonId } : {}),
      };
    case 'selectLesson':
      return {
        ...state,
        selectedLessonId: action.lessonId,
        lessonOpen: false,
      };
    case 'toggleLessonOpen':
      return { ...state, lessonOpen: !state.lessonOpen };
    case 'setText':
      return { ...state, text: action.text };
    case 'addImage':
      return { ...state, images: [...state.images, action.image] };
    case 'removeImage': {
      const next = [...state.images];
      next.splice(action.index, 1);
      return { ...state, images: next };
    }
    case 'setUploading':
      return { ...state, isUploadingImage: action.uploading };
    default:
      return state;
  }
}

export default function QnaWritePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [state, dispatch] = useReducer(qnaWriteReducer, INITIAL_QNA_WRITE);
  const { selectedLessonId, lessonOpen, text, images, isUploadingImage } =
    state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: courseData } = useGetCourseDetail(slug);
  const courseId = courseData?.courseId ?? 0;
  const { data: curriculum } = useGetCourseCurriculum(slug);
  const createQna = useCreateLessonQna();

  useEffect(() => {
    const draft = localStorage.getItem(`course-qna-draft-${slug}`);
    if (!draft) return;
    try {
      const { content: c, lessonId: l } = JSON.parse(draft);
      dispatch({
        type: 'hydrateDraft',
        text: c || undefined,
        lessonId: l || undefined,
      });
    } catch {
      // malformed draft — ignore
    }
  }, [slug]);

  const allLessons =
    curriculum?.chapters.flatMap((ch) =>
      ch.lessons.map((l) => ({
        lessonId: l.lessonId,
        label: `Lesson ${String(l.order).padStart(2, '0')}. ${l.title}`,
      })),
    ) ?? [];

  const selectedLessonLabel =
    allLessons.find((l) => l.lessonId === selectedLessonId)?.label ??
    'Lesson 선택';

  async function handleImageAdd(file: File) {
    if (images.length >= MAX_IMAGE_COUNT) {
      showToast(`최대 ${MAX_IMAGE_COUNT}장까지 첨부 가능합니다.`, 'error');
      return;
    }
    dispatch({ type: 'setUploading', uploading: true });
    try {
      const publicUrl = await uploadCommunityMarkdownImage(file);
      const key = new URL(publicUrl).pathname.slice(1);
      const previewUrl = URL.createObjectURL(file);
      dispatch({ type: 'addImage', image: { previewUrl, key } });
    } catch {
      showToast('이미지 업로드에 실패했습니다.', 'error');
    } finally {
      dispatch({ type: 'setUploading', uploading: false });
    }
  }

  function handleImageRemove(index: number) {
    URL.revokeObjectURL(images[index].previewUrl);
    dispatch({ type: 'removeImage', index });
  }

  function handleSaveDraft() {
    if (!selectedLessonId) {
      showToast('레슨을 선택해주세요.', 'error');
      return;
    }
    localStorage.setItem(
      `course-qna-draft-${slug}`,
      JSON.stringify({ content: text, lessonId: selectedLessonId }),
    );
    showToast('임시저장되었습니다.');
  }

  function handleSubmit() {
    if (!selectedLessonId) {
      showToast('레슨을 선택해주세요.', 'error');
      return;
    }
    if (!text.replace(/<[^>]*>/g, '').trim()) {
      showToast('내용을 입력해주세요.', 'error');
      return;
    }
    createQna.mutate(
      {
        courseId,
        request: {
          lessonId: selectedLessonId,
          content: text,
          imageKeys: images.map((img) => img.key),
        },
      },
      {
        onSuccess: () => {
          localStorage.removeItem(`course-qna-draft-${slug}`);
          showToast('질문이 등록되었어요!');
          router.push(`/class/${slug}/home?tab=qna`);
        },
        onError: () => showToast('등록에 실패했어요.', 'error'),
      },
    );
  }

  return (
    <div className="w-full pb-800">
      <div className="w-full px-3000 pt-500">
        <Link
          href={`/class/${slug}/home?tab=qna`}
          className="inline-flex items-center gap-125 font-designer-14m text-gray-800"
        >
          <ArrowLeft className="size-300" />
          질문 목록 돌아가기
        </Link>

        <div className="mt-400 space-y-400">
          {/* Lesson selector */}
          <div>
            <p className="mb-150 font-designer-16b text-gray-800">
              어떤 레슨에 대한 질문인가요?
            </p>
            <div className="mb-200 flex items-center rounded-100 border border-border-default px-250 py-175 font-designer-16r text-gray-500">
              바이브 코딩 입문자 코스
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => dispatch({ type: 'toggleLessonOpen' })}
                className="flex w-full items-center justify-between rounded-100 border border-border-default px-250 py-175 font-designer-16r text-gray-800"
              >
                {selectedLessonLabel}
                <ChevronDown
                  className={cn(
                    'size-300 transition-transform',
                    lessonOpen && 'rotate-180',
                  )}
                />
              </button>
              {lessonOpen && (
                <div className="absolute left-0 top-full z-10 mt-75 max-h-3750 w-full overflow-y-auto rounded-100 border border-border-default bg-background-default shadow-1">
                  {allLessons.map((l) => (
                    <button
                      key={l.lessonId}
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'selectLesson',
                          lessonId: l.lessonId,
                        })
                      }
                      className="flex w-full items-center bg-gray-50 px-250 py-175 font-designer-16r text-gray-800 hover:bg-gray-100"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <p className="mb-50 font-designer-14r text-gray-500">
              * 최대 {MAX_IMAGE_COUNT}개의 사진을 등록할 수 있어요.
            </p>
            <div className="flex flex-wrap gap-150">
              {images.map((img, i) => (
                <div key={img.key} className="relative size-1500 shrink-0">
                  <Image
                    src={img.previewUrl}
                    alt={`첨부 이미지 ${i + 1}`}
                    fill
                    unoptimized
                    sizes="100vw"
                    className="rounded-150 object-cover"
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
              {images.length < MAX_IMAGE_COUNT && (
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex size-1500 shrink-0 flex-col items-center justify-center gap-75 rounded-150 border border-border-default bg-gray-200',
                    isUploadingImage
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:border-rose-400',
                  )}
                >
                  <Plus className="size-300 text-gray-400" />
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
                const target = e.target;
                const file = target.files?.[0];
                if (file) await handleImageAdd(file);
                target.value = '';
              }}
            />
          </div>

          {/* Text content */}
          <MarkdownEditor
            value={text}
            onChange={(value) => dispatch({ type: 'setText', text: value })}
            placeholder="질문 내용을 자유롭게 작성해보세요. 막히는 부분, 이해가 안 되는 개념, 에러 상황 등을 구체적으로 적어주시면 더 좋은 답변을 받을 수 있어요."
            uploadImage={uploadCommunityMarkdownImage}
          />

          {/* Notice */}
          <div className="rounded-200 border border-gray-200 p-200">
            <p className="mb-100 font-designer-16m text-gray-400">유의사항</p>
            <ul className="list-disc space-y-75 pl-300 font-designer-13r text-gray-400">
              {QNA_NOTICE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="flex gap-200">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex h-775 flex-1 items-center justify-center rounded-100 border border-rose-400 font-designer-16m text-rose-500"
            >
              임시저장
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createQna.isPending}
              className="flex h-775 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:bg-gray-300"
            >
              등록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
