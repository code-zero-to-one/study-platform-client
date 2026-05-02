'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useToastStore } from '@/stores/use-toast-store';
import { MaterialIcon } from './material-icon';

const CONFETTI_COLORS = [
  '#F63D68',
  '#FD6F8E',
  '#FECDD6',
  '#FFD66B',
  '#7CD4FD',
  '#A6F4C5',
  '#1F2933',
];

const STATS = [
  { num: '10', label: '레슨 완료' },
  { num: '5', label: '일간 여정' },
  { num: '1', label: '내 사이트 URL' },
];

interface ConfettiParticle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rot: number;
  shape: 0 | 1 | 2;
}

function buildParticles(): ConfettiParticle[] {
  return Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 10,
    rot: Math.random() * 360,
    shape: (i % 3) as 0 | 1 | 2,
  }));
}

export function CelebratePage() {
  const showToast = useToastStore((state) => state.showToast);
  const particles = useMemo(buildParticles, []);

  const onShare = () => {
    showToast('공유 링크가 복사되었어요 🔗', 'success');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        background:
          'linear-gradient(180deg, #FFE4E8 0%, #FFF1F4 50%, #FFFFFF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Confetti */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {particles.map((p) => (
          <span
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: `-${p.size + 20}px`,
              width: p.size,
              height: p.shape === 2 ? p.size * 0.4 : p.size,
              background: p.color,
              borderRadius: p.shape === 1 ? '50%' : 2,
              transform: `rotate(${p.rot}deg)`,
              animation: `celebrate-fall ${p.duration}s linear ${p.delay}s infinite`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '72px 32px 96px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Mascot */}
        <div
          style={{
            margin: '0 auto 28px',
            width: 200,
            height: 200,
            position: 'relative',
            animation: 'celebrate-mascot-bob 2.4s ease-in-out infinite',
          }}
        >
          <Mascot />
        </div>

        {/* Eyebrow */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            background: '#181D27',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            marginBottom: 20,
          }}
        >
          <MaterialIcon name="emoji_events" size={14} />
          5일 코스 완주
        </div>

        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            margin: '0 0 16px',
            color: '#181D27',
          }}
        >
          당신의 첫 URL이
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #C01048, #FD6F8E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            세상에 나왔어요.
          </span>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: '#252B37',
            lineHeight: 1.6,
            margin: '0 auto 36px',
            maxWidth: 480,
          }}
        >
          5일 전엔 시작하기조차 막막했는데,
          <br />
          이제 만든 걸 보여줄 주소가 손에 있어요.
          <br />
          다음에 만들고 싶은 게 벌써 떠오르지 않나요?
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            margin: '0 auto 36px',
            maxWidth: 540,
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: '#fff',
                border: '1px solid #E9EAEB',
                borderRadius: 14,
                padding: '18px 12px',
                boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: '#F63D68',
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {s.num}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#535862',
                  marginTop: 6,
                  fontWeight: 600,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/community/feed"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '13px 22px',
              background: '#F63D68',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 8px 24px -4px rgba(246,61,104,0.25)',
              transition: 'background 150ms ease',
            }}
          >
            <MaterialIcon name="travel_explore" size={18} />
            빌더들의 작업물 구경가기
          </Link>
          <button
            type="button"
            onClick={onShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '13px 22px',
              background: '#fff',
              color: '#181D27',
              border: '1px solid #D5D7DA',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FAFAFA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            <MaterialIcon name="share" size={18} />
            성과 공유하기
          </button>
        </div>
        <Link
          href="/class/vibe-intro/roadmap"
          style={{
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            color: '#535862',
            fontSize: 13,
            fontWeight: 600,
            padding: '8px 14px',
            fontFamily: 'inherit',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          학습 여정 지도에서 다시 둘러보기 →
        </Link>

        {/* Operator note */}
        <div
          style={{
            marginTop: 56,
            padding: '20px 24px',
            background: '#fff',
            border: '1px solid #E9EAEB',
            borderRadius: 16,
            textAlign: 'left',
            maxWidth: 540,
            margin: '56px auto 0',
            boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#181D27',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            호준
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#717680',
                marginBottom: 4,
              }}
            >
              운영자 호준
            </div>
            <div
              style={{
                fontSize: 14,
                color: '#252B37',
                lineHeight: 1.65,
              }}
            >
              5일 동안 진짜 고생했어요. 그리고 한 가지 알려드릴게요 — 두 번째
              사이트는 첫 번째보다 훨씬 빠르게 나옵니다. 일주일 안에, 머릿속에
              떠오른 그 아이디어 하나만 더 만들어보세요. 그 두 번째가 진짜
              출발선이에요.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes celebrate-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          5%   { opacity: 0.9; }
          90%  { opacity: 0.9; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes celebrate-mascot-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

function Mascot() {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200" aria-hidden="true">
      <defs>
        <linearGradient id="celebrate-mascot-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="100" cy="186" rx="46" ry="6" fill="#000" opacity="0.08" />
      {/* body */}
      <rect x="38" y="44" width="124" height="124" rx="32" fill="#F63D68" />
      <rect
        x="38"
        y="44"
        width="124"
        height="124"
        rx="32"
        fill="url(#celebrate-mascot-shine)"
        opacity="0.25"
      />
      <rect
        x="50"
        y="56"
        width="100"
        height="14"
        rx="7"
        fill="#fff"
        opacity="0.18"
      />
      <ellipse cx="68" cy="112" rx="10" ry="6" fill="#fff" opacity="0.35" />
      <ellipse cx="132" cy="112" rx="10" ry="6" fill="#fff" opacity="0.35" />
      <path
        d="M64 96 Q72 86 80 96"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M120 96 Q128 86 136 96"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M76 124 Q100 144 124 124"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* sparkles */}
      <g fill="#FFD66B">
        <path d="M28 60 L31 68 L39 70 L31 72 L28 80 L25 72 L17 70 L25 68 Z" />
        <path d="M170 36 L172 42 L178 44 L172 46 L170 52 L168 46 L162 44 L168 42 Z" />
        <path d="M178 130 L180 136 L186 138 L180 140 L178 146 L176 140 L170 138 L176 136 Z" />
      </g>
      {/* arms */}
      <rect
        x="20"
        y="64"
        width="22"
        height="10"
        rx="5"
        fill="#F63D68"
        transform="rotate(-30 31 69)"
      />
      <rect
        x="158"
        y="64"
        width="22"
        height="10"
        rx="5"
        fill="#F63D68"
        transform="rotate(30 169 69)"
      />
      <circle cx="20" cy="58" r="8" fill="#F63D68" />
      <circle cx="180" cy="58" r="8" fill="#F63D68" />
      {/* flag */}
      <line
        x1="180"
        y1="58"
        x2="180"
        y2="22"
        stroke="#1F2933"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M180 24 L200 30 L180 36 Z" fill="#1F2933" />
      <text
        x="184"
        y="33"
        fontSize="6"
        fontWeight="900"
        fill="#FFD66B"
        fontFamily="ui-sans-serif, system-ui"
      >
        1
      </text>
    </svg>
  );
}
