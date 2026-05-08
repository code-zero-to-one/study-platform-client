'use client';

import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  useGetCourseDrawer,
  useGetLessonDetail,
  useGetLessonQnas,
  useSubmitLessonRetrospective,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';

const POSITIVE_CHIPS = [
  '설명이 이해하기 쉬웠어요',
  '실습이 재밌었어요',
  '만들어졌다는 게 신기했어요',
];
const NEGATIVE_CHIPS = [
  '실습이 막혔어요',
  '설명이 어려웠어요',
  '뭘 하는 건지 모르겠어요',
];

const CURRICULUM_CHAPTERS = [
  {
    num: '01',
    title: 'AI와 처음 만나는 날',
    lessons: [
      { num: 1, title: 'Lesson01. Claude와 인사하기' },
      { num: 2, title: 'Lesson02. Claude를 다뤄보기' },
      { num: 3, title: 'Lesson03. Claude를 다뤄보기' },
    ],
  },
  {
    num: '02',
    title: 'AI와 처음 만나는 날',
    lessons: [
      { num: 4, title: 'Lesson04. Claude를 다뤄보기' },
      { num: 5, title: 'Lesson05. Claude를 다뤄보기' },
      { num: 6, title: 'Lesson06. Claude를 다뤄보기' },
    ],
  },
  {
    num: '03',
    title: 'AI와 처음 만나는 날',
    lessons: [
      { num: 7, title: 'Lesson07. Claude를 다뤄보기' },
      { num: 8, title: 'Lesson08. Claude를 다뤄보기' },
      { num: 9, title: 'Lesson09. Claude를 다뤄보기' },
    ],
  },
  {
    num: '04',
    title: 'AI와 처음 만나는 날',
    lessons: [
      { num: 10, title: 'Lesson10. Claude를 다뤄보기' },
      { num: 11, title: 'Lesson11. Claude를 다뤄보기' },
      { num: 12, title: 'Lesson12. Claude를 다뤄보기' },
    ],
  },
  {
    num: '05',
    title: 'AI와 처음 만나는 날',
    lessons: [
      { num: 13, title: 'Lesson13. Claude를 다뤄보기' },
      { num: 14, title: 'Lesson14. Claude를 다뤄보기' },
      { num: 15, title: 'Lesson15. Claude를 다뤄보기' },
    ],
  },
];

