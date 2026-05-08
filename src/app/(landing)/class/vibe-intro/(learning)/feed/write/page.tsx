'use client';

import { ArrowLeft, ChevronDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  useCreateBuilderFeed,
  useGetCourseCurriculum,
  useGetCourseDetail,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';

export default function FeedWritePage() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [course, setCourse] = useState('바이브 코딩 입문자 코스');
  const [courseOpen, setCourseOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [text, setText] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  function handleSubmit() {
    if (!selectedLessonId) {
      showToast('레슨을 선택해주세요.', 'error');
      return;
    }
    if (!text.trim()) {
      showToast('내용을 입력해주세요.', 'error');
      return;
    }
    createFeed.mutate(
      {
        courseId,
        request: { lessonId: selectedLessonId, content: text },
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
          <div className="flex w-[400px] flex-col items-center gap-300 rounded-200 bg-background-default p-500">
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
                        className="flex w-full items-center px-250 py-175 font-designer-16r text-gray-800 hover:bg-gray-100"
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
                      className="flex w-full items-center px-250 py-175 font-designer-16r text-gray-800 hover:bg-gray-100"
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
              <div className="flex gap-150">
                <button
                  type="button"
                  className="flex h-[130px] w-[130px] flex-col items-center justify-center gap-75 rounded-150 border border-border-default bg-background-default"
                >
                  <Plus className="h-300 w-300 text-gray-400" />
                  <span className="font-designer-14m text-gray-400">
                    이미지 첨부
                  </span>
                </button>
                {/* Placeholder upload slots */}
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="relative h-[130px] w-[130px] rounded-150 bg-gray-200"
                  />
                ))}
              </div>
            </div>

            {/* Text content */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`코딩을 하며 다양한 순간을 글로 작성해보세요!\n\n"이번 레슨, 어떤 기대로 시작했나요?"\n예) 내 포트폴리오에 넣을 사이트를 만들어보고 싶었어요 / AI가 진짜 코드를 짜주는지 궁금했어요\n\n"오늘 새롭게 알게 된 것을 적어주세요."\n예) AI에게 시킬 때 구체적으로 말해야 원하는 결과가 나온다 / 터미널이 생각보다 안 무섭다`}
              className="h-[350px] w-full resize-none rounded-200 border border-border-default p-300 font-designer-16r text-gray-800 outline-none placeholder:whitespace-pre-line placeholder:text-gray-400 focus:border-border-brand"
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
