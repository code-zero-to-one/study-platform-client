'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MaterialIcon } from './material-icon';
import { VIBE_COURSE, VIBE_LESSONS, type CourseLesson } from '../_data/courses';

export type LessonStatus = 'done' | 'current' | 'locked';

interface RoadmapTabProps {
  lessonStatus: LessonStatus[];
}

interface RoadmapNode extends CourseLesson {
  x: number;
  y: number;
  idx: number;
}

const W = 720;
const ROW_H = 140;

export function RoadmapTab({ lessonStatus }: RoadmapTabProps) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<
    { idx: number; msg: string } | undefined
  >(undefined);

  const nodes: RoadmapNode[] = VIBE_LESSONS.map((l, i) => {
    const row = Math.floor(i / 2);
    const colInRow = i % 2;
    const goingRight = row % 2 === 0;
    const xs = goingRight ? [W * 0.25, W * 0.72] : [W * 0.72, W * 0.25];
    const x = xs[colInRow];
    const y = 56 + row * ROW_H + colInRow * 40;
    return { ...l, x, y, idx: i };
  });

  const buildPath = (segNodes: RoadmapNode[]) =>
    segNodes.reduce((acc, n, i) => {
      if (i === 0) return `M ${n.x} ${n.y}`;
      const prev = segNodes[i - 1];
      const midY = (prev.y + n.y) / 2;
      return `${acc} C ${prev.x} ${midY}, ${n.x} ${midY}, ${n.x} ${n.y}`;
    }, '');

  const pathD = buildPath(nodes);
  const totalH = 60 + Math.ceil(VIBE_LESSONS.length / 2) * ROW_H + 60;

  const doneCount = lessonStatus.filter((s) => s === 'done').length;
  const allDone = doneCount === lessonStatus.length;

  const lastDoneIdx = lessonStatus.reduce(
    (acc, s, i) => (s === 'done' ? i : acc),
    -1,
  );
  const filledPath =
    lastDoneIdx >= 0 ? buildPath(nodes.slice(0, lastDoneIdx + 2)) : '';

  const chapterLabels = VIBE_COURSE.chapters
    .map((c) => {
      const firstNode = nodes.find((n) => n.ch === c.id);
      return firstNode ? { ...c, y: firstNode.y - 50 } : undefined;
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const handleNodeClick = (node: RoadmapNode) => {
    const status = lessonStatus[node.idx];
    if (status === 'locked') {
      setTooltip({ idx: node.idx, msg: '이전 레슨을 먼저 완료해야 해요 🔒' });
      setTimeout(() => setTooltip(undefined), 2400);
      return;
    }
    router.push(`/class/vibe-intro/${node.num}`);
  };

  return (
    <div
      style={{
        background:
          'linear-gradient(180deg, #FFE4E8 0%, #FFF1F4 35%, #FFFFFF 100%)',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          padding: '32px 24px 80px',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 58 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: 999,
              background: '#FFE4E8',
              color: '#C01048',
              letterSpacing: '-0.005em',
            }}
          >
            YOUR JOURNEY
          </span>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '12px 0 6px',
              color: '#181D27',
            }}
          >
            여기가 <span style={{ color: '#F63D68' }}>당신의 출발선</span>이에요
          </h1>
          <p style={{ fontSize: 14, color: '#535862', margin: 0 }}>
            한 스테이지씩 깨면서, 5일 후 첫 배포까지 데려갈게요.
          </p>
        </div>

        <div
          style={{
            position: 'relative',
            width: W,
            margin: '0 auto',
            height: totalH,
          }}
        >
          <svg
            width={W}
            height={totalH}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="roadmap-dotline"
                patternUnits="userSpaceOnUse"
                width="14"
                height="14"
                patternTransform="rotate(45)"
              >
                <circle cx="3" cy="3" r="2" fill="#D5D7DA" />
              </pattern>
              <linearGradient id="roadmap-pathgrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F63D68" />
                <stop offset="100%" stopColor="#FD6F8E" />
              </linearGradient>
            </defs>
            <path
              d={pathD}
              fill="none"
              stroke="url(#roadmap-dotline)"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.7"
            />
            {filledPath ? (
              <path
                d={filledPath}
                fill="none"
                stroke="url(#roadmap-pathgrad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </svg>

          {chapterLabels.map((c) => (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: c.y - 16,
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#fff',
                  border: '1px solid #E9EAEB',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#181D27',
                  letterSpacing: '0.04em',
                  boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
                }}
              >
                <MaterialIcon
                  name={c.emoji}
                  size={13}
                  style={{ color: '#F63D68' }}
                />
                {c.num} · {c.title}
              </span>
            </div>
          ))}

          {nodes.map((n) => {
            const status = lessonStatus[n.idx];
            const isCurrent = status === 'current';
            const isDone = status === 'done';
            const isLocked = status === 'locked';
            return (
              <div
                key={n.idx}
                style={{
                  position: 'absolute',
                  left: n.x,
                  top: n.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {tooltip && tooltip.idx === n.idx ? (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '110%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#181D27',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      boxShadow:
                        '0 4px 8px -2px rgba(16,24,40,0.10), 0 2px 4px -2px rgba(16,24,40,0.06)',
                    }}
                  >
                    {tooltip.msg}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => handleNodeClick(n)}
                  aria-label={`레슨 ${n.num} ${n.title}`}
                  style={{
                    width: isCurrent ? 62 : 52,
                    height: isCurrent ? 62 : 52,
                    borderRadius: '50%',
                    border: 0,
                    padding: 0,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    background: isDone
                      ? 'linear-gradient(180deg, #F63D68, #E31B54)'
                      : isCurrent
                        ? 'linear-gradient(180deg, #fff, #FFE4E8)'
                        : '#F5F5F5',
                    boxShadow: isCurrent
                      ? '0 0 0 4px rgba(246,61,104,0.18), 0 6px 12px rgba(246,61,104,0.25)'
                      : isDone
                        ? '0 4px 10px -3px rgba(246,61,104,0.4)'
                        : '0 3px 6px rgba(16,24,40,0.06)',
                    color: isDone ? '#fff' : isCurrent ? '#E31B54' : '#A4A7AE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    transition: 'transform .15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLocked)
                      e.currentTarget.style.transform = 'scale(1.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                  }}
                >
                  {isCurrent ? (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        border: '3px solid #F63D68',
                        animation: 'roadmap-pulse 1.6s ease-out infinite',
                      }}
                    />
                  ) : null}
                  {isDone ? <MaterialIcon name="check" size={22} /> : null}
                  {isCurrent ? (
                    <MaterialIcon
                      name="play_arrow"
                      size={20}
                      style={{ color: '#F63D68' }}
                    />
                  ) : null}
                  {isLocked ? <MaterialIcon name="lock" size={18} /> : null}
                </button>

                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isLocked ? '#A4A7AE' : '#E31B54',
                      letterSpacing: '0.05em',
                    }}
                  >
                    LESSON {n.num}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginTop: 2,
                      color: isLocked ? '#A4A7AE' : '#181D27',
                    }}
                  >
                    {n.title}
                  </div>
                </div>

                {isCurrent ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: 'calc(100% + 16px)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#181D27',
                      color: '#fff',
                      padding: '8px 14px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      boxShadow:
                        '0 4px 8px -2px rgba(16,24,40,0.18), 0 2px 4px -2px rgba(16,24,40,0.10)',
                    }}
                  >
                    <MaterialIcon
                      name="group"
                      size={16}
                      style={{ color: '#fff' }}
                    />
                    24명이 함께 달리는 중
                  </div>
                ) : null}
              </div>
            );
          })}

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: nodes[0].x,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div
              style={{
                padding: '6px 14px',
                background: '#181D27',
                color: '#fff',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              START
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              top: nodes[nodes.length - 1].y + 90,
              left: nodes[nodes.length - 1].x,
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            {allDone ? (
              <button
                type="button"
                onClick={() => router.push('/class/vibe-intro/celebrate')}
                style={{
                  padding: '14px 22px',
                  background: 'linear-gradient(135deg, #F63D68, #C01048)',
                  color: '#fff',
                  border: 0,
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 24px -4px rgba(246,61,104,0.25)',
                  animation: 'roadmap-celebrate 2.4s ease-in-out infinite',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(-2px) scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                }}
              >
                <MaterialIcon name="emoji_events" size={20} />
                완주 축하 페이지로 가기
                <MaterialIcon name="arrow_forward" size={18} />
              </button>
            ) : (
              <div
                style={{
                  padding: '6px 14px',
                  background: '#181D27',
                  color: '#fff',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                FINISH
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes roadmap-pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.4); opacity: 0; }
          }
          @keyframes roadmap-celebrate {
            0%, 100% { box-shadow: 0 8px 24px rgba(246, 61, 104, 0.32); }
            50% { box-shadow: 0 12px 32px rgba(246, 61, 104, 0.55); }
          }
        `}</style>
      </div>
    </div>
  );
}