export default function LessonPage({ params }: { params: { id: string } }) {
  const lessonId = parseInt(params.id, 10);
  const [rating, setRating] = useState(3);
  const [hoverRating, setHoverRating] = useState(0);
  const [reflection, setReflection] = useState('');
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());
  const [feedbackText, setFeedbackText] = useState('');
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set(),
  );
  const showToast = useToastStore((s) => s.showToast);

  const { data: lesson } = useGetLessonDetail(lessonId);
  const courseId = lesson?.courseId ?? 0;
  const { data: drawer } = useGetCourseDrawer(courseId);
  const { data: qnaData } = useGetLessonQnas(lessonId);
  const submitRetrospective = useSubmitLessonRetrospective();

  function toggleChip(chip: string) {
    setSelectedChips((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  }

  function toggleChapter(id: number) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (selectedChips.size < 2) {
      showToast('최소 2개 이상 선택해주세요.', 'error');
      return;
    }
    const chips = [...selectedChips];
    const checklistFlags = [...POSITIVE_CHIPS, ...NEGATIVE_CHIPS].map((c) =>
      chips.includes(c),
    );
    submitRetrospective.mutate(
      {
        lessonId,
        request: {
          understandingScore: rating,
          content: reflection,
          artifactType: null,
          artifactValue: null,
          feedback: { checklistFlags, freeText: feedbackText },
        },
      },
      {
        onSuccess: () => showToast('제출이 완료되었어요!'),
        onError: () => showToast('제출에 실패했어요.', 'error'),
      },
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="relative w-full bg-gray-100">
      {/* Curriculum Drawer */}
      {curriculumOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex h-full w-[350px] flex-col bg-white shadow-2">
            <div className="flex items-center justify-between border-b border-border-subtle px-300 py-250">
              <div>
                <p className="font-designer-18b text-gray-800">
                  바이브 코딩 입문자 코스
                </p>
                <p className="font-designer-14r text-gray-500">
                  수강 중 이어하기
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurriculumOpen(false)}
                className="text-gray-800"
              >
                <X className="h-300 w-300" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-200">
              {(drawer?.chapters ?? []).map((chapter) => (
                <div key={chapter.chapterId}>
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter.chapterId)}
                    className="flex w-full items-center justify-between px-300 py-200"
                  >
                    <div className="flex items-center gap-150">
                      <div className="flex h-300 w-300 items-center justify-center rounded-50 bg-background-brand-default">
                        <p className="font-designer-12b text-white">
                          {String(chapter.order).padStart(2, '0')}
                        </p>
                      </div>
                      <p className="font-designer-14b text-gray-800">
                        {chapter.title}
                      </p>
                    </div>
                    {expandedChapters.has(chapter.chapterId) ? (
                      <ChevronUp className="h-250 w-250 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-250 w-250 text-gray-500" />
                    )}
                  </button>
                  {expandedChapters.has(chapter.chapterId) && (
                    <div className="pb-100">
                      {chapter.lessons.map((l) => (
                        <Link
                          key={l.lessonId}
                          href={`/class/vibe-intro/lesson/${l.lessonId}`}
                          className={cn(
                            'flex items-center gap-150 px-350 py-150 font-designer-14r text-gray-800',
                            l.lessonId === lessonId &&
                              'bg-rose-50 text-text-brand',
                          )}
                        >
                          <div
                            className={cn(
                              'h-25 w-25 rounded-full border border-border-subtle',
                              l.lessonId === lessonId &&
                                'border-border-brand bg-background-brand-default',
                            )}
                          />
                          {l.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setCurriculumOpen(false)}
          />
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex h-[64px] w-full items-center bg-white">
        {/* Curriculum toggle */}
        <button
          type="button"
          onClick={() => setCurriculumOpen(true)}
          className="flex h-[64px] w-[64px] shrink-0 flex-col items-center justify-center bg-background-brand-default text-white"
        >
          <Image
            src="/class/vibe-intro/checklist.svg"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
          />
          <p className="font-designer-14m text-white">커리큘럼</p>
        </button>

        {/* Course progress */}
        <div className="flex items-center gap-350 px-350">
          <div className="flex items-center gap-125 rounded-100 bg-rose-200 px-125 py-25">
            <p className="font-designer-16m text-rose-400">{lessonId} / 20</p>
          </div>
          <p className="font-designer-16b text-gray-1000">
            {lesson?.courseTitle ?? '바이브 코딩 입문자 코스'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex-1 px-300">
          <div className="relative h-[14px] overflow-hidden rounded-full bg-gray-200">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-background-brand-default transition-all"
              style={{ width: `${(lessonId / 20) * 100}%` }}
            />
          </div>
        </div>

        {/* Discord count */}
        <div className="mr-400 flex items-center gap-75 rounded-100 bg-gray-800 px-250 py-100">
          <p className="font-designer-16b">
            <span className="text-text-brand">59</span>
            <span className="text-white">명과 디스코드에서 함께 공부중!</span>
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-page px-600">
        <div className="grid grid-cols-content-sidebar-360 items-start gap-500 pt-400">
          {/* LEFT: lesson content */}
          <div className="min-w-0">
            {/* Back link */}
            <Link
              href="/class/vibe-intro/home"
              className="inline-flex items-center gap-125 rounded-full border border-border-default bg-background-default px-200 py-100"
            >
              <ArrowLeft className="h-300 w-300" />
              <span className="font-designer-14m text-gray-1000">
                학습 여정 맵 돌아가기
              </span>
            </Link>

            {/* Lesson header */}
            <div className="mt-300 flex items-center justify-between">
              <div className="flex items-center gap-200">
                <span className="rounded-100 bg-background-brand-default px-125 py-25 font-designer-14m text-text-inverse">
                  Lesson {String(lessonId).padStart(2, '0')}
                </span>
                <h1 className="font-designer-28b text-gray-800">
                  {lesson?.title ?? 'AI와 처음 만나는 날'}
                </h1>
              </div>
              <p className="font-designer-16m text-gray-500">
                {lesson
                  ? `약 ${lesson.lessonViewCount > 0 ? '18' : '18'}분 소요`
                  : '약 18분 소요'}
              </p>
            </div>

            {/* Sub-tabs */}
            <div className="mt-300 flex gap-250 border-b border-border-subtle">
              {['따라해보기', '레슨 돌아보기'].map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  className={cn(
                    'flex flex-col gap-[9px] pb-0 pt-100 font-designer-16r',
                    i === 0
                      ? 'font-designer-16b text-text-brand'
                      : 'text-gray-800',
                  )}
                >
                  {tab}
                  {i === 0 && (
                    <div className="h-px w-full bg-background-brand-default" />
                  )}
                </button>
              ))}
            </div>

            {/* Lesson content area (markdown viewer) */}
            <div className="mt-300 min-h-[964px] rounded-150 bg-background-default">
              {/* TODO: markdown viewer for lesson content */}
            </div>

            {/* Review section */}
            <hr className="my-400 border-border-default" />

            <div className="space-y-500 pb-800">
              {/* 레슨 돌아보기 title */}
              <div>
                <h2 className="font-designer-28b text-gray-800">
                  레슨 돌아보기
                </h2>
                <p className="mt-125 font-designer-16r text-gray-1000">
                  오늘 만든 결과물과 배운점을 가볍게 적어주세요. 기록을 제출하면
                  다음 레슨이 자동으로 열려요.
                </p>
              </div>

              {/* Star rating */}
              <div className="rounded-200 border border-border-default bg-background-default p-350">
                <div className="mb-300">
                  <p className="font-designer-20m text-gray-800">
                    Q. <span className="text-text-brand">*</span> 오늘 코딩
                    바이브 내용이 얼마나 이해가 되었나요?
                  </p>
                  <p className="mt-75 font-designer-16r text-gray-800">
                    별점을 선택해 오늘 레슨 내용 이해도를 알려주세요.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="h-[42px] w-[42px] shrink-0"
                    >
                      <Image
                        src={
                          star <= displayRating
                            ? '/class/vibe-intro/star-enabled.svg'
                            : '/class/vibe-intro/star-disabled.svg'
                        }
                        alt={`${star}점`}
                        width={42}
                        height={42}
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-200 text-center font-designer-14b text-gray-400">
                  {
                    [
                      '',
                      '어려웠어요',
                      '조금 어려웠어요',
                      '보통이에요',
                      '재밌었어요',
                      '너무 재밌었어요',
                    ][displayRating]
                  }
                </p>
              </div>

              {/* Reflection text */}
              <div>
                <p className="font-designer-20m text-gray-800">
                  Q. <span className="text-text-brand">*</span> 이번 레슨, 어떤
                  기대로 시작했나요?
                </p>
                <p className="mt-75 font-designer-16r text-gray-800">
                  어려웠던 점이나 뿌듯했던 순간을 기록해 보세요. 이 기록들은
                  모여서 당신만의 멋진 포트폴리오가 됩니다.
                </p>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder={`"이번 레슨, 어떤 기대로 시작했나요?"\n예) 내 포트폴리오에 넣을 사이트를 만들어보고 싶었어요 / AI가 진짜 코드를 짜주는지 궁금했어요`}
                  className="mt-300 h-[448px] w-full resize-none rounded-200 border border-border-default p-300 font-designer-16m text-gray-800 outline-none placeholder:whitespace-pre-line placeholder:text-gray-400 focus:border-border-brand"
                />
              </div>

              {/* Project completion */}
              <div>
                <h3 className="font-designer-28b text-gray-800">
                  오늘의 프로젝트 완성 알리기
                </h3>
                <p className="mt-125 font-designer-16r text-gray-1000">
                  두 가지 중 한 가지만 등록할 수 있습니다.
                </p>
                <div className="mt-300 flex gap-250">
                  <button
                    type="button"
                    className="flex h-[62px] flex-1 items-center justify-center gap-125 rounded-100 border border-gray-400 bg-background-default font-designer-18b text-gray-800"
                  >
                    <ImageIcon className="h-300 w-300" />
                    스크린샷 첨부
                  </button>
                  <button
                    type="button"
                    className="flex h-[62px] flex-1 items-center justify-center gap-125 rounded-100 border border-gray-400 bg-background-default font-designer-18b text-gray-800"
                  >
                    <LinkIcon className="h-300 w-300" />
                    링크 입력
                  </button>
                </div>
              </div>

              {/* Today's lesson chips */}
              <div>
                <h3 className="font-designer-28b text-gray-800">
                  오늘 레슨은 어떠셨나요?
                </h3>
                <p className="mt-125 font-designer-16r text-gray-1000">
                  최소 2개 이상 선택해주세요.
                </p>
                <div className="mt-300 flex flex-col gap-200">
                  <div className="flex flex-wrap gap-125">
                    {POSITIVE_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip(chip)}
                        className={cn(
                          'rounded-full px-350 py-125 font-designer-16r transition-colors',
                          selectedChips.has(chip)
                            ? 'bg-[#dafbe7] font-designer-16b text-[#02c76e]'
                            : 'border border-[#02c76e] text-[#02c76e]',
                        )}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-125">
                    {NEGATIVE_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip(chip)}
                        className={cn(
                          'rounded-full px-350 py-125 font-designer-16r transition-colors',
                          selectedChips.has(chip)
                            ? 'bg-[#fecdcd] font-designer-16b text-[#ff4343]'
                            : 'border border-[#f76363] text-[#f76363]',
                        )}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={`어떠한 피드백도 환영입니다! \n간략히 적어주세요(선택사항).`}
                  className="mt-300 h-[130px] w-full resize-none rounded-200 border border-border-default p-300 font-designer-16m text-gray-800 outline-none placeholder:whitespace-pre-line placeholder:text-gray-400 focus:border-border-brand"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={() => {
                  handleSubmit().catch(() => {});
                }}
                className="flex h-[80px] w-full items-center justify-center gap-150 rounded-100 bg-gray-300 font-designer-24b text-white transition-colors hover:bg-background-brand-default"
              >
                <Image
                  src="/class/vibe-intro/lesson-lock.svg"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                />
                제출하고 다음 Lesson 하러 가기
              </button>
            </div>
          </div>

          {/* RIGHT: sticky sidebar */}
          <div className="sticky top-[64px]">
            <div className="space-y-300">
              {/* Q&A section */}
              <div className="overflow-hidden rounded-150 border border-border-default bg-background-default">
                <div className="p-300">
                  <h3 className="text-center font-designer-16b text-gray-1000">
                    여기서 막히셨나요?
                  </h3>
                  <p className="mt-125 text-center font-designer-14r text-gray-1000">
                    30분 이상 막히면 바로 질문하기!
                    <br />
                    질문을 남겨주시면 빠르게 답변드립니다.
                  </p>
                  <button
                    type="button"
                    className="mt-300 flex w-full items-center justify-center gap-50 rounded-100 bg-background-brand-default p-250 font-designer-16b text-text-inverse"
                  >
                    질문하기
                  </button>

                  {/* My questions */}
                  <div className="mt-300">
                    <div className="flex items-center gap-125">
                      <p className="font-designer-14b text-gray-1000">
                        내 질문
                      </p>
                      <span className="rounded-100 bg-gray-200 px-100 font-designer-14b text-gray-600">
                        {qnaData?.myQnas.length ?? 0}
                      </span>
                    </div>
                    {(qnaData?.myQnas ?? []).map((q) => (
                      <div
                        key={q.qnaId}
                        className="relative mt-150 overflow-hidden rounded-100 border border-border-subtle bg-gray-100 p-150"
                      >
                        <div className="flex items-center gap-125">
                          <p className="flex-1 font-designer-14b text-gray-800">
                            {q.title}
                          </p>
                          <p className="font-designer-13m text-gray-400">
                            {new Date(q.createdAt)
                              .toLocaleDateString('ko-KR', {
                                month: '2-digit',
                                day: '2-digit',
                              })
                              .replace(/\. /g, '.')
                              .replace('.', '')}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-150 flex items-center justify-between">
                      <button type="button">
                        <ChevronLeft className="h-300 w-300 text-border-default" />
                      </button>
                      <button type="button">
                        <ChevronRight className="h-300 w-300 text-border-default" />
                      </button>
                    </div>
                  </div>

                  {/* Other builders' questions */}
                  <div className="mt-300">
                    <p className="font-designer-14b text-gray-1000">
                      빌더들의 질문
                    </p>
                    <div className="mt-150 space-y-125">
                      {(qnaData?.qnas ?? []).slice(0, 3).map((q) => (
                        <div
                          key={q.qnaId}
                          className="overflow-hidden rounded-100 border border-border-subtle bg-gray-100 p-150"
                        >
                          <div className="flex items-center gap-125">
                            <p className="flex-1 font-designer-14b text-gray-800">
                              {q.title}
                            </p>
                            <p className="font-designer-13m text-gray-400">
                              {new Date(q.createdAt)
                                .toLocaleDateString('ko-KR', {
                                  month: '2-digit',
                                  day: '2-digit',
                                })
                                .replace(/\. /g, '.')
                                .replace('.', '')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hot builder feed */}
              <div className="overflow-hidden rounded-150 border border-border-default bg-background-default">
                <div className="p-300">
                  <p className="font-designer-16b text-gray-1000">
                    지금 HOT한 빌더 피드
                  </p>
                  <div className="relative mt-250">
                    <div
                      className="overflow-hidden rounded-150 bg-gray-600"
                      style={{ height: 186 }}
                    />
                    <div className="mt-200 px-150">
                      <div className="flex items-center gap-125 pb-125">
                        <div className="flex h-300 w-300 items-center justify-center rounded-full bg-gray-200" />
                        <p className="font-designer-14b text-gray-800">뭉다</p>
                      </div>
                      <p className="font-designer-14r text-gray-1000 leading-relaxed">
                        가나다라마바사아자차카파타하가나다라마바사아자차카파타하
                      </p>
                      <div className="mt-150 flex items-center gap-125">
                        <div className="flex items-center gap-50">
                          <Heart className="h-250 w-250 text-gray-1000" />
                          <p className="font-designer-14r text-gray-1000">24</p>
                        </div>
                        <div className="flex items-center gap-50">
                          <MessageCircle className="h-250 w-250 text-gray-1000" />
                          <p className="font-designer-14r text-gray-1000">10</p>
                        </div>
                        <Share2 className="h-250 w-250 text-gray-1000" />
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="이전"
                      className="absolute left-0 top-[93px] -translate-x-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-100"
                    >
                      <ChevronLeft className="h-250 w-250" />
                    </button>
                    <button
                      type="button"
                      aria-label="다음"
                      className="absolute right-0 top-[93px] translate-x-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-100"
                    >
                      <ChevronRight className="h-250 w-250" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
