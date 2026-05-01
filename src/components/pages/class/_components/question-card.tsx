'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DUMMY_PROFILE_IMAGE_SRC } from '@/components/pages/community/_data/community-dummy-assets';
import { GradeBadge } from './builder-detail-modal';
import { MaterialIcon } from './material-icon';
import { VIBE_LESSONS } from '../_data/courses';
import { type QnaQuestion } from '../_data/qna-data';

interface QuestionCardProps {
  q: QnaQuestion;
  expanded: boolean;
  onToggle: () => void;
  onExpand?: () => void;
  onAnswerClick?: () => void;
  isAdmin?: boolean;
  hideExpandIcon?: boolean;
}

export function QuestionCard({
  q,
  expanded,
  onToggle,
  onExpand,
  onAnswerClick,
  isAdmin,
  hideExpandIcon,
}: QuestionCardProps) {
  const lesson = VIBE_LESSONS.find((l) => l.num === q.lessonNum);
  const answerCount = q.answers.length;
  const [viewerSrc, setViewerSrc] = useState<string | undefined>(undefined);
  const [zoom, setZoom] = useState(1);
  const prevExpandedRef = useRef(expanded);

  useEffect(() => {
    if (expanded && !prevExpandedRef.current) {
      onExpand?.();
    }
    prevExpandedRef.current = expanded;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  return (
    <div
      style={{
        border: '1px solid #E9EAEB',
        borderRadius: 12,
        background: '#fff',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '14px 18px',
          border: 0,
          background: 'transparent',
          fontFamily: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {lesson ? (
            <span
              style={{
                fontSize: 10,
                fontFamily: 'inherit',
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '3px 8px',
                borderRadius: 4,
                background: 'transparent',
                border: '1px solid #D5D7DA',
                color: '#535862',
              }}
            >
              Lesson {String(lesson.num).padStart(2, '0')} · {lesson.title}
            </span>
          ) : null}
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: '#717680' }}>{q.when}</span>
        </div>

        <div
          style={{
            fontSize: 14.5,
            fontWeight: 700,
            color: '#181D27',
            letterSpacing: '-0.005em',
            lineHeight: 1.4,
          }}
        >
          {q.title}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12,
            color: '#535862',
          }}
        >
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={DUMMY_PROFILE_IMAGE_SRC}
                alt=""
                width={20}
                height={20}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </span>
            <span style={{ fontWeight: 600, color: '#252B37' }}>
              {q.author}
            </span>
            <GradeBadge grade={q.grade} />
          </span>
          <span style={{ flex: 1 }} />
          {q.images && q.images.length > 0 ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 11,
                color: '#717680',
              }}
            >
              <MaterialIcon
                name="photo_library"
                size={13}
                style={{ color: '#A4A7AE' }}
              />
              {q.images.length}
            </span>
          ) : null}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11,
              color: '#717680',
            }}
            title={`조회수 ${q.views}`}
          >
            <MaterialIcon
              name="visibility"
              size={13}
              style={{ color: '#A4A7AE' }}
            />
            {q.views}
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 999,
              background: expanded ? '#FFE4E8' : '#F5F5F5',
              color: expanded ? '#C01048' : '#535862',
              fontWeight: 700,
            }}
            title={`답변 ${answerCount}개`}
          >
            <MaterialIcon name="chat_bubble" size={13} />
            {answerCount}
          </span>
          {hideExpandIcon ? null : (
            <MaterialIcon
              name={expanded ? 'expand_less' : 'expand_more'}
              size={18}
              style={{ color: '#535862' }}
            />
          )}
        </div>
      </button>

      {expanded ? (
        <div
          style={{
            padding: '14px 18px 18px',
            borderTop: '1px solid #F5F5F5',
            background: '#FAFAFA',
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1px solid #E9EAEB',
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 13.5,
              lineHeight: 1.7,
              color: '#252B37',
              whiteSpace: 'pre-wrap',
              marginBottom: q.images && q.images.length > 0 ? 8 : 12,
            }}
          >
            {q.body}
          </div>

          {q.images && q.images.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  q.images.length === 1
                    ? '1fr'
                    : `repeat(${q.images.length}, 1fr)`,
                gap: 4,
                marginBottom: 12,
                borderRadius: 8,
                overflow: 'hidden',
                maxHeight: 220,
              }}
            >
              {q.images.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewerSrc(src);
                    setZoom(1);
                  }}
                  style={{
                    overflow: 'hidden',
                    background: '#F5F5F5',
                    minHeight: 100,
                    border: 0,
                    padding: 0,
                    cursor: 'zoom-in',
                    display: 'block',
                  }}
                >
                  <img
                    src={src}
                    alt={`첨부 이미지 ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 200ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                    }}
                  />
                </button>
              ))}
            </div>
          ) : null}

          <ImageViewer
            src={viewerSrc}
            zoom={zoom}
            onZoomChange={setZoom}
            onClose={() => setViewerSrc(undefined)}
          />

          {answerCount === 0 ? (
            <div
              style={{
                padding: '14px 16px',
                border: '1px dashed #D5D7DA',
                borderRadius: 8,
                fontSize: 12.5,
                color: '#535862',
                textAlign: 'center',
                background: '#fff',
              }}
            >
              아직 답변이 없어요.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.answers.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #E9EAEB',
                    borderRadius: 8,
                    padding: '12px 14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: '#181D27',
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      Z
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#181D27',
                      }}
                    >
                      {a.author}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: '#F63D68',
                        color: '#fff',
                      }}
                    >
                      운영자
                    </span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: '#717680' }}>
                      {a.when}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.7,
                      color: '#252B37',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {a.body}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAdmin ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAnswerClick?.();
              }}
              style={{
                marginTop: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: '#181D27',
                color: '#fff',
                border: 0,
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#252B37';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#181D27';
              }}
            >
              답변 달기
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface ImageViewerProps {
  src: string | undefined;
  zoom: number;
  onZoomChange: (z: number) => void;
  onClose: () => void;
}

function ImageViewer({ src, zoom, onZoomChange, onClose }: ImageViewerProps) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=')
        onZoomChange(Math.min(zoom + 0.25, 4));
      if (e.key === '-') onZoomChange(Math.max(zoom - 0.25, 0.5));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [src, zoom, onClose, onZoomChange]);

  if (!src || typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(10,13,18,0.88)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 툴바 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(zoom - 0.25, 0.5))}
          disabled={zoom <= 0.5}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: 0,
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
            opacity: zoom <= 0.5 ? 0.4 : 1,
          }}
        >
          <MaterialIcon name="remove" size={18} />
        </button>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            minWidth: 44,
            textAlign: 'center',
          }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(zoom + 0.25, 4))}
          disabled={zoom >= 4}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: 0,
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: zoom >= 4 ? 'not-allowed' : 'pointer',
            opacity: zoom >= 4 ? 0.4 : 1,
          }}
        >
          <MaterialIcon name="add" size={18} />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: 0,
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: 4,
          }}
        >
          <MaterialIcon name="close" size={20} />
        </button>
      </div>

      {/* 이미지 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ overflow: 'auto', maxWidth: '90vw', maxHeight: '85vh' }}
      >
        <img
          src={src}
          alt="확대 이미지"
          style={{
            display: 'block',
            maxWidth: `${90 * zoom}vw`,
            maxHeight: `${85 * zoom}vh`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 200ms ease',
            borderRadius: 8,
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
