'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BuilderDetailModal } from '@/components/pages/class/_components/builder-detail-modal';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';
import { MiniThumb } from '@/components/pages/class/_components/mini-site-thumbs';
import {
  type FeedItem,
  FEED_ITEMS,
} from '@/components/pages/class/_data/feed-data';

const MY_FEED_IDS = [1, 4, 6];

export function MyBuilderFeedPage() {
  const [openSample, setOpenSample] = useState<FeedItem | undefined>(undefined);
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  const items = FEED_ITEMS.filter((i) => MY_FEED_IDS.includes(i.id));
  const totalLikes = items.reduce((acc, i) => acc + i.likes, 0);
  const totalComments = items.reduce((acc, i) => acc + i.comments, 0);

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

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#717680',
          }}
        >
          MY BUILDER FEED
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '-0.015em',
            margin: '6px 0 6px',
            color: '#181D27',
          }}
        >
          내 빌더 피드 모아보기
        </h1>
        <p
          style={{ fontSize: 14, color: '#535862', margin: 0, lineHeight: 1.6 }}
        >
          내가 빌더 피드에 올린 작업물 {items.length}건을 모았어요.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatCard num={String(items.length)} label="게시한 작업물" />
        <StatCard num={String(totalLikes)} label="누적 좋아요" />
        <StatCard num={String(totalComments)} label="받은 댓글" />
      </div>

      {items.length === 0 ? (
        <div
          style={{
            padding: '36px 20px',
            border: '1px dashed #D5D7DA',
            borderRadius: 12,
            fontSize: 13,
            color: '#535862',
            textAlign: 'center',
            background: '#fff',
          }}
        >
          아직 빌더 피드에 올린 작업물이 없어요.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 14,
          }}
        >
          {items.map((item) => {
            const isLiked = !!liked[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenSample(item)}
                style={{
                  background: '#fff',
                  border: '1px solid #E9EAEB',
                  borderRadius: 14,
                  overflow: 'hidden',
                  textAlign: 'left',
                  padding: 0,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                  boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
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
                    aspectRatio: '4/3',
                    background: '#FAFAFA',
                    borderBottom: '1px solid #F5F5F5',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <MiniThumb kind={item.thumbKind} />
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: 'rgba(16,24,40,0.85)',
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Day {item.day} 결과물
                  </span>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#181D27',
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#535862',
                      margin: 0,
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.motiv}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 10,
                      fontSize: 11,
                      color: '#717680',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <MaterialIcon
                        name="favorite"
                        size={12}
                        filled={isLiked}
                        style={{ color: isLiked ? '#F63D68' : '#717680' }}
                      />
                      {item.likes + (isLiked ? 1 : 0)}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <MaterialIcon name="chat_bubble_outline" size={12} />
                      {item.comments}
                    </span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 10, color: '#A4A7AE' }}>
                      {item.when}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <BuilderDetailModal
        item={openSample}
        onClose={() => setOpenSample(undefined)}
        liked={liked}
        onToggleLike={(id) => setLiked({ ...liked, [id]: !liked[id] })}
      />
    </div>
  );
}

function StatCard({ num, label }: { num: string; label: string }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E9EAEB',
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#181D27',
          letterSpacing: '-0.015em',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        }}
      >
        {num}
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#535862',
          marginTop: 2,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}
