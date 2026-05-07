'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  type ClassAdminCreateResult,
  type ClassApiError,
  type ClassCourseDetail,
  type ClassCourseSummary,
  type ClassCurriculum,
  type ClassPlan,
  type ClassPageResponse,
  createClassAdminSample,
  getClassCourseDetail,
  getClassCourses,
  getClassCurriculum,
  loginClassAdminTestMember,
  toClassApiError,
} from '@/features/class-domain-test/api/class-domain-test-api';

type SmokeState = 'idle' | 'loading' | 'success' | 'error';

interface SmokeResult {
  state: SmokeState;
  error?: ClassApiError;
}

interface ScenarioStep {
  title: string;
  description: string;
  state: SmokeState;
}

const initialSmokeResult: SmokeResult = {
  state: 'idle',
};

const initialScenarioSteps: ScenarioStep[] = [
  {
    title: '운영자 권한 준비',
    description: '로컬 test login으로 관리자 토큰을 받습니다.',
    state: 'idle',
  },
  {
    title: '테스트 클래스 생성',
    description: '운영자 API로 공개 클래스와 레슨 2개를 만듭니다.',
    state: 'idle',
  },
  {
    title: '사용자 공개 목록 확인',
    description: '방금 만든 클래스가 공개 목록에 나오는지 확인합니다.',
    state: 'idle',
  },
  {
    title: '상세/커리큘럼 확인',
    description: '상세 정보와 무료/유료 레슨 잠금 상태를 확인합니다.',
    state: 'idle',
  },
];

const viewerStatusLabel: Record<ClassCourseDetail['viewerStatus'], string> = {
  ANONYMOUS: '비로그인 사용자로 상세를 조회했습니다.',
  LOGIN_ONLY: '로그인하면 무료 등록을 시작할 수 있는 공개 클래스입니다.',
  FREE_ENROLLED: '무료 등록을 마친 사용자로 조회했습니다.',
  PAID: '결제 완료 사용자로 전체 접근 가능합니다.',
};

const booleanLabel = (value: ClassCourseDetail['freeEnrollmentAvailable']) => {
  if (value === true) {
    return '가능';
  }

  if (value === false) {
    return '불가';
  }

  return '응답 없음';
};

