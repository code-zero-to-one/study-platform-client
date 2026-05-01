import Link from 'next/link';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { ComingSoonSlot } from './coming-soon-slot';
import { MaterialIcon } from './material-icon';
import {
  type AvailableCourse,
  CLASS_TRUST_INDICATORS,
  COMING_SOON_COURSES,
  type ComingSoonCourse,
  VIBE_COURSE,
} from '../_data/courses';

export function ClassMainPage() {
  return (
    <div className="bg-background-alternative min-h-screen pb-1400">
      <ClassHero />
      <div className="mx-auto w-full max-w-page px-600 pt-500">
        <CourseGrid course={VIBE_COURSE} comingSoon={COMING_SOON_COURSES} />
        <TrustStrip />
      </div>
    </div>
  );
}

function ClassHero() {
  return (
    <div
      className="border-b border-border-subtle"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
        padding: '56px 0 32px',
      }}
    >
      <div className="mx-auto w-full max-w-page px-600">
        <h1
          className="text-text-strong font-bold m-0"
          style={{
            fontSize: 44,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            fontWeight: 800,
          }}
        >
          지금 가장 빠르게 <span className="text-text-brand">만드는 사람</span>
          이 되는 길
        </h1>
        <p
          className="text-text-subtle font-designer-16r mt-150 max-w-240"
          style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 620 }}
        >
          아이디어가 있는데 만들 줄 몰라서 멈춰 있던 모든 예비 빌더들에게.
          <br />
          ZERO-ONE은 코딩이 아니라 <b className="text-text-strong">완성 경험</b>
          을 먼저 가르칩니다.
        </p>
      </div>
    </div>
  );
}

function CourseGrid({
  course,
  comingSoon,
}: {
  course: AvailableCourse;
  comingSoon: ComingSoonCourse[];
}) {
  return (
    <div
      className="grid gap-300"
      style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
    >
      <FeaturedCourseCard course={course} />
      {comingSoon.map((c) => (
        <ComingSoonSlot key={c.id} course={c} />
      ))}
    </div>
  );
}

function FeaturedCourseCard({ course }: { course: AvailableCourse }) {
  return (
    <Link
      href={`/class/${course.slug}`}
      className={cn(
        'group bg-background-default border-border-subtle rounded-200 shadow-1 overflow-hidden border',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-50 hover:shadow-3',
      )}
    >
      <CourseThumbnail
        thumbAccent={course.thumbAccent}
        ribbon={course.ribbon}
      />

      <div className="px-300 pt-250 pb-300">
        <div className="flex gap-75">
          {course.badge.map((b) => (
            <Badge
              key={b.label}
              variant={b.kind === 'level' ? 'brand' : 'neutral'}
            >
              {b.label}
            </Badge>
          ))}
        </div>
        <h3
          className="font-bold-h6 text-text-strong mt-150"
          style={{ letterSpacing: '-0.01em' }}
        >
          {course.title}
        </h3>
        <p className="font-designer-13r text-text-subtle mt-75">
          {course.tagline}
        </p>

        <div className="border-border-subtle mt-225 flex items-baseline justify-between border-t pt-200">
          <div>
            <div className="font-designer-11r text-text-subtlest line-through">
              ₩{course.originalPrice.toLocaleString()}
            </div>
            <div
              className="font-bold-h5 text-text-brand"
              style={{ fontWeight: 800, letterSpacing: '-0.01em' }}
            >
              ₩{course.price.toLocaleString()}
            </div>
          </div>
          <span
            className={cn(
              'font-designer-14b inline-flex items-center gap-75 rounded-100 px-200 py-150',
              'bg-fill-neutral-strong-default text-text-inverse',
              'group-hover:bg-fill-neutral-strong-hover transition-colors',
            )}
            aria-hidden="true"
          >
            자세히 보기
            <MaterialIcon name="arrow_forward" size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CourseThumbnail({
  thumbAccent,
  ribbon,
}: {
  thumbAccent: string;
  ribbon?: string;
}) {
  return (
    <div
      className="relative flex h-200 items-end p-250"
      style={{ background: thumbAccent }}
    >
      <svg
        viewBox="0 0 200 200"
        width={180}
        height={180}
        aria-hidden="true"
        className="absolute"
        style={{ right: -10, top: -20, opacity: 0.95 }}
      >
        <rect
          x="40"
          y="50"
          width="110"
          height="78"
          rx="6"
          fill="#FFFFFF"
          opacity="0.95"
        />
        <rect x="40" y="50" width="110" height="14" rx="6" fill="#FFE4E8" />
        <circle cx="48" cy="57" r="2" fill="#F63D68" />
        <circle cx="56" cy="57" r="2" fill="#F63D68" />
        <text
          x="50"
          y="92"
          fontFamily="ui-monospace"
          fontSize="13"
          fontWeight="700"
          fill="#F63D68"
        >
          {'<vibe>'}
        </text>
        <text
          x="50"
          y="110"
          fontFamily="ui-monospace"
          fontSize="13"
          fontWeight="700"
          fill="#A11043"
        >
          {'coding</>'}
        </text>
        <rect
          x="80"
          y="128"
          width="30"
          height="6"
          rx="2"
          fill="#717680"
          opacity="0.4"
        />
        <path
          d="M165 35 L168 45 L178 48 L168 51 L165 61 L162 51 L152 48 L162 45 Z"
          fill="#FFFFFF"
        />
        <path
          d="M30 145 L33 153 L41 155 L33 158 L30 166 L27 158 L19 155 L27 153 Z"
          fill="#FFE4E8"
        />
      </svg>
      {ribbon ? (
        <span
          className={cn(
            'font-designer-11b absolute rounded-full px-200 py-25',
            'bg-fill-neutral-strong-default text-text-inverse',
          )}
          style={{ top: 16, left: 16, letterSpacing: '0.05em' }}
        >
          {ribbon}
        </span>
      ) : null}
    </div>
  );
}

function TrustStrip() {
  return (
    <div
      className={cn(
        'bg-background-default border-border-subtle rounded-200 mt-700 grid gap-300 border',
      )}
      style={{
        gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '32px 36px',
      }}
    >
      {CLASS_TRUST_INDICATORS.map((s) => (
        <div key={s.label} className="flex items-start gap-175">
          <div
            className={cn(
              'h-500 w-500 rounded-100 flex shrink-0 items-center justify-center',
              'bg-rose-100 text-rose-600',
            )}
          >
            <MaterialIcon name={s.icon} size={22} />
          </div>
          <div>
            <div
              className="font-bold-h4 text-text-strong"
              style={{ fontWeight: 800, letterSpacing: '-0.01em' }}
            >
              {s.num}
            </div>
            <div className="font-designer-13r text-text-subtle">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface BadgeProps {
  variant: 'brand' | 'neutral' | 'dark';
  children: React.ReactNode;
}

function Badge({ variant, children }: BadgeProps) {
  const variantClass = (() => {
    switch (variant) {
      case 'brand':
        return 'bg-rose-100 text-rose-700';
      case 'dark':
        return 'bg-fill-neutral-strong-default text-text-inverse';
      case 'neutral':
      default:
        return 'bg-fill-neutral-default-default text-text-default';
    }
  })();

  return (
    <span
      className={cn(
        'font-designer-12b inline-flex items-center gap-50 rounded-full px-150 py-25',
        variantClass,
      )}
      style={{ letterSpacing: '-0.005em' }}
    >
      {children}
    </span>
  );
}
