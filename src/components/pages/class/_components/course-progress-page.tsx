'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { FeedTab } from './feed-tab';
import { MaterialIcon } from './material-icon';
import { QnaTab } from './qna-tab';
import { RoadmapTab } from './roadmap-tab';
import { VIBE_COURSE, VIBE_LESSONS } from '../_data/courses';
import { useClassPrototypeStore } from '../_data/use-class-prototype-store';

type TabKey = 'roadmap' | 'feed' | 'qna';

const TABS: { id: TabKey; label: string; icon: string }[] = [
  { id: 'roadmap', label: '학습 여정 맵', icon: 'map' },
  { id: 'feed', label: '빌더 피드', icon: 'photo_library' },
  { id: 'qna', label: '질문답변', icon: 'forum' },
];

function resolveTab(raw: string | undefined): TabKey {
  if (raw === 'feed' || raw === 'qna') return raw;
  return 'roadmap';
}

export function CourseProgressPage() {
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams.get('tab') ?? undefined);

  const lessonStatus = useClassPrototypeStore((s) => s.lessonStatus);
  const doneCount = useMemo(
    () => lessonStatus.filter((s) => s === 'done').length,
    [lessonStatus],
  );
  const allDone = doneCount === lessonStatus.length;
  const progressPct = (doneCount / VIBE_LESSONS.length) * 100;
  const currentLessonNum = doneCount + 1;

  return (
    <div style={{ background: '#fff' }}>
      {/* HUD bar */}
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

          {/* Progress bar */}
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

          {/* 현재 진행 상태 */}
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

        {/* Tabs immediately below HUD */}
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 48px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            borderTop: '1px solid #F5F5F5',
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            const href =
              t.id === 'roadmap'
                ? '/class/vibe-intro/roadmap'
                : `/class/vibe-intro/roadmap?tab=${t.id}`;
            return (
              <Link
                key={t.id}
                href={href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 18px',
                  fontSize: 14,
                  fontWeight: active ? 700 : 600,
                  color: active ? '#181D27' : '#535862',
                  borderBottom: active
                    ? '2px solid #F63D68'
                    : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'color 120ms ease, border-color 120ms ease',
                  marginBottom: -1,
                }}
              >
                <MaterialIcon
                  name={t.icon}
                  size={18}
                  style={{ color: active ? '#F63D68' : '#535862' }}
                />
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'roadmap' ? <RoadmapTab lessonStatus={lessonStatus} /> : null}
      {tab === 'feed' ? <FeedTab /> : null}
      {tab === 'qna' ? <QnaTab /> : null}
    </div>
  );
}
