'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MaterialIcon } from './material-icon';
import { type LessonStatus } from './roadmap-tab';
import { VIBE_COURSE, VIBE_LESSONS } from '../_data/courses';

interface LessonCurriculumSidebarProps {
  currentLessonNum: number;
  lessonStatus: LessonStatus[];
  /** Matches center column `SectionHeader` band height. */
  headerBandPx: number;
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
}

export function LessonCurriculumSidebar({
  currentLessonNum,
  lessonStatus,
  headerBandPx,
  expanded,
  onExpandedChange,
}: LessonCurriculumSidebarProps) {
  const initialChapter =
    VIBE_LESSONS.find((l) => l.num === currentLessonNum)?.ch ?? 'ch1';
  const [expandedCh, setExpandedCh] = useState<Set<string>>(
    () => new Set([initialChapter]),
  );

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

  if (!expanded) {
    return (
      <aside
        style={{
          position: 'sticky',
          top: 88,
          alignSelf: 'start',
        }}
      >
        <button
          type="button"
          aria-expanded={false}
          aria-controls="lesson-curriculum-panel"
          aria-label="커리큘럼 펼치기"
          onClick={() => onExpandedChange(true)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '14px 8px',
            border: '1px solid #E9EAEB',
            borderRadius: 16,
            background: '#fff',
            boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MaterialIcon
            name="menu_book"
            size={22}
            style={{ color: '#252B37' }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'var(--font-pretendard), sans-serif',
              color: '#535862',
              lineHeight: 1.25,
              textAlign: 'center',
            }}
          >
            커리큘럼
          </span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      style={{
        position: 'sticky',
        top: 88,
        alignSelf: 'start',
        maxHeight: 'calc(100vh - 104px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        id="lesson-curriculum-panel"
        style={{
          background: '#fff',
          border: '1px solid #E9EAEB',
          borderRadius: 16,
          boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 104px)',
        }}
      >
        {/* Header — same vertical band height as lesson `SectionHeader` */}
        <div
          style={{
            boxSizing: 'border-box',
            minHeight: headerBandPx,
            padding: '14px 12px 14px 16px',
            borderBottom: '1px solid #E9EAEB',
            background: '#fff',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#181D27',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {VIBE_COURSE.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
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
              <span
                style={{
                  flexShrink: 0,
                  fontFamily: 'var(--font-pretendard), sans-serif',
                  fontWeight: 700,
                  fontSize: 11,
                  color: '#181D27',
                }}
              >
                {done}/{total} · {pct}%
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="커리큘럼 패널 접기"
            aria-expanded={true}
            aria-controls="lesson-curriculum-panel"
            onClick={() => onExpandedChange(false)}
            style={{
              flexShrink: 0,
              width: 34,
              height: 34,
              borderRadius: 8,
              border: 0,
              background: '#F5F5F5',
              color: '#535862',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcon name="chevron_left" size={20} />
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

        {/* Footer back link */}
        <div
          style={{
            padding: '10px 12px',
            borderTop: '1px solid #E9EAEB',
            background: '#FAFAFA',
          }}
        >
          <Link
            href="/class/vibe-intro/roadmap"
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 6,
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#535862',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            <MaterialIcon name="map" size={14} />
            학습 여정 지도로 돌아가기
          </Link>
        </div>
      </div>
    </aside>
  );
}
