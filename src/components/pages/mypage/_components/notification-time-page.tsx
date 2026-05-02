'use client';

import Link from 'next/link';
import { type ChangeEvent, useState } from 'react';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';
import { useToastStore } from '@/stores/use-toast-store';

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

export function NotificationTimePage({
  initialTime = '19:00',
}: {
  initialTime?: string;
}) {
  const showToast = useToastStore((state) => state.showToast);
  const [picked, setPicked] = useState(initialTime);
  const [custom, setCustom] = useState(initialTime);
  const [usingCustom, setUsingCustom] = useState(
    !SLOTS.some((s) => s.id === initialTime),
  );

  const finalTime = usingCustom ? custom : picked;

  const handleCustomTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustom(e.target.value);
    setUsingCustom(true);
  };

  const onSave = () => {
    showToast(`알림톡 시간이 매일 ${finalTime}으로 저장됐어요.`, 'success');
  };

  return (
    <div style={{ padding: '8px 0 48px' }}>
      <Link
        href="/my-class"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          color: '#535862',
          textDecoration: 'none',
          marginBottom: 16,
        }}
      >
        <MaterialIcon name="arrow_back" size={14} />
        나의 클래스
      </Link>

      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#E31B54',
          }}
        >
          DAILY ALERT
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '-0.015em',
            margin: '6px 0 6px',
            color: '#181D27',
            lineHeight: 1.3,
          }}
        >
          매일 학습 알림톡 시간
        </h1>
        <p
          style={{ fontSize: 14, color: '#535862', margin: 0, lineHeight: 1.6 }}
        >
          카카오 알림톡으로 &quot;오늘 한 챕터&quot; 부드럽게 알려드려요.
          <br />
          언제가 가장 챙기기 좋을까요?
        </p>
      </div>

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

      <label
        htmlFor="notification-time-custom"
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
          name="notification-time-mode"
          checked={usingCustom}
          onChange={() => setUsingCustom(true)}
          style={{ accentColor: '#F63D68', cursor: 'pointer' }}
        />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#181D27' }}>
          직접 입력
        </span>
        <input
          id="notification-time-custom"
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

      <button
        type="button"
        onClick={onSave}
        style={{
          width: '100%',
          padding: '13px 22px',
          background: '#F63D68',
          color: '#fff',
          border: 0,
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'inherit',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          boxShadow: '0 8px 24px -4px rgba(246,61,104,0.25)',
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
        저장하기
      </button>
    </div>
  );
}
