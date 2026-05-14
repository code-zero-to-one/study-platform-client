'use client';

import { ArrowLeft, ChevronDown, Plus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import {
  useCreateBuilderFeed,
  useGetCourseCurriculum,
  useGetCourseDetail,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';

interface AttachedImage {
  previewUrl: string;
  key: string;
}

export default function FeedWritePage() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [course, setCourse] = useState('바이브 코딩 입문자 코스');
  const [courseOpen, setCourseOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [text, setText] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: courseData } = useGetCourseDetail('vibe-intro');
  const courseId = courseData?.courseId ?? 0;
  const { data: curriculum } = useGetCourseCurriculum('vibe-intro');
  const createFeed = useCreateBuilderFeed();

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
    if (images.length >= 10) {
      showToast('최대 10장까지 첨부 가능합니다.', 'error');
      return;
    }
    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadCommunityMarkdownImage(file);
      const key = new URL(publicUrl).pathname.slice(1);
      const previewUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, { previewUrl, key }]);
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

  function handleSubmit() {
    if (!selectedLessonId) {
      showToast('레슨을 선택해주세요.', 'error');
      return;
    }
    if (!text.replace(/<[^>]*>/g, '').trim()) {
      showToast('내용을 입력해주세요.', 'error');
      return;
    }
    createFeed.mutate(
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
          showToast('피드가 등록되었어요!');
          router.push('/class/vibe-intro/feed');
        },
        onError: () => showToast('등록에 실패했어요.', 'error'),
      },
    );
  }

  return (
    <>
      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex w-5000 flex-col items-center gap-300 rounded-200 bg-background-default p-500">
            <div className="text-center">
              <p className="font-designer-20b text-gray-800">
                피드 등록을 취소하시겠습니까?
              </p>
              <p className="mt-150 font-designer-16r text-gray-500">
                작성된 내용은 저장되지 않습니다.
              </p>
            </div>
            <div className="flex w-full gap-200">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex h-700 flex-1 items-center justify-center rounded-100 border border-border-default font-designer-16m text-gray-800"
              >
                계속 작성
              </button>
              <Link
                href="/class/vibe-intro/feed"
                className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse"
              >
                확인
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="w-full pb-800">
        <div className="mx-auto max-w-page px-600 pt-500">
          {/* Back link */}
          <Link
            href="/class/vibe-intro/feed"
            className="inline-flex items-center gap-125 font-designer-14m text-gray-800"
          >
            <ArrowLeft className="h-300 w-300" />
            빌더 피드 돌아가기
          </Link>

          <div className="mt-400 space-y-400">
            {/* Course selector */}
            <div>
              <p className="mb-150 font-designer-16b text-gray-800">
                어떤 코스에서 만든 결과물인가요?
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCourseOpen((p) => !p)}
                  className="flex w-full items-center justify-between rounded-100 border border-border-default px-250 py-175 font-designer-16r text-gray-800"
                >
                  {course}
                  <ChevronDown
                    className={cn(
                      'h-300 w-300 transition-transform',
                      courseOpen && 'rotate-180',
                    )}
                  />
                </button>
                {courseOpen && (
                  <div className="absolute left-0 top-full z-10 mt-75 w-full rounded-100 border border-border-default bg-background-default shadow-1">
                    {['바이브 코딩 입문자 코스'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCourse(c);
                          setCourseOpen(false);
                        }}
                        className="flex w-full items-center px-250 py-175 font-designer-16r text-gray-800 bg-gray-50 hover:bg-gray-100"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lesson selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLessonOpen((p) => !p)}
                className="flex w-full items-center justify-between rounded-100 border border-border-default px-250 py-175 font-designer-16r text-gray-800"
              >
                {selectedLessonLabel}
                <ChevronDown
                  className={cn(
                    'h-300 w-300 transition-transform',
                    lessonOpen && 'rotate-180',
                  )}
                />
              </button>
              {lessonOpen && (
                <div className="absolute left-0 top-full z-10 mt-75 max-h-[300px] w-full overflow-y-auto rounded-100 border border-border-default bg-background-default shadow-1">
                  {allLessons.map((l) => (
                    <button
                      key={l.lessonId}
                      type="button"
                      onClick={() => {
                        setSelectedLessonId(l.lessonId);
                        setLessonOpen(false);
                      }}
                      className="flex w-full items-center px-250 py-175 font-designer-16r text-gray-800 bg-gray-50 hover:bg-gray-100"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image upload */}
            <div>
              <p className="mb-50 font-designer-14r text-gray-500">
                * 최대 10개의 사진을 등록할 수 있어요.
              </p>
              <div className="flex flex-wrap gap-150">
                {images.map((img, i) => (
                  <div
                    key={img.key}
                    className="relative h-1625 w-1625 shrink-0"
                  >
                    <Image
                      src={img.previewUrl}
                      alt={`첨부 이미지 ${i + 1}`}
                      fill
                      unoptimized
                      className="rounded-150 object-cover"
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
                {images.length < 10 && (
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'flex h-1625 w-1625 shrink-0 flex-col items-center justify-center gap-75 rounded-150 border border-border-default bg-gray-200',
                      isUploadingImage
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:border-rose-400',
                    )}
                  >
                    <Plus className="h-300 w-300 text-gray-400" />
                  </button>
                )}
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

            {/* Text content */}
            <MarkdownEditor
              value={text}
              onChange={setText}
              placeholder="코딩을 하며 다양한 순간을 글로 작성해보세요! 이번 레슨에서 배운 것, 새롭게 알게 된 것을 자유롭게 작성해보세요."
              uploadImage={uploadCommunityMarkdownImage}
            />

            {/* CTAs */}
            <div className="flex gap-200">
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="flex h-700 flex-1 items-center justify-center rounded-100 border border-border-default font-designer-16m text-gray-800"
              >
                임시저장
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createFeed.isPending}
                className="flex h-700 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16m text-text-inverse disabled:bg-gray-300"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