export default function ClassDomainTestPage() {
  const [courses, setCourses] =
    useState<ClassPageResponse<ClassCourseSummary>>();
  const [selectedSlug, setSelectedSlug] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [adminCreateResult, setAdminCreateResult] =
    useState<ClassAdminCreateResult>();
  const [detail, setDetail] = useState<ClassCourseDetail>();
  const [curriculum, setCurriculum] = useState<ClassCurriculum>();
  const [scenarioResult, setScenarioResult] =
    useState<SmokeResult>(initialSmokeResult);
  const [scenarioSteps, setScenarioSteps] =
    useState<ScenarioStep[]>(initialScenarioSteps);
  const [coursesResult, setCoursesResult] =
    useState<SmokeResult>(initialSmokeResult);
  const [detailResult, setDetailResult] =
    useState<SmokeResult>(initialSmokeResult);
  const [curriculumResult, setCurriculumResult] =
    useState<SmokeResult>(initialSmokeResult);
  const [adminResult, setAdminResult] =
    useState<SmokeResult>(initialSmokeResult);

  const updateScenarioStep = useCallback(
    (stepIndex: number, state: SmokeState) => {
      setScenarioSteps((currentSteps) =>
        currentSteps.map((step, index) =>
          index === stepIndex ? { ...step, state } : step,
        ),
      );
    },
    [],
  );

  const resetReadResults = useCallback(() => {
    setDetail(undefined);
    setCurriculum(undefined);
    setDetailResult(initialSmokeResult);
    setCurriculumResult(initialSmokeResult);
  }, []);

  const loadCourses = useCallback(async () => {
    setCoursesResult({ state: 'loading', error: undefined });
    resetReadResults();

    try {
      const nextCourses = await getClassCourses();
      const firstSlug = nextCourses.content.at(0)?.slug ?? '';
      setCourses(nextCourses);
      setSelectedSlug((currentSlug) => currentSlug || firstSlug);
      setCoursesResult({ state: 'success', error: undefined });
    } catch (error) {
      setCoursesResult({ state: 'error', error: toClassApiError(error) });
    }
  }, [resetReadResults]);

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

  const runPublicReadSmoke = useCallback(async () => {
    setCoursesResult({ state: 'loading', error: undefined });
    resetReadResults();

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
            message: '조회된 OPEN 코스가 없어 상세 조회를 건너뜁니다.',
          },
        });
        return;
      }

      setDetailResult({ state: 'loading', error: undefined });
      setCurriculumResult({ state: 'loading', error: undefined });
      const [nextDetail, nextCurriculum] = await Promise.all([
        getClassCourseDetail(firstSlug),
        getClassCurriculum(firstSlug),
      ]);
      setDetail(nextDetail);
      setCurriculum(nextCurriculum);
      setDetailResult({ state: 'success', error: undefined });
      setCurriculumResult({ state: 'success', error: undefined });
    } catch (error) {
      const apiError = toClassApiError(error);
      setCoursesResult({ state: 'error', error: apiError });
      setDetailResult((current) =>
        current.state === 'loading'
          ? { state: 'error', error: apiError }
          : current,
      );
      setCurriculumResult((current) =>
        current.state === 'loading'
          ? { state: 'error', error: apiError }
          : current,
      );
    }
  }, [resetReadResults]);

  const loginAdmin = useCallback(async () => {
    setAdminResult({ state: 'loading', error: undefined });

    try {
      const accessToken = await loginClassAdminTestMember();
      setAdminToken(accessToken);
      setAdminResult({ state: 'success', error: undefined });
    } catch (error) {
      setAdminResult({ state: 'error', error: toClassApiError(error) });
    }
  }, []);

  const createAdminSample = useCallback(async () => {
    if (!adminToken) {
      setAdminResult({
        state: 'error',
        error: { message: '먼저 운영자 테스트 로그인을 실행하세요.' },
      });
      return;
    }

    setAdminResult({ state: 'loading', error: undefined });

    try {
      const result = await createClassAdminSample(adminToken);
      setAdminCreateResult(result);
      setSelectedSlug(result.slug);
      setAdminResult({ state: 'success', error: undefined });
      await loadCourses();
    } catch (error) {
      setAdminResult({ state: 'error', error: toClassApiError(error) });
    }
  }, [adminToken, loadCourses]);

  const runLocalScenario = useCallback(async () => {
    setScenarioResult({ state: 'loading', error: undefined });
    setScenarioSteps(initialScenarioSteps);
    setAdminResult(initialSmokeResult);
    setCoursesResult(initialSmokeResult);
    resetReadResults();

    try {
      updateScenarioStep(0, 'loading');
      setAdminResult({ state: 'loading', error: undefined });
      const accessToken = await loginClassAdminTestMember();
      setAdminToken(accessToken);
      updateScenarioStep(0, 'success');

      updateScenarioStep(1, 'loading');
      const created = await createClassAdminSample(accessToken);
      setAdminCreateResult(created);
      setSelectedSlug(created.slug);
      setAdminResult({ state: 'success', error: undefined });
      updateScenarioStep(1, 'success');

      updateScenarioStep(2, 'loading');
      setCoursesResult({ state: 'loading', error: undefined });
      const nextCourses = await getClassCourses();
      setCourses(nextCourses);
      setCoursesResult({ state: 'success', error: undefined });
      updateScenarioStep(2, 'success');

      updateScenarioStep(3, 'loading');
      setDetailResult({ state: 'loading', error: undefined });
      setCurriculumResult({ state: 'loading', error: undefined });
      const [nextDetail, nextCurriculum] = await Promise.all([
        getClassCourseDetail(created.slug),
        getClassCurriculum(created.slug),
      ]);
      setDetail(nextDetail);
      setCurriculum(nextCurriculum);
      setDetailResult({ state: 'success', error: undefined });
      setCurriculumResult({ state: 'success', error: undefined });
      updateScenarioStep(3, 'success');
      setScenarioResult({ state: 'success', error: undefined });
    } catch (error) {
      const apiError = toClassApiError(error);
      setScenarioResult({ state: 'error', error: apiError });
      setAdminResult((current) =>
        current.state === 'loading'
          ? { state: 'error', error: apiError }
          : current,
      );
      setCoursesResult((current) =>
        current.state === 'loading'
          ? { state: 'error', error: apiError }
          : current,
      );
      setDetailResult((current) =>
        current.state === 'loading'
          ? { state: 'error', error: apiError }
          : current,
      );
      setCurriculumResult((current) =>
        current.state === 'loading'
          ? { state: 'error', error: apiError }
          : current,
      );
      setScenarioSteps((currentSteps) =>
        currentSteps.map((step) =>
          step.state === 'loading' ? { ...step, state: 'error' } : step,
        ),
      );
    }
  }, [resetReadResults, updateScenarioStep]);

  const primaryCourse = detail ?? courses?.content.at(0);
  const heroTitle =
    detail?.title ?? primaryCourse?.title ?? '바이브코딩 입문자 클래스';
  const heroDescription =
    detail?.description ??
    '실제 v0.6 화면 흐름처럼 코스 랜딩, 상세 결제 카드, 학습 여정, 레슨 미리보기를 한 화면에서 확인합니다.';
  const visiblePlans = detail?.plans ?? [];
  const firstChapter = curriculum?.chapters.at(0);
  const firstLesson = firstChapter?.lessons.at(0);
  const paidLesson =
    firstChapter?.lessons.find((lesson) => lesson.locked) ??
    firstChapter?.lessons.at(1);

  return (
    <main className="min-h-screen bg-background-alternative text-text-default">
      <section className="mx-auto flex w-full max-w-screen-xl flex-col gap-300 px-300 py-300">
        <header className="rounded-300 border border-border-default bg-background-default p-300 shadow-2">
          <div className="flex flex-col gap-200 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-screen-md">
              <p className="font-designer-14b text-text-brand">
                CLASS v0.6 LOCAL E2E
              </p>
              <h1 className="font-designer-32b mt-75 text-text-default">
                화면맵 흐름대로 클래스 기능을 눌러보기
              </h1>
              <p className="font-designer-15r mt-100 text-text-subtle">
                이 페이지는 개발자용 JSON 확인 화면이 아니라, v0.6 screen-map의
                주요 화면을 얕게 재현한 로컬 검증용 미니 프론트입니다. 아래 버튼
                하나로 데이터를 만들고, 랜딩 → 코스상세 → 학습여정 → 레슨
                미리보기 구조에서 결과를 확인합니다.
              </p>
            </div>
            <SmokeButton
              variant="primary"
              onClick={runLocalScenario}
              isLoading={scenarioResult.state === 'loading'}
            >
              로컬 데이터 만들고 화면 채우기
            </SmokeButton>
          </div>
          {scenarioResult.error && (
            <ErrorMessage error={scenarioResult.error} className="mt-150" />
          )}
          <div className="mt-200 grid gap-100 md:grid-cols-4">
            {scenarioSteps.map((step, index) => (
              <ScenarioStepCard
                key={step.title}
                step={index + 1}
                title={step.title}
                description={step.description}
                state={step.state}
              />
            ))}
          </div>
        </header>

        <section className="grid gap-200 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-300 border border-border-default bg-background-default p-300 shadow-2">
            <div className="grid gap-250 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex flex-col gap-175">
                <div className="flex flex-wrap gap-75">
                  <span className="rounded-500 bg-background-accent-rose-subtle px-125 py-50 font-designer-12b text-text-brand">
                    S-코스상세-A
                  </span>
                  <span className="rounded-500 bg-background-alternative px-125 py-50 font-designer-12b text-text-subtle">
                    A-02 상세/가격
                  </span>
                </div>
                <h2 className="font-designer-36b text-text-default">
                  {heroTitle}
                </h2>
                <p className="font-designer-16r text-text-subtle">
                  {heroDescription}
                </p>
                <div className="grid gap-100 md:grid-cols-3">
                  <Metric
                    label="완주 예상일"
                    value={curriculum?.durationDays ?? 5}
                  />
                  <Metric label="챕터" value={curriculum?.totalChapters ?? 5} />
                  <Metric label="레슨" value={curriculum?.totalLessons ?? 20} />
                </div>
                <div className="rounded-250 bg-background-alternative p-200">
                  <p className="font-designer-14b text-text-default">
                    이런 분들이 들으면 좋아요
                  </p>
                  <div className="mt-125 grid gap-100 md:grid-cols-3">
                    {[
                      '처음 웹서비스를 만드는 입문자',
                      'AI 도구를 실전 프로젝트에 쓰고 싶은 사람',
                      '혼자 막히지 않고 완주하고 싶은 사람',
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-150 bg-background-default p-150 font-designer-13r text-text-subtle"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="rounded-250 border-2 border-border-brand bg-background-default p-200 shadow-2">
                <p className="font-designer-14b text-text-brand">
                  얼리버드 플랜
                </p>
                <div className="mt-150 flex flex-col gap-125">
                  {visiblePlans.length > 0 ? (
                    visiblePlans.map((plan) => (
                      <PlanCard key={plan.planCode} plan={plan} />
                    ))
                  ) : (
                    <EmptyMessage text="상세 조회 후 가격 플랜이 표시됩니다." />
                  )}
                </div>
                <div className="mt-175 flex flex-col gap-100">
                  <button
                    type="button"
                    className="rounded-150 bg-background-brand-default px-200 py-150 font-designer-15b text-text-inverse"
                  >
                    참가하기
                  </button>
                  <button
                    type="button"
                    className="rounded-150 border border-border-default px-200 py-150 font-designer-15b text-text-default"
                  >
                    무료 코스 시작하기
                  </button>
                </div>
                {detail && (
                  <p className="font-designer-12r mt-125 text-text-subtlest">
                    현재 상태: {viewerStatusLabel[detail.viewerStatus]}
                  </p>
                )}
              </aside>
            </div>
          </article>

          <aside className="flex flex-col gap-150 rounded-300 border border-border-default bg-background-default p-250 shadow-1">
            <div>
              <p className="font-designer-14b text-text-brand">테스트 조작</p>
              <h2 className="font-designer-20b text-text-default">
                무엇을 누르면 되나요?
              </h2>
              <p className="font-designer-13r mt-75 text-text-subtle">
                처음에는 위의 큰 버튼만 누르세요. 실패하면 아래 개별 버튼으로
                어느 API 단계가 막혔는지 확인합니다.
              </p>
            </div>
            <SmokeButton
              onClick={runPublicReadSmoke}
              isLoading={coursesResult.state === 'loading'}
            >
              공개 목록/상세/커리큘럼 다시 조회
            </SmokeButton>
            <SmokeButton
              onClick={loginAdmin}
              isLoading={adminResult.state === 'loading'}
            >
              운영자 로그인만 실행
            </SmokeButton>
            <SmokeButton
              onClick={createAdminSample}
              isLoading={adminResult.state === 'loading'}
            >
              코스+레슨 생성만 실행
            </SmokeButton>
            <label className="flex flex-col gap-75">
              <span className="font-designer-13b text-text-subtle">
                직접 확인할 slug
              </span>
              <input
                value={selectedSlug}
                onChange={(event) => setSelectedSlug(event.target.value)}
                className="rounded-150 border border-border-default bg-background-default px-150 py-100 font-designer-14r text-text-default"
                placeholder="예: vibe-coding-intro"
              />
            </label>
            <div className="flex gap-100">
              <SmokeButton
                onClick={loadDetail}
                isLoading={detailResult.state === 'loading'}
              >
                상세
              </SmokeButton>
              <SmokeButton
                onClick={loadCurriculum}
                isLoading={curriculumResult.state === 'loading'}
              >
                커리큘럼
              </SmokeButton>
            </div>
            {adminCreateResult && (
              <ContractNote
                title="생성 완료"
                description={`courseId ${adminCreateResult.courseId}, lesson ${adminCreateResult.lessonIds.length}개가 생성됐습니다.`}
              />
            )}
          </aside>
        </section>

        <section className="grid gap-200 lg:grid-cols-3">
          <ScreenCard
            screenId="S-코스목록"
            title="클래스 목록"
            subtitle="A-01 공개 코스 목록"
            result={coursesResult}
          >
            <div className="flex flex-col gap-100">
              {courses?.content.map((course) => (
                <button
                  key={course.courseId}
                  type="button"
                  onClick={() => setSelectedSlug(course.slug)}
                  className={cn(
                    'rounded-200 border p-150 text-left',
                    selectedSlug === course.slug
                      ? 'border-border-brand bg-background-accent-rose-subtle'
                      : 'border-border-default bg-background-default',
                  )}
                >
                  <p className="font-designer-15b text-text-default">
                    {course.title}
                  </p>
                  <p className="font-designer-13r mt-50 break-all text-text-subtle">
                    {course.slug}
                  </p>
                  <p className="font-designer-12b mt-75 text-text-brand">
                    자세히 보기
                  </p>
                </button>
              ))}
              {courses && courses.content.length === 0 && (
                <EmptyMessage text="OPEN 클래스가 없습니다." />
              )}
              {!courses && (
                <EmptyMessage text="큰 버튼을 누르면 코스 카드가 표시됩니다." />
              )}
            </div>
          </ScreenCard>

          <ScreenCard
            screenId="S-학습여정-무료/결제자"
            title="학습 여정 맵"
            subtitle="A-03/A-06 형태 미리보기"
            result={curriculumResult}
          >
            <div className="rounded-200 bg-background-accent-green-subtle p-150">
              <p className="font-designer-14b text-text-success">
                한 레슨씩, 순서대로 따라가면 됩니다
              </p>
              <p className="font-designer-13r mt-50 text-text-subtle">
                {detail?.viewerStatus === 'PAID'
                  ? '결제자 화면에서는 전체 레슨이 열립니다.'
                  : '무료 화면에서는 첫 레슨 이후 결제 CTA가 노출됩니다.'}
              </p>
            </div>
            <div className="mt-150 flex flex-col gap-100">
              {firstChapter?.lessons.map((lesson, index) => (
                <div
                  key={lesson.lessonId}
                  className="flex items-center gap-100 rounded-150 bg-background-alternative p-125"
                >
                  <span
                    className={cn(
                      'flex h-250 w-250 items-center justify-center rounded-full font-designer-12b',
                      lesson.locked
                        ? 'bg-background-default text-text-subtlest'
                        : 'bg-background-brand-default text-text-inverse',
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-designer-14b text-text-default">
                      Lesson {lesson.order}. {lesson.title}
                    </p>
                    <p className="font-designer-12r text-text-subtle">
                      {lesson.locked
                        ? '잠김 · 결제 후 열림'
                        : '무료 공개 · 바로 시작 가능'}
                    </p>
                  </div>
                </div>
              )) ?? (
                <EmptyMessage text="커리큘럼 조회 후 여정 노드가 표시됩니다." />
              )}
            </div>
          </ScreenCard>

          <ScreenCard
            screenId="S-레슨상세/돌아보기"
            title="레슨 진입 미리보기"
            subtitle="A-05/B-01 화면 감각"
            result={curriculumResult}
          >
            <div className="rounded-200 bg-background-default p-150 shadow-1">
              <p className="font-designer-12b text-text-brand">NEXT LESSON</p>
              <h3 className="font-designer-18b mt-50 text-text-default">
                {firstLesson
                  ? `Lesson ${firstLesson.order}. ${firstLesson.title}`
                  : 'Lesson 01. 무료 첫 레슨'}
              </h3>
              <div className="mt-125 rounded-200 bg-background-alternative p-200 text-center font-designer-14b text-text-subtle">
                비디오/실습 영역
              </div>
            </div>
            <div className="rounded-200 border border-border-default bg-background-default p-150">
              <p className="font-designer-14b text-text-default">
                클래스 돌아보기
              </p>
              <p className="font-designer-13r mt-50 text-text-subtle">
                오늘 가장 신기했던 코드와 막혔던 지점을 작성하고 다음 레슨으로
                넘어갑니다.
              </p>
            </div>
            {paidLesson && (
              <ContractNote
                title="잠금 정책 확인"
                description={`${paidLesson.title}은 ${paidLesson.locked ? '잠김 상태' : '열림 상태'}로 내려왔습니다.`}
              />
            )}
          </ScreenCard>
        </section>

        <section className="grid gap-200 lg:grid-cols-2">
          <SmokeCard
            title="상세 API가 화면에 반영한 판단"
            endpoint="GET /api/v1/courses/{slug}"
            result={detailResult}
            verifies="viewerStatus, 무료 등록, 구매 가능 여부, 플랜 가격이 실제 화면 카드에 반영되는지 확인합니다."
          >
            {detail ? (
              <div className="flex flex-col gap-75">
                <KeyValue
                  label="사용자 접근 상태"
                  value={viewerStatusLabel[detail.viewerStatus]}
                />
                <KeyValue
                  label="무료 등록"
                  value={booleanLabel(detail.freeEnrollmentAvailable)}
                />
                <KeyValue
                  label="구매"
                  value={booleanLabel(detail.purchaseAvailable)}
                />
                <KeyValue
                  label="가격 플랜 수"
                  value={`${detail.plans?.length ?? 0}개`}
                />
              </div>
            ) : (
              <EmptyMessage text="상세 조회 후 판단 결과가 표시됩니다." />
            )}
          </SmokeCard>

          <SmokeCard
            title="운영자 생성 smoke"
            endpoint="POST /admin/courses → POST /admin/courses/{courseId}/lessons"
            result={adminResult}
            verifies="로컬 백엔드에서 운영자 API로 화면 검증용 코스와 레슨을 직접 만들 수 있는지 확인합니다."
          >
            {adminCreateResult ? (
              <div className="grid gap-100 md:grid-cols-3">
                <Metric label="courseId" value={adminCreateResult.courseId} />
                <Metric
                  label="lesson"
                  value={adminCreateResult.lessonIds.length}
                />
                <div className="rounded-150 bg-background-alternative p-150">
                  <p className="font-designer-12r text-text-subtlest">slug</p>
                  <p className="font-designer-13b break-all text-text-default">
                    {adminCreateResult.slug}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyMessage text="로컬 데이터 만들기 버튼을 누르면 생성 결과가 표시됩니다." />
            )}
          </SmokeCard>
        </section>
      </section>
    </main>
  );
}

function ScenarioStepCard({
  description,
  state,
  step,
  title,
}: {
  description: string;
  state: SmokeState;
  step: number;
  title: string;
}) {
  return (
    <div
      className={cn(
        'rounded-150 border p-150',
        state === 'success' &&
          'border-border-success bg-background-accent-green-subtle',
        state === 'error' &&
          'border-border-error bg-background-accent-red-subtle',
        state === 'loading' &&
          'border-border-warning bg-background-accent-yellow-subtle',
        state === 'idle' && 'border-border-default bg-background-alternative',
      )}
    >
      <div className="flex items-center justify-between gap-100">
        <p className="font-designer-12b text-text-brand">STEP {step}</p>
        <StatusBadge state={state} />
      </div>
      <h3 className="font-designer-15b mt-75 text-text-default">{title}</h3>
      <p className="font-designer-13r mt-50 text-text-subtle">{description}</p>
    </div>
  );
}

function ContractNote({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-150 bg-background-accent-green-subtle p-150">
      <p className="font-designer-13b text-text-success">{title}</p>
      <p className="font-designer-13r mt-50 text-text-subtle">{description}</p>
    </div>
  );
}

function PlanCard({ plan }: { plan: ClassPlan }) {
  return (
    <div className="rounded-200 border border-border-default bg-background-alternative p-150">
      <div className="flex items-start justify-between gap-100">
        <div>
          <p className="font-designer-15b text-text-default">{plan.name}</p>
          {plan.subtitle && (
            <p className="font-designer-12r mt-50 text-text-subtle">
              {plan.subtitle}
            </p>
          )}
        </div>
        <p className="font-designer-18b text-text-brand">
          {(
            plan.earlyBirdPrice ??
            plan.regularPriceAfterEb ??
            0
          ).toLocaleString()}
          원
        </p>
      </div>
      <ul className="mt-125 flex flex-col gap-50">
        {plan.items.map((item) => (
          <li
            key={item.code}
            className="font-designer-12r flex items-center justify-between gap-100 text-text-subtle"
          >
            <span>{item.label}</span>
            <span>{item.valueAmount.toLocaleString()}원 가치</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScreenCard({
  children,
  result,
  screenId,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  result: SmokeResult;
  screenId: string;
  subtitle: string;
  title: string;
}) {
  return (
    <article className="rounded-300 border border-border-default bg-background-default p-250 shadow-1">
      <div className="mb-175 flex items-start justify-between gap-150">
        <div>
          <p className="font-designer-12b text-text-brand">{screenId}</p>
          <h2 className="font-designer-20b mt-50 text-text-default">{title}</h2>
          <p className="font-designer-13r mt-50 text-text-subtle">{subtitle}</p>
        </div>
        <StatusBadge state={result.state} />
      </div>
      <div className="flex flex-col gap-150">{children}</div>
      {result.error && <ErrorMessage error={result.error} className="mt-150" />}
    </article>
  );
}

function SmokeButton({
  children,
  isLoading,
  onClick,
  variant = 'secondary',
}: {
  children: React.ReactNode;
  isLoading: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'rounded-150 bg-background-brand-default font-designer-14b text-text-inverse disabled:opacity-50',
        variant === 'primary' && 'px-300 py-175 shadow-2',
        variant === 'secondary' && 'px-200 py-125',
      )}
    >
      {isLoading ? '요청 중...' : children}
    </button>
  );
}

function SmokeCard({
  children,
  endpoint,
  result,
  title,
  verifies,
}: {
  children: React.ReactNode;
  endpoint?: string;
  result: SmokeResult;
  title: string;
  verifies?: string;
}) {
  return (
    <article className="rounded-250 border border-border-default bg-background-default p-250 shadow-1">
      <div className="mb-150 flex items-start justify-between gap-150">
        <div className="flex flex-col gap-50">
          <h2 className="font-designer-18b text-text-default">{title}</h2>
          {endpoint && (
            <code className="font-designer-12r break-all text-text-subtlest">
              {endpoint}
            </code>
          )}
        </div>
        <StatusBadge state={result.state} />
      </div>
      {verifies && (
        <p className="font-designer-13r mb-150 text-text-subtle">
          확인 내용: {verifies}
        </p>
      )}
      {result.error && <ErrorMessage error={result.error} className="mb-150" />}
      <div className="flex flex-col gap-150">{children}</div>
    </article>
  );
}

function ErrorMessage({
  className,
  error,
}: {
  className?: string;
  error: ClassApiError;
}) {
  return (
    <div
      className={cn(
        'rounded-150 border border-border-error bg-background-accent-red-subtle p-150',
        className,
      )}
    >
      <p className="font-designer-13b text-text-error">
        {error.status ? `${error.status} · ` : ''}
        {error.message}
      </p>
    </div>
  );
}

function StatusBadge({ state }: { state: SmokeState }) {
  return (
    <span
      className={cn(
        'rounded-500 px-125 py-50 font-designer-12b shrink-0 whitespace-nowrap',
        state === 'success' &&
          'bg-background-accent-green-subtle text-text-success',
        state === 'error' && 'bg-background-accent-red-subtle text-text-error',
        state === 'loading' &&
          'bg-background-accent-yellow-subtle text-text-warning',
        state === 'idle' && 'bg-background-alternative text-text-subtle',
      )}
    >
      {state === 'idle' && '대기'}
      {state === 'loading' && '요청 중'}
      {state === 'success' && '성공'}
      {state === 'error' && '실패'}
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
