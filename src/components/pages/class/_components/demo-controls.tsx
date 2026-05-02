'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { MaterialIcon } from './material-icon';
import { useClassPrototypeStore } from '../_data/use-class-prototype-store';

interface DemoLink {
  to: string;
  label: string;
}

const PAGE_LINKS: DemoLink[] = [
  { to: '/class', label: '클래스 메인' },
  { to: '/class/vibe-intro', label: '코스 상세' },
  { to: '/class/vibe-intro/roadmap', label: '학습 여정 지도' },
  { to: '/class/vibe-intro/3', label: '레슨 3 (현재)' },
  { to: '/class/vibe-intro/celebrate', label: '완주 축하 페이지' },
  { to: '/community/feed', label: '빌더 피드' },
  { to: '/my-page', label: '마이페이지' },
  { to: '/my-class', label: '나의 클래스' },
];

export function DemoControls() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isLoggedIn = useClassPrototypeStore((s) => s.isLoggedIn);
  const setLoggedIn = useClassPrototypeStore((s) => s.setLoggedIn);
  const reset = useClassPrototypeStore((s) => s.reset);
  const markAllDone = useClassPrototypeStore((s) => s.markAllDone);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="데모 네비"
        title="데모 네비"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 60,
          width: 52,
          height: 52,
          borderRadius: 999,
          background: '#181D27',
          color: '#fff',
          border: 0,
          cursor: 'pointer',
          boxShadow:
            '0 12px 16px -4px rgba(16,24,40,0.16), 0 4px 6px -2px rgba(16,24,40,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcon name="explore" size={22} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 60,
        background: '#fff',
        borderRadius: 14,
        boxShadow:
          '0 20px 24px -4px rgba(16,24,40,0.12), 0 8px 8px -4px rgba(16,24,40,0.04)',
        border: '1px solid #E9EAEB',
        padding: 16,
        width: 256,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#C01048',
            letterSpacing: '0.08em',
          }}
        >
          DEMO NAV
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="닫기"
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            border: 0,
            background: 'transparent',
            color: '#535862',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 120ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F5F5F5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <MaterialIcon name="close" size={14} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          marginBottom: 12,
        }}
      >
        {PAGE_LINKS.map((l) => {
          const active = pathname === l.to;
          return (
            <button
              key={l.to}
              type="button"
              onClick={() => router.push(l.to)}
              style={{
                padding: '7px 10px',
                borderRadius: 6,
                border: 0,
                fontFamily: 'inherit',
                background: active ? '#FFE4E8' : 'transparent',
                color: active ? '#C01048' : '#252B37',
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = '#FAFAFA';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              {l.label}
            </button>
          );
        })}
      </div>

      <div style={{ height: 1, background: '#E9EAEB', margin: '0 0 10px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <DemoActionButton onClick={() => setLoggedIn(!isLoggedIn)}>
          {isLoggedIn ? '로그아웃 시뮬' : '로그인 시뮬'}
        </DemoActionButton>
        <DemoActionButton onClick={() => reset()}>
          진행 상태 리셋
        </DemoActionButton>
        <DemoActionButton onClick={() => markAllDone()}>
          완주 상태로
        </DemoActionButton>
      </div>
    </div>
  );
}

function DemoActionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '7px 10px',
        background: '#fff',
        color: '#181D27',
        border: '1px solid #D5D7DA',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'background 120ms ease, border-color 120ms ease',
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
      {children}
    </button>
  );
}
