'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MaterialIcon } from './material-icon';
import { VIBE_COURSE, VIBE_LESSONS } from '../_data/courses';

export function CurriculumAccordion() {
  const router = useRouter();
  const [openLesson, setOpenLesson] = useState<number | null>(null);
  const [hoverLock, setHoverLock] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {VIBE_COURSE.chapters.map((ch, chIdx) => {
        const chLessons = VIBE_LESSONS.filter((l) => l.ch === ch.id);
        const minutes = chLessons.reduce((s, l) => s + l.minutes, 0);
        return (
          <div key={ch.id}>
            {/* Chapter header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: chIdx === 0 ? '#F63D68' : '#181D27',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MaterialIcon name={ch.emoji} size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#717680',
                    letterSpacing: '0.08em',
                  }}
                >
                  DAY {chIdx + 1} · {ch.num}
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#181D27',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {ch.title}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#535862' }}>
                예상 학습 시간 {minutes}분
              </div>
            </div>

            {/* Lesson rows */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                marginLeft: 50,
              }}
            >
              {chLessons.map((lesson) => {
                const isLocked = lesson.num >= 3;
                const isOpen = openLesson === lesson.num;
                const isHover = hoverLock === lesson.num;

                return (
                  <div
                    key={lesson.num}
                    style={{
                      position: 'relative',
                      border: `1px solid ${isOpen ? '#D5D7DA' : '#E9EAEB'}`,
                      borderRadius: 12,
                      background: isOpen ? '#FAFAFA' : '#fff',
                      overflow: 'visible',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          setOpenLesson(isOpen ? null : lesson.num);
                        } else {
                          router.push(`/class/vibe-intro/${lesson.num}`);
                        }
                      }}
                      onMouseEnter={() => isLocked && setHoverLock(lesson.num)}
                      onMouseLeave={() => setHoverLock(null)}
                      className={isLocked ? '' : 'lesson-row-free group'}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: 0,
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: 'background 160ms ease',
                        borderRadius: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isLocked ? '#717680' : '#E31B54',
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                          letterSpacing: '0.04em',
                          minWidth: 36,
                        }}
                      >
                        L{String(lesson.num).padStart(2, '0')}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: 15,
                          fontWeight: 600,
                          color: isLocked ? '#252B37' : '#181D27',
                        }}
                      >
                        {lesson.title}
                      </span>
                      {!isLocked ? (
                        <>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#E31B54',
                              background: '#FFE4E8',
                              padding: '3px 10px',
                              borderRadius: 999,
                              letterSpacing: '0.04em',
                            }}
                          >
                            FREE
                          </span>
                          <span
                            className="lesson-row-free__cta"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#E31B54',
                              opacity: 0,
                              transition:
                                'opacity 160ms ease, transform 160ms ease',
                              transform: 'translateX(-4px)',
                            }}
                          >
                            미리보기
                            <MaterialIcon name="arrow_forward" size={14} />
                          </span>
                        </>
                      ) : (
                        <>
                          <MaterialIcon
                            name="lock"
                            size={18}
                            style={{ color: '#717680' }}
                          />
                          <MaterialIcon
                            name={isOpen ? 'remove' : 'add'}
                            size={20}
                            style={{ color: '#535862' }}
                          />
                        </>
                      )}
                    </button>

                    {/* Hover tooltip on locked lessons */}
                    {isLocked && isHover && !isOpen ? (
                      <div
                        style={{
                          position: 'absolute',
                          top: -10,
                          left: '50%',
                          transform: 'translate(-50%, -100%)',
                          background: '#181D27',
                          color: '#fff',
                          padding: '10px 14px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          boxShadow:
                            '0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)',
                          zIndex: 5,
                          pointerEvents: 'none',
                        }}
                      >
                        <MaterialIcon
                          name="lock"
                          size={14}
                          style={{
                            verticalAlign: '-2px',
                            marginRight: 6,
                            color: '#FEA3B4',
                          }}
                        />
                        결제하여 나만의 사이트 구현하기
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -6,
                            left: '50%',
                            transform: 'translateX(-50%) rotate(45deg)',
                            width: 12,
                            height: 12,
                            background: '#181D27',
                          }}
                        />
                      </div>
                    ) : null}

                    {isOpen && isLocked ? (
                      <div
                        style={{
                          padding: '0 20px 18px 70px',
                          fontSize: 14,
                          lineHeight: 1.65,
                          color: '#252B37',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                        }}
                      >
                        <MaterialIcon
                          name="flag"
                          size={16}
                          style={{
                            color: '#F63D68',
                            marginTop: 2,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#717680',
                              letterSpacing: '0.08em',
                              marginBottom: 4,
                            }}
                          >
                            학습 목표
                          </div>
                          {lesson.goal}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <style>{`
        .lesson-row-free:hover {
          background: #FFF1F3 !important;
        }
        .lesson-row-free:hover .lesson-row-free__cta {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </div>
  );
}
