'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useToastStore } from '@/stores/use-toast-store';
import { BuilderDetailModal, GradeBadge } from './builder-detail-modal';
import { MaterialIcon } from './material-icon';
import { MiniThumb } from './mini-site-thumbs';
import { type PostFeedPayload, PostFeedModal } from './post-feed-modal';
import { VIBE_LESSONS } from '../_data/courses';
import {
  FEED_CURRENT_USER,
  FEED_ITEMS,
  type FeedItem,
} from '../_data/feed-data';
import { parseDaysAgo } from '../_data/qna-data';

type SortKey = 'latest' | 'popular';
type LessonFilter = number | 'all';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '최신순' },
  { key: 'popular', label: '인기순' },
];

export function FeedTab() {
  const showToast = useToastStore((s) => s.showToast);
  const [items, setItems] = useState<FeedItem[]>(FEED_ITEMS);
  const [openSample, setOpenSample] = useState<FeedItem | undefined>(undefined);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [sort, setSort] = useState<SortKey>('latest');
  const [lessonFilter, setLessonFilter] = useState<LessonFilter>('all');
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  const [postOpen, setPostOpen] = useState<boolean>(false);

  const [sortOpen, setSortOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const lessonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
      if (lessonRef.current && !lessonRef.current.contains(e.target as Node)) {
        setLessonOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const base = items.filter((it) => {
      if (lessonFilter !== 'all' && it.day !== lessonFilter) return false;
      if (onlyMine && it.name !== FEED_CURRENT_USER) return false;
      return true;
    });
    return [...base].sort((a, b) =>
      sort === 'popular'
        ? b.likes - a.likes
        : parseDaysAgo(a.when) - parseDaysAgo(b.when),
    );
  }, [items, lessonFilter, onlyMine, sort]);

  const myCount = items.filter((it) => it.name === FEED_CURRENT_USER).length;

  const handlePost = (payload: PostFeedPayload) => {
    const next: FeedItem = {
      id: Date.now(),
      name: FEED_CURRENT_USER,
      grade: '빌더',
      title: payload.title,
      motiv: payload.motiv,
      review: payload.review,
      likes: 0,
      comments: 0,
      thumbKind: 'portfolio',
      day: payload.lessonNum,
      when: '방금',
      role: `빌더 ${FEED_CURRENT_USER}`,
    };
    setItems([next, ...items]);
    showToast('피드가 게시되었어요!', 'success');
  };

  return (
    <div
      style={{
        background: '#FAFAFA',
        minHeight: 'calc(100vh - 64px - 56px)',
        padding: '32px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: 14,
                color: '#535862',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              바이브코딩 입문자 코스를 함께 들은 빌더들이 만든 작업물
              모음이에요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPostOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: '#F63D68',
              color: '#fff',
              border: 0,
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              boxShadow: '0 8px 24px -4px rgba(246,61,104,0.25)',
              transition: 'background 150ms ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E31B54';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F63D68';
            }}
          >
            피드 올리기
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => setOnlyMine((v) => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: onlyMine ? '#181D27' : '#fff',
              color: onlyMine ? '#fff' : '#181D27',
              border: `1px solid ${onlyMine ? '#181D27' : '#D5D7DA'}`,
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {onlyMine ? <MaterialIcon name="check" size={14} /> : null}내 피드 (
            {myCount})
          </button>

          <span style={{ flex: 1 }} />

          {/* 정렬 드롭다운 */}
          <div ref={sortRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: '#181D27',
                background: '#fff',
                border: '1px solid #D5D7DA',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <MaterialIcon
                name="swap_vert"
                size={15}
                style={{ color: '#535862' }}
              />
              {SORT_OPTIONS.find((o) => o.key === sort)?.label}
              <MaterialIcon
                name={sortOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                size={15}
                style={{ color: '#535862' }}
              />
            </button>
            {sortOpen ? (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  background: '#fff',
                  border: '1px solid #E9EAEB',
                  borderRadius: 10,
                  boxShadow: '0 4px 16px -4px rgba(16,24,40,0.12)',
                  minWidth: 130,
                  overflow: 'hidden',
                  zIndex: 50,
                }}
              >
                {SORT_OPTIONS.map((opt) => {
                  const active = sort === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setSort(opt.key);
                        setSortOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '10px 16px',
                        fontSize: 13,
                        fontWeight: active ? 700 : 400,
                        color: active ? '#181D27' : '#535862',
                        background: active ? '#FAFAFA' : 'transparent',
                        border: 0,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                    >
                      {opt.label}
                      {active ? (
                        <MaterialIcon
                          name="check"
                          size={14}
                          style={{ color: '#F63D68' }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* 레슨 필터 드롭다운 */}
          <div ref={lessonRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setLessonOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: lessonFilter !== 'all' ? '#F63D68' : '#181D27',
                background: '#fff',
                border: `1px solid ${lessonFilter !== 'all' ? '#FEA3B4' : '#D5D7DA'}`,
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <MaterialIcon
                name="filter_list"
                size={15}
                style={{ color: '#535862' }}
              />
              {lessonFilter === 'all'
                ? '전체'
                : `Lesson ${String(lessonFilter).padStart(2, '0')}`}
              <MaterialIcon
                name={lessonOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                size={15}
                style={{ color: '#535862' }}
              />
            </button>
            {lessonOpen ? (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  background: '#fff',
                  border: '1px solid #E9EAEB',
                  borderRadius: 10,
                  boxShadow: '0 4px 16px -4px rgba(16,24,40,0.12)',
                  minWidth: 150,
                  maxHeight: 280,
                  overflowY: 'auto',
                  zIndex: 50,
                }}
              >
                {[
                  { label: '전체', value: 'all' as LessonFilter },
                  ...VIBE_LESSONS.map((l) => ({
                    label: `Lesson ${String(l.num).padStart(2, '0')}`,
                    value: l.num as LessonFilter,
                  })),
                ].map((opt) => {
                  const active = lessonFilter === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        setLessonFilter(opt.value);
                        setLessonOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '10px 16px',
                        fontSize: 13,
                        fontWeight: active ? 700 : 400,
                        color: active ? '#181D27' : '#535862',
                        background: active ? '#FAFAFA' : 'transparent',
                        border: 0,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        if (!active)
                          e.currentTarget.style.background = '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        if (!active)
                          e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {opt.label}
                      {active ? (
                        <MaterialIcon
                          name="check"
                          size={14}
                          style={{ color: '#F63D68' }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {filtered.map((item) => {
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
                  e.currentTarget.style.transform = 'translateY(-4px)';
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
                      background: '#fff',
                      color: '#535862',
                      border: '1px solid #D5D7DA',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                    }}
                  >
                    Lesson {item.day}
                  </span>
                </div>
                <div style={{ padding: '14px 16px', flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#F5F5F5',
                        color: '#535862',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {item.name[0]}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#252B37',
                      }}
                    >
                      {item.name}
                    </span>
                    <GradeBadge grade={item.grade} />
                  </div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#181D27',
                      margin: 0,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#535862',
                      margin: '4px 0 0',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.motiv}
                  </p>
                </div>
                <div
                  style={{
                    padding: '10px 16px',
                    borderTop: '1px solid #F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    fontSize: 12,
                    color: '#717680',
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLiked({ ...liked, [item.id]: !liked[item.id] });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 12,
                      color: isLiked ? '#F63D68' : '#717680',
                      transition: 'color 150ms ease',
                    }}
                  >
                    <MaterialIcon
                      name="favorite"
                      size={14}
                      filled={isLiked}
                      style={{
                        color: isLiked ? '#F63D68' : '#717680',
                        transition: 'color 150ms ease',
                      }}
                    />
                    {item.likes + (isLiked ? 1 : 0)}
                  </button>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <MaterialIcon name="chat_bubble_outline" size={14} />
                    {item.comments}
                  </span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: '#A4A7AE' }}>
                    {item.when}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <BuilderDetailModal
        item={openSample}
        onClose={() => setOpenSample(undefined)}
        liked={liked}
        onToggleLike={(id) => setLiked({ ...liked, [id]: !liked[id] })}
      />

      <PostFeedModal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        onSubmit={handlePost}
        defaultLessonNum={lessonFilter === 'all' ? 5 : lessonFilter}
      />
    </div>
  );
}
