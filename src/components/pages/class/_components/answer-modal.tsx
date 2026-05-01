'use client';

import { useEffect, useState } from 'react';
import { MarkdownEditor } from './markdown-editor';
import { MaterialIcon } from './material-icon';
import { type QnaQuestion } from '../_data/qna-data';

interface AnswerModalProps {
  open: boolean;
  question: QnaQuestion | undefined;
  onClose: () => void;
  onSubmit?: (body: string) => void;
}

export function AnswerModal({
  open,
  question,
  onClose,
  onSubmit,
}: AnswerModalProps) {
  const [body, setBody] = useState<string>('');

  useEffect(() => {
    if (open) setBody('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !question) return undefined;

  const canSubmit = body.trim().length >= 10;
  const submit = () => {
    if (!canSubmit) return;
    onSubmit?.(body);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(10,13,18,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 580,
          maxWidth: '94vw',
          maxHeight: '88vh',
          background: '#fff',
          borderRadius: 24,
          boxShadow:
            '0 20px 24px -4px rgba(16,24,40,0.08), 0 8px 8px -4px rgba(16,24,40,0.03)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '22px 28px 14px',
            borderBottom: '1px solid #E9EAEB',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#181D27',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialIcon name="reply" size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#535862',
                letterSpacing: '0.08em',
              }}
            >
              OPERATOR REPLY
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: '2px 0 0',
                color: '#181D27',
              }}
            >
              답변하기
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              border: 0,
              background: 'transparent',
              color: '#535862',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F5F5F5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 28px 22px', overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              padding: '10px 14px',
              background: '#FAFAFA',
              border: '1px solid #E9EAEB',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 11, color: '#717680', marginBottom: 2 }}>
              원본 질문
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#181D27' }}>
              {question.title}
            </div>
          </div>
          <MarkdownEditor
            value={body}
            onChange={setBody}
            placeholder="명확하고 친절하게 답변해주세요. 단계가 있다면 번호 리스트로 정리하면 좋아요."
            rows={8}
          />
        </div>

        <div
          style={{
            padding: '14px 28px',
            borderTop: '1px solid #E9EAEB',
            background: '#FAFAFA',
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              background: '#fff',
              color: '#181D27',
              border: '1px solid #D5D7DA',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              background: canSubmit ? '#F63D68' : '#FECDD6',
              color: '#fff',
              border: 0,
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            <MaterialIcon name="send" size={15} />
            답변 게시
          </button>
        </div>
      </div>
    </div>
  );
}
