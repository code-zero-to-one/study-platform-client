'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type RefObject,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import MarkdownContentCore from '@/components/common/ui/rich-text/markdown-content-core';
import {
  useGetCourseDrawer,
  useGetLessonBuilderFeedPreview,
  useGetLessonDetail,
  useGetLessonQnaSidebar,
  useSubmitLessonRetrospective,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';
import { CurriculumDrawer } from './_components/curriculum-drawer';
import { LessonBuilderFeedCard } from './_components/lesson-builder-feed-card';
import { LessonBuilderFeedDetailModal } from './_components/lesson-builder-feed-detail-modal';
import { LessonLinkModal } from './_components/lesson-link-modal';
import { LessonQnaCard } from './_components/lesson-qna-card';
import { LessonQnaDetailModal } from './_components/lesson-qna-detail-modal';
import { LessonQnaSubmissionModal } from './_components/lesson-qna-submission-modal';
import {
  LessonReviewForm,
  NEGATIVE_CHIPS,
  POSITIVE_CHIPS,
} from './_components/lesson-review-form';
import { LessonScreenshotModal } from './_components/lesson-screenshot-modal';
import { LessonTabs, type LessonTabValue } from './_components/lesson-tabs';
import { LessonTopBar } from './_components/lesson-top-bar';

export default function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id, slug } = use(params);
  const lessonId = parseInt(id, 10);
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const [tab, setTab] = useState<LessonTabValue>('follow');
  const reviewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);

  function scrollToRef(ref: RefObject<HTMLDivElement | null>) {
    if (!ref.current) return;
    const headerHeight = topBarRef.current?.offsetHeight ?? 64;
    const top =
      ref.current.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      16;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function handleTabChange(next: LessonTabValue) {
    setTab(next);
    if (next === 'review') scrollToRef(reviewRef);
    else if (next === 'follow') scrollToRef(contentRef);
  }
  const [starRating, setStarRating] = useState(0);
  const [highlightAnswer, setHighlightAnswer] = useState('');
  const [unexpectedAnswer, setUnexpectedAnswer] = useState('');
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());
  const [feedbackText, setFeedbackText] = useState('');
  const [curriculumOpen, setCurriculumOpen] = useState(false);

  useEffect(() => {
    setCurriculumOpen(true);
    const timer = setTimeout(() => setCurriculumOpen(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(),
  );
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedQnaId, setSelectedQnaId] = useState<number | null>(null);
  const [selectedFeedId, setSelectedFeedId] = useState<number | null>(null);
  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [artifactImageUrl, setArtifactImageUrl] = useState<string | null>(null);
  const [artifactImagePreviewUrl, setArtifactImagePreviewUrl] = useState<
    string | null
  >(null);
  const [artifactLink, setArtifactLink] = useState<string | null>(null);

  const { data: lesson } = useGetLessonDetail(lessonId);
  const courseId = lesson?.courseId ?? 0;
  const { data: drawer, isPending: isDrawerLoading } =
    useGetCourseDrawer(courseId);
  const { data: qnaSidebar } = useGetLessonQnaSidebar(lessonId);
  const { data: feedPreview } = useGetLessonBuilderFeedPreview(lessonId);
  const submitRetrospective = useSubmitLessonRetrospective();

  const drawerChapters = useMemo(() => drawer?.chapters ?? [], [drawer]);
  const courseTitle = drawer?.courseTitle ?? lesson?.courseTitle ?? '';

  // Initialize expanded chapters from drawer.isDefaultExpanded
  useEffect(() => {
    if (drawerChapters.length === 0) return;
    setExpandedChapters((prev) => {
      if (prev.size > 0) return prev;
      return new Set(
        drawerChapters
          .filter((c) => c.isDefaultExpanded)
          .map((c) => c.chapterId),
      );
    });
  }, [drawerChapters]);

  const totalLessons = useMemo(
    () => drawerChapters.reduce((sum, c) => sum + c.lessons.length, 0),
    [drawerChapters],
  );

  const isLastLesson = useMemo(() => {
    const allLessons = drawerChapters.flatMap((c) => c.lessons);
    if (allLessons.length === 0) return false;
    const isLast = allLessons.at(-1)?.lessonId === lessonId;
    const allOthersCompleted = allLessons.every(
      (l) => l.lessonId === lessonId || l.status === 'COMPLETED',
    );
    return isLast && allOthersCompleted;
  }, [drawerChapters, lessonId]);

  const alreadySubmitted = lesson?.retrospectiveSubmitted ?? false;
  const isFormValid =
    starRating > 0 &&
    highlightAnswer.trim().length > 0 &&
    unexpectedAnswer.trim().length > 0 &&
    selectedChips.size >= 2 &&
    (!lesson?.artifactSubmissionRequired || !!artifactImageUrl);
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
    submitRetrospective.mutate(
      {
        lessonId,
        request: {
          starRating: starRating || null,
          highlightAnswer: highlightAnswer.trim(),
          unexpectedAnswer: unexpectedAnswer.trim(),
          artifactType: artifactImageUrl
            ? 'SCREENSHOT'
            : artifactLink
              ? 'LINK'
              : null,
          artifactValue: artifactImageUrl ?? artifactLink ?? null,
          feedback: { checklistFlags, freeText: feedbackText },
        },
      },
      {
        onSuccess: (data) => {
          showToast('제출이 완료되었어요!');
          const courseSlugForNav = lesson?.courseSlug ?? slug;
          if (data.isCourseCompleted) {
            router.push(`/class/${courseSlugForNav}/complete`);
          } else {
            router.push(`/class/${courseSlugForNav}/home`);
          }
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
        isLoading={isDrawerLoading}
        courseSlug={lesson?.courseSlug ?? slug}
      />

      <div ref={topBarRef}>
        <LessonTopBar
          onToggleCurriculum={() => setCurriculumOpen((v) => !v)}
          curriculumOpen={curriculumOpen}
          currentLesson={lessonId}
          totalLessons={totalLessons}
          courseTitle={courseTitle}
        />
      </div>

      <div className="mx-auto w-full max-w-[1236px] px-300">
        <div className="grid grid-cols-content-sidebar-360 items-start gap-250 pt-500">
          {/* LEFT */}
          <div className="min-w-0">
            <Link
              href={`/class/${lesson?.courseSlug ?? slug}/home`}
              className="inline-flex items-center gap-125 rounded-full border border-gray-200 bg-background-default px-200 py-100"
            >
              <ArrowLeft className="h-250 w-250 text-gray-800" />
              <span className="font-designer-14m text-gray-1000">
                학습 여정 맵 돌아가기
              </span>
            </Link>

            <div className="mt-300 flex items-center justify-between">
              <div className="flex items-center gap-200">
                <span className="rounded-100 bg-rose-200 px-125 py-25 font-designer-14m text-rose-400">
                  Lesson {String(lessonId).padStart(2, '0')}
                </span>
                <h1 className="font-designer-32b text-gray-800">
                  {lesson?.title ?? 'AI 처음 만나는 날'}
                </h1>
              </div>
              <p className="font-designer-16m text-gray-500">
                {lesson?.estimatedMinutes
                  ? `약 ${lesson.estimatedMinutes}분 소요`
                  : ''}
              </p>
            </div>

            {lesson?.description ? (
              <p className="mt-150 whitespace-pre-line font-designer-16r text-gray-700">
                {lesson.description}
              </p>
            ) : null}

            <div className="sticky top-800 z-20 mt-300 bg-gray-100">
              <LessonTabs value={tab} onChange={handleTabChange} />
            </div>

            <div
              ref={contentRef}
              className="mt-300 min-h-[964px] rounded-150 bg-background-default p-500"
            >
              {lesson?.contentMarkdown ? (
                <MarkdownContentCore content={lesson.contentMarkdown} />
              ) : (
                <p className="font-designer-16r text-gray-500">
                  본문이 준비 중입니다.
                </p>
              )}
            </div>

            <div ref={reviewRef} />
            <hr className="my-500 border-gray-300" />

            {tab === 'review' || tab === 'follow' ? (
              <LessonReviewForm
                starRating={starRating}
                onStarRatingChange={setStarRating}
                highlightAnswer={highlightAnswer}
                unexpectedAnswer={unexpectedAnswer}
                selectedChips={selectedChips}
                feedbackText={feedbackText}
                submitDisabled={isSubmitDisabled}
                submitting={submitRetrospective.isPending}
                alreadySubmitted={alreadySubmitted}
                showArtifact={lesson?.artifactSubmissionRequired ?? false}
                retrospectivePrompt={lesson?.retrospectivePrompt}
                onHighlightAnswerChange={setHighlightAnswer}
                onUnexpectedAnswerChange={setUnexpectedAnswer}
                onToggleChip={toggleChip}
                onFeedbackChange={setFeedbackText}
                artifactImagePreviewUrl={artifactImagePreviewUrl}
                artifactLink={artifactLink}
                onAttachScreenshot={() => setScreenshotModalOpen(true)}
                onAttachLink={() => setLinkModalOpen(true)}
                onRemoveArtifactImage={() => {
                  if (artifactImagePreviewUrl)
                    URL.revokeObjectURL(artifactImagePreviewUrl);
                  setArtifactImageUrl(null);
                  setArtifactImagePreviewUrl(null);
                }}
                onRemoveArtifactLink={() => setArtifactLink(null)}
                isLastLesson={isLastLesson}
                onSubmit={handleSubmit}
              />
            ) : null}

            <div className="h-1000" />
          </div>

          {/* RIGHT sticky sidebar */}
          <div className="sticky top-800 z-10 flex max-h-[calc(100vh-var(--spacing-800))] flex-col gap-250 overflow-y-auto">
            <LessonQnaCard
              myQnas={qnaSidebar?.qnas ?? []}
              builderQnas={qnaSidebar?.builderQnas ?? []}
              onAskClick={() => setSubmissionModalOpen(true)}
              onSelectQna={setSelectedQnaId}
            />
            <LessonBuilderFeedCard
              feeds={feedPreview?.feeds ?? []}
              onSelectFeed={setSelectedFeedId}
            />
          </div>
        </div>
      </div>

      <LessonQnaSubmissionModal
        lessonId={lessonId}
        courseId={lesson?.courseId ?? 0}
        open={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
      />
      <LessonQnaDetailModal
        qnaId={selectedQnaId}
        onClose={() => setSelectedQnaId(null)}
      />
      <LessonBuilderFeedDetailModal
        feedId={selectedFeedId}
        onClose={() => setSelectedFeedId(null)}
      />
      <LessonScreenshotModal
        open={screenshotModalOpen}
        onClose={() => setScreenshotModalOpen(false)}
        onConfirm={(imageUrl, previewUrl) => {
          setArtifactImageUrl(imageUrl);
          setArtifactImagePreviewUrl(previewUrl);
        }}
      />
      <LessonLinkModal
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onConfirm={(url) => setArtifactLink(url)}
      />
    </div>
  );
}
