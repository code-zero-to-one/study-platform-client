'use client';

import Link from 'next/link';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';

interface DashboardItem {
  href: string;
  icon: string;
  title: string;
  desc: string;
  preview: string;
}

const ITEMS: DashboardItem[] = [
  {
    href: '/my-class/notification-time',
    icon: 'schedule',
    title: '매일 학습 알림톡 시간',
    desc: '학습이 가장 잘 챙겨지는 시간으로 알림톡을 받아보세요.',
    preview: '오후 7시',
  },
  {
    href: '/my-class/my-builder-feed',
    icon: 'photo_library',
    title: '내 빌더 피드 모아보기',
    desc: '내가 빌더 피드에 올린 작업물을 한 곳에서 확인해요.',
    preview: '게시 3건 · 받은 좋아요 142',
  },
];

export function MyClassDashboard() {
  return (
    <div style={{ padding: '8px 0 32px' }}>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#717680',
          }}
        >
          MY CLASS
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '-0.015em',
            margin: '6px 0 4px',
            color: '#181D27',
          }}
        >
          나의 클래스
        </h1>
        <p
          style={{
            fontSize: 14,
            color: '#535862',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          코스 학습과 관련된 설정과 결과물을 한 곳에 모아두었어요.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}
      >
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              background: '#fff',
              border: '1px solid #E9EAEB',
              borderRadius: 16,
              padding: 22,
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
              transition: 'transform 200ms ease, box-shadow 200ms ease',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              minHeight: 180,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow =
                '0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow =
                '0 1px 2px 0 rgba(16,24,40,0.05)';
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#FFE4E8',
                color: '#E31B54',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcon name={item.icon} size={22} />
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#181D27',
                letterSpacing: '-0.01em',
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#535862',
                lineHeight: 1.55,
                flex: 1,
              }}
            >
              {item.desc}
            </div>
            <div
              style={{
                marginTop: 4,
                paddingTop: 10,
                borderTop: '1px solid #F5F5F5',
                fontSize: 12,
                color: '#181D27',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontWeight: 700 }}>{item.preview}</span>
              <MaterialIcon
                name="arrow_forward"
                size={16}
                style={{ color: '#535862' }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
