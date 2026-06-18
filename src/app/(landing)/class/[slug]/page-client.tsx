'use client';

import { History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useMemo, useReducer } from 'react';
import { ClassDetailBenefitsSection } from '@/components/class/class-detail-benefits-section';
import { ClassDetailBuilderFeedSection } from '@/components/class/class-detail-builder-feed-section';
import { CHAPTERS, type Tab } from '@/components/class/class-detail-constants';
import {
  ClassDetailCurriculumSection,
  type ChapterForRoadmap,
} from '@/components/class/class-detail-curriculum-section';
import { ClassDetailDifferentiationSection } from '@/components/class/class-detail-differentiation-section';
import { ClassDetailFaqSection } from '@/components/class/class-detail-faq-section';
import { ClassDetailInstructorSection } from '@/components/class/class-detail-instructor-section';
import { ClassDetailRoadmapSection } from '@/components/class/class-detail-roadmap-section';
import { ClassDetailSidebar } from '@/components/class/class-detail-sidebar';
import { ClassDetailTabNav } from '@/components/class/class-detail-tab-nav';
import {
  canShowCourseFreeEnrollCta,
  getCourseViewerStatusLabel,
  hasCourseFullAccess,
  isCourseFreeEnrolled,
  isCoursePaidEnrolled,
} from '@/components/class/course-viewer-status';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useCreateCourseFreeEnrollment,
  useCreateStudyWithMeSubscription,
  useGetBuilderFeedShowcase,
  useGetCourseCurriculum,
  useGetCourseDetail,
  useGetMyGiftEmail,
  useRegisterGiftEmail,
} from '@/hooks/queries/course/course-queries';
import { useToastStore } from '@/stores/use-toast-store';

interface ClassDetailState {
  activeTab: Tab;
  expandedChapters: Set<number>;
  expandedFaq: number | null;
  studyWithMePhone: string;
  studyWithMeAgreed: boolean;
  giftEmail: string;
}

type ClassDetailAction =
  | { type: 'setActiveTab'; tab: Tab }
  | { type: 'toggleChapter'; index: number }
  | { type: 'toggleFaq'; index: number }
  | { type: 'setStudyWithMePhone'; value: string }
  | { type: 'setStudyWithMeAgreed'; value: boolean }
  | { type: 'resetStudyWithMe' }
  | { type: 'setGiftEmail'; value: string };

const INITIAL_CLASS_DETAIL: ClassDetailState = {
  activeTab: 'roadmap',
  expandedChapters: new Set([0]),
  expandedFaq: null,
  studyWithMePhone: '',
  studyWithMeAgreed: false,
  giftEmail: '',
};

function classDetailReducer(
  state: ClassDetailState,
  action: ClassDetailAction,
): ClassDetailState {
  switch (action.type) {
    case 'setActiveTab':
      return { ...state, activeTab: action.tab };
    case 'toggleChapter': {
      const next = new Set(state.expandedChapters);
      if (next.has(action.index)) next.delete(action.index);
      else next.add(action.index);
      return { ...state, expandedChapters: next };
    }
    case 'toggleFaq':
      return {
        ...state,
        expandedFaq: state.expandedFaq === action.index ? null : action.index,
      };
    case 'setStudyWithMePhone':
      return { ...state, studyWithMePhone: action.value };
    case 'setStudyWithMeAgreed':
      return { ...state, studyWithMeAgreed: action.value };
    case 'resetStudyWithMe':
      return { ...state, studyWithMePhone: '', studyWithMeAgreed: false };
    case 'setGiftEmail':
      return { ...state, giftEmail: action.value };
    default:
      return state;
  }
}

