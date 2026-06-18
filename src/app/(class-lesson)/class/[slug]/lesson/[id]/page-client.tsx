'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type ComponentProps,
  type Dispatch,
  type RefObject,
  use,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import MarkdownContentCore from '@/components/common/ui/rich-text/markdown-content-core';
import {
  useGetCourseDrawer,
  useGetLessonBuilderFeedPreview,
  useGetLessonDetail,
  useGetLessonQnaSidebar,
  useSubmitLessonRetrospective,
} from '@/hooks/queries/course/course-queries';
import { useToastStore } from '@/stores/use-toast-store';
import {
  type LessonRetrospectiveCreateRequest,
  type LessonRetrospectivePurpose,
  normalizeRetrospectivePurpose,
} from '@/types/api/course.types';
import { getAttributionParams } from '@/utils/attribution-tracker';
import { CurriculumDrawer } from './_components/curriculum-drawer';
import { LessonBuilderFeedCard } from './_components/lesson-builder-feed-card';
import { LessonBuilderFeedDetailModal } from './_components/lesson-builder-feed-detail-modal';
import { LessonQnaCard } from './_components/lesson-qna-card';
import { LessonQnaDetailModal } from './_components/lesson-qna-detail-modal';
import { LessonQnaSubmissionModal } from './_components/lesson-qna-submission-modal';
import {
  LessonReviewForm,
  type LessonFormData,
} from './_components/lesson-review-form';
import { LessonTabs, type LessonTabValue } from './_components/lesson-tabs';
import { LessonTopBar } from './_components/lesson-top-bar';

interface LessonPageState {
  tab: LessonTabValue;
  curriculumOpen: boolean;
  userExpandedChapters: Set<number> | null;
  submissionModalOpen: boolean;
  selectedQnaId: number | null;
  selectedFeedId: number | null;
}

type LessonPageAction =
  | { type: 'setTab'; tab: LessonTabValue }
  | { type: 'setCurriculumOpen'; open: boolean }
  | { type: 'toggleCurriculum' }
  | { type: 'toggleChapter'; chapterId: number; fallback: Set<number> }
  | { type: 'setSubmissionModalOpen'; open: boolean }
  | { type: 'setSelectedQnaId'; qnaId: number | null }
  | { type: 'setSelectedFeedId'; feedId: number | null };

const INITIAL_LESSON_PAGE: LessonPageState = {
  tab: 'follow',
  curriculumOpen: true,
  userExpandedChapters: null,
  submissionModalOpen: false,
  selectedQnaId: null,
  selectedFeedId: null,
};

function lessonPageReducer(
  state: LessonPageState,
  action: LessonPageAction,
): LessonPageState {
  switch (action.type) {
    case 'setTab':
      return { ...state, tab: action.tab };
    case 'setCurriculumOpen':
      return { ...state, curriculumOpen: action.open };
    case 'toggleCurriculum':
      return { ...state, curriculumOpen: !state.curriculumOpen };
    case 'toggleChapter': {
      const next = new Set(state.userExpandedChapters ?? action.fallback);
      if (next.has(action.chapterId)) next.delete(action.chapterId);
      else next.add(action.chapterId);
      return { ...state, userExpandedChapters: next };
    }
    case 'setSubmissionModalOpen':
      return { ...state, submissionModalOpen: action.open };
    case 'setSelectedQnaId':
      return { ...state, selectedQnaId: action.qnaId };
    case 'setSelectedFeedId':
      return { ...state, selectedFeedId: action.feedId };
    default:
      return state;
  }
}

