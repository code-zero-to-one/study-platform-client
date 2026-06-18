'use client';

import { m, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useGetCourseList } from '@/hooks/queries/course/course-queries';

/* ─── Entrance helper (LazyMotion domAnimation = useInView, not whileInView) ─── */

function Rise({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <m.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </m.div>
  );
}

/* ─── Two-course preset (static marketing copy + confirmed slugs) ─────────────
   Live learnerCount/status is overlaid from useGetCourseList when present, but
   the cards always render from this preset so the fork never disappears. */

interface CoursePreset {
  slug: string;
  href: string;
  index: string;
  kicker: string;
  label: string;
  title: string;
  desc: string;
  tags: string[];
  badge?: string;
  surface: string;
  labelClass: string;
}

const COURSES: CoursePreset[] = [
  {
    slug: 'vibe-intro-claude-code',
    href: '/class/vibe-intro-claude-code',
    index: '01',
    kicker: '웹사이트를 만들고 싶다면',
    label: 'Vibe Coding',
    title: '코딩 0에서\n내 이름 박힌 웹사이트까지',
    desc: '머릿속 그 화면, AI랑 둘이서. 20일이면 진짜 URL이 생깁니다.',
    tags: ['웹사이트', '사이드 프로젝트', '포트폴리오'],
    surface: 'linear-gradient(-57.924deg, #ffc4e1 0.43%, #ffefef 99.57%)',
    labelClass: 'text-gray-1000',
  },
  {
    slug: 'claude-cowork-intro',
    href: '/class/claude-cowork-intro',
    index: '02',
    kicker: '반복 업무를 없애고 싶다면',
    label: 'AI for Work',
    title: '매주 반복하는 그 업무,\nAI에게 통째로 위임',
    desc: '보고서·회의록·데이터 정리. 코드 한 줄 없이 2시간을 5분으로.',
    tags: ['보고서', '회의록', '데이터 정리'],
    badge: 'Ch1 무료',
    surface:
      'linear-gradient(122.16deg, var(--color-rose-500) 8.5%, var(--color-rose-400) 92.47%)',
    labelClass: 'text-white',
  },
];

/* ─── Single course card ─────────────────────────────────────────────────── */

function CourseCard({
  course,
  learnerCount,
  isLoading,
  delay,
}: {
  course: CoursePreset;
  learnerCount?: number;
  isLoading: boolean;
  delay: number;
}) {
  return (
    <Rise delay={delay} className="h-full">
      <Link
        href={course.href}
        className="group flex h-full flex-col overflow-hidden rounded-300 border border-gray-200 bg-white shadow-2 transition-shadow duration-200 hover:shadow-3"
      >
        {/* Gradient header band */}
        <div
          className="relative flex h-3000 shrink-0 items-center justify-center overflow-hidden"
          style={{ background: course.surface }}
        >
          <span
            className={cn(
              'font-signature text-[40px] leading-none tracking-[-1.14px] md:text-[56px]',
              course.labelClass,
            )}
          >
            {course.label}
          </span>
          {course.badge && (
            <span className="absolute right-300 top-300 rounded-full bg-gray-1000/85 px-200 py-50 text-[13px] font-bold leading-[1.5] text-white">
              {course.badge}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-250 p-375 md:p-500">
          <p className="text-[14px] font-bold leading-[1.5] tracking-[-0.304px] text-rose-500 md:text-[16px]">
            <span className="text-gray-400">코스 {course.index} · </span>
            {course.kicker}
          </p>

          <h3 className="whitespace-pre-line text-[22px] font-bold leading-[1.4] tracking-[-0.57px] text-gray-1000 md:text-[28px]">
            {course.title}
          </h3>

          <p className="text-[14px] leading-[1.55] tracking-[-0.304px] text-gray-600 md:text-[16px]">
            {course.desc}
          </p>

          <div className="flex flex-wrap gap-100">
            {course.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-50 px-200 py-50 text-[13px] font-medium leading-[1.5] text-gray-500 md:text-[14px]"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Social proof + CTA pinned to the bottom */}
          <div className="mt-auto flex flex-col gap-250 pt-250">
            <p className="h-300 text-[13px] leading-[1.5] text-gray-500 md:text-[14px]">
              {isLoading ? (
                <span className="inline-block h-200 w-3000 animate-pulse rounded-full bg-gray-100 align-middle" />
              ) : learnerCount && learnerCount > 0 ? (
                <>
                  이미{' '}
                  <span className="font-bold text-gray-800">
                    {learnerCount.toLocaleString()}명
                  </span>
                  이 먼저 시작했어요
                </>
              ) : (
                '1기 얼리버드, 지금 합류하세요'
              )}
            </p>
            <span className="flex w-full items-center justify-center gap-100 rounded-100 bg-rose-500 py-200 text-[15px] font-bold leading-[1.5] text-white transition-colors group-hover:bg-rose-600 md:text-[16px]">
              무료로 시작하기
              <ArrowRight className="size-225 transition-transform duration-200 group-hover:translate-x-50" />
            </span>
          </div>
        </div>
      </Link>
    </Rise>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */

export function CourseBranch({ className }: { className?: string }) {
  const { data: courses, isLoading } = useGetCourseList();

  const learnerBySlug = new Map(
    (courses ?? []).map((c) => [c.slug, c.learnerCount]),
  );

  return (
    <div className={className}>
      <Rise className="flex flex-col items-center gap-125 text-center">
        <span className="rounded-500 bg-rose-300 px-250 py-125 text-[20px] font-medium leading-[1.5] text-white md:text-[24px]">
          Choose your path
        </span>
        <h2 className="text-[24px] font-bold leading-[1.4] tracking-[-0.57px] text-gray-800 md:text-[34px]">
          배우는 건 코딩이 아니라,
          <br />
          <span className="text-rose-500">AI에게 일을 시키는 법</span>
        </h2>
        <p className="text-[14px] leading-[1.5] text-gray-600 md:text-[18px]">
          당신의 목표에 맞는 길을 고르세요. 둘 다 코드 없이, 무료로 시작합니다.
        </p>
      </Rise>

      <div className="mt-500 grid grid-cols-1 gap-300 md:mt-750 md:grid-cols-2 md:gap-400">
        {COURSES.map((course, i) => (
          <CourseCard
            key={course.slug}
            course={course}
            learnerCount={learnerBySlug.get(course.slug)}
            isLoading={isLoading}
            delay={i * 0.1}
          />
        ))}
      </div>
    </div>
  );
}
