'use client';

import { ChevronDown, Users } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

type SortOption = '최신순' | '인기순' | '완주율순';

const SORT_OPTIONS: SortOption[] = ['최신순', '인기순', '완주율순'];

const MARQUEE_ITEMS = [
  'ZERO ONE',
  '·',
  'Idea',
  '·',
  'Website',
  '·',
  'Just Follow Along',
  '·',
  'Build',
  '·',
  'Deploy',
  '·',
  'Share',
  '·',
  'Zero to One',
];

interface Course {
  id: string;
  title: string;
  description: string;
  tags: string[];
  learnerCount: number;
  learnerSuffix: string;
  originalPrice?: number;
  price?: number;
  status: 'active' | 'coming-soon';
  ctaText: string;
  thumbnailVariant: 'basic' | 'work' | 'soon';
}

const COURSES: Course[] = [
  {
    id: 'basic',
    title: '바이브 코딩 입문자 코스',
    description:
      '코딩 경험 제로\n5일 뒤, 내 이름의 웹사이트가 인터넷에 뜹니다.',
    tags: ['입문', '5일 코스'],
    learnerCount: 30,
    learnerSuffix: '명이 이 코스를 들었어요!',
    originalPrice: 59900,
    price: 39900,
    status: 'active',
    ctaText: '자세히 보기',
    thumbnailVariant: 'basic',
  },
  {
    id: 'designer',
    title: '디자이너 AI 역량 개발 코스',
    description: '2026년 여름 오픈 예정',
    tags: ['실무역량', 'Coming Soon'],
    learnerCount: 30,
    learnerSuffix: '명이 이 코스를 듣고 싶어해요!',
    status: 'coming-soon',
    ctaText: '오픈 알림 받기',
    thumbnailVariant: 'work',
  },
  {
    id: 'advanced',
    title: '바이브 코딩 실무 딥다이브 코스',
    description: '2026년 가을 오픈 예정',
    tags: ['심화', 'Coming Soon'],
    learnerCount: 30,
    learnerSuffix: '명이 이 코스를 듣고 싶어해요!',
    status: 'coming-soon',
    ctaText: '오픈 알림 받기',
    thumbnailVariant: 'soon',
  },
];

function CourseThumbnail({ variant }: { variant: Course['thumbnailVariant'] }) {
  if (variant === 'basic') {
    return (
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background:
            'linear-gradient(-57.92deg, var(--color-rose-200) 0.43%, var(--color-rose-50) 99.57%)',
        }}
      >
        <p className="absolute left-1/2 top-300 -translate-x-1/2 whitespace-nowrap text-center font-black leading-normal tracking-tight text-gray-1000 font-display-headings5">
          Vibe Coding
        </p>
        <div
          className="absolute left-1/2 top-1/2 flex items-baseline gap-50 text-rose-500 font-display-headings4"
          style={{
            transform: 'translate(-50%, -40%) rotate(-15deg)',
            fontWeight: 900,
          }}
        >
          <span>&lt;</span>
          <span className="font-display-headings6">/</span>
          <span>&gt;</span>
        </div>
        <p className="absolute bottom-300 left-1/2 -translate-x-1/2 text-center font-black tracking-tight text-gray-1000 font-display-headings5">
          Basic
        </p>
        <span
          className="absolute left-300 top-200 text-rose-500"
          style={{ fontSize: 28, lineHeight: 1 }}
        >
          ✦
        </span>
        <span
          className="absolute right-400 bottom-300 text-rose-500"
          style={{ fontSize: 18, lineHeight: 1 }}
        >
          ✦
        </span>
      </div>
    );
  }

  if (variant === 'work') {
    return (
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background:
            'linear-gradient(122.16deg, var(--color-rose-500) 8.5%, var(--color-rose-400) 92.47%)',
        }}
      >
        <div className="absolute right-300 top-300 flex items-baseline gap-50 font-black text-gray-0 font-display-headings6">
          <span>&lt;</span>
          <span className="font-designer-28b">/</span>
          <span>&gt;</span>
        </div>
        <p className="absolute bottom-500 left-300 whitespace-nowrap font-bold leading-normal tracking-tight text-rose-500 font-display-headings6">
          Vibe Coding
        </p>
        <p className="absolute bottom-150 left-300 whitespace-nowrap font-bold tracking-tight text-rose-500 font-display-headings6">
          for Work
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(-57.92deg, var(--color-gray-300) 0.43%, var(--color-gray-50) 99.57%)',
      }}
    >
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center font-black tracking-tight text-gray-500 font-display-headings5">
        Coming soon
      </p>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-200 border border-border-default">
      <div className="h-[292px] shrink-0">
        <CourseThumbnail variant={course.thumbnailVariant} />
      </div>
      <div className="flex flex-1 flex-col bg-background-default p-350 pt-300">
        <div className="mb-300 flex items-center gap-75">
          <Users className="h-300 w-300 shrink-0 text-text-subtlest" />
          <p className="font-designer-16m text-text-default">
            <span className="font-designer-16b text-text-brand">
              {course.learnerCount}
            </span>
            {course.learnerSuffix}
          </p>
        </div>

        <div className="mb-300 flex flex-col gap-75">
          <p className="font-designer-28b leading-normal text-gray-1000">
            {course.title}
          </p>
          <p className="whitespace-pre-line font-designer-20r text-text-default">
            {course.description}
          </p>
        </div>

        <div className="mb-auto flex flex-wrap gap-125">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-200 px-200 py-50 font-designer-16r text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>

        {course.status === 'active' && course.price !== undefined && (
          <div className="mt-300 flex flex-col">
            {course.originalPrice !== undefined && (
              <p className="font-designer-16r text-gray-400 line-through">
                정가 {course.originalPrice.toLocaleString()}원
              </p>
            )}
            <p className="font-designer-28b text-gray-1000">
              {course.price.toLocaleString()}원
            </p>
          </div>
        )}

        <button
          type="button"
          className={cn(
            'mt-300 w-full rounded-100 py-200 font-designer-20m',
            course.status === 'active'
              ? 'bg-background-brand-default text-text-inverse'
              : 'border border-border-brand bg-background-default text-text-brand',
          )}
        >
          {course.ctaText}
        </button>
      </div>
    </div>
  );
}

