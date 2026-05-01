'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';
import {
  FEED_ITEMS,
  type FeedItem,
} from '@/components/pages/class/_data/feed-data';
import {
  QNA_ITEMS,
  type QnaQuestion,
  parseDaysAgo,
} from '@/components/pages/class/_data/qna-data';
import { type CommunityPost, FREE_POSTS, TECH_POSTS } from '../_data/post-data';

// 4개 카테고리에서 최신 5개씩만 가져오는 단순 페이지
const CARD_LIMIT = 5;

export function CommunityHomePage() {
  const recentFeed = useMemo<FeedItem[]>(
    () =>
      [...FEED_ITEMS]
        .sort((a, b) => parseDaysAgo(a.when) - parseDaysAgo(b.when))
        .slice(0, CARD_LIMIT),
    [],
  );
  const recentQna = useMemo<QnaQuestion[]>(
    () =>
      [...QNA_ITEMS]
        .sort((a, b) => parseDaysAgo(a.when) - parseDaysAgo(b.when))
        .slice(0, CARD_LIMIT),
    [],
  );
  const recentTech = useMemo<CommunityPost[]>(
    () =>
      [...TECH_POSTS]
        .sort((a, b) => parseDaysAgo(a.when) - parseDaysAgo(b.when))
        .slice(0, CARD_LIMIT),
    [],
  );
  const recentFree = useMemo<CommunityPost[]>(
    () =>
      [...FREE_POSTS]
        .sort((a, b) => parseDaysAgo(a.when) - parseDaysAgo(b.when))
        .slice(0, CARD_LIMIT),
    [],
  );

  return (
    <div
      style={{
        background: '#FAFAFA',
        minHeight: 'calc(100vh - 64px)',
        padding: '32px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* 신규 코스 홍보 배너 */}
        <section
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            padding: '28px 32px',
            background:
              'linear-gradient(135deg, #FFE4E8 0%, #FFF1F3 60%, #FFFAFB 100%)',
            border: '1px solid #FECDD6',
            borderRadius: 18,
            marginBottom: 28,
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                background: '#fff',
                color: '#E31B54',
                border: '1px solid #FEA3B4',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.04em',
                marginBottom: 10,
              }}
            >
              신규 코스
            </span>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#7A0F2E',
                letterSpacing: '-0.02em',
                margin: '0 0 6px',
              }}
            >
              바이브코딩 입문자 코스가 시작됐어요
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: '#535862',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              코드를 처음 만져보는 분도 OK. 매일 1개 레슨, 7일만에 첫 결과물을
              완성해요.
            </p>
          </div>
          <Link
            href="/class"
            style={{
              padding: '10px 18px',
              background: '#181D27',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            자세히 보기
          </Link>
        </section>

        {/* 4개 카테고리 카드 그리드 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <CategoryCard
            href="/community/feed"
            iconName="rocket_launch"
            iconColor="#E31B54"
            iconBg="#FFE4E8"
            title="빌더 피드"
            description="제로원 빌더들의 결과물"
            items={recentFeed.map((it) => ({
              id: String(it.id),
              title: it.title,
              author: it.name,
              when: it.when,
              comments: it.comments,
              href: `/community/feed/${it.id}`,
            }))}
          />
          <CategoryCard
            href="/community/qna"
            iconName="help"
            iconColor="#0369A1"
            iconBg="#E0F2FE"
            title="질문답변"
            description="운영진 24시간 답변"
            items={recentQna.map((q) => ({
              id: q.id,
              title: q.title,
              author: q.author,
              when: q.when,
              comments: q.answers.length,
              href: `/community/qna/${q.id}`,
            }))}
          />
          <CategoryCard
            href="/community/tech"
            iconName="lightbulb"
            iconColor="#7A2E0E"
            iconBg="#FEF0C7"
            title="테크 한입"
            description="개발 지식·테크 트렌드·도구·인사이트"
            items={recentTech.map((p) => ({
              id: p.id,
              title: p.title,
              author: p.author,
              when: p.when,
              comments: p.comments.length,
              href: `/community/tech/${p.id}`,
            }))}
          />
          <CategoryCard
            href="/community/free"
            iconName="forum"
            iconColor="#054F31"
            iconBg="#D1FADF"
            title="자유게시판"
            description="IT 이슈·일상·스터디 그룹 모집"
            items={recentFree.map((p) => ({
              id: p.id,
              title: p.title,
              author: p.author,
              when: p.when,
              comments: p.comments.length,
              href: `/community/free/${p.id}`,
            }))}
          />
        </div>

        {/* 디스코드 CTA 배너 */}
        <a
          href="https://discord.gg/zero-one"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '24px 28px',
            background: 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)',
            color: '#fff',
            borderRadius: 18,
            textDecoration: 'none',
            boxShadow: '0 12px 24px -8px rgba(88,101,242,0.35)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MaterialIcon name="forum" size={28} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                opacity: 0.85,
                marginBottom: 4,
              }}
            >
              ZERO-ONE DISCORD
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: '0 0 4px',
              }}
            >
              실시간으로 빌더들과 함께 이야기 나눠요
            </h3>
            <p
              style={{
                fontSize: 13,
                margin: 0,
                opacity: 0.9,
                lineHeight: 1.5,
              }}
            >
              막히는 곳, 새벽에 같이 코딩할 사람, 채용 정보까지. 디스코드에서
              먼저 공유돼요.
            </p>
          </div>
          <span
            style={{
              padding: '10px 18px',
              background: '#fff',
              color: '#4752C4',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            입장하기
          </span>
        </a>
      </div>
    </div>
  );
}

interface CategoryItem {
  id: string;
  title: string;
  author: string;
  when: string;
  comments: number;
  href: string;
}

interface CategoryCardProps {
  href: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  items: CategoryItem[];
}

function CategoryCard({
  href,
  iconName,
  iconColor,
  iconBg,
  title,
  description,
  items,
}: CategoryCardProps) {
  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid #E9EAEB',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '18px 20px',
          borderBottom: '1px solid #F2F4F7',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MaterialIcon name={iconName} size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#181D27',
              margin: '0 0 2px',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h3>
          <p style={{ fontSize: 12, color: '#717680', margin: 0 }}>
            {description}
          </p>
        </div>
        <MaterialIcon
          name="chevron_right"
          size={18}
          style={{ color: '#A4A7AE' }}
        />
      </Link>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.length === 0 ? (
          <li
            style={{
              padding: '20px',
              textAlign: 'center',
              fontSize: 13,
              color: '#A4A7AE',
            }}
          >
            아직 게시글이 없어요.
          </li>
        ) : (
          items.map((it) => (
            <li key={it.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
              <Link
                href={it.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 20px',
                  fontSize: 13,
                  color: '#252B37',
                  textDecoration: 'none',
                  transition: 'background 120ms ease',
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                  }}
                >
                  {it.title}
                </span>
                {it.comments > 0 ? (
                  <span
                    style={{
                      fontSize: 11,
                      color: '#E31B54',
                      fontWeight: 700,
                    }}
                  >
                    [{it.comments}]
                  </span>
                ) : null}
                <span
                  style={{
                    fontSize: 11,
                    color: '#A4A7AE',
                    flexShrink: 0,
                    minWidth: 50,
                    textAlign: 'right',
                  }}
                >
                  {it.author}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: '#A4A7AE',
                    flexShrink: 0,
                    minWidth: 56,
                    textAlign: 'right',
                  }}
                >
                  {it.when}
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
