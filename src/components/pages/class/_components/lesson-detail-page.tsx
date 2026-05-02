'use client';

import Link from 'next/link';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { LessonContent } from './lesson-content';
import { LessonCurriculumDrawer } from './lesson-curriculum-drawer';
import { LessonFeedbackForm } from './lesson-feedback-form';
import { LessonRightSidebar } from './lesson-right-sidebar';
import { MaterialIcon } from './material-icon';
import { type LessonStatus } from './roadmap-tab';
import { VIBE_COURSE, VIBE_LESSONS } from '../_data/courses';

interface LessonDetailPageProps {
  lessonNum: number;
}

const PROTOTYPE_LESSON_STATUS: LessonStatus[] = [
  'done',
  'done',
  'current',
  'locked',
  'locked',
  'locked',
  'locked',
  'locked',
  'locked',
  'locked',
];

type ActiveTab = 'tutorial' | 'reflection';

const LessonStripeHeaderRow = forwardRef<
  HTMLDivElement,
  {
    id?: string;
    icon: string;
    title: string;
    meta?: React.ReactNode;
    /** 돌아보기 스트라이프처럼 본문과 구분되는 상단 보더 */
    dividerTop?: boolean;
  }
>(function LessonStripeHeaderRow({ id, icon, title, meta, dividerTop }, ref) {
  return (
    <div
      ref={ref}
      id={id}
      style={{
        padding: '14px 24px 14px 21px',
        borderTop: dividerTop ? '1px solid #E9EAEB' : undefined,
        borderBottom: '1px solid #E9EAEB',
        borderLeft: '3px solid #F63D68',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#FFFFFF',
        flexShrink: 0,
        scrollMarginTop: 172,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: '#F5F5F5',
          color: '#181D27',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        <MaterialIcon name={icon} size={21} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 19,
            fontWeight: 800,
            color: '#181D27',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
      </div>
      {meta ?? null}
    </div>
  );
});

LessonStripeHeaderRow.displayName = 'LessonStripeHeaderRow';

export function LessonDetailPage({ lessonNum }: LessonDetailPageProps) {
  const lesson = useMemo(
    () => VIBE_LESSONS.find((l) => l.num === lessonNum) ?? VIBE_LESSONS[0],
    [lessonNum],
  );
  const isFinalLesson = lesson.num === VIBE_LESSONS.length;
  const lessonStatus = PROTOTYPE_LESSON_STATUS;

  const doneCount = useMemo(
    () => lessonStatus.filter((s) => s === 'done').length,
    [lessonStatus],
  );
  const allDone = doneCount === lessonStatus.length;
  const progressPct = useMemo(
    () => (doneCount / VIBE_LESSONS.length) * 100,
    [doneCount],
  );
  const currentLessonNum = doneCount + 1;

  const tutorialRef = useRef<HTMLDivElement>(null);
  const reflectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('tutorial');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [layoutNarrow, setLayoutNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const apply = () => setLayoutNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const scrollTo = (which: ActiveTab) => {
    const target =
      which === 'tutorial' ? tutorialRef.current : reflectionRef.current;
    if (!target) return;
    setActiveTab(which);
    const top = target.getBoundingClientRect().top + window.scrollY - 172;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // Track which section is in view based on scroll position
  useEffect(() => {
    const onScroll = () => {
      const reflectionTop =
        reflectionRef.current?.getBoundingClientRect().top ??
        Number.POSITIVE_INFINITY;
      const threshold = window.innerHeight * 0.5;
      setActiveTab(reflectionTop < threshold ? 'reflection' : 'tutorial');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: '#FAFAFA', minHeight: 'calc(100vh - 64px)' }}>
      {/* CourseProgress 스타일 HUD + 레슨 탭 + 코스 내 링크 */}
      <div
        style={{
          position: 'sticky',
          top: 64,
          zIndex: 30,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E9EAEB',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '14px 48px',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#181D27',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {VIBE_COURSE.title}
          </div>

          <div
            style={{
              flex: 1,
              marginLeft: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 10,
                background: '#E9EAEB',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: '#F63D68',
                  borderRadius: 999,
                  transition: 'width .4s ease',
                }}
              />
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 4,
                fontSize: 18,
                fontWeight: 700,
                color: '#181D27',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {doneCount}
              <span style={{ color: '#D5D7DA', fontWeight: 400 }}>/</span>
              {VIBE_LESSONS.length}
            </span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: allDone ? '#F63D68' : '#181D27',
              color: '#fff',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}
          >
            {allDone ? <MaterialIcon name="emoji_events" size={15} /> : null}
            {allDone ? '완주!' : `Lesson ${currentLessonNum} 진행 중`}
          </div>
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 48px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexWrap: 'wrap',
            borderTop: '1px solid #F5F5F5',
          }}
        >
          <LessonSectionTabButton
            active={activeTab === 'tutorial'}
            icon="menu_book"
            label="따라해보기"
            onClick={() => scrollTo('tutorial')}
          />
          <LessonSectionTabButton
            active={activeTab === 'reflection'}
            icon="lightbulb"
            label="돌아보기"
            onClick={() => scrollTo('reflection')}
          />
          <span style={{ flex: 1 }} />
          <Link
            href="/class/vibe-intro/roadmap"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 18px',
              fontSize: 14,
              fontWeight: 600,
              color: '#535862',
              borderBottom: '2px solid transparent',
              textDecoration: 'none',
              transition: 'color 120ms ease, border-color 120ms ease',
              marginBottom: -1,
            }}
          >
            <MaterialIcon name="map" size={18} style={{ color: '#535862' }} />
            학습 여정 맵
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="커리큘럼 열기"
            aria-expanded={drawerOpen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 18px',
              fontSize: 14,
              fontWeight: drawerOpen ? 700 : 600,
              color: drawerOpen ? '#181D27' : '#535862',
              border: 0,
              borderBottom: drawerOpen
                ? '2px solid #F63D68'
                : '2px solid transparent',
              marginBottom: -1,
              background: 'transparent',
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition:
                'color 120ms ease, border-color 120ms ease, font-weight 120ms ease',
            }}
          >
            <MaterialIcon
              name="menu_book"
              size={18}
              style={{
                color: drawerOpen ? '#F63D68' : '#535862',
              }}
            />
            커리큘럼
          </button>
        </div>
      </div>

      {/* Main grid: center stack + right sticky */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '20px 48px 80px',
          display: 'grid',
          gridTemplateColumns: layoutNarrow
            ? 'minmax(0, 1fr)'
            : 'minmax(0, 1fr) minmax(280px, 320px)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            minWidth: 0,
          }}
        >
          <section
            style={{
              background: '#fff',
              border: '1px solid #E9EAEB',
              borderRadius: 16,
              boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
              overflow: 'hidden',
              scrollMarginTop: 172,
            }}
          >
            <LessonStripeHeaderRow
              ref={tutorialRef}
              id="lesson-tutorial"
              icon="menu_book"
              title="따라해보기"
              meta={
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: '#535862',
                    flexShrink: 0,
                  }}
                >
                  <MaterialIcon name="schedule" size={13} />약 {lesson.minutes}
                  분
                </span>
              }
            />
            <div style={{ padding: '24px 36px 32px' }}>
              <LessonContent lesson={lesson} isFinalLesson={isFinalLesson} />
            </div>
          </section>

          <section
            style={{
              background: '#fff',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 16,
              boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
              overflow: 'hidden',
              scrollMarginTop: 172,
            }}
          >
            <LessonStripeHeaderRow
              ref={reflectionRef}
              id="lesson-reflection"
              icon="lightbulb"
              title="돌아보기"
              meta={
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: '#535862',
                    flexShrink: 0,
                  }}
                >
                  <MaterialIcon name="schedule" size={13} />약 5분
                </span>
              }
            />
            <div style={{ padding: '24px 36px 32px' }}>
              <LessonFeedbackForm
                lessonNum={lesson.num}
                isFinalLesson={isFinalLesson}
              />
            </div>
          </section>
        </main>

        <LessonRightSidebar lesson={lesson} isFinalLesson={isFinalLesson} />
      </div>

      <LessonCurriculumDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentLessonNum={lesson.num}
        lessonStatus={lessonStatus}
      />
    </div>
  );
}

function LessonSectionTabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 18px',
        fontSize: 14,
        fontWeight: active ? 700 : 600,
        color: active ? '#181D27' : '#535862',
        borderBottom: active ? '2px solid #F63D68' : '2px solid transparent',
        marginBottom: -1,
        background: 'transparent',
        borderLeft: 0,
        borderRight: 0,
        borderTop: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        textDecoration: 'none',
        transition: 'color 120ms ease, border-color 120ms ease',
      }}
    >
      <MaterialIcon
        name={icon}
        size={18}
        style={{ color: active ? '#F63D68' : '#535862' }}
      />
      {label}
    </button>
  );
}