export default function ClassDetailPageClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [state, dispatch] = useReducer(
    classDetailReducer,
    INITIAL_CLASS_DETAIL,
  );
  const {
    activeTab,
    expandedChapters,
    expandedFaq,
    studyWithMePhone,
    studyWithMeAgreed,
    giftEmail,
  } = state;
  const showToast = useToastStore((s) => s.showToast);
  const { isAuthenticated } = useAuth();

  const { data: curriculum } = useGetCourseCurriculum(slug);
  const { data: courseDetail, refetch: refetchCourseDetail } =
    useGetCourseDetail(slug);
  const courseId = courseDetail?.courseId ?? 0;
  const { data: builderFeedShowcase } = useGetBuilderFeedShowcase(courseId);
  const createCourseFreeEnrollment = useCreateCourseFreeEnrollment();
  const createStudyWithMeSubscription = useCreateStudyWithMeSubscription();
  const canFreeEnrollFromDetail = canShowCourseFreeEnrollCta(courseDetail);
  const hasFullAccessFromDetail = hasCourseFullAccess(courseDetail);
  const viewerStatusLabel = getCourseViewerStatusLabel(courseDetail);

  const ctaLabel = (() => {
    if (createCourseFreeEnrollment.isPending) return '등록 중...';
    if (canFreeEnrollFromDetail) return '무료 코스 시작하기';
    if (isCoursePaidEnrolled(courseDetail)) return '학습하러 가기';
    if (isCourseFreeEnrolled(courseDetail)) return '학습 계속하기';
    if (hasFullAccessFromDetail) return '관리자 권한으로 보기';
    return undefined;
  })();
  const { data: myGiftEmail } = useGetMyGiftEmail({
    enabled: isAuthenticated && !!courseDetail?.isPaidEnrolled,
  });
  const registerGiftEmailMutation = useRegisterGiftEmail();

  const learningHomeHref = `/class/${slug}/home`;

  const chaptersForRoadmap = useMemo<ChapterForRoadmap[]>(() => {
    if (curriculum?.chapters && curriculum.chapters.length > 0) {
      return curriculum.chapters.map((chapter) => ({
        num: String(chapter.chapterNumber).padStart(2, '0'),
        title: chapter.title,
        desc: '',
        lessons: chapter.lessons.map((lesson) => ({
          order: lesson.order,
          title: lesson.title,
          lessonId: lesson.lessonId,
          estimatedMinutes: lesson.estimatedMinutes,
          isFree: lesson.isFree,
        })),
      }));
    }
    return CHAPTERS.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((title, index) => ({
        order: index + 1,
        title,
        lessonId: undefined as number | undefined,
        estimatedMinutes: 0,
        isFree: false,
      })),
    }));
  }, [curriculum]);

  function handleTabClick(tab: Tab) {
    dispatch({ type: 'setActiveTab', tab });
    document
      .getElementById(tab)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('링크가 복사되었어요!');
    } catch {}
  }

  async function handleStartCourse() {
    if (!courseDetail) {
      showToast('코스 정보를 불러오는 중입니다.', 'info');
      return;
    }
    if (canShowCourseFreeEnrollCta(courseDetail)) {
      try {
        await createCourseFreeEnrollment.mutateAsync(courseDetail.courseId);
        await refetchCourseDetail();
        showToast('무료 코스 등록이 완료되었어요.');
      } catch {
        showToast('무료 코스 등록 중 오류가 발생했어요.', 'error');
      }
      return;
    }
    router.push(learningHomeHref);
  }

  async function handleStudyWithMeSubmit() {
    if (!courseDetail) {
      showToast('코스 정보를 불러오는 중입니다.', 'info');
      return;
    }
    if (!studyWithMePhone.trim()) {
      showToast('전화번호를 입력해주세요.', 'error');
      return;
    }
    if (!studyWithMeAgreed) {
      showToast('개인정보 수집·이용에 동의해주세요.', 'error');
      return;
    }
    try {
      await createStudyWithMeSubscription.mutateAsync({
        courseId: courseDetail.courseId,
        request: {
          phone: studyWithMePhone.trim(),
          agreed: studyWithMeAgreed,
        },
      });
      dispatch({ type: 'resetStudyWithMe' });
      showToast('Study with Me 알림 신청이 완료되었어요.');
    } catch {
      showToast('Study with Me 알림 신청 중 오류가 발생했어요.', 'error');
    }
  }

  function handleRegisterGiftEmail() {
    if (!giftEmail.trim()) {
      showToast('이메일을 입력해주세요.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(giftEmail.trim())) {
      showToast('올바른 이메일 형식을 입력해주세요.', 'error');
      return;
    }
    registerGiftEmailMutation.mutate(
      { email: giftEmail.trim() },
      {
        onSuccess: () => {
          dispatch({ type: 'setGiftEmail', value: '' });
          showToast('Gift 이메일이 등록되었어요.');
        },
        onError: () => showToast('이메일 등록에 실패했어요.', 'error'),
      },
    );
  }

  function toggleChapter(index: number) {
    dispatch({ type: 'toggleChapter', index });
  }

  return (
    <div className="w-full pb-800">
      <div className="mx-auto max-w-page px-600 pt-600">
        <h1 className="font-designer-36b text-gray-800">
          {courseDetail?.title ?? '바이브 코딩 입문자 코스'}
        </h1>
        <div className="mt-300 flex flex-wrap gap-350">
          <div className="flex items-center gap-75">
            <svg
              viewBox="0 0 24 24"
              className="size-300 shrink-0 text-text-brand"
              fill="none"
              aria-hidden="true"
            >
              <path
                transform="translate(3.32 1.53)"
                d="M0.12 15.18C1.15 18.61 4.54 20.18 6.11 20.75L6.81 20.93C7.55 21.14 7.44 20.63 7.29 20.36C7.1 20.17 6.65 19.48 6.44 19.16C5.41 17.61 4.9 16.9 5.22 15.18C5.88 13.1 7.36 11.87 8.02 11.51C7.97 12.59 8.78 13.92 9.19 14.44C10.03 15.34 10.56 16.33 10.72 16.71C11.05 17.94 10.45 19.45 10.11 20.06C9.54 21.01 10.13 21.04 10.5 20.93C10.83 20.84 11.37 20.66 11.59 20.58C14 19.94 15.71 17.86 16.27 16.9C18.01 14.49 17.09 11.59 16.41 10.43C15.36 8.4 14.28 7.13 13.86 6.75C13.43 6.38 13.24 6.83 13.2 7.09C13.02 7.61 12.72 7.86 12.6 7.91C12.87 5.42 11.89 3.61 11.36 3.01C10.3 1.43 8.33 0.39 7.47 0.06C6.84 -0.17 6.84 0.29 6.92 0.55C7 0.93 7.05 1.77 7.06 2.14C7.01 4.25 5.9 5.82 5.35 6.34C4.21 7.19 2.81 8.59 2.26 9.18C0.2 10.9 -0.25 12.86 0.12 15.18Z"
                fill="currentColor"
              />
            </svg>
            <p className="font-designer-16m text-gray-800">
              <span className="font-designer-16b text-text-brand">
                {(courseDetail?.learnerCount ?? 0).toLocaleString()}
              </span>
              명이 함께 배우고 있어요!
            </p>
          </div>
          {courseDetail !== undefined && courseDetail.durationDays !== null ? (
            <div className="flex items-center gap-75">
              <History className="size-300 shrink-0 text-text-subtlest" />
              <p className="font-designer-16m text-gray-800">
                평균 {courseDetail.durationDays}일 소요
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <ClassDetailTabNav activeTab={activeTab} onTabClick={handleTabClick} />

      <div className="mx-auto max-w-page px-600 pt-500">
        <div className="grid grid-cols-1 items-start gap-500 lg:grid-cols-content-sidebar-360">
          <div className="min-w-0 space-y-800">
            <ClassDetailRoadmapSection />
            <ClassDetailDifferentiationSection />
            <ClassDetailBuilderFeedSection
              builderFeedShowcase={builderFeedShowcase}
            />
            <ClassDetailBenefitsSection />
            <ClassDetailCurriculumSection
              chaptersForRoadmap={chaptersForRoadmap}
              expandedChapters={expandedChapters}
              onToggleChapter={toggleChapter}
            />
            <ClassDetailInstructorSection />
            <ClassDetailFaqSection
              expandedFaq={expandedFaq}
              onToggleFaq={(idx) => dispatch({ type: 'toggleFaq', index: idx })}
            />
          </div>

          <ClassDetailSidebar
            courseDetail={courseDetail}
            isAuthenticated={isAuthenticated}
            ctaLabel={ctaLabel}
            viewerStatusLabel={viewerStatusLabel}
            isEnrolling={createCourseFreeEnrollment.isPending}
            onShare={handleShare}
            onStartCourse={handleStartCourse}
            myGiftEmail={myGiftEmail}
            giftEmail={giftEmail}
            onGiftEmailChange={(value) =>
              dispatch({ type: 'setGiftEmail', value })
            }
            onRegisterGiftEmail={handleRegisterGiftEmail}
            isRegisteringGiftEmail={registerGiftEmailMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