export default function ClassPage() {
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>('최신순');

  return (
    <div className="w-full">
      {/* Banner */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          background:
            'linear-gradient(90deg, var(--color-rose-100) 0%, var(--color-gray-0) 53.37%, var(--color-rose-100) 100%)',
        }}
      >
        {/* Decorative illustrations — desktop only */}
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
          {/* Orbit ellipse ring */}
          <div
            className="absolute border border-rose-300"
            style={{
              left: '34.3%',
              top: '105px',
              width: '31.4%',
              height: '130px',
              borderRadius: '50%',
              transform: 'rotate(-9.38deg)',
              opacity: 0.7,
            }}
          />
          {/* Code card */}
          <div
            className="absolute flex flex-col items-center justify-center gap-75 rounded-200 border border-rose-300"
            style={{
              left: '39.1%',
              top: '97px',
              width: 180,
              height: 180,
              background:
                'radial-gradient(circle at center, var(--color-rose-100) 52%, var(--color-rose-200) 76%, var(--color-rose-300) 100%)',
              opacity: 0.85,
              transform: 'rotate(-15deg)',
            }}
          >
            <p className="font-designer-20b text-text-brand">Code</p>
            <div
              className="flex items-baseline gap-25 font-black text-gray-800 font-designer-28b"
              style={{ fontSize: 26 }}
            >
              <span>&lt;</span>
              <span style={{ fontSize: 20 }}>/</span>
              <span>&gt;</span>
            </div>
          </div>
          {/* Community card */}
          <div
            className="absolute flex flex-col items-center justify-center rounded-200 border border-rose-300"
            style={{
              left: '50.3%',
              top: '100px',
              width: 185,
              height: 185,
              background:
                'radial-gradient(circle at center, var(--color-rose-100) 52%, var(--color-rose-200) 76%, var(--color-rose-300) 100%)',
              opacity: 0.85,
              transform: 'rotate(18.03deg)',
            }}
          >
            <p className="font-designer-20b text-text-brand">Community</p>
          </div>
          {/* Sparkle decorations */}
          <span
            className="absolute text-rose-500"
            style={{ left: '22.8%', top: 39, fontSize: 32, lineHeight: 1 }}
          >
            ✦
          </span>
          <span
            className="absolute text-rose-500"
            style={{ left: '74.5%', top: 346, fontSize: 32, lineHeight: 1 }}
          >
            ✦
          </span>
          <span
            className="absolute text-rose-500"
            style={{ left: '57.3%', top: 192, fontSize: 20, lineHeight: 1 }}
          >
            ✦
          </span>
        </div>

        {/* Hero heading */}
        <div className="relative z-10 py-800 text-center">
          <h1 className="font-display-headings2 text-gray-1000">
            따라만 하면 완성되는
            <br />
            바이브 코딩 코스
          </h1>
        </div>

        {/* Marquee ticker — "문구 흘러가게 구현" annotation */}
        <div className="flex h-800 items-center overflow-hidden bg-gray-1000">
          <div className="animate-marquee flex shrink-0 items-center gap-500 whitespace-nowrap px-500">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="font-designer-24b text-gray-0">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Course list */}
      <section className="mx-auto w-full max-w-1496 px-600 pb-800 pt-600">
        {/* Sort chip */}
        <div className="relative mb-400">
          <button
            type="button"
            className="flex items-center gap-150 rounded-full border border-border-strong px-250 py-125 font-designer-16m text-text-default"
            onClick={() => setSortOpen((prev) => !prev)}
          >
            {sort}
            <ChevronDown
              className={cn(
                'h-300 w-300 transition-transform duration-200',
                sortOpen && 'rotate-180',
              )}
            />
          </button>

          {sortOpen && (
            <div className="absolute left-0 top-full z-10 mt-100 flex flex-col gap-200 rounded-250 border border-border-strong bg-background-default p-250 shadow-1">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    'whitespace-nowrap text-left font-designer-18r text-text-default transition-colors',
                    option === sort && 'font-designer-18b',
                  )}
                  onClick={() => {
                    setSort(option);
                    setSortOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-300 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
