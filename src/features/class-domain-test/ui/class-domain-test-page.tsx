'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  type ClassAdminCreateResult,
  type ClassApiError,
  type ClassCourseDetail,
  type ClassCourseSummary,
  type ClassCurriculum,
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

  return (
    <main className="bg-background-alternative min-h-screen w-full px-300 py-400">
      <section className="mx-auto flex w-full max-w-screen-xl flex-col gap-250">
        <header className="rounded-250 border border-border-default bg-background-default p-300 shadow-2">
          <p className="font-designer-14b text-text-brand">LOCAL CLASS TEST</p>
          <h1 className="font-designer-28b text-text-default">
            클래스 기능이 연결됐는지 확인하기
          </h1>
          <p className="font-designer-15r mt-100 text-text-subtle">
            이 화면은 실제 운영자 화면이 아닙니다. 로컬 테스트용으로 클래스와
            레슨을 하나 만들고, 그 클래스가 사용자 공개 API에서 보이는지
            확인합니다. 처음 보는 사람은 아래 큰 버튼 하나만 누르면 됩니다.
          </p>
        </header>

        <section className="rounded-250 border-2 border-border-brand bg-background-default p-300 shadow-2">
          <div className="flex flex-col gap-150 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-designer-14b text-text-brand">
                가장 쉬운 사용법
              </p>
              <h2 className="font-designer-24b mt-50 text-text-default">
                1번 버튼만 누르세요
              </h2>
              <p className="font-designer-14r mt-75 text-text-subtle">
                자동으로 관리자 로그인, 클래스 생성, 공개 목록 조회,
                상세/커리큘럼 조회를 순서대로 실행합니다. 네 단계가 모두 초록색
                성공이면 테스트 통과입니다.
              </p>
            </div>
            <SmokeButton
              variant="primary"
              onClick={runLocalScenario}
              isLoading={scenarioResult.state === 'loading'}
            >
              1번: 자동 테스트 시작
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
          {scenarioResult.state === 'success' && adminCreateResult && (
            <div className="mt-200 rounded-150 bg-background-accent-green-subtle p-150">
              <p className="font-designer-15b text-text-success">
                테스트 완료: 방금 만든 클래스가 공개 API에서 조회됩니다.
              </p>
              <p className="font-designer-13r mt-50 break-all text-text-subtle">
                생성된 slug: {adminCreateResult.slug}
              </p>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-150">
          <div>
            <p className="font-designer-14b text-text-brand">세부 결과</p>
            <h2 className="font-designer-22b text-text-default">
              자동 테스트가 실제로 확인한 내용
            </h2>
          </div>
          <SmokeCard
            title="운영자 데이터 만들기"
            endpoint="POST /growth/test/login → POST /admin/courses → POST /admin/courses/{courseId}/lessons"
            result={adminResult}
            verifies="관리자 권한으로 테스트용 공개 클래스와 무료/유료 레슨을 만들 수 있는지 확인합니다."
          >
            <div className="flex flex-wrap gap-100">
              <SmokeButton
                onClick={loginAdmin}
                isLoading={adminResult.state === 'loading'}
              >
                수동: 운영자 로그인
              </SmokeButton>
              <SmokeButton
                onClick={createAdminSample}
                isLoading={adminResult.state === 'loading'}
              >
                수동: 코스+레슨 생성
              </SmokeButton>
            </div>
            <p className="font-designer-13r text-text-subtle">
              자동 테스트가 실패했을 때만 개별 버튼으로 어느 단계가 문제인지
              확인하세요. accessToken은 화면에 노출하지 않습니다.
            </p>
            {adminCreateResult && (
              <div className="grid gap-100 md:grid-cols-3">
                <Metric
                  label="생성된 courseId"
                  value={adminCreateResult.courseId}
                />
                <Metric
                  label="생성된 레슨 수"
                  value={adminCreateResult.lessonIds.length}
                />
                <div className="rounded-150 bg-background-alternative p-150">
                  <p className="font-designer-12r text-text-subtlest">slug</p>
                  <p className="font-designer-13b break-all text-text-default">
                    {adminCreateResult.slug}
                  </p>
                </div>
              </div>
            )}
          </SmokeCard>

          <section className="grid gap-200 lg:grid-cols-3">
            <SmokeCard
              title="공개 목록 확인"
              endpoint="GET /api/v1/courses?status=OPEN&page=0&size=20"
              result={coursesResult}
              verifies="방금 만든 OPEN 클래스가 사용자 공개 목록에 노출되는지 확인합니다."
            >
              <div className="flex flex-wrap gap-100">
                <SmokeButton
                  onClick={runPublicReadSmoke}
                  isLoading={coursesResult.state === 'loading'}
                >
                  수동: 공개 조회 전체 실행
                </SmokeButton>
                <SmokeButton
                  onClick={loadCourses}
                  isLoading={coursesResult.state === 'loading'}
                >
                  수동: 목록만 조회
                </SmokeButton>
              </div>
              <label className="flex flex-col gap-75">
                <span className="font-designer-13b text-text-subtle">
                  테스트할 클래스 slug
                </span>
                <input
                  value={selectedSlug}
                  onChange={(event) => setSelectedSlug(event.target.value)}
                  className="rounded-150 border border-border-default bg-background-default px-150 py-100 font-designer-14r text-text-default"
                  placeholder="자동 테스트를 실행하면 자동으로 채워집니다"
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
                  총 {courses.totalElements}개 OPEN 클래스 · 현재 page{' '}
                  {courses.page} · 다음 페이지{' '}
                  {courses.hasNext ? '있음' : '없음'}
                </p>
              )}
            </SmokeCard>

            <SmokeCard
              title="상세 확인"
              endpoint="GET /api/v1/courses/{slug}"
              result={detailResult}
              verifies="선택한 slug의 제목, 설명, 무료 등록 가능 여부, 구매 가능 여부가 내려오는지 확인합니다."
            >
              <SmokeButton
                onClick={loadDetail}
                isLoading={detailResult.state === 'loading'}
              >
                수동: 선택 slug 상세 조회
              </SmokeButton>
              {detail ? (
                <div className="flex flex-col gap-100">
                  <h2 className="font-designer-22b text-text-default">
                    {detail.title}
                  </h2>
                  <p className="font-designer-14r text-text-subtle">
                    {detail.description}
                  </p>
                  <ContractNote
                    title="상세 조회 성공 의미"
                    description="공개 slug로 접근 가능하고, 사용자에게 보여줄 가격/등록 상태 판단이 내려왔다는 뜻입니다."
                  />
                  <KeyValue
                    label="사용자 접근 상태"
                    value={viewerStatusLabel[detail.viewerStatus]}
                  />
                  <KeyValue label="courseId" value={String(detail.courseId)} />
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
                <EmptyMessage text="자동 테스트를 실행하면 상세 결과가 여기에 표시됩니다." />
              )}
            </SmokeCard>

            <SmokeCard
              title="커리큘럼 확인"
              endpoint="GET /api/v1/courses/{slug}/curriculum"
              result={curriculumResult}
              verifies="무료 레슨은 열려 있고 유료 레슨은 잠겨 있는지, 챕터/레슨 수가 맞는지 확인합니다."
            >
              <SmokeButton
                onClick={loadCurriculum}
                isLoading={curriculumResult.state === 'loading'}
              >
                수동: 선택 slug 커리큘럼 조회
              </SmokeButton>
              {curriculum ? (
                <div className="flex flex-col gap-150">
                  <div className="grid grid-cols-3 gap-100">
                    <Metric label="챕터 수" value={curriculum.totalChapters} />
                    <Metric label="레슨 수" value={curriculum.totalLessons} />
                    <Metric label="진행 일수" value={curriculum.durationDays} />
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
                          {chapter.lessons.length}개 레슨 · 예상{' '}
                          {chapter.estimatedMinutes}분
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
                              <span>
                                {lesson.locked ? '잠김' : '무료 공개'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyMessage text="자동 테스트를 실행하면 커리큘럼 결과가 여기에 표시됩니다." />
              )}
            </SmokeCard>
          </section>
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
