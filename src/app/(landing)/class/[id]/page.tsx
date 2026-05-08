'use client';

import {
  Users,
  Clock,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageSquare,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useToastStore } from '@/stores/use-toast-store';

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

export default function ClassDetailPage({
  params: _params,
}: {
  params: { id: string };
}) {
  const [activeTab, setActiveTab] = useState<Tab>('roadmap');
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([0]),
  );
  const showToast = useToastStore((state) => state.showToast);

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
          바이브 코딩 입문자 코스
        </h1>
        <div className="mt-300 flex flex-wrap gap-400">
          <div className="flex items-center gap-75">
            <Users className="h-300 w-300 shrink-0 text-text-subtlest" />
            <p className="font-designer-16m text-gray-800">
              <span className="font-designer-16b text-text-brand">30</span>
              명이 함께 배우고 있어요!
            </p>
          </div>
          <div className="flex items-center gap-75">
            <Clock className="h-300 w-300 shrink-0 text-text-subtlest" />
            <p className="font-designer-16m text-gray-800">평균 5일 소요</p>
          </div>
          <div className="flex items-center gap-75">
            <ThumbsUp className="h-300 w-300 shrink-0 text-text-subtlest" />
            <p className="font-designer-16m text-gray-800">
              <span className="font-designer-16b text-text-brand">25</span>명
            </p>
          </div>
        </div>
      </div>

      {/* Tab nav — sticky */}
      <div className="sticky top-0 z-10 border-b border-border-default bg-background-default">
        <div className="mx-auto max-w-page px-600">
          <nav className="flex">
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
              <div className="relative mt-400">
                <div className="flex h-[354px] items-center justify-center overflow-hidden rounded-100 bg-gray-300">
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
                <div className="grid grid-cols-2 gap-300">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-100 border border-border-subtle"
                    >
                      <div className="flex items-center gap-125 p-250">
                        <div className="flex h-300 w-300 shrink-0 items-center justify-center rounded-full bg-gray-200">
                          <Users className="h-200 w-200 text-gray-500" />
                        </div>
                        <p className="font-designer-14m text-gray-800">뭉다</p>
                      </div>
                      <p className="px-250 font-designer-13r text-gray-800">
                        오늘 처음 만들어본 바이브 코딩!
                        <br />뭘 먼저 시작해야될지 모르겠어서 고민이 많았던...
                      </p>
                      <div className="mt-150 h-[276px] bg-gray-600" />
                      <div className="flex items-center gap-125 p-250">
                        <div className="flex items-center gap-50">
                          <Heart className="h-250 w-250 text-gray-1000" />
                          <p className="font-designer-16r text-gray-1000">24</p>
                        </div>
                        <div className="flex items-center gap-50">
                          <MessageSquare className="h-250 w-250 text-gray-1000" />
                          <p className="font-designer-16r text-gray-1000">10</p>
                        </div>
                        <Share2 className="h-250 w-250 text-gray-1000" />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="이전"
                  className="absolute left-0 top-[calc(50%-2rem)] -translate-x-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
                >
                  <ChevronLeft className="h-250 w-250" />
                </button>
                <button
                  type="button"
                  aria-label="다음"
                  className="absolute right-0 top-[calc(50%-2rem)] translate-x-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
                >
                  <ChevronRight className="h-250 w-250" />
                </button>
              </div>
            </section>

            {/* Team intro */}
            <section>
              <h2 className="font-designer-24b text-gray-800">
                가장 많이 좌절하시는 지점, 저희가 잘 알고 있어요.
              </h2>
              <p className="mt-300 font-designer-14r text-gray-800">
                학습은 같이 할 때 가장 즐겁습니다.
                <br />
                서로의 아이디어를 나누고 함께 성장하세요.
              </p>
              <div className="mt-400 space-y-300">
                {TEAM_MESSAGES.map((msg) => (
                  <div
                    key={msg.team}
                    className="rounded-200 border border-rose-200 bg-background-default p-400 shadow-1"
                  >
                    <p className="font-designer-20b text-text-brand">
                      {msg.heading}
                    </p>
                    <p className="mt-150 whitespace-pre-line font-designer-18r text-gray-800">
                      {msg.body}
                    </p>
                    <p className="mt-200 text-right font-designer-18r text-gray-800">
                      - {msg.team}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION: 커리큘럼 */}
            <section id="curriculum">
              <h2 className="font-designer-24b text-gray-800">
                로드맵 따라만 가세요!
              </h2>
              <div className="mt-400 space-y-250">
                {CHAPTERS.map((chapter, i) => (
                  <div
                    key={i}
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
                        <p className="mt-75 font-designer-16m text-gray-800">
                          {chapter.desc}
                        </p>
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
                        {chapter.lessons.map((lesson, j) => (
                          <div
                            key={j}
                            className="flex items-center gap-200 border-t border-border-default bg-background-default px-350 py-300"
                          >
                            <span className="shrink-0 rounded-50 bg-rose-400 px-125 py-25 font-designer-16m text-text-inverse">
                              온보딩
                            </span>
                            <p className="font-designer-16r text-gray-800">
                              Lesson {String(j + 1).padStart(2, '0')}
                            </p>
                            <p className="font-designer-18b text-gray-800">
                              {lesson}
                            </p>
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
              <div className="mt-400 space-y-250">
                <div className="overflow-hidden rounded-200 bg-rose-100 p-350">
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
                {/* TODO: remaining benefit cards — content to be confirmed */}
              </div>
            </section>

            {/* SECTION: FAQ */}
            <section id="faq">
              <h2 className="font-designer-24b text-gray-800">
                자주 묻는 질문
              </h2>
              {/* TODO: FAQ content to be confirmed */}
              <p className="mt-300 font-designer-16r text-gray-500">
                준비 중입니다.
              </p>
            </section>
          </div>

          {/* RIGHT: sticky sidebar */}
          <div className="sticky top-[57px]">
            <div className="overflow-hidden rounded-150 border border-border-subtle">
              <div className="p-300">
                <h3 className="font-designer-28b text-gray-800">
                  바이브 코딩 입문자 코스
                </h3>
                <p className="mt-150 font-designer-16r text-gray-800">
                  바이브 코딩 막막함 이젠 여기서 끝내세요!
                  <br />
                  ZERO-ONE의 빌더들과 함께 뿌셔보세요!
                </p>

                <span className="mt-150 inline-block rounded-50 bg-gray-400 px-75 py-25 font-designer-12r text-text-inverse">
                  혜택
                </span>
                <p className="mt-75 font-designer-14r text-gray-500">
                  Claude Pro 1개월 Gift 증정 + 커뮤니티 +
                  <br />
                  N개 레슨 + 실습 가이드
                </p>

                <div className="mt-300 flex items-center gap-50">
                  <Users className="h-300 w-300 shrink-0 text-text-subtlest" />
                  <p className="font-designer-14m text-gray-800">
                    지금 <span className="text-text-brand">00</span>
                    명이 이 코스를 탐색하고 있어요!
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
                  <Link
                    href="/class/vibe-intro/home"
                    className="flex h-700 w-full items-center justify-center rounded-100 bg-background-brand-default font-designer-14b text-text-inverse"
                  >
                    무료 코스 시작하기
                  </Link>
                </div>

                {/* Study With Me */}
                <div className="mt-300 overflow-hidden rounded-100 bg-gray-800 p-300">
                  <p className="font-designer-14m text-white">
                    5월 20일(토) 저녁 8시
                  </p>
                  <p className="mt-75 font-designer-18b text-white">
                    Study with Me 진행!
                  </p>
                  <p className="mt-150 font-designer-14r text-gray-400">
                    디스코드에서 모여서 배운 것을 토대로
                    <br />
                    각자 공부해봐요!
                  </p>
                  <p className="mt-300 font-designer-12r text-gray-400">
                    *디스코드 방은 알림톡으로 안내드립니다.
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
