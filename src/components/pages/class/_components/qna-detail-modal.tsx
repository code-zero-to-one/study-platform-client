'use client';

import { useEffect } from 'react';
import { GradeBadge } from './builder-detail-modal';
import { MaterialIcon } from './material-icon';
import { VIBE_LESSONS } from '../_data/courses';
import { QNA_ADMIN, type QnaAnswer, type QnaQuestion } from '../_data/qna-data';

interface QnaDetailModalProps {
  question: QnaQuestion | undefined;
  onClose: () => void;
}

export function QnaDetailModal({ question, onClose }: QnaDetailModalProps) {
  useEffect(() => {
    if (!question) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [question, onClose]);

  if (!question) return undefined;

  const lesson = VIBE_LESSONS.find((l) => l.num === question.lessonNum);
  const answerCount = question.answers.length;

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
          position: 'relative',
        }}
      >
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
            boxShadow: '0 1px 4px rgba(16,24,40,0.08)',
          }}
        >
          <MaterialIcon name="close" size={20} />
        </button>

        <div style={{ padding: '28px 32px 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              flexWrap: 'wrap',
            }}
          >
            {lesson ? (
              <span
                style={{
                  fontFamily: 'var(--font-pretendard), sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#C01048',
                  background: '#FFE4E8',
                  padding: '3px 8px',
                  borderRadius: 4,
                }}
              >
                L{String(lesson.num).padStart(2, '0')}
              </span>
            ) : null}
            <span style={{ fontSize: 12, color: '#A4A7AE' }}>
              {question.when}
            </span>
            <span style={{ flex: 1 }} />
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
                name="visibility"
                size={13}
                style={{ color: '#A4A7AE' }}
              />
              {question.views}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 11,
                color: '#717680',
              }}
            >
              <MaterialIcon name="chat_bubble" size={13} />
              {answerCount}
            </span>
          </div>

          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#181D27',
              margin: '0 0 16px',
              letterSpacing: '-0.01em',
              lineHeight: 1.35,
            }}
          >
            {question.title}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              paddingBottom: 18,
              borderBottom: '1px solid #F5F5F5',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#F5F5F5',
                color: '#535862',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {question.author[0]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#181D27' }}>
                {question.author}
              </span>
              <GradeBadge grade={question.grade} />
            </div>
          </div>

          <div
            style={{
              background: '#FAFAFA',
              border: '1px solid #E9EAEB',
              borderRadius: 8,
              padding: '14px 16px',
              fontSize: 13.5,
              lineHeight: 1.7,
              color: '#252B37',
              whiteSpace: 'pre-wrap',
              marginBottom:
                question.images && question.images.length > 0 ? 12 : 20,
            }}
          >
            {question.body}
          </div>

          {question.images && question.images.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  question.images.length === 1 ? '1fr' : '1fr 1fr',
                gap: 8,
                marginBottom: 20,
              }}
            >
              {question.images.map((src, idx) => (
                // eslint-disable-next-line @next/next/no-img-element -- prototype asset URLs
                <img
                  key={idx}
                  src={src}
                  alt={`첨부 이미지 ${idx + 1}`}
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: '1px solid #E9EAEB',
                    objectFit: 'cover',
                    maxHeight: 240,
                  }}
                />
              ))}
            </div>
          ) : null}

          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#535862',
              letterSpacing: '0.06em',
              marginBottom: 12,
            }}
          >
            답변 ({answerCount})
          </div>

          {answerCount === 0 ? (
            <div
              style={{
                padding: '16px 18px',
                border: '1px dashed #D5D7DA',
                borderRadius: 10,
                fontSize: 13,
                color: '#535862',
                textAlign: 'center',
                background: '#FAFAFA',
              }}
            >
              아직 답변이 없어요.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {question.answers.map((a) => (
                <AnswerBlock key={a.id} answer={a} />
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(12px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function AnswerBlock({ answer }: { answer: QnaAnswer }) {
  const isAdmin = answer.role === 'admin';
  const initial = isAdmin ? QNA_ADMIN.initial : (answer.author[0] ?? '?');

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E9EAEB',
        borderRadius: 10,
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: isAdmin ? '#181D27' : '#F5F5F5',
            color: isAdmin ? '#fff' : '#535862',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {initial}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#181D27' }}>
          {answer.author}
        </span>
        {isAdmin ? (
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
        ) : null}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#717680' }}>{answer.when}</span>
      </div>
      <div
        style={{
          fontSize: 13.5,
          lineHeight: 1.7,
          color: '#252B37',
          whiteSpace: 'pre-wrap',
        }}
      >
        {answer.body}
      </div>
    </div>
  );
}