function buildRetrospectiveRequest(
  formData: LessonFormData,
  purpose: LessonRetrospectivePurpose,
): LessonRetrospectiveCreateRequest {
  const normalized = normalizeRetrospectivePurpose(purpose);
  const allowsArtifact = normalized === 'PRACTICAL';

  let artifactType: string | null = null;
  let artifactValue: string | null = null;
  if (allowsArtifact) {
    if (formData.artifactImageUrls.length > 0) {
      artifactType = 'SCREENSHOT';
      artifactValue = formData.artifactImageUrls[0];
    } else if (formData.artifactLink) {
      artifactType = 'LINK';
      artifactValue = formData.artifactLink;
    }
  }

  const trueChipCount = formData.checklistFlags.filter(Boolean).length;
  const trimmedFeedback = formData.feedbackText.trim();
  const feedback =
    trueChipCount >= 2
      ? {
          checklistFlags: formData.checklistFlags,
          freeText: trimmedFeedback,
        }
      : trimmedFeedback.length > 0
        ? { checklistFlags: null, freeText: trimmedFeedback }
        : null;

  const reviewContent = formData.reviewContent.trim();

  return {
    starRating: formData.starRating,
    highlightAnswer: reviewContent,
    unexpectedAnswer: reviewContent,
    artifactType,
    artifactValue,
    artifactImages:
      allowsArtifact && formData.artifactImageUrls.length > 0
        ? formData.artifactImageUrls
        : null,
    feedback,
  };
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id, slug } = use(params);
  const lessonId = parseInt(id, 10);
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const [state, dispatch] = useReducer(lessonPageReducer, INITIAL_LESSON_PAGE);
  const {
    tab,
    curriculumOpen,
    userExpandedChapters,
    submissionModalOpen,
    selectedQnaId,
    selectedFeedId,
  } = state;
  const reviewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const lessonStartTimeRef = useRef<number | null>(null);
  const progressReachedRef = useRef<Set<number> | null>(null);
  if (progressReachedRef.current === null) {
    progressReachedRef.current = new Set<number>();
  }

  function scrollToRef(ref: RefObject<HTMLDivElement | null>) {
    if (!ref.current || !leftColRef.current) return;
    const container = leftColRef.current;
    const offset = 48;
    const top =
      container.scrollTop +
      ref.current.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      offset;
    container.scrollTo({ top, behavior: 'smooth' });
  }

  function handleTabChange(next: LessonTabValue) {
    dispatch({ type: 'setTab', tab: next });
    if (next === 'review') scrollToRef(reviewRef);
    else if (next === 'follow') scrollToRef(contentRef);
  }

  useEffect(() => {
    const timer = setTimeout(
      () => dispatch({ type: 'setCurriculumOpen', open: false }),
      2000,
    );
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    lessonStartTimeRef.current = Date.now();
    progressReachedRef.current = new Set();
    sendGTMEvent({
      event: 'lesson_start',
      lesson_id: lessonId,
      ...getAttributionParams(),
    });
  }, [lessonId]);

  useEffect(() => {
    const el = leftColRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight <= clientHeight) return;
      const pct = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      for (const milestone of [25, 50, 75, 100]) {
        if (pct >= milestone && !progressReachedRef.current.has(milestone)) {
          progressReachedRef.current.add(milestone);
          sendGTMEvent({
            event: 'lesson_progress',
            lesson_id: lessonId,
            progress_pct: milestone,
            ...getAttributionParams(),
          });
        }
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [lessonId]);

  const { data: lesson, isLoading: isLessonLoading } =
    useGetLessonDetail(lessonId);
  const courseId = lesson?.courseId ?? 0;
  const { data: drawer, isLoading: isDrawerLoading } =
    useGetCourseDrawer(courseId);
  const isCurriculumLoading = isLessonLoading || isDrawerLoading;
  const { data: qnaSidebar } = useGetLessonQnaSidebar(lessonId);
  const { data: feedPreview } = useGetLessonBuilderFeedPreview(lessonId);
  const submitRetrospective = useSubmitLessonRetrospective();

  const drawerChapters = useMemo(() => drawer?.chapters ?? [], [drawer]);
  const courseTitle = drawer?.courseTitle ?? lesson?.courseTitle ?? '';
  const currentChapterId = useMemo(
    () =>
      drawerChapters.find((c) => c.lessons.some((l) => l.lessonId === lessonId))
        ?.chapterId ?? null,
    [drawerChapters, lessonId],
  );

  const defaultExpandedChapters = useMemo(
    () =>
      new Set(
        drawerChapters.flatMap((c) =>
          c.isDefaultExpanded ? [c.chapterId] : [],
        ),
      ),
    [drawerChapters],
  );
  const expandedChapters = userExpandedChapters ?? defaultExpandedChapters;

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

  function toggleChapter(chapterId: number) {
    dispatch({
      type: 'toggleChapter',
      chapterId,
      fallback: defaultExpandedChapters,
    });
  }

  function handleSubmit(formData: LessonFormData) {
    const request = buildRetrospectiveRequest(
      formData,
      lesson?.retrospectivePurpose ?? 'ARTIFACT_SHARE',
    );

    submitRetrospective.mutate(
      { lessonId, request },
      {
        onSuccess: (data) => {
          sendGTMEvent({
            event: 'lesson_complete',
            lesson_id: lessonId,
            chapter_id: currentChapterId,
            time_spent: Math.round(
              (Date.now() - lessonStartTimeRef.current) / 1000,
            ),
            ...getAttributionParams(),
          });
          const currentChapter = drawerChapters.find((c) =>
            c.lessons.some((l) => l.lessonId === lessonId),
          );
          const isLastInChapter =
            currentChapter?.lessons.at(-1)?.lessonId === lessonId;
          const allDone = currentChapter?.lessons.every(
            (l) => l.lessonId === lessonId || l.status === 'COMPLETED',
          );
          if (currentChapter && isLastInChapter && allDone) {
            sendGTMEvent({
              event: 'chapter_complete',
              chapter_id: currentChapter.chapterId,
              ...getAttributionParams(),
            });
          }
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
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-100">
      <CurriculumDrawer
        open={curriculumOpen}
        onClose={() => dispatch({ type: 'setCurriculumOpen', open: false })}
        courseTitle={courseTitle}
        chapters={drawerChapters}
        expandedChapters={expandedChapters}
        onToggleChapter={toggleChapter}
        isLoading={isCurriculumLoading}
        courseSlug={lesson?.courseSlug ?? slug}
      />

      <div ref={topBarRef} className="shrink-0">
        <LessonTopBar
          onToggleCurriculum={() => dispatch({ type: 'toggleCurriculum' })}
          currentLesson={lessonId}
          totalLessons={totalLessons}
          courseTitle={courseTitle}
        />
      </div>

      <div
        ref={leftColRef}
        data-lesson-scroll
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="w-full bg-gray-0">
          <div className="mx-auto w-full max-w-[1236px] px-300 pb-500">
            <LessonHeader
              courseSlug={lesson?.courseSlug ?? slug}
              lessonId={lessonId}
              title={lesson?.title ?? undefined}
              estimatedMinutes={lesson?.estimatedMinutes ?? undefined}
              description={lesson?.description ?? undefined}
              tags={lesson?.tags}
            />
          </div>
        </div>

        <div className="sticky top-0 z-20 w-full bg-gray-0">
          <div className="mx-auto w-full max-w-[1236px] px-300">
            <LessonTabs value={tab} onChange={handleTabChange} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1236px] px-300 pb-1000">
          <div className="flex flex-col md:flex-row md:items-start md:gap-250">
            {/* LEFT CONTENT */}
            <div className="flex min-w-0 flex-1 flex-col">
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
                  key={lessonId}
                  lessonId={lessonId}
                  retrospectivePurpose={
                    lesson?.retrospectivePurpose ?? 'ARTIFACT_SHARE'
                  }
                  retrospectivePrompt={lesson?.retrospectivePrompt}
                  artifactSubmissionRequired={
                    lesson?.artifactSubmissionRequired ?? false
                  }
                  alreadySubmitted={alreadySubmitted}
                  submitting={submitRetrospective.isPending}
                  isLastLesson={isLastLesson}
                  onSubmit={handleSubmit}
                />
              ) : null}
            </div>

            <LessonSidebar
              qnas={qnaSidebar?.qnas ?? []}
              builderQnas={qnaSidebar?.builderQnas ?? []}
              feeds={feedPreview?.feeds ?? []}
              dispatch={dispatch}
            />
          </div>
        </div>
      </div>

      <LessonModals
        lessonId={lessonId}
        courseId={lesson?.courseId ?? 0}
        submissionModalOpen={submissionModalOpen}
        selectedQnaId={selectedQnaId}
        selectedFeedId={selectedFeedId}
        dispatch={dispatch}
      />
    </div>
  );
}

