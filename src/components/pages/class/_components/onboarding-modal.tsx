'use client';

import { type ChangeEvent, type MouseEvent, useEffect, useState } from 'react';
import { MaterialIcon } from './material-icon';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TimeSlot {
  id: string;
  label: string;
  hint: string;
}

const SLOTS: TimeSlot[] = [
  { id: '08:00', label: '오전 8시', hint: '출근길 챙기기' },
  { id: '12:00', label: '오후 12시', hint: '점심 짬에' },
  { id: '19:00', label: '오후 7시', hint: '퇴근 후 한 챕터' },
  { id: '21:00', label: '오후 9시', hint: '잠들기 전 마무리' },
];

const DEFAULT_PICK = '19:00';
const DEFAULT_CUSTOM = '21:30';

export function OnboardingModal({
  open,
  onClose,
  onComplete,
}: OnboardingModalProps) {
  const [picked, setPicked] = useState<string>(DEFAULT_PICK);
  const [custom, setCustom] = useState<string>(DEFAULT_CUSTOM);
  const [usingCustom, setUsingCustom] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setPicked(DEFAULT_PICK);
      setCustom(DEFAULT_CUSTOM);
      setUsingCustom(false);
    }
  }, [open]);

  if (!open) return undefined;

  const finalTime = usingCustom ? custom : picked;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCustomTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustom(e.target.value);
    setUsingCustom(true);
  };

  return (
    <div
      onClick={handleOverlayClick}
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
          borderRadius: 24,
          width: 520,
          maxWidth: '92vw',
          padding: '36px 36px 32px',
          position: 'relative',
          boxShadow:
            '0 20px 24px -4px rgba(16,24,40,0.08), 0 8px 8px -4px rgba(16,24,40,0.03)',
          animation: 'modalIn 0.25s cubic-bezier(.2,.8,.3,1.1)',
        }}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 0,
            background: 'transparent',
            color: '#535862',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 150ms ease',
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

        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 20,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#FFE4E8',
              color: '#E31B54',
              marginBottom: 16,
            }}
          >
            <MaterialIcon name="celebration" size={36} />
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#E31B54',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            STEP 1 / 1 · 결제 완료!
          </div>
          <h3
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.015em',
              margin: '6px 0',
              color: '#181D27',
              lineHeight: 1.3,
            }}
          >
            완료까지 잊지 않도록,
            <br />
            매일 챙길게요 :)
          </h3>
          <p
            style={{
              fontSize: 14,
              color: '#535862',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            카카오 알림톡으로 &quot;오늘 한 챕터&quot; 부드럽게 알려드려요.
            <br />
            언제가 가장 챙기기 좋을까요?
          </p>
        </div>

        {/* Time slots */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            marginBottom: 12,
          }}
        >
          {SLOTS.map((s) => {
            const active = !usingCustom && picked === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setPicked(s.id);
                  setUsingCustom(false);
                }}
                style={{
                  background: active ? '#F63D68' : '#fff',
                  color: active ? '#fff' : '#181D27',
                  border: `1px solid ${active ? '#F63D68' : '#D5D7DA'}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  boxShadow: active
                    ? '0 8px 24px -4px rgba(246,61,104,0.25)'
                    : 'none',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.label}</div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: active ? 0.85 : 0.6,
                    marginTop: 2,
                  }}
                >
                  {s.hint}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom time */}
        <label
          htmlFor="onboarding-custom-time"
          style={{
            padding: '12px 14px',
            background: usingCustom ? '#FFE4E8' : '#FAFAFA',
            border: `1px solid ${usingCustom ? '#FEA3B4' : '#E9EAEB'}`,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 22,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <input
            type="radio"
            name="onboarding-time-mode"
            checked={usingCustom}
            onChange={() => setUsingCustom(true)}
            style={{ accentColor: '#F63D68', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#181D27' }}>
            직접 입력
          </span>
          <input
            id="onboarding-custom-time"
            type="time"
            value={custom}
            onChange={handleCustomTimeChange}
            onClick={() => setUsingCustom(true)}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: 14,
              fontFamily: 'inherit',
              border: '1px solid #D5D7DA',
              borderRadius: 8,
              background: '#fff',
              color: '#181D27',
              outline: 'none',
            }}
          />
        </label>

        {/* Info banner */}
        <div
          style={{
            background: '#FAFAFA',
            border: '1px solid #E9EAEB',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 12,
            color: '#535862',
            marginBottom: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MaterialIcon name="info" size={16} style={{ color: '#535862' }} />
          매일 <b style={{ color: '#181D27' }}>{finalTime}</b>에 카카오톡으로
          가볍게 알려드려요. 언제든 끌 수 있어요.
        </div>

        {/* Footer buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onComplete}
            style={{
              flex: 1,
              padding: '13px 22px',
              background: '#fff',
              color: '#181D27',
              border: '1px solid #D5D7DA',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
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
          >
            나중에 설정
          </button>
          <button
            type="button"
            onClick={onComplete}
            style={{
              flex: 1.4,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '13px 22px',
              background: '#F63D68',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E31B54';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F63D68';
            }}
          >
            <MaterialIcon name="check" size={18} />
            설정 완료
          </button>
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
