'use client';

import { useEffect } from 'react';
import { MaterialIcon } from './material-icon';
import { MiniThumb } from './mini-site-thumbs';
import {
  type FeedItem,
  GRADE_BADGE_STYLES,
  type Grade,
} from '../_data/feed-data';

interface BuilderDetailModalProps {
  item: FeedItem | undefined;
  onClose: () => void;
  liked: Record<number, boolean>;
  onToggleLike: (id: number) => void;
}

const DEFAULT_COMMENTS = [
  {
    name: '운영자 호준',
    grade: '운영자' as Grade,
    text: '진심이 담긴 결과물이에요. 다음 챕터에서 또 만나요!',
  },
  {
    name: '손지영',
    grade: '4학년' as Grade,
    text: '저도 이런 거 만들어보고 싶어요. 어떤 색 조합 쓰셨어요?',
  },
];

export function BuilderDetailModal({
  item,
  onClose,
  liked,
  onToggleLike,
}: BuilderDetailModalProps) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return undefined;
  const isLiked = !!liked[item.id];
  const comments = item.commentsList ?? DEFAULT_COMMENTS;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(10,13,18,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'overlayIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          width: 720,
          maxWidth: '92vw',
          maxHeight: '86vh',
          overflow: 'auto',
          boxShadow:
            '0 20px 24px -4px rgba(16,24,40,0.08), 0 8px 8px -4px rgba(16,24,40,0.03)',
          animation: 'modalIn 0.25s cubic-bezier(.2,.8,.3,1.1)',
        }}
      >
        <div
          style={{
            aspectRatio: '16/9',
            background: '#F5F5F5',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            position: 'relative',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '75%',
              aspectRatio: '4/3',
              borderRadius: 8,
              boxShadow:
                '0 24px 48px -12px rgba(16,24,40,0.24), 0 8px 16px -8px rgba(16,24,40,0.12)',
              overflow: 'hidden',
              border: '1px solid #E9EAEB',
            }}
          >
            <MiniThumb kind={item.thumbKind} />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 38,
              height: 38,
              borderRadius: 999,
              border: 0,
              background: 'rgba(255,255,255,0.95)',
              color: '#181D27',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
            }}
          >
            <MaterialIcon name="close" size={20} />
          </button>
          {item.day ? (
            <span
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                background: 'rgba(16,24,40,0.85)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.02em',
                zIndex: 2,
              }}
            >
              Day {item.day} 결과물
            </span>
          ) : null}
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#F5F5F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                color: '#535862',
              }}
            >
              {item.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginRight: 4,
                    color: '#181D27',
                  }}
                >
                  {item.name}
                </span>
                <GradeBadge grade={item.grade} />
              </div>
              <div style={{ fontSize: 12, color: '#717680', marginTop: 2 }}>
                {item.when || '2일 전'}
              </div>
            </div>
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '-0.015em',
              margin: '0 0 14px',
              color: '#181D27',
            }}
          >
            {item.title}
          </h2>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#717680',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              왜 만들었나
            </div>
            <div style={{ fontSize: 14, color: '#252B37', lineHeight: 1.7 }}>
              {item.motiv}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#717680',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}
            >
              학습 소감
            </div>
            <div
              style={{
                fontSize: 15,
                color: '#252B37',
                lineHeight: 1.7,
                background: '#FAFAFA',
                padding: '14px 16px',
                borderRadius: 10,
                borderLeft: '3px solid #F63D68',
              }}
            >
              {`"${item.review}"`}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              paddingTop: 16,
              borderTop: '1px solid #E9EAEB',
            }}
          >
            <ModalActionButton onClick={() => onToggleLike(item.id)}>
              <MaterialIcon
                name="favorite"
                size={16}
                filled={isLiked}
                style={{ color: isLiked ? '#F63D68' : '#535862' }}
              />
              좋아요 {item.likes + (isLiked ? 1 : 0)}
            </ModalActionButton>
            <ModalActionButton>
              <MaterialIcon name="chat_bubble_outline" size={16} />
              댓글 {item.comments}
            </ModalActionButton>
            <ModalActionButton>
              <MaterialIcon name="open_in_new" size={16} />
              사이트 열기
            </ModalActionButton>
            <div style={{ marginLeft: 'auto' }}>
              <ModalActionButton aria-label="공유">
                <MaterialIcon name="share" size={16} />
              </ModalActionButton>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid #E9EAEB',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 14,
                color: '#181D27',
              }}
            >
              댓글 {item.comments}
            </div>
            {comments.map((c, i) => (
              <div
                key={i}
                style={{ display: 'flex', gap: 12, marginBottom: 14 }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#535862',
                  }}
                >
                  {c.name.replace(/^운영자\s/, '').slice(0, 1)}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        marginRight: 4,
                        color: '#181D27',
                      }}
                    >
                      {c.name}
                    </span>
                    <GradeBadge grade={c.grade} />
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#252B37',
                      marginTop: 3,
                      lineHeight: 1.5,
                    }}
                  >
                    {c.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(12px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function ModalActionButton({
  children,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '10px 18px',
        fontSize: 14,
        fontWeight: 600,
        background: '#fff',
        color: '#181D27',
        border: '1px solid #D5D7DA',
        borderRadius: 4,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 150ms ease, border-color 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#FAFAFA';
        e.currentTarget.style.borderColor = '#A4A7AE';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#fff';
        e.currentTarget.style.borderColor = '#D5D7DA';
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function GradeBadge({ grade }: { grade: Grade }) {
  const { bg, color } = GRADE_BADGE_STYLES[grade];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 4,
        background: bg,
        color,
      }}
    >
      {grade}
    </span>
  );
}
