'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useMemo, useState } from 'react';
import {
  useGetCourseDrawer,
  useGetLessonBuilderFeedPreview,
  useGetLessonDetail,
  useGetLessonQnaSidebar,
  useSubmitLessonRetrospective,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';
import type { CourseDrawerChapterResponse } from '@/types/api/course.types';
import { CurriculumDrawer } from './_components/curriculum-drawer';
import { LessonBuilderFeedCard } from './_components/lesson-builder-feed-card';
import { LessonQnaCard } from './_components/lesson-qna-card';
import { LessonQnaDetailModal } from './_components/lesson-qna-detail-modal';
import { LessonQnaSubmissionModal } from './_components/lesson-qna-submission-modal';
import { LessonRatingCard } from './_components/lesson-rating-card';
import {
  LessonReviewForm,
  NEGATIVE_CHIPS,
  POSITIVE_CHIPS,
} from './_components/lesson-review-form';
import { LessonTabs, type LessonTabValue } from './_components/lesson-tabs';
import { LessonTopBar } from './_components/lesson-top-bar';

const MOCK_COURSE_TITLE = '바이브 코딩 입문자 코스';
const MOCK_TOTAL_LESSONS = 20;

const MOCK_DRAWER_CHAPTERS: CourseDrawerChapterResponse[] = [
  {
    chapterId: 1,
    order: 1,
    title: 'AI 처음 만나는 날',
    defaultExpanded: true,
    lessons: [
      {
        lessonId: 1,
        order: 1,
        title: 'Claude와 친해지기',
        isFree: true,
        status: 'IN_PROGRESS',
        isLocked: false,
        isCurrentLesson: true,
      },
      {
        lessonId: 2,
        order: 2,
        title: 'Claude와 친해지기',
        isFree: true,
        status: 'LOCKED',
        isLocked: true,
        isCurrentLesson: false,
      },
      {
        lessonId: 3,
        order: 3,
        title: 'Claude와 친해지기',
        isFree: true,
        status: 'LOCKED',
        isLocked: true,
        isCurrentLesson: false,
      },
    ],
  },
  {
    chapterId: 2,
    order: 2,
    title: 'AI 처음 만나는 날',
    defaultExpanded: false,
    lessons: [
      {
        lessonId: 4,
        order: 4,
        title: 'Claude와 친해지기',
        isFree: false,
        status: 'IN_PROGRESS',
        isLocked: false,
        isCurrentLesson: false,
      },
      {
        lessonId: 5,
        order: 5,
        title: 'Claude와 친해지기',
        isFree: false,
        status: 'LOCKED',
        isLocked: true,
        isCurrentLesson: false,
      },
      {
        lessonId: 6,
        order: 6,
        title: 'Claude와 친해지기',
        isFree: false,
        status: 'LOCKED',
        isLocked: true,
        isCurrentLesson: false,
      },
    ],
  },
];

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lessonId = parseInt(id, 10);
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const [tab, setTab] = useState<LessonTabValue>('follow');
  const [rating, setRating] = useState(0);
  const [reflection1, setReflection1] = useState('');
  const [reflection2, setReflection2] = useState('');
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());
  const [feedbackText, setFeedbackText] = useState('');
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(),
  );
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedQnaId, setSelectedQnaId] = useState<number | null>(null);

  const { data: lesson } = useGetLessonDetail(lessonId);
  const courseId = lesson?.courseId ?? 0;
  const { data: drawer } = useGetCourseDrawer(courseId);
  const { data: qnaSidebar } = useGetLessonQnaSidebar(lessonId);
  const { data: feedPreview } = useGetLessonBuilderFeedPreview(lessonId);
  const submitRetrospective = useSubmitLessonRetrospective();

  const drawerChapters = drawer?.chapters ?? MOCK_DRAWER_CHAPTERS;
  const courseTitle =
    drawer?.courseTitle ?? lesson?.courseTitle ?? MOCK_COURSE_TITLE;

  // Initialize expanded chapters from drawer.defaultExpanded
  useEffect(() => {
    if (drawerChapters.length === 0) return;
    setExpandedChapters((prev) => {
      if (prev.size > 0) return prev;
      return new Set(
        drawerChapters.filter((c) => c.defaultExpanded).map((c) => c.chapterId),
      );
    });
  }, [drawerChapters]);

  const totalLessons = useMemo(
    () =>
      drawerChapters.reduce((sum, c) => sum + c.lessons.length, 0) ||
      MOCK_TOTAL_LESSONS,
    [drawerChapters],
  );

  const alreadySubmitted = lesson?.retrospectiveSubmitted ?? false;
  const isFormValid =
    rating > 0 &&
    reflection1.trim().length > 0 &&
    reflection2.trim().length > 0 &&
    selectedChips.size >= 2;
  const isSubmitDisabled =
    !isFormValid || submitRetrospective.isPending || alreadySubmitted;

  function toggleChip(chip: string) {
    setSelectedChips((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  }

  function toggleChapter(chapterId: number) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  }

  function handleSubmit() {
    if (isSubmitDisabled) return;
    const chips = [...selectedChips];
    const checklistFlags = [...POSITIVE_CHIPS, ...NEGATIVE_CHIPS].map((c) =>
      chips.includes(c),
    );
    // Two-question UI bundled into single backend `content` field with delimiter.
    const combinedContent = `${reflection1}\n---\n${reflection2}`;
    submitRetrospective.mutate(
      {
        lessonId,
        request: {
          understandingScore: rating,
          content: combinedContent,
          artifactType: null,
          artifactValue: null,
          feedback: { checklistFlags, freeText: feedbackText },
        },
      },
      {
        onSuccess: () => {
          showToast('제출이 완료되었어요!');
          router.push('/class/vibe-intro/complete');
        },
        onError: () => showToast('제출에 실패했어요.', 'error'),
      },
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gray-100">
      <CurriculumDrawer
        open={curriculumOpen}
        onClose={() => setCurriculumOpen(false)}
        courseTitle={courseTitle}
        chapters={drawerChapters}
        expandedChapters={expandedChapters}
        onToggleChapter={toggleChapter}
        currentLessonId={lessonId}
      />

      <LessonTopBar
        onToggleCurriculum={() => setCurriculumOpen((v) => !v)}
        currentLesson={lessonId}
        totalLessons={totalLessons}
        courseTitle={courseTitle}
      />

      <div className="mx-auto w-full max-w-[1236px] px-[24px]">
        <div className="grid grid-cols-content-sidebar-360 items-start gap-[20px] pt-[40px]">
          {/* LEFT */}
          <div className="min-w-0">
            <Link
              href="/class/vibe-intro/home"
              className="inline-flex items-center gap-125 rounded-full border border-gray-200 bg-background-default px-[16px] py-[8px]"
            >
              <ArrowLeft className="h-[20px] w-[20px] text-gray-800" />
              <span className="font-designer-14m text-gray-1000">
                학습 여정 맵 돌아가기
              </span>
            </Link>

            <div className="mt-[24px] flex items-center justify-between">
              <div className="flex items-center gap-200">
                <span className="rounded-100 bg-rose-200 px-125 py-25 font-designer-14m text-rose-400">
                  Lesson {String(lessonId).padStart(2, '0')}
                </span>
                <h1 className="font-designer-32b text-gray-800">
                  {lesson?.title ?? 'AI 처음 만나는 날'}
                </h1>
              </div>
              <p className="font-designer-16m text-gray-500">약 18분 소요</p>
            </div>

            <div className="mt-[24px]">
              <LessonTabs value={tab} onChange={setTab} />
            </div>

            <div className="mt-[24px] min-h-[964px] rounded-150 bg-background-default" />

            <hr className="my-[40px] border-gray-300" />

            {tab === 'review' || tab === 'follow' ? (
              <LessonReviewForm
                reflection1={reflection1}
                reflection2={reflection2}
                selectedChips={selectedChips}
                feedbackText={feedbackText}
                submitDisabled={isSubmitDisabled}
                submitting={submitRetrospective.isPending}
                alreadySubmitted={alreadySubmitted}
                onReflection1Change={setReflection1}
                onReflection2Change={setReflection2}
                onToggleChip={toggleChip}
                onFeedbackChange={setFeedbackText}
                onAttachScreenshot={() =>
                  showToast('스크린샷 첨부는 준비 중입니다.')
                }
                onAttachLink={() => showToast('링크 입력은 준비 중입니다.')}
                onSubmit={handleSubmit}
              />
            ) : null}

            <div className="h-[80px]" />
          </div>

          {/* RIGHT sticky sidebar */}
          <div className="sticky top-[88px] flex flex-col gap-[20px]">
            <LessonRatingCard rating={rating} onChange={setRating} />
            <LessonQnaCard
              myQnas={qnaSidebar?.qnas ?? []}
              onAskClick={() => setSubmissionModalOpen(true)}
              onSelectQna={setSelectedQnaId}
            />
            <LessonBuilderFeedCard feeds={feedPreview?.feeds ?? []} />
          </div>
        </div>
      </div>

      <LessonQnaSubmissionModal
        lessonId={lessonId}
        open={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
      />
      <LessonQnaDetailModal
        qnaId={selectedQnaId}
        onClose={() => setSelectedQnaId(null)}
      />
    </div>
  );
}
