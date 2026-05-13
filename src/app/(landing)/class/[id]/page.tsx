'use client';

import {
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageSquare,
  Share2,
  UserRound,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, use, useMemo, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { BenefitScrollCharacter } from '@/components/pages/class/benefit-scroll-character';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useCreateCourseFreeEnrollment,
  useCreateStudyWithMeSubscription,
  useGetBuilderFeedShowcase,
  useGetCourseCurriculum,
  useGetCourseDetail,
  useGetCourseList,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
);

type Tab = 'roadmap' | 'builder-feed' | 'curriculum' | 'benefits' | 'faq';

const TABS: { id: Tab; label: string }[] = [
  { id: 'roadmap', label: '로드맵 소개' },
  { id: 'builder-feed', label: '빌더 피드' },
  { id: 'curriculum', label: '커리큘럼' },
  { id: 'benefits', label: '혜택' },
  { id: 'faq', label: 'FAQ' },
];

const TARGET_AUDIENCE = [
  {
    title: '코딩 쌩초보',
    desc: '코드 한 줄 몰라도 AI와 대화하며\n완성하는 첫 웹사이트',
  },
  {
    title: '기획자',
    desc: '개발자와의 소통 장벽을\n허무는 가장 빠른 방법',
  },
  {
    title: '디자이너',
    desc: '피그마 시안을 실제 움직이는\n웹으로 만드는 경험',
  },
  {
    title: '바이브 코딩 관심자',
    desc: "AI와 함께라면 5일 만에\n첫 배포까지 '무조건' 성공",
  },
  {
    title: '1인 창업가',
    desc: '외주 없이 내 손으로\n직접 만드는 랜딩페이지',
  },
  {
    title: '직장인',
    desc: '퇴근 후 1시간, 나만의\n기술 자산을 쌓는 짜릿한 성취감',
  },
];

const TEAM_MESSAGES = [
  {
    team: 'ZERO-ONE 기획팀',
    heading: '"바이브 코딩, 해보고 싶은데 뭐부터 해야 할지 모르겠다"',
    body: 'ZERO-ONE 바이브코딩 입문자 클래스는\n그 질문에서부터 시작했어요.',
  },
  {
    team: 'ZERO-ONE 엔지니어링팀',
    heading: '코스를 따라만 가도 바이브 코딩을 할 수 있게끔 고민했어요.',
    body: '우리도 처음엔 까만 터미널 앞에서 얼어붙었던 사람들이었어요.\n그때 겪은 시행착오를 압축해서 이 코스에 담았습니다.',
  },
  {
    team: 'ZERO-ONE 운영팀',
    heading: '혼자가 아닌 디스코드에서 함께 공부하며 동기부여 받아요.',
    body: '입문자분들을 위해 디스코드에서 모여 공부하는 시스템으로\n함께의 가치를 드리고 싶습니다.',
  },
];

const CHAPTERS = [
  {
    num: '01',
    title: '바이브 코딩이란?',
    desc: '바이브 코딩이란 무엇인지, 왜 이걸 만드는 건지 과정을 알아가는 시간입니다.',
    lessons: ['가나다라마바사아자차카타파하', '가나다라마바사아자차카타파하'],
  },
  {
    num: '02',
    title: '바이브 코딩이란?',
    desc: '바이브 코딩이란 무엇인지, 왜 이걸 만드는 건지 과정을 알아가는 시간입니다.',
    lessons: [],
  },
  {
    num: '03',
    title: '바이브 코딩이란?',
    desc: '바이브 코딩이란 무엇인지, 왜 이걸 만드는 건지 과정을 알아가는 시간입니다.',
    lessons: [],
  },
];

