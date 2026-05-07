'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  getClassCourseDetail,
  getClassCourses,
  getClassCurriculum,
  toClassApiError,
  type ClassApiError,
  type ClassCourseDetail,
  type ClassCourseSummary,
  type ClassCurriculum,
  type ClassPageResponse,
} from '@/features/class-domain-test/api/class-domain-test-api';

type SmokeState = 'idle' | 'loading' | 'success' | 'error';

interface SmokeResult {
  state: SmokeState;
  error?: ClassApiError;
}

const initialSmokeResult: SmokeResult = {
  state: 'idle',
};

export default function ClassDomainTestPage() {
  const [courses, setCourses] =
    useState<ClassPageResponse<ClassCourseSummary>>();
  const [selectedSlug, setSelectedSlug] = useState('');
  const [detail, setDetail] = useState<ClassCourseDetail>();
  const [curriculum, setCurriculum] = useState<ClassCurriculum>();
  const [coursesResult, setCoursesResult] =
    useState<SmokeResult>(initialSmokeResult);
  const [detailResult, setDetailResult] =
    useState<SmokeResult>(initialSmokeResult);
  const [curriculumResult, setCurriculumResult] =
    useState<SmokeResult>(initialSmokeResult);

  const loadCourses = useCallback(async () => {
    setCoursesResult({ state: 'loading', error: undefined });
    setDetail(undefined);
    setCurriculum(undefined);

    try {
      const nextCourses = await getClassCourses();
      const firstSlug = nextCourses.content.at(0)?.slug ?? '';
      setCourses(nextCourses);
      setSelectedSlug((currentSlug) => currentSlug || firstSlug);
      setCoursesResult({ state: 'success', error: undefined });
    } catch (error) {
      setCoursesResult({ state: 'error', error: toClassApiError(error) });
    }
  }, []);

  const loadDetail = useCallback(async () => {
    if (!selectedSlug) {
      setDetailResult({
        state: 'error',
        error: { message: '먼저 slug를 선택하거나 입력하세요.' },
      });
      return;
    }

    setDetailResult({ state: 'loading', error: undefined });

    try {
      const nextDetail = await getClassCourseDetail(selectedSlug);
      setDetail(nextDetail);
      setDetailResult({ state: 'success', error: undefined });
    } catch (error) {
      setDetailResult({ state: 'error', error: toClassApiError(error) });
    }
  }, [selectedSlug]);

  const loadCurriculum = useCallback(async () => {
    if (!selectedSlug) {
      setCurriculumResult({
        state: 'error',
        error: { message: '먼저 slug를 선택하거나 입력하세요.' },
      });
      return;
    }

    setCurriculumResult({ state: 'loading', error: undefined });

    try {
      const nextCurriculum = await getClassCurriculum(selectedSlug);
      setCurriculum(nextCurriculum);
      setCurriculumResult({ state: 'success', error: undefined });
    } catch (error) {
      setCurriculumResult({ state: 'error', error: toClassApiError(error) });
    }
  }, [selectedSlug]);

  const runSmoke = useCallback(async () => {
    setCoursesResult({ state: 'loading', error: undefined });
    setDetailResult(initialSmokeResult);
    setCurriculumResult(initialSmokeResult);
    setDetail(undefined);
    setCurriculum(undefined);

    try {
      const nextCourses = await getClassCourses();
      const firstSlug = nextCourses.content.at(0)?.slug ?? '';
      setCourses(nextCourses);
      setSelectedSlug(firstSlug);
      setCoursesResult({ state: 'success', error: undefined });

      if (!firstSlug) {
        setDetailResult({
          state: 'error',
          error: {
            message: '조회된 OPEN 코스가 없어 상세 smoke를 건너뜁니다.',
          },
        });
        return;
      }

      setDetailResult({ state: 'loading', error: undefined });
      try {
        const nextDetail = await getClassCourseDetail(firstSlug);
        setDetail(nextDetail);
        setDetailResult({ state: 'success', error: undefined });
      } catch (error) {
        setDetailResult({ state: 'error', error: toClassApiError(error) });
        return;
      }

      setCurriculumResult({ state: 'loading', error: undefined });
      try {
        const nextCurriculum = await getClassCurriculum(firstSlug);
        setCurriculum(nextCurriculum);
        setCurriculumResult({ state: 'success', error: undefined });
      } catch (error) {
        setCurriculumResult({ state: 'error', error: toClassApiError(error) });
      }
    } catch (error) {
      setCoursesResult({ state: 'error', error: toClassApiError(error) });
    }
  }, []);

  return (
    <main className="bg-background-alternative min-h-screen w-full px-300 py-400">
      <section className="mx-auto flex w-full max-w-screen-xl flex-col gap-250">
        <header className="rounded-250 border border-border-default bg-background-default p-300 shadow-2">
          <p className="font-designer-14b text-text-brand">E2E TEST HARNESS</p>
          <h1 className="font-designer-28b text-text-default">
            Class domain API smoke page
          </h1>
          <p className="font-designer-15r mt-100 text-text-subtle">
            디자인 완성도보다 실제 backend class API 호출 확인에 집중하는 임시
            페이지입니다.
          </p>
          <div className="mt-250 flex flex-wrap gap-100">
            <SmokeButton
              onClick={runSmoke}
              isLoading={coursesResult.state === 'loading'}
            >
              전체 smoke 실행
            </SmokeButton>
            <SmokeButton
              onClick={loadCourses}
              isLoading={coursesResult.state === 'loading'}
            >
              A-01 목록
            </SmokeButton>
            <SmokeButton
              onClick={loadDetail}
              isLoading={detailResult.state === 'loading'}
            >
              A-02 상세
            </SmokeButton>
            <SmokeButton
              onClick={loadCurriculum}
              isLoading={curriculumResult.state === 'loading'}
            >
              A-04 커리큘럼
            </SmokeButton>
          </div>
        </header>

        <section className="grid gap-200 lg:grid-cols-3">
          <SmokeCard title="A-01 GET /courses" result={coursesResult}>
            <label className="flex flex-col gap-75">
              <span className="font-designer-13b text-text-subtle">
                선택 slug
              </span>
              <input
                value={selectedSlug}
                onChange={(event) => setSelectedSlug(event.target.value)}
                className="rounded-150 border border-border-default bg-background-default px-150 py-100 font-designer-14r text-text-default"
                placeholder="vibe-coding-intro"
              />
            </label>
            <div className="flex flex-col gap-100">
              {courses?.content.map((course) => (
                <button
                  key={course.courseId}
                  type="button"
                  onClick={() => setSelectedSlug(course.slug)}
                  className={cn(
                    'rounded-150 border px-150 py-125 text-left',
                    selectedSlug === course.slug
                      ? 'border-border-brand bg-background-accent-rose-subtle'
                      : 'border-border-default bg-background-default',
                  )}
                >
                  <span className="font-designer-15b text-text-default">
                    {course.title}
                  </span>
                  <span className="font-designer-13r block text-text-subtle">
                    {course.slug} · {course.status}
                  </span>
                </button>
              ))}
              {courses && courses.content.length === 0 && (
                <p className="font-designer-14r text-text-subtle">
                  OPEN 코스가 없습니다.
                </p>
              )}
            </div>
            {courses && (
              <p className="font-designer-13r text-text-subtlest">
                page {courses.page} / total {courses.totalElements} / hasNext{' '}
                {String(courses.hasNext)}
              </p>
            )}
          </SmokeCard>

          <SmokeCard title="A-02 GET /courses/{slug}" result={detailResult}>
            {detail ? (
              <div className="flex flex-col gap-100">
                <h2 className="font-designer-22b text-text-default">
                  {detail.title}
                </h2>
                <p className="font-designer-14r text-text-subtle">
                  {detail.description}
                </p>
                <KeyValue label="viewerStatus" value={detail.viewerStatus} />
                <KeyValue label="courseId" value={String(detail.courseId)} />
                <KeyValue
                  label="freeEnrollmentAvailable"
                  value={String(detail.freeEnrollmentAvailable)}
                />
                <KeyValue
                  label="purchaseAvailable"
                  value={String(detail.purchaseAvailable)}
                />
                <KeyValue
                  label="plans"
                  value={String(detail.plans?.length ?? 0)}
                />
              </div>
            ) : (
              <EmptyMessage text="상세 응답이 아직 없습니다." />
            )}
          </SmokeCard>

          <SmokeCard
            title="A-04 GET /courses/{slug}/curriculum"
            result={curriculumResult}
          >
            {curriculum ? (
              <div className="flex flex-col gap-150">
                <div className="grid grid-cols-3 gap-100">
                  <Metric label="chapters" value={curriculum.totalChapters} />
                  <Metric label="lessons" value={curriculum.totalLessons} />
                  <Metric label="days" value={curriculum.durationDays} />
                </div>
                <div className="flex flex-col gap-100">
                  {curriculum.chapters.map((chapter) => (
                    <article
                      key={chapter.chapterId}
                      className="rounded-150 border border-border-default bg-background-default p-150"
                    >
                      <h3 className="font-designer-15b text-text-default">
                        CH {chapter.chapterNumber}. {chapter.title}
                      </h3>
                      <p className="font-designer-13r text-text-subtlest">
                        {chapter.lessons.length} lessons ·{' '}
                        {chapter.estimatedMinutes} min
                      </p>
                      <ul className="mt-100 flex flex-col gap-75">
                        {chapter.lessons.map((lesson) => (
                          <li
                            key={lesson.lessonId}
                            className="font-designer-13r flex items-center justify-between text-text-subtle"
                          >
                            <span>
                              L{lesson.order}. {lesson.title}
                            </span>
                            <span>{lesson.locked ? 'LOCKED' : 'OPEN'}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyMessage text="커리큘럼 응답이 아직 없습니다." />
            )}
          </SmokeCard>
        </section>
      </section>
    </main>
  );
}

function SmokeButton({
  children,
  isLoading,
  onClick,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="rounded-150 bg-background-brand-default px-200 py-125 font-designer-14b text-text-inverse disabled:opacity-50"
    >
      {isLoading ? '요청 중...' : children}
    </button>
  );
}

function SmokeCard({
  children,
  result,
  title,
}: {
  children: React.ReactNode;
  result: SmokeResult;
  title: string;
}) {
  return (
    <article className="rounded-250 border border-border-default bg-background-default p-250 shadow-1">
      <div className="mb-200 flex items-center justify-between gap-150">
        <h2 className="font-designer-18b text-text-default">{title}</h2>
        <StatusBadge state={result.state} />
      </div>
      {result.error && (
        <div className="mb-150 rounded-150 border border-border-error bg-background-accent-red-subtle p-150">
          <p className="font-designer-13b text-text-error">
            {result.error.status ? `${result.error.status} · ` : ''}
            {result.error.message}
          </p>
        </div>
      )}
      <div className="flex flex-col gap-150">{children}</div>
    </article>
  );
}

function StatusBadge({ state }: { state: SmokeState }) {
  return (
    <span
      className={cn(
        'rounded-500 px-125 py-50 font-designer-12b',
        state === 'success' &&
          'bg-background-accent-green-subtle text-text-success',
        state === 'error' && 'bg-background-accent-red-subtle text-text-error',
        state === 'loading' &&
          'bg-background-accent-yellow-subtle text-text-warning',
        state === 'idle' && 'bg-background-alternative text-text-subtle',
      )}
    >
      {state.toUpperCase()}
    </span>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-150 border-b border-border-subtle py-75">
      <span className="font-designer-13r text-text-subtlest">{label}</span>
      <span className="font-designer-13b text-text-default">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-150 bg-background-alternative p-150 text-center">
      <p className="font-designer-20b text-text-default">{value}</p>
      <p className="font-designer-12r text-text-subtlest">{label}</p>
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return <p className="font-designer-14r text-text-subtle">{text}</p>;
}