function LessonHeader({
  courseSlug,
  lessonId,
  title,
  estimatedMinutes,
  description,
  tags,
}: {
  courseSlug: string;
  lessonId: number;
  title: string | undefined;
  estimatedMinutes: number | undefined;
  description: string | undefined;
  tags: string[] | undefined;
}) {
  return (
    <div className="pt-250">
      <Link
        href={`/class/${courseSlug}/home`}
        className="inline-flex h-500 items-center gap-125 rounded-full border border-gray-200 bg-white px-200"
      >
        <Image
          src="/icons/arrow-left-line.svg"
          alt="back"
          width={24}
          height={24}
        />
        <span className="font-designer-14m text-black">
          학습 여정 맵 돌아가기
        </span>
      </Link>

      <div className="mt-400 flex items-center gap-200">
        <span className="inline-flex h-350 items-center justify-center rounded-100 bg-rose-500 px-125 font-designer-14m text-rose-100">
          Lesson {String(lessonId).padStart(2, '0')}
        </span>
        <div className="flex items-center gap-25">
          <Image
            src="/class/timer.svg"
            alt="clock"
            width={24}
            height={24}
            className="size-300"
          />
          <div className="flex items-center font-designer-14r text-gray-500">
            <span>약</span>
            <span className="mx-25">{estimatedMinutes ?? 12}</span>
            <span>분 소요</span>
          </div>
        </div>
      </div>

      {tags && tags.length > 0 ? (
        <div className="mt-200 flex flex-wrap items-center gap-125">
          {tags.map((tag, index) => (
            <span
              key={tag ?? index}
              className="inline-flex items-center rounded-full bg-gray-100 px-200 py-75 font-designer-14m text-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <h1 className="mt-200 font-designer-24b text-gray-800 md:font-designer-30b">
        {title ?? 'AI 처음 만나는 날'}
      </h1>

      {description ? (
        <p className="font-designer-18r text-gray-800">{description}</p>
      ) : null}
    </div>
  );
}

function LessonSidebar({
  qnas,
  builderQnas,
  feeds,
  dispatch,
}: {
  qnas: ComponentProps<typeof LessonQnaCard>['myQnas'];
  builderQnas: ComponentProps<typeof LessonQnaCard>['builderQnas'];
  feeds: ComponentProps<typeof LessonBuilderFeedCard>['feeds'];
  dispatch: Dispatch<LessonPageAction>;
}) {
  return (
    <div className="hidden md:sticky md:top-600 md:mt-300 md:block md:w-4500 md:shrink-0 md:self-start">
      <div className="flex flex-col gap-250">
        <LessonQnaCard
          myQnas={qnas}
          builderQnas={builderQnas}
          onAskClick={() =>
            dispatch({ type: 'setSubmissionModalOpen', open: true })
          }
          onSelectQna={(qnaId) => dispatch({ type: 'setSelectedQnaId', qnaId })}
        />
        <LessonBuilderFeedCard
          feeds={feeds}
          onSelectFeed={(feedId) =>
            dispatch({ type: 'setSelectedFeedId', feedId })
          }
        />
      </div>
    </div>
  );
}

function LessonModals({
  lessonId,
  courseId,
  submissionModalOpen,
  selectedQnaId,
  selectedFeedId,
  dispatch,
}: {
  lessonId: number;
  courseId: number;
  submissionModalOpen: boolean;
  selectedQnaId: number | null;
  selectedFeedId: number | null;
  dispatch: Dispatch<LessonPageAction>;
}) {
  return (
    <>
      {submissionModalOpen && (
        <LessonQnaSubmissionModal
          lessonId={lessonId}
          courseId={courseId}
          open={submissionModalOpen}
          onClose={() =>
            dispatch({
              type: 'setSubmissionModalOpen',
              open: false,
            })
          }
        />
      )}
      <LessonQnaDetailModal
        qnaId={selectedQnaId}
        onClose={() => dispatch({ type: 'setSelectedQnaId', qnaId: null })}
      />
      <LessonBuilderFeedDetailModal
        feedId={selectedFeedId}
        onClose={() => dispatch({ type: 'setSelectedFeedId', feedId: null })}
      />
    </>
  );
}
