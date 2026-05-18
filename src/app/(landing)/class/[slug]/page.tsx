'use client';

import { Flame, History, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useMemo, useState } from 'react';
import { ClassDetailBenefitsSection } from '@/components/pages/class/class-detail-benefits-section';
import { ClassDetailBuilderFeedSection } from '@/components/pages/class/class-detail-builder-feed-section';
import {
  CHAPTERS,
  TEAM_MESSAGES,
  type Tab,
} from '@/components/pages/class/class-detail-constants';
import {
  ClassDetailCurriculumSection,
  type ChapterForRoadmap,
} from '@/components/pages/class/class-detail-curriculum-section';
import { ClassDetailFaqSection } from '@/components/pages/class/class-detail-faq-section';
import { ClassDetailInstructorSection } from '@/components/pages/class/class-detail-instructor-section';
import { ClassDetailRoadmapSection } from '@/components/pages/class/class-detail-roadmap-section';
import { ClassDetailSidebar } from '@/components/pages/class/class-detail-sidebar';
import { ClassDetailTabNav } from '@/components/pages/class/class-detail-tab-nav';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useCreateCourseFreeEnrollment,
  useCreateStudyWithMeSubscription,
  useGetBuilderFeedShowcase,
  useGetCourseCurriculum,
  useGetCourseDetail,
  useGetMyGiftEmail,
  useRegisterGiftEmail,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('roadmap');
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([0]),
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [studyWithMePhone, setStudyWithMePhone] = useState('');
  const [studyWithMeAgreed, setStudyWithMeAgreed] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const showToast = useToastStore((state) => state.showToast);
  const { isAuthenticated } = useAuth();

  // 커리큘럼은 DB에서 가져오되, 코스가 없으면 하드코딩된 CHAPTERS로 fallback.
  const { data: curriculum } = useGetCourseCurriculum(slug);
  const { data: courseDetail } = useGetCourseDetail(slug);
  const courseId = courseDetail?.courseId ?? 0;
  const { data: builderFeedShowcase } = useGetBuilderFeedShowcase(courseId);
  const createCourseFreeEnrollment = useCreateCourseFreeEnrollment();
  const createStudyWithMeSubscription = useCreateStudyWithMeSubscription();
  const ctaLabel = (() => {
    if (createCourseFreeEnrollment.isPending) return '등록 중...';
    if (courseDetail?.viewerStatus === 'PAID') return '학습하러 가기';
    if (courseDetail?.viewerStatus === 'FREE_ENROLLED') return '학습 계속하기';
    return '무료 코스 시작하기';
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

  const instructorCards = TEAM_MESSAGES.map((msg) => ({
    team: msg.team,
    heading: msg.heading,
    body: msg.body,
    profileImageUrl: undefined as string | undefined,
  }));

  function handleTabClick(tab: Tab) {
    setActiveTab(tab);
    document
      .getElementById(tab)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('링크가 복사되었어요!');
    } catch {
      // clipboard API unavailable
    }
  }

  async function handleStartCourse() {
    if (!courseDetail) {
      showToast('코스 정보를 불러오는 중입니다.', 'info');
      return;
    }
    if (
      courseDetail.viewerStatus === 'LOGIN_ONLY' &&
      courseDetail.canFreeEnroll
    ) {
      try {
        await createCourseFreeEnrollment.mutateAsync(courseDetail.courseId);
        showToast('무료 코스 등록이 완료되었어요.');
      } catch {
        showToast('무료 코스 등록 중 오류가 발생했어요.', 'error');
        return;
      }
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
        request: { phone: studyWithMePhone.trim(), agreed: studyWithMeAgreed },
      });
      setStudyWithMePhone('');
      setStudyWithMeAgreed(false);
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
          setGiftEmail('');
          showToast('Gift 이메일이 등록되었어요.');
        },
        onError: () => showToast('이메일 등록에 실패했어요.', 'error'),
      },
    );
  }

  function toggleChapter(index: number) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="w-full pb-800">
      <div className="mx-auto max-w-page px-600 pt-600">
        <h1 className="font-designer-36b text-gray-800">
          {courseDetail?.title ?? '바이브 코딩 입문자 코스'}
        </h1>
        <div className="mt-300 flex flex-wrap gap-400">
          <div className="flex items-center gap-75">
            <Flame className="h-300 w-300 shrink-0 text-text-subtlest" />
            <p className="font-designer-16m text-gray-800">
              <span className="font-designer-16b text-text-brand">
                {(courseDetail?.learnerCount ?? 0).toLocaleString()}
              </span>
              명이 함께 배우고 있어요!
            </p>
          </div>
          {courseDetail !== undefined &&
          courseDetail.completionCount !== null ? (
            <div className="flex items-center gap-75">
              <ThumbsUp className="h-300 w-300 shrink-0 text-text-subtlest" />
              <p className="font-designer-16m text-gray-800">
                <span className="font-designer-16b">
                  {courseDetail.completionCount.toLocaleString()}
                </span>
                명 배출
              </p>
            </div>
          ) : null}
          {courseDetail !== undefined && courseDetail.durationDays !== null ? (
            <div className="flex items-center gap-75">
              <History className="h-300 w-300 shrink-0 text-text-subtlest" />
              <p className="font-designer-16m text-gray-800">
                평균 {courseDetail.durationDays}일 소요
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <ClassDetailTabNav activeTab={activeTab} onTabClick={handleTabClick} />

      <div className="mx-auto max-w-page px-600 pt-500">
        <div className="grid grid-cols-content-sidebar-360 items-start gap-500">
          <div className="min-w-0 space-y-800">
            <ClassDetailRoadmapSection />
            <ClassDetailBuilderFeedSection
              builderFeedShowcase={builderFeedShowcase}
            />
            <ClassDetailInstructorSection instructorCards={instructorCards} />
            <ClassDetailCurriculumSection
              chaptersForRoadmap={chaptersForRoadmap}
              expandedChapters={expandedChapters}
              onToggleChapter={toggleChapter}
            />
            <ClassDetailBenefitsSection />
            <ClassDetailFaqSection
              expandedFaq={expandedFaq}
              onToggleFaq={(idx) =>
                setExpandedFaq(expandedFaq === idx ? null : idx)
              }
            />
          </div>

          <ClassDetailSidebar
            courseDetail={courseDetail}
            isAuthenticated={isAuthenticated}
            ctaLabel={ctaLabel}
            isEnrolling={createCourseFreeEnrollment.isPending}
            onShare={handleShare}
            onStartCourse={handleStartCourse}
            myGiftEmail={myGiftEmail}
            giftEmail={giftEmail}
            onGiftEmailChange={setGiftEmail}
            onRegisterGiftEmail={handleRegisterGiftEmail}
            isRegisteringGiftEmail={registerGiftEmailMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
