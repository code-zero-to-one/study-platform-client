import { type ReactNode } from 'react';
import { type ThumbKind } from '../_data/feed-data';

interface MiniBrowserProps {
  url: string;
  children: ReactNode;
}

function MiniBrowser({ url, children }: MiniBrowserProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Pretendard, Inter, sans-serif',
      }}
    >
      <div
        style={{
          height: '14%',
          minHeight: 18,
          background: '#F4F5F7',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          padding: '0 6%',
          gap: '3%',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#FF5F57',
          }}
        />
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#FEBC2E',
          }}
        />
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#28C840',
          }}
        />
        <div
          style={{
            flex: 1,
            marginLeft: '4%',
            height: '60%',
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            padding: '0 6px',
            fontSize: 8,
            color: '#98A2B3',
            fontFamily: 'ui-monospace, monospace',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {url}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

function ThumbPortfolio() {
  return (
    <MiniBrowser url="jiyun.vercel.app">
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #fff 0%, #FFE4E8 100%)',
          padding: '10% 8%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 6,
            color: '#F63D68',
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          HELLO,
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#101828',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginTop: 4,
          }}
        >
          저는 김지윤
          <br />
          입니다.
        </div>
        <div
          style={{
            fontSize: 6,
            color: '#475467',
            marginTop: 8,
            lineHeight: 1.4,
          }}
        >
          프로덕트 디자이너 / 5년차
          <br />
          AI 시대의 만드는 사람
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
          <span
            style={{
              background: '#F63D68',
              color: '#fff',
              fontSize: 6,
              padding: '2px 6px',
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            포트폴리오
          </span>
          <span
            style={{
              border: '1px solid #D0D5DD',
              color: '#101828',
              fontSize: 6,
              padding: '2px 6px',
              borderRadius: 2,
              fontWeight: 600,
              background: '#fff',
            }}
          >
            이메일
          </span>
        </div>
      </div>
    </MiniBrowser>
  );
}

function ThumbBookClub() {
  return (
    <MiniBrowser url="bookclub-april.vercel.app">
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{ background: '#1570EF', padding: '10% 8% 8%', color: '#fff' }}
        >
          <div style={{ fontSize: 6, opacity: 0.85, fontWeight: 600 }}>
            4월의 독서 모임
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              marginTop: 3,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}
          >
            『도둑맞은 집중력』
            <br />
            같이 읽어요
          </div>
        </div>
        <div
          style={{
            padding: '6% 8%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <div style={{ display: 'flex', gap: 5 }}>
            <div
              style={{
                flex: 1,
                height: 18,
                background: '#F4F5F7',
                borderRadius: 3,
                padding: '3px 6px',
              }}
            >
              <div style={{ fontSize: 5, color: '#98A2B3' }}>이름</div>
            </div>
            <div
              style={{
                flex: 1,
                height: 18,
                background: '#F4F5F7',
                borderRadius: 3,
                padding: '3px 6px',
              }}
            >
              <div style={{ fontSize: 5, color: '#98A2B3' }}>전화</div>
            </div>
          </div>
          <div
            style={{
              height: 18,
              background: '#F4F5F7',
              borderRadius: 3,
              padding: '3px 6px',
            }}
          >
            <div style={{ fontSize: 5, color: '#98A2B3' }}>참여 동기</div>
          </div>
          <div
            style={{
              marginTop: 'auto',
              height: 18,
              background: '#1570EF',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 7,
              fontWeight: 700,
            }}
          >
            신청하기
          </div>
        </div>
      </div>
    </MiniBrowser>
  );
}

function ThumbLanding() {
  return (
    <MiniBrowser url="dailycoffee.app">
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#101828',
          color: '#fff',
          padding: '8% 8%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 6,
          }}
        >
          <span
            style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: 8 }}
          >
            DailyCoffee
          </span>
          <span
            style={{
              background: '#039855',
              padding: '2px 5px',
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Try free
          </span>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div
            style={{
              fontSize: 7,
              color: '#039855',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            NEW
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              marginTop: 3,
            }}
          >
            Your daily
            <br />
            coffee, tracked.
          </div>
          <div
            style={{
              fontSize: 6,
              color: '#98A2B3',
              marginTop: 5,
              lineHeight: 1.4,
            }}
          >
            매일 마신 한 잔이 한 해의 기록이 됩니다.
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
            <span
              style={{
                background: '#039855',
                color: '#fff',
                fontSize: 6,
                padding: '3px 7px',
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              시작하기 →
            </span>
            <span
              style={{
                border: '1px solid #344054',
                color: '#fff',
                fontSize: 6,
                padding: '3px 7px',
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              데모
            </span>
          </div>
        </div>
      </div>
    </MiniBrowser>
  );
}

function ThumbPetDiary() {
  const filledIndices = [2, 3, 5, 8, 9, 10, 12, 15, 16, 17, 19, 20];
  return (
    <MiniBrowser url="bori-walks.vercel.app">
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FFFAEB',
          padding: '7% 7%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: '#FEF0C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
            }}
          >
            🐕
          </div>
          <div>
            <div
              style={{
                fontSize: 8,
                fontWeight: 800,
                color: '#101828',
                lineHeight: 1,
              }}
            >
              보리의 산책일지
            </div>
            <div style={{ fontSize: 5, color: '#98A2B3', marginTop: 1 }}>
              2026년 4월 · 23회 산책
            </div>
          </div>
        </div>
        <div
          style={{
            background: '#fff',
            borderRadius: 4,
            padding: 5,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2,
            flex: 1,
          }}
        >
          {Array.from({ length: 21 }).map((_, i) => {
            const filled = filledIndices.includes(i);
            return (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  borderRadius: 1.5,
                  background: filled ? '#DC6803' : '#F4F5F7',
                  opacity: filled ? 0.4 + (i % 5) * 0.12 : 1,
                }}
              />
            );
          })}
        </div>
      </div>
    </MiniBrowser>
  );
}