const FAQS = [
  {
    question: '코딩을 전혀 몰라도 들을 수 있나요?',
    answer:
      '네, 이 코스는 코딩 경험이 전혀 없는 분들을 위해 설계되었어요. 기초부터 차근차근 알려드립니다.',
  },
  {
    question: '수강 기간은 얼마나 되나요?',
    answer:
      '수강 기간은 별도 제한 없이 커리큘럼을 모두 완료할 때까지 자유롭게 학습하실 수 있어요.',
  },
  {
    question: '결제 후 환불이 가능한가요?',
    answer:
      '결제 후 7일 이내, 강의 진도율 20% 미만인 경우 전액 환불 가능합니다.',
  },
  {
    question: '강의는 어떤 방식으로 진행되나요?',
    answer:
      '영상 강의와 실습 과제를 병행하며, 디스코드를 통해 멘토와 다른 수강생들과 소통할 수 있어요.',
  },
  {
    question: '수료증이 발급되나요?',
    answer: '모든 강의를 완료하면 ZERO-ONE 수료증을 발급해 드립니다.',
  },
];

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('roadmap');
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([0]),
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [studyWithMePhone, setStudyWithMePhone] = useState('');
  const [studyWithMeAgreed, setStudyWithMeAgreed] = useState(false);
  const showToast = useToastStore((state) => state.showToast);
  const { isAuthenticated } = useAuth();

  // 커리큘럼은 DB에서 가져오되, 코스가 없으면 하드코딩된 CHAPTERS로 fallback.
  const { data: curriculum } = useGetCourseCurriculum(slug);
  const { data: courseDetail } = useGetCourseDetail(slug);
  const courseId = courseDetail?.courseId ?? 0;
  const { data: builderFeedShowcase } = useGetBuilderFeedShowcase(courseId);
  const createCourseFreeEnrollment = useCreateCourseFreeEnrollment();
  const createStudyWithMeSubscription = useCreateStudyWithMeSubscription();

  const { data: allCourses } = useGetCourseList();
  const courseSummary = allCourses?.find((c) => c.slug === slug);
  const learningHomeHref =
    slug === 'vibe-intro' ? '/class/vibe-intro/home' : `/class/${slug}`;
  const chaptersForRoadmap = useMemo(() => {
    if (curriculum?.chapters && curriculum.chapters.length > 0) {
      return curriculum.chapters.map((chapter) => ({
        num: String(chapter.chapterNumber).padStart(2, '0'),
        title: chapter.title,
        desc: '',
        lessons: chapter.lessons.map((lesson) => ({
          order: lesson.order,
          title: lesson.title,
          lessonId: lesson.lessonId,
        })),
      }));
    }
    return CHAPTERS.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((title, index) => ({
        order: index + 1,
        title,
        lessonId: undefined as number | undefined,
      })),
    }));
  }, [curriculum]);

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
        request: {
          phone: studyWithMePhone.trim(),
          agreed: studyWithMeAgreed,
        },
      });
      setStudyWithMePhone('');
      setStudyWithMeAgreed(false);
      showToast('Study with Me 알림 신청이 완료되었어요.');
    } catch {
      showToast('Study with Me 알림 신청 중 오류가 발생했어요.', 'error');
    }
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
      {/* Page header */}
      <div className="mx-auto max-w-page px-600 pt-600">
        <h1 className="font-designer-36b text-gray-800">
          {courseDetail?.title ?? '바이브 코딩 입문자 코스'}
        </h1>
        <div className="mt-300 flex flex-wrap gap-400">
          <div className="flex items-center gap-75">
            <Users className="h-300 w-300 shrink-0 text-text-subtlest" />
            <p className="font-designer-16m text-gray-800">
              <span className="font-designer-16b text-text-brand">
                {courseSummary?.learnerCount ?? 0}
              </span>
              {courseSummary?.learnerLabel ?? '명이 함께 배우고 있어요!'}
            </p>
          </div>
          {curriculum?.durationDays && (
            <div className="flex items-center gap-75">
              <Clock className="h-300 w-300 shrink-0 text-text-subtlest" />
              <p className="font-designer-16m text-gray-800">
                평균 {curriculum.durationDays}일 소요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tab nav — sticky */}
      <div className="mt-[27px] sticky top-0 z-10 border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-page px-600">
          <nav className="flex gap-125">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'flex flex-col gap-[9px] px-100 pt-100',
                  activeTab === tab.id
                    ? 'font-designer-16b text-text-brand'
                    : 'font-designer-16r text-gray-800',
                )}
              >
                {tab.label}
                <div
                  className={cn(
                    'h-px w-full transition-colors',
                    activeTab === tab.id
                      ? 'bg-background-brand-default'
                      : 'bg-transparent',
                  )}
                />
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mx-auto max-w-page px-600 pt-500">
        <div className="grid grid-cols-content-sidebar-360 items-start gap-500">
          {/* LEFT: all content sections */}
          <div className="min-w-0 space-y-800">
            {/* SECTION: 로드맵 소개 */}
            <section id="roadmap">
              <h2 className="font-designer-24b text-gray-800">
                바이브 코딩, 나도 해보고 싶은데… 어디서부터?
                <br />그 막막함, 여기서 끝내세요.
              </h2>
              <p className="mt-300 font-designer-14r text-gray-800">
                코드 한 줄 몰라도 괜찮아요.
                <br />
                Claude가 만들고, 참여자가 결정합니다. 터미널 막막했던 그 벽,
                여기서 없애드릴게요.
              </p>

              {/* Curriculum preview carousel */}
              <div className="mt-400">
                <div className="relative">
                  {/* TODO: h-[354px] uses a banned px arbitrary value — add --spacing-4425 token */}
                  <div className="mx-[10.35%] flex h-[354px] items-center justify-center overflow-hidden rounded-100 bg-gray-300">
                    <p className="font-designer-18r text-black">
                      커리큘럼 미리보기 이미지
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="이전"
                    className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
                  >
                    <ChevronLeft className="h-250 w-250" />
                  </button>
                  <button
                    type="button"
                    aria-label="다음"
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
                  >
                    <ChevronRight className="h-250 w-250" />
                  </button>
                </div>
                {/* Indicator dots — 4 dots, 10px each, 10px gap, centered */}
                <div className="mt-200 flex items-center justify-center gap-125">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'size-125 rounded-full',
                        i === 0 ? 'bg-rose-500' : 'bg-gray-300',
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Target audience */}
              <h3 className="mt-500 font-designer-24b text-gray-800">
                이런 분들이 들으면 좋아요!
              </h3>
              <div className="mt-300 grid grid-cols-3 gap-250">
                {TARGET_AUDIENCE.map((a) => (
                  <div
                    key={a.title}
                    className="flex h-[140px] flex-col items-center justify-center gap-125 overflow-hidden rounded-200 bg-gray-200 px-200 text-center"
                  >
                    <p className="font-designer-18b text-gray-1000">
                      {a.title}
                    </p>
                    <p className="whitespace-pre-line font-designer-16r text-gray-1000">
                      {a.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Completion result */}
              <h3 className="mt-500 font-designer-24b text-gray-800">
                이 코스를 완주하면 이런 걸 만들 수 있어요!
              </h3>
              <div className="relative mt-300 h-[150px] w-full overflow-hidden rounded-100">
                <Image
                  src="/class/detail/result-showcase.png"
                  alt="코스 완주 결과물 예시"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-150 font-designer-14r text-gray-800">
                형식은 자유예요. 중요한 건{' '}
                <span className="font-designer-14b text-text-brand">
                  &quot;내가 만든 웹사이트&quot;
                </span>
                가 진짜로 인터넷에 올라간다는 거예요!
              </p>
            </section>

            {/* SECTION: 빌더 피드 */}
            <section id="builder-feed">
              <h2 className="font-designer-24b text-gray-800">
                ZERO-ONE 빌더들이 만든 결과물이에요
              </h2>
              <div className="relative mt-400">
                {builderFeedShowcase?.items.length ? (
                  <>
                    <div className="grid grid-cols-2 gap-300">
                      {builderFeedShowcase.items.slice(0, 2).map((feed) => (
                        <div
                          key={feed.feedId}
                          className="overflow-hidden rounded-100 border border-border-subtle"
                        >
                          <div className="flex items-center gap-125 p-250">
                            <div className="flex h-300 w-300 shrink-0 items-center justify-center rounded-full bg-gray-200">
                              <Users className="h-200 w-200 text-gray-500" />
                            </div>
                            <p className="font-designer-14m text-gray-800">
                              {feed.author.nickname}
                            </p>
                          </div>
                          <p className="line-clamp-3 px-250 font-designer-13r text-gray-800">
                            {feed.content}
                          </p>
                          {feed.thumbnailUrl ? (
                            <div className="relative mt-150 h-3400 bg-gray-600">
                              <Image
                                src={feed.thumbnailUrl}
                                alt="빌더 피드 이미지"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="mt-150 h-3400 bg-gray-600" />
                          )}
                          <div className="flex items-center gap-125 p-250">
                            <div className="flex items-center gap-50">
                              <Heart className="h-250 w-250 text-gray-1000" />
                              <p className="font-designer-16r text-gray-1000">
                                {feed.likeCount}
                              </p>
                            </div>
                            <div className="flex items-center gap-50">
                              <MessageSquare className="h-250 w-250 text-gray-1000" />
                              <p className="font-designer-16r text-gray-1000">
                                {feed.commentCount}
                              </p>
                            </div>
                            <Share2 className="h-250 w-250 text-gray-1000" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-label="이전"
                      className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
                    >
                      <ChevronLeft className="h-250 w-250" />
                    </button>
                    <button
                      type="button"
                      aria-label="다음"
                      className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
                    >
                      <ChevronRight className="h-250 w-250" />
                    </button>
                  </>
                ) : (
                  <div className="rounded-100 border border-border-subtle bg-gray-100 p-500 text-center">
                    <p className="font-designer-16r text-gray-500">
                      아직 공개된 빌더 피드가 없어요.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* SECTION: 강사진 */}
            <section>
              <h2 className="font-designer-24b text-gray-800">
                가장 많이 좌절하시는 지점, 저희가 잘 알고 있어요.
              </h2>
              <p className="mt-100 font-designer-14r text-gray-800">
                학습은 같이 할 때 가장 즐겁습니다.
                <br />
                서로의 아이디어를 나누고 함께 성장하세요.
              </p>
              <div className="mt-500 flex flex-col">
                {TEAM_MESSAGES.map((msg, i) => (
                  <Fragment key={msg.team}>
                    {/* Gap div between cards — contains vertical line + diagonal connector */}
                    {i === 1 && (
                      <div className="relative h-400 md:h-1375">
                        <svg
                          className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
                          aria-hidden="true"
                        >
                          <line
                            x1="11.5%"
                            y1="0"
                            x2="11.5%"
                            y2="100%"
                            stroke="#fecdd6"
                            strokeWidth="1.5"
                            strokeDasharray="6 4"
                          />
                          <line
                            x1="45.8%"
                            y1="0"
                            x2="56%"
                            y2="100%"
                            stroke="#fecdd6"
                            strokeWidth="1.5"
                            strokeDasharray="6 4"
                          />
                        </svg>
                      </div>
                    )}
                    {i === 2 && (
                      <div className="relative h-400 md:h-1375">
                        <svg
                          className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
                          aria-hidden="true"
                        >
                          <line
                            x1="11.5%"
                            y1="0"
                            x2="11.5%"
                            y2="100%"
                            stroke="#fecdd6"
                            strokeWidth="1.5"
                            strokeDasharray="6 4"
                          />
                          <line
                            x1="67.3%"
                            y1="0"
                            x2="57%"
                            y2="100%"
                            stroke="#fecdd6"
                            strokeWidth="1.5"
                            strokeDasharray="6 4"
                          />
                        </svg>
                      </div>
                    )}
                    {/* Card wrapper — card 2 needs relative wrapper for vertical line in left margin */}
                    <div className={i === 1 ? 'relative' : undefined}>
                      {i === 1 && (
                        <svg
                          className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
                          aria-hidden="true"
                        >
                          <line
                            x1="11.5%"
                            y1="0"
                            x2="11.5%"
                            y2="100%"
                            stroke="#fecdd6"
                            strokeWidth="1.5"
                            strokeDasharray="6 4"
                          />
                        </svg>
                      )}
                      <div
                        className={cn(
                          'rounded-200 border border-rose-200 bg-gray-0 p-500 shadow-[0_4px_17px_3px_#f9e9ed]',
                          i === 1 && 'md:ml-[25%]',
                        )}
                      >
                        <p className="font-designer-20b text-text-brand">
                          {msg.heading}
                        </p>
                        <p className="mt-150 whitespace-pre-line font-designer-16r text-gray-800">
                          {msg.body}
                        </p>
                        <div className="mt-300 flex items-end justify-end gap-200">
                          <p className="font-designer-16r text-gray-800">
                            - {msg.team}
                          </p>
                          <div className="flex size-750 shrink-0 items-center justify-center rounded-full bg-gray-100">
                            <UserRound className="size-400 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </section>

            {/* SECTION: 커리큘럼 */}
            <section id="curriculum">
              <h2 className="font-designer-24b text-gray-800">
                로드맵 따라만 가세요!
              </h2>
              <div className="mt-400 space-y-250">
                {chaptersForRoadmap.map((chapter, i) => (
                  <div
                    key={`${chapter.num}-${chapter.title}`}
                    className="overflow-hidden rounded-200 border border-border-default bg-gray-100"
                  >
                    <div className="flex items-start gap-300 p-250">
                      <div className="flex shrink-0 flex-col items-center justify-center rounded-100 bg-background-brand-default px-150 py-75">
                        <p className="font-designer-16m text-text-inverse">
                          Chapter
                        </p>
                        <p className="font-designer-24b text-center text-text-inverse">
                          {chapter.num}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-designer-20b text-gray-800">
                          {chapter.title}
                        </p>
                        {chapter.desc && (
                          <p className="mt-75 font-designer-16m text-gray-800">
                            {chapter.desc}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleChapter(i)}
                        className="shrink-0 text-gray-800"
                        aria-label={expandedChapters.has(i) ? '접기' : '펼치기'}
                      >
                        {expandedChapters.has(i) ? (
                          <ChevronUp className="h-300 w-300" />
                        ) : (
                          <ChevronDown className="h-300 w-300" />
                        )}
                      </button>
                    </div>
                    {expandedChapters.has(i) && chapter.lessons.length > 0 && (
                      <div>
                        {chapter.lessons.map((lesson) => (
                          <div
                            key={`${chapter.num}-${lesson.order}`}
                            className="flex flex-col justify-center gap-75 border-t border-border-default bg-background-default px-250 py-200"
                          >
                            <div className="flex gap-125">
                              <span className="shrink-0 rounded-50 bg-rose-400 px-125 py-25 font-designer-16m text-text-inverse">
                                온보딩
                              </span>
                              <p className="font-designer-16r text-gray-800">
                                Lesson {String(lesson.order).padStart(2, '0')}
                              </p>
                            </div>
                            <div>
                              <p className="font-designer-18b text-gray-800">
                                {lesson.title}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION: 혜택 */}
            <section id="benefits">
              <h2 className="font-designer-24b text-gray-800">
                ZERO-ONE에서 드리는 입문자 코스 혜택!
              </h2>
              <div className="relative mt-400 flex flex-col gap-250">
                <div className="relative overflow-hidden rounded-200 bg-rose-100 p-350">
                  <p className="font-designer-20b text-gray-800">
                    Claude Code Pro 1개월 구독권을 드려요
                  </p>
                  <p className="mt-200 font-designer-18r text-gray-800">
                    바이브 코딩의 핵심 도구, 별도 절차 없이 바로 쓰실 수 있게
                    해드려요.
                    <br />
                    고민 없이 바로 시작하실 수 있도록 Claude 1개월 구독권을
                    드립니다.
                  </p>
                  <p className="mt-150 font-designer-16r text-gray-800">
                    ※ 이미 구독 중인 경우 별도 플랜 결제 가능
                  </p>
                  <div className="mt-300">
                    <Image
                      src="/class/detail/claude-pro-gift.png"
                      alt="Claude Code Pro 1개월 구독권"
                      width={96}
                      height={96}
                      className="rounded-150"
                    />
                  </div>
                </div>
                <div className="overflow-hidden rounded-200 bg-purple-150 p-350">
                  <p className="font-designer-20b text-gray-800">
                    디스코드에서 함께 공부해요
                  </p>
                  <p className="mt-200 whitespace-pre-line font-designer-18r text-gray-800">
                    {
                      '라이브 학습 채널에서 화면 공유하고 함께 레슨 들어요.\n혼자가 아닌 함께 완주할 수 있어요.\n운영진 24시간 상주, 막힌 곳 질문답변 가능.'
                    }
                  </p>
                  <div className="mt-300">
                    <Image
                      src="/class/detail/benefit-3.png"
                      alt="디스코드"
                      width={96}
                      height={96}
                      className="rounded-150"
                    />
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-200 bg-yellow-100 p-350">
                  <p className="font-designer-20b text-gray-800">
                    막히면 바로 질문하세요
                  </p>
                  <p className="mt-200 whitespace-pre-line font-designer-18r text-gray-800">
                    {
                      '레슨마다 질문답변을 남길 수 있어요.\n운영진이 직접 답변해드립니다.\n다른 빌더들은 어떤 곳에서 막혔는지, 어떻게 해결했는지도 참고해보세요.'
                    }
                  </p>
                  {/* Q/A 데코 — relative 컨테이너 안에서 배치 */}
                  <div className="relative mt-300 h-[150px]">
                    <div
                      className="absolute left-0 top-100 flex size-[85px] items-center justify-center"
                      style={{
                        transform: 'rotate(-20.32deg)',
                      }}
                    >
                      <div className="size-[66px] rounded-100 border border-purple-600 bg-purple-200/20" />
                      <span className="absolute text-58 font-designer-36b leading-none text-grape-600">
                        Q
                      </span>
                    </div>
                    <div
                      className="absolute left-750 top-500 flex size-[89px] items-center justify-center"
                      style={{
                        transform: 'rotate(27.01deg)',
                      }}
                    >
                      <div className="size-[66px] rounded-100 border border-yellow-500 bg-yellow-200/20" />
                      <span className="absolute text-58 font-designer-36b leading-none text-yellow-300">
                        A
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative min-h-3888 overflow-hidden rounded-200 bg-rose-150 p-350">
                  <p className="font-designer-20b text-gray-800">
                    수료 빌더들과 네트워킹하는 커뮤니티
                  </p>
                  <p className="mt-200 whitespace-pre-line font-designer-18r text-gray-800">
                    {
                      '완주 후 ZERO-ONE 오픈톡방에 초대됩니다.\n의지만땅 빌더분들과 소통하실 수 있어요.\n함께 협업하거나, 고민을 주고받고 같은 목표를 향해 달려나가보세요.'
                    }
                  </p>
                  {/* 말풍선1 — #FF698C, Figma SVG path, 꼬리 좌하단 */}
                  <div className="absolute left-375 top-[178px]">
                    <svg
                      width="108.575"
                      height="64.48"
                      viewBox="0 0 108.575 64.4803"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 14.7481C0 6.60297 6.60296 0 14.7481 0H93.827C101.972 0 108.575 6.60296 108.575 14.7481V33.7525C108.575 41.8976 101.972 48.5006 93.827 48.5006H14.7481C6.60296 48.5006 0 41.8976 0 33.7525V14.7481Z"
                        fill="#FF698C"
                      />
                      <path
                        d="M15.432 55.6655V41.8869H46.8472L22.5968 61.7281C15.9831 68.7827 15.0646 60.6258 15.432 55.6655Z"
                        fill="#FF698C"
                      />
                    </svg>
                    <div className="absolute top-175 left-150 flex flex-col gap-[5px]">
                      <div className="h-30 w-800 rounded-full bg-gray-0" />
                      <div className="h-30 w-[42px] rounded-full bg-gray-0" />
                      <div className="h-30 w-[42px] rounded-full bg-gray-0" />
                    </div>
                  </div>
                  {/* 말풍선2 — #FFB5C6, scaleX(-1) 미러로 꼬리 우하단 */}
                  <div className="absolute top-[232px] left-800">
                    <svg
                      width="86.948"
                      height="54.02"
                      viewBox="0 0 86.9482 54.0207"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ transform: 'scaleX(-1)' }}
                    >
                      <path
                        d="M0 12.3625C0 5.53967 5.53098 0.0086764 12.3538 0.0086764L74.5944 0C81.4172 0 86.9482 5.53098 86.9482 12.3538V28.2728C86.9482 35.0956 81.4172 40.6266 74.5944 40.6266L12.3538 40.6353C5.53098 40.6353 0 35.1043 0 28.2815V12.3625Z"
                        fill="#FFB5C6"
                      />
                      <path
                        d="M12.9267 46.637V35.0953H39.2416L18.9283 51.7153C13.3883 57.6246 12.6189 50.792 12.9267 46.637Z"
                        fill="#FFB5C6"
                      />
                    </svg>
                    <div className="absolute top-125 left-150 flex w-800 flex-col items-end gap-[5px]">
                      <div className="h-30 w-full rounded-full bg-gray-0" />
                      <div className="h-30 w-[42px] rounded-full bg-gray-0" />
                      <div className="h-30 w-[42px] rounded-full bg-gray-0" />
                    </div>
                  </div>
                </div>
                <BenefitScrollCharacter />
              </div>
            </section>

            {/* SECTION: FAQ */}
            <section id="faq">
              <h2 className="font-designer-24b text-gray-800">
                궁금한 점 있으세요?
              </h2>
              <div className="mt-400 space-y-125">
                {(courseDetail?.faqs?.length ? courseDetail.faqs : FAQS).map(
                  (faq, idx) => (
                    <div
                      key={faq.question}
                      className="overflow-hidden rounded-200 border border-border-default bg-gray-100"
                    >
                      <button
                        type="button"
                        className="flex h-800 w-full items-center justify-between px-350"
                        onClick={() =>
                          setExpandedFaq(expandedFaq === idx ? null : idx)
                        }
                      >
                        <div className="flex items-center">
                          <span className="mr-250 font-designer-16m text-text-brand">
                            Q
                          </span>
                          <span className="font-designer-16m text-gray-800">
                            {faq.question}
                          </span>
                        </div>
                        {expandedFaq === idx ? (
                          <ChevronUp className="h-300 w-300 shrink-0 text-gray-800" />
                        ) : (
                          <ChevronDown className="h-300 w-300 shrink-0 text-gray-800" />
                        )}
                      </button>
                      {expandedFaq === idx && (
                        <div className="flex items-start gap-250 border-t border-border-default px-350 py-300">
                          <span className="font-designer-16m text-gray-500">
                            A
                          </span>
                          <span className="font-designer-16r text-gray-800">
                            {faq.answer}
                          </span>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: sticky sidebar */}
          <div className="sticky top-550">
            <div className="overflow-hidden rounded-150 border border-border-subtle">
              <div className="p-300">
                <h3 className="font-designer-28b text-gray-800">
                  {courseDetail?.title ?? '바이브 코딩 입문자 코스'}
                </h3>
                <p className="mt-150 whitespace-pre-line font-designer-16r text-gray-800">
                  {courseDetail?.description ??
                    '바이브 코딩 막막함 이젠 여기서 끝내세요!\nZERO-ONE의 빌더들과 함께 뿌셔보세요!'}
                </p>

                <span className="mt-150 inline-block rounded-50 bg-gray-400 px-75 py-25 font-designer-12r text-text-inverse">
                  혜택
                </span>
                <p className="mt-75 font-designer-14r text-gray-500">
                  Claude Pro 1개월 Gift 증정 + 커뮤니티 +
                  <br />
                  {courseDetail?.freeLessonCount !== null &&
                  courseDetail?.freeLessonCount !== undefined
                    ? `${courseDetail.freeLessonCount}개 레슨`
                    : 'N개 레슨'}{' '}
                  + 실습 가이드
                </p>

                {courseSummary?.discountPrice && (
                  <div className="mt-300">
                    <p className="font-designer-14b text-gray-800">
                      무료 온보딩 이후 코스 금액가
                    </p>
                    <p className="mt-75 font-designer-30b text-gray-800">
                      {courseSummary.discountPrice.toLocaleString()}원
                    </p>
                    {courseSummary.regularPrice && (
                      <p className="font-designer-16r text-gray-500 line-through">
                        {courseSummary.regularPrice.toLocaleString()}원
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-300 flex items-center gap-50">
                  <Users className="h-300 w-300 shrink-0 text-text-subtlest" />
                  <p className="font-designer-14m text-gray-800">
                    지금{' '}
                    <span className="text-text-brand">
                      {courseSummary?.learnerCount}
                    </span>
                    명이 이 코스를 들었어요!
                  </p>
                </div>

                <div className="mt-300 flex flex-col gap-150">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="h-700 w-full rounded-100 border border-border-brand bg-rose-50 font-designer-14m text-text-brand"
                  >
                    공유하기
                  </button>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={handleStartCourse}
                      disabled={createCourseFreeEnrollment.isPending}
                      className="flex h-700 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-14b text-text-inverse"
                    >
                      {createCourseFreeEnrollment.isPending
                        ? '등록 중...'
                        : '무료 코스 시작하기'}
                    </button>
                  ) : (
                    <LoginModal
                      openTrigger={
                        <button
                          type="button"
                          className="flex h-700 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-14b text-text-inverse"
                        >
                          무료 코스 시작하기
                        </button>
                      }
                    />
                  )}
                </div>

                <div className="mt-300 rounded-100 bg-gray-800 p-300">
                  <p className="font-designer-14m text-gray-0">
                    매주 월·화·수 오전 6시
                  </p>
                  <p className="mt-75 font-designer-18b text-gray-0">
                    Study with Me 진행!
                  </p>
                  <p className="mt-150 whitespace-pre-line font-designer-14r text-gray-400">
                    {
                      '함께 모여 공부하는 시간이에요.\n디스코드 라이브 채널에서 만나요.'
                    }
                  </p>
                  <p className="mt-200 font-designer-12r text-gray-400">
                    ※ 디스코드 방은 알림톡으로 안내드립니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
