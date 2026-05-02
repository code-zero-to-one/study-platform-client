'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MaterialIcon } from './material-icon';
import { type LessonStatus } from './roadmap-tab';
import { VIBE_COURSE, VIBE_LESSONS } from '../_data/courses';

interface LessonCurriculumDrawerProps {
  open: boolean;
  onClose: () => void;
  currentLessonNum: number;
  lessonStatus: LessonStatus[];
}

export function LessonCurriculumDrawer({
  open,
  onClose,
  currentLessonNum,
  lessonStatus,
}: LessonCurriculumDrawerProps) {
  const initialChapter =
    VIBE_LESSONS.find((l) => l.num === currentLessonNum)?.ch ?? 'ch1';
  const [expandedCh, setExpandedCh] = useState<Set<string>>(
    () => new Set([initialChapter]),
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const lessonsByCh = VIBE_COURSE.chapters.reduce<
    Record<string, typeof VIBE_LESSONS>
  >((acc, ch) => {
    acc[ch.id] = VIBE_LESSONS.filter((l) => l.ch === ch.id);
    return acc;
  }, {});

  const toggleCh = (chId: string) => {
    setExpandedCh((prev) => {
      const next = new Set(prev);
      if (next.has(chId)) next.delete(chId);
      else next.add(chId);
      return next;
    });
  };

  const chapterStatus = (
    chId: string,
  ): 'done' | 'current' | 'locked' | 'in-progress' => {
    const lessons = lessonsByCh[chId] ?? [];
    const statuses = lessons.map((l) => lessonStatus[l.num - 1]);
    if (statuses.every((s) => s === 'done')) return 'done';
    if (statuses.some((s) => s === 'current')) return 'current';
    if (statuses.every((s) => s === 'locked')) return 'locked';
    return 'in-progress';
  };

  const done = lessonStatus.filter((s) => s === 'done').length;
  const total = lessonStatus.length;
  const pct = Math.round((done / total) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,13,18,0.32)',
          zIndex: 45,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
        }}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-label="커리큘럼"
        aria-hidden={!open}
        style={{
          position: 'fixed',
          top: 64,
          right: 0,
          width: 340,
          maxWidth: '92vw',
          height: 'calc(100vh - 64px)',
          background: '#fff',
          borderLeft: '1px solid #E9EAEB',
          boxShadow: open
            ? '-12px 0 32px -8px rgba(16,24,40,0.12), -4px 0 8px -2px rgba(16,24,40,0.06)'
            : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms cubic-bezier(.2,.8,.3,1)',
          zIndex: 46,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid #E9EAEB',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: '#181D27',
                letterSpacing: '-0.01em',
              }}
            >
              {VIBE_COURSE.title}
            </div>
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontSize: 11,
                  color: '#535862',
                  marginBottom: 6,
                }}
              >
                <span>진행률</span>
                <span
                  style={{
                    fontFamily: 'var(--font-pretendard), sans-serif',
                    fontWeight: 700,
                    color: '#181D27',
                  }}
                >
                  {done}/{total} · {pct}%
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: '#F5F5F5',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: '#F63D68',
                    transition: 'width .3s ease',
                  }}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="커리큘럼 닫기"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 0,
              background: 'transparent',
              color: '#535862',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F5F5F5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        {/* Chapter list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {VIBE_COURSE.chapters.map((ch) => {
            const isExpanded = expandedCh.has(ch.id);
            const lessons = lessonsByCh[ch.id] ?? [];
            const status = chapterStatus(ch.id);
            const isLocked = status === 'locked';
            const iconBg =
              status === 'done'
                ? '#D1FADF'
                : status === 'locked'
                  ? '#F5F5F5'
                  : '#FFE4E8';
            const iconFg =
              status === 'done'
                ? '#027A48'
                : status === 'locked'
                  ? '#717680'
                  : '#E31B54';

            return (
              <div key={ch.id} style={{ padding: '0 8px', marginBottom: 2 }}>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-label={
                    isLocked
                      ? `${ch.title}(잠긴 챕터) 하위 레슨 ${isExpanded ? '접기' : '펼치기'}`
                      : `${ch.title} 하위 레슨 ${isExpanded ? '접기' : '펼치기'}`
                  }
                  onClick={() => toggleCh(ch.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    border: 0,
                    background: isExpanded ? '#FAFAFA' : 'transparent',
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: iconBg,
                      color: iconFg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MaterialIcon
                      name={isLocked ? 'lock' : ch.emoji}
                      size={14}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        fontFamily: 'var(--font-pretendard), sans-serif',
                        color: '#535862',
                      }}
                    >
                      {ch.num}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#181D27',
                        letterSpacing: '-0.005em',
                        marginTop: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ch.title}
                    </div>
                  </div>
                  <MaterialIcon
                    name={
                      isExpanded
                        ? 'keyboard_arrow_down'
                        : 'keyboard_arrow_right'
                    }
                    size={16}
                    style={{ color: '#717680', flexShrink: 0 }}
                  />
                </button>

                {isExpanded ? (
                  <div
                    style={{
                      padding: '4px 0 6px 12px',
                      marginLeft: 21,
                      borderLeft: '1px dashed #E9EAEB',
                    }}
                  >
                    {lessons.map((l) => {
                      const lStatus = lessonStatus[l.num - 1];
                      const isCurrent = l.num === currentLessonNum;
                      const lLocked = lStatus === 'locked';
                      const lDone = lStatus === 'done';

                      return (
                        <Link
                          key={l.num}
                          href={lLocked ? '#' : `/class/vibe-intro/${l.num}`}
                          aria-disabled={lLocked}
                          onClick={(e) => {
                            if (lLocked) e.preventDefault();
                            if (!lLocked) onClose();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 10px',
                            borderRadius: 6,
                            fontFamily: 'inherit',
                            background: isCurrent ? '#FFE4E8' : 'transparent',
                            color: lLocked
                              ? '#717680'
                              : isCurrent
                                ? '#C01048'
                                : '#252B37',
                            cursor: lLocked ? 'not-allowed' : 'pointer',
                            textDecoration: 'none',
                            transition: 'background .12s',
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: lDone
                                ? '#12B76A'
                                : isCurrent
                                  ? '#F63D68'
                                  : lLocked
                                    ? 'transparent'
                                    : '#F5F5F5',
                              border: lLocked
                                ? '1px dashed #D5D7DA'
                                : lDone || isCurrent
                                  ? '0'
                                  : '1px solid #D5D7DA',
                              color: '#fff',
                            }}
                          >
                            {lDone ? (
                              <MaterialIcon
                                name="check"
                                size={12}
                                style={{ color: '#fff' }}
                              />
                            ) : null}
                            {isCurrent && !lDone ? (
                              <div
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: '#fff',
                                }}
                              />
                            ) : null}
                            {lLocked ? (
                              <MaterialIcon
                                name="lock"
                                size={10}
                                style={{ color: '#717680' }}
                              />
                            ) : null}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 10,
                                fontFamily:
                                  'var(--font-pretendard), sans-serif',
                                color: isCurrent ? '#E31B54' : '#717680',
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                              }}
                            >
                              L{String(l.num).padStart(2, '0')}
                            </div>
                            <div
                              style={{
                                fontSize: 12.5,
                                lineHeight: 1.35,
                                fontWeight: isCurrent ? 700 : 500,
                                marginTop: 1,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {l.title}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 12px',
            borderTop: '1px solid #E9EAEB',
            background: '#FAFAFA',
            flexShrink: 0,
          }}
        >
          <Link
            href="/class/vibe-intro/roadmap"
            onClick={onClose}
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#535862',
              textDecoration: 'none',
            }}
          >
            <MaterialIcon name="map" size={14} />
            학습 여정 지도로 돌아가기
          </Link>
        </div>
      </aside>
    </>
  );
}