function ThumbRetros() {
  const sprints = [
    { date: '04.21', title: 'Sprint 12 회고', color: '#7A5AF8' },
    { date: '04.07', title: 'Sprint 11 회고', color: '#7A5AF8' },
    { date: '03.24', title: 'Sprint 10 회고', color: '#98A2B3' },
  ];
  return (
    <MiniBrowser url="team-retros.vercel.app">
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '6% 8% 4%', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 6, color: '#98A2B3', fontWeight: 600 }}>
            SQUAD A · Q2
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#101828',
              letterSpacing: '-0.01em',
              marginTop: 1,
            }}
          >
            팀 회고 모음
          </div>
        </div>
        <div
          style={{
            padding: '4% 8%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {sprints.map((r) => (
            <div
              key={r.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 5px',
                border: '1px solid #E5E7EB',
                borderRadius: 3,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 14,
                  background: r.color,
                  borderRadius: 1,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 5, color: '#98A2B3' }}>{r.date}</div>
                <div style={{ fontSize: 7, fontWeight: 700, color: '#101828' }}>
                  {r.title}
                </div>
              </div>
              <span style={{ fontSize: 5, color: '#7A5AF8', fontWeight: 700 }}>
                →
              </span>
            </div>
          ))}
        </div>
      </div>
    </MiniBrowser>
  );
}

function ThumbCafeMenu() {
  const menu = [
    { n: '아메리카노', p: '4,500' },
    { n: '카페라떼', p: '5,000' },
    { n: '수제 쑥라떼', p: '5,500' },
    { n: '오늘의 디저트', p: '4,000' },
  ];
  return (
    <MiniBrowser url="momscafe.kr">
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #FEF6EE 0%, #fff 50%)',
          padding: '6% 7%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            borderBottom: '1px dashed #DC6803',
            paddingBottom: 4,
          }}
        >
          <div
            style={{
              fontSize: 5,
              color: '#B42318',
              fontWeight: 700,
              letterSpacing: '0.15em',
            }}
          >
            SINCE 1998
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#101828',
              fontFamily: 'serif',
              marginTop: 1,
            }}
          >
            엄마손 카페
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            marginTop: 5,
          }}
        >
          {menu.map((m) => (
            <div
              key={m.n}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontSize: 7,
              }}
            >
              <span style={{ color: '#101828', fontWeight: 600 }}>{m.n}</span>
              <span
                style={{
                  flex: 1,
                  borderBottom: '1px dotted #D0D5DD',
                  margin: '0 4px',
                  transform: 'translateY(-2px)',
                }}
              />
              <span style={{ color: '#B42318', fontWeight: 700 }}>{m.p}</span>
            </div>
          ))}
        </div>
      </div>
    </MiniBrowser>
  );
}

const MINI_THUMBS: Record<ThumbKind, () => React.JSX.Element> = {
  portfolio: ThumbPortfolio,
  bookclub: ThumbBookClub,
  landing: ThumbLanding,
  petdiary: ThumbPetDiary,
  retros: ThumbRetros,
  cafemenu: ThumbCafeMenu,
};

export function MiniThumb({ kind }: { kind: ThumbKind }) {
  const Comp = MINI_THUMBS[kind] || MINI_THUMBS.portfolio;
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Comp />
    </div>
  );
}
