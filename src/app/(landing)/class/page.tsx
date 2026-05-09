'use client';

import { ChevronDown, Users, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useGetCourseList } from '@/hooks/queries/course/course-api';
import type { CourseSummaryResponse } from '@/types/api/course.types';

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

const DOUBLED_MARQUEE = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

const SLUG_VARIANT: Record<string, 'basic' | 'work' | 'soon'> = {
  'vibe-intro': 'basic',
};

function CourseThumbnail({ variant }: { variant: 'basic' | 'work' | 'soon' }) {
  if (variant === 'basic') {
    return (
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background:
            'linear-gradient(-57.92deg, #ffc4e1 0.43%, #ffefef 99.57%)',
        }}
      >
        <Image
          src="/class/star-lg.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          width={42}
          height={42}
          style={{ left: 32, top: 17, width: 42, height: 42 }}
        />

        <Image
          src="/class/star-sm.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          width={26}
          height={26}
          style={{ left: 19, top: 42, width: 26, height: 26 }}
        />

        <Image
          src="/class/vector-basic.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          width={39}
          height={39}
          style={{ left: 388, top: 20, width: 39, height: 39 }}
        />
        <p
          className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-center font-black leading-normal tracking-tight text-gray-1000 font-display-headings5"
          style={{ top: 31 }}
        >
          Vibe Coding
        </p>

        <Image
          src="/class/sphere.svg"
          alt=""
          className="absolute left-1/2 -translate-x-1/2"
          width={214}
          height={133}
          style={{ top: 74, width: 214, height: 133 }}
        />
        <p
          className="absolute left-1/2 -translate-x-1/2 text-center font-black tracking-tight text-gray-1000 font-display-headings5"
          style={{ top: 189 }}
        >
          Basic
        </p>

        <Image
          src="/class/star-lg.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          width={42}
          height={42}
          style={{ left: 328, top: 179, width: 42, height: 42 }}
        />
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
        {/* vector-work renders behind subtract — matches Figma z-order */}
        <Image
          src="/class/vector-work.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          width={39}
          height={39}
          style={{ left: 361, top: 227, width: 39, height: 39 }}
        />
        <Image
          src="/class/subtract.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          width={405}
          height={233}
          style={{ left: 23, top: 30, width: 405, height: 233 }}
        />
        <Image
          src="/class/bracket-left.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          width={42}
          height={66}
          style={{ left: 295, top: 30, width: 42, height: 66 }}
        />
        <Image
          src="/class/slash.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          width={31}
          height={74}
          style={{ left: 346, top: 30, width: 31, height: 74 }}
        />

        <Image
          src="/class/bracket-right.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          width={42}
          height={66}
          style={{
            left: 385,
            top: 30,
            width: 42,
            height: 66,
            transform: 'scaleY(-1) rotate(180deg)',
          }}
        />
        <p
          className="absolute whitespace-nowrap font-bold leading-normal tracking-tight text-rose-500 font-display-headings6"
          style={{ left: 154, top: 146, transform: 'translateX(-50%)' }}
        >
          Vibe Coding
        </p>
        <p
          className="absolute whitespace-nowrap font-bold tracking-tight text-rose-500 font-display-headings6"
          style={{ left: 42, top: 197 }}
        >
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

function NotifyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [emailError, setEmailError] = useState(false);

  if (!open) return null;

  function handleSubmit() {
    if (!email.trim()) {
      setEmailError(true);
      return;
    }
    // TODO: API not found - open notification signup endpoint
    setEmail('');
    setAgreed(false);
    setEmailError(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="relative w-[560px] overflow-hidden rounded-200 bg-background-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-300 top-300 text-gray-800"
          aria-label="닫기"
        >
          <X className="h-300 w-300" />
        </button>

        <div className="px-500 pb-500 pt-500">
          <h2 className="mb-300 text-center font-designer-24b text-gray-800">
            오픈 알림 신청
          </h2>

          <p className="mb-500 text-center font-designer-18b text-gray-800">
            지금 신청하면{' '}
            <span className="text-text-brand">최대 50% 할인 혜택</span>과 사전
            학습 자료를
            <br />
            가장 먼저 받아보실 수 있어요.
          </p>

          <div className="mb-300">
            <div className="mb-150 flex items-end gap-25">
              <label
                htmlFor="notify-email"
                className="font-designer-20m text-gray-800"
              >
                이메일 주소
              </label>
              <span className="font-designer-12b text-text-brand">*</span>
            </div>
            <input
              id="notify-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
              }}
              placeholder="이메일 주소를 입력해주세요"
              className={cn(
                'h-700 w-full rounded-100 border px-250 font-designer-14r text-gray-800 outline-none placeholder:text-gray-500',
                emailError
                  ? 'border-border-error'
                  : 'border-border-default focus:border-border-brand',
              )}
            />
            {emailError && (
              <p className="mt-75 font-designer-12r text-text-error">
                이메일 주소를 입력해주세요.
              </p>
            )}
          </div>

          <div className="mb-300 space-y-75">
            <label className="flex cursor-pointer items-start gap-125">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-25 h-300 w-300 shrink-0 rounded-50 accent-rose-500"
              />
              <span className="font-designer-14b">
                <span className="text-text-brand">필수</span>{' '}
                <span className="text-gray-800">
                  오픈 알림 발송을 위한 개인정보 수집·이용에 동의합니다.
                </span>
              </span>
            </label>
            <p className="pl-[34px] font-designer-12r text-gray-800">
              수집 항목: 전화번호·이메일 / 보유 기간: 오픈 안내 발송 후 30일
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="h-700 w-full rounded-100 bg-background-brand-default font-designer-18b text-text-inverse"
          >
            입력 완료
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  onNotify,
}: {
  course: CourseSummaryResponse;
  onNotify: () => void;
}) {
  const status = course.status === 'ACTIVE' ? 'active' : 'coming-soon';
  const ctaText = status === 'active' ? '자세히 보기' : '오픈 알림 받기';
  console.log({ ctaText });
  const thumbnailVariant = SLUG_VARIANT[course.slug] ?? 'soon';

  return (
    <div className="flex flex-col overflow-hidden rounded-200 border border-border-default">
      <div className="h-[292px] shrink-0">
        <CourseThumbnail variant={thumbnailVariant} />
      </div>
      <div className="flex flex-1 flex-col bg-background-default p-350 pt-300">
        <div className="mb-300 flex items-center gap-75">
          <Users className="h-300 w-300 shrink-0 text-text-subtlest" />
          <p className="font-designer-16m text-text-default">
            <span className="font-designer-16b text-text-brand">
              {course.participantCount}
            </span>
            {course.participantLabel}
          </p>
        </div>

        <div className="mb-300 flex flex-col gap-75">
          <p className="font-designer-28b leading-normal text-gray-1000">
            {course.title}
          </p>
          <p className="whitespace-pre-line font-designer-20r text-text-default">
            {course.headline}
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

        {status === 'active' &&
          course.discountPrice !== null &&
          course.discountPrice !== undefined && (
            <div className="mt-300 flex flex-col">
              {course.regularPrice !== null &&
                course.regularPrice !== undefined && (
                  <p className="font-designer-16r text-gray-400 line-through">
                    정가 {course.regularPrice.toLocaleString()}원
                  </p>
                )}
              <p className="font-designer-28b text-gray-1000">
                {course.discountPrice.toLocaleString()}원
              </p>
            </div>
          )}

        {status === 'active' ? (
          <Link
            href={`/class/${course.slug}`}
            className="mt-300 block w-full rounded-100 bg-background-brand-default py-200 text-center font-designer-20m text-text-inverse"
          >
            {ctaText}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onNotify}
            className="mt-300 w-full rounded-100 border border-border-brand bg-background-default py-200 font-designer-20m text-text-brand"
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ClassPage() {
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>('최신순');
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  const { data: courses } = useGetCourseList();

  return (
    <div className="w-full">
      <NotifyModal
        open={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
      />
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

          <Image
            src="/class/banner-orbit-ring.svg"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            className="absolute"
            style={{
              left: '34.3%',
              top: '10px',
              width: '31.4%',
              height: '130px',
              transform: 'rotate(-9.38deg)',
            }}
          />

          {/* Code card */}
          <div
            className="absolute flex flex-col items-center justify-center gap-75 rounded-250 border border-rose-300"
            style={{
              left: '39.1%',
              top: '51px',
              width: 180,
              height: 180,
              background:
                'radial-gradient(circle at center, var(--color-rose-100) 52%, var(--color-rose-200) 76%, var(--color-rose-300) 100%)',
              opacity: 0.85,
              transform: 'rotate(-15deg)',
            }}
          >
            <p className="font-designer-20b text-text-brand">Code</p>
            <div className="flex items-end">
              <Image
                src="/class/banner-bracket-left.svg"
                alt=""
                aria-hidden="true"
                width={32}
                height={50}
                style={{ height: 50, width: 32 }}
              />

              <Image
                src="/class/banner-slash.svg"
                alt=""
                aria-hidden="true"
                width={23}
                height={56}
                style={{ height: 56, width: 23 }}
              />

              <Image
                src="/class/banner-bracket-right.svg"
                alt=""
                aria-hidden="true"
                width={32}
                height={50}
                style={{
                  height: 50,
                  width: 32,
                  transform: 'scaleY(-1) rotate(180deg)',
                }}
              />
            </div>
          </div>

          {/* Community card */}
          <div
            className="absolute rounded-250 border border-rose-300"
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
            <p
              className="absolute whitespace-nowrap font-designer-20b text-text-brand"
              style={{ top: 18, left: '50%', transform: 'translateX(-50%)' }}
            >
              Community
            </p>
            {/* Back bubble — rotated, partially behind front */}

            <Image
              src="/class/banner-bubble-back.svg"
              alt=""
              aria-hidden="true"
              className="absolute"
              width={76}
              height={45}
              style={{
                width: 76,
                height: 45,
                right: 18,
                bottom: 28,
                transform: 'scaleY(-1) rotate(-160.37deg)',
              }}
            />
            {/* Front bubble */}

            <Image
              src="/class/banner-bubble-front.svg"
              alt=""
              aria-hidden="true"
              className="absolute"
              width={90}
              height={54}
              style={{ width: 90, height: 54, left: 20, bottom: 38 }}
            />
          </div>

          {/* Sparkle large — left */}

          <Image
            src="/class/banner-sparkle-lg.svg"
            alt=""
            aria-hidden="true"
            className="absolute"
            width={74}
            height={74}
            style={{ left: '22.8%', top: 39, width: 74, height: 74 }}
          />
          {/* Sparkle large — right */}

          <Image
            src="/class/banner-sparkle-lg.svg"
            alt=""
            aria-hidden="true"
            className="absolute"
            width={74}
            height={74}
            style={{ left: '74.5%', top: 346, width: 74, height: 74 }}
          />
          {/* Sparkle small */}

          <Image
            src="/class/banner-sparkle-sm.svg"
            alt=""
            aria-hidden="true"
            className="absolute"
            width={44}
            height={44}
            style={{ left: '57.3%', top: 192, width: 44, height: 44 }}
          />

          {/* Wave curve — bottom-left */}

          <Image
            src="/class/banner-wave-top.svg"
            alt=""
            aria-hidden="true"
            className="absolute"
            width={230}
            height={113}
            style={{ left: '31.7%', top: 219, width: 230, height: 113 }}
          />
          {/* Wave curve — top-right (rotated 180deg) */}

          <Image
            src="/class/banner-wave-bottom.svg"
            alt=""
            aria-hidden="true"
            className="absolute"
            width={230}
            height={113}
            style={{
              left: '54.7%',
              top: 53,
              width: 230,
              height: 113,
              transform: 'rotate(180deg)',
            }}
          />

          {/* Small ellipse decorations */}

          <Image
            src="/class/banner-ellipse-1.svg"
            alt=""
            aria-hidden="true"
            className="absolute"
            width={50}
            height={23}
            style={{
              left: '32.7%',
              top: 236,
              width: 50,
              height: 23,
              transform: 'rotate(15deg)',
            }}
          />

          <Image
            src="/class/banner-ellipse-2.svg"
            alt=""
            aria-hidden="true"
            className="absolute"
            width={42}
            height={19}
            style={{
              left: '59.2%',
              top: 43,
              width: 42,
              height: 19,
              transform: 'rotate(141.54deg)',
            }}
          />

          <Image
            src="/class/banner-ellipse-3.svg"
            alt=""
            aria-hidden="true"
            className="absolute"
            width={23}
            height={11}
            style={{
              left: '34.0%',
              top: 278,
              width: 23,
              height: 11,
              transform: 'rotate(-28.4deg)',
            }}
          />
        </div>

        {/* Hero heading */}
        <div
          className="relative z-10 flex flex-col items-center justify-end pb-500"
          style={{ minHeight: 'clamp(260px, 30.2vw, 580px)' }}
        >
          <h1 className="font-designer-62b text-center text-gray-1000">
            따라만 하면 완성되는
            <br />
            바이브 코딩 코스
          </h1>
        </div>

        {/* Marquee ticker */}
        <div className="flex h-800 items-center overflow-hidden bg-gray-1000">
          <div className="animate-marquee flex shrink-0 items-center gap-500 whitespace-nowrap px-500">
            {DOUBLED_MARQUEE.map((item, i) => (
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
          {courses?.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              onNotify={() => setNotifyModalOpen(true)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
