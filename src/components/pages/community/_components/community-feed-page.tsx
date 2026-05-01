'use client';

import { useRouter } from 'next/navigation';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { GradeBadge } from '@/components/pages/class/_components/builder-detail-modal';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';
import { MiniThumb } from '@/components/pages/class/_components/mini-site-thumbs';
import {
  type PostFeedPayload,
  PostFeedModal,
} from '@/components/pages/class/_components/post-feed-modal';
import { VIBE_LESSONS } from '@/components/pages/class/_data/courses';
import {
  FEED_CURRENT_USER,
  FEED_ITEMS,
  type FeedItem,
} from '@/components/pages/class/_data/feed-data';
import {
  QNA_COURSES,
  parseDaysAgo,
} from '@/components/pages/class/_data/qna-data';
import { DUMMY_PROFILE_IMAGE_SRC } from '@/components/pages/community/_data/community-dummy-assets';
import { useToastStore } from '@/stores/use-toast-store';

type SortKey = 'latest' | 'popular';
type LessonFilter = number | 'all';
type CourseFilter = string | 'all';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '최신순' },
  { key: 'popular', label: '인기순' },
];

// 글로벌 게시판 — 코스 정보를 피드 아이템에 임의로 매핑
const FEED_COURSE_MAP: Record<number, string> = {
  1: 'vibe-intro',
  2: 'vibe-intro',
  3: 'vibe-intro',
  4: 'vibe-intro',
  5: 'web-basics',
  6: 'web-basics',
  7: 'react-fundamentals',
};

function getCourseId(item: FeedItem): string {
  return FEED_COURSE_MAP[item.id] ?? 'vibe-intro';
}

// --- 드롭다운 보조 컴포넌트 ---
interface DropdownButtonProps {
  open: boolean;
  onToggle: () => void;
  label: string;
  iconName: string;
  highlight?: boolean;
  children: React.ReactNode;
}

const DropdownButton = forwardRef<HTMLDivElement, DropdownButtonProps>(
  ({ open, onToggle, label, iconName, highlight, children }, ref) => (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          fontSize: 13,
          fontWeight: 600,
          color: highlight ? '#F63D68' : '#181D27',
          background: '#fff',
          border: `1px solid ${highlight ? '#FEA3B4' : '#D5D7DA'}`,
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <MaterialIcon name={iconName} size={15} style={{ color: '#535862' }} />
        {label}
        <MaterialIcon
          name={open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          size={15}
          style={{ color: '#535862' }}
        />
      </button>
      {open ? (
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
          {children}
        </div>
      ) : null}
    </div>
  ),
);
DropdownButton.displayName = 'DropdownButton';

function DropdownItem({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
        if (!active) e.currentTarget.style.background = '#F9FAFB';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      {label}
      {active ? (
        <MaterialIcon name="check" size={14} style={{ color: '#F63D68' }} />
      ) : null}
    </button>
  );
}

export function CommunityFeedPage() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [items, setItems] = useState<FeedItem[]>(FEED_ITEMS);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [sort, setSort] = useState<SortKey>('latest');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');
  const [lessonFilter, setLessonFilter] = useState<LessonFilter>('all');
  const [onlyMine, setOnlyMine] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [postOpen, setPostOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const lessonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setSortOpen(false);
      if (lessonRef.current && !lessonRef.current.contains(e.target as Node))
        setLessonOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const base = items.filter((it) => {
      if (courseFilter !== 'all' && getCourseId(it) !== courseFilter)
        return false;
      if (lessonFilter !== 'all' && it.day !== lessonFilter) return false;
      if (onlyMine && it.name !== FEED_CURRENT_USER) return false;
      if (k) {
        const hay =
          `${it.title} ${it.motiv} ${it.review} ${it.name}`.toLowerCase();
        if (!hay.includes(k)) return false;
      }
      return true;
    });
    return [...base].sort((a, b) =>
      sort === 'popular'
        ? b.likes - a.likes
        : parseDaysAgo(a.when) - parseDaysAgo(b.when),
    );
  }, [items, courseFilter, lessonFilter, onlyMine, sort, keyword]);

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
        minHeight: 'calc(100vh - 64px)',
        padding: '40px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* 히어로 배너 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '24px 28px',
            background: '#FFE4E8',
            borderRadius: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#fff',
              color: '#E31B54',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MaterialIcon name="rocket_launch" size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#7A0F2E',
                letterSpacing: '-0.02em',
                margin: '0 0 6px',
              }}
            >
              빌더 피드
            </h1>
            <p
              style={{
                fontSize: 13,
                color: '#535862',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              제로원의 빌더들이 만든 작업물을 한눈에 둘러보세요.
            </p>
          </div>
        </div>

        {/* 내 피드 chip + 글 작성 버튼 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            flexWrap: 'wrap',
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
            }}
          >
            {onlyMine ? <MaterialIcon name="check" size={14} /> : null}내 피드 (
            {myCount})
          </button>

          <span style={{ flex: 1 }} />

          <button
            type="button"
            onClick={() => setPostOpen(true)}
            style={{
              padding: '9px 16px',
              background: '#181D27',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            피드 올리기
          </button>
        </div>

        {/* 검색 + 정렬 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <MaterialIcon
              name="search"
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#A4A7AE',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="글 제목, 내용, 작성자 검색"
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                fontSize: 13,
                fontFamily: 'inherit',
                color: '#181D27',
                background: '#fff',
                border: '1px solid #D5D7DA',
                borderRadius: 8,
                outline: 'none',
              }}
            />
          </div>

          {/* 정렬 드롭다운 */}
          <DropdownButton
            ref={sortRef}
            open={sortOpen}
            onToggle={() => setSortOpen((v) => !v)}
            label={SORT_OPTIONS.find((o) => o.key === sort)?.label ?? '최신순'}
            iconName="swap_vert"
          >
            {SORT_OPTIONS.map((opt) => (
              <DropdownItem
                key={opt.key}
                active={sort === opt.key}
                onClick={() => {
                  setSort(opt.key);
                  setSortOpen(false);
                }}
                label={opt.label}
              />
            ))}
          </DropdownButton>

          {/* 레슨 드롭다운 */}
          <DropdownButton
            ref={lessonRef}
            open={lessonOpen}
            onToggle={() => setLessonOpen((v) => !v)}
            label={
              lessonFilter === 'all'
                ? '전체 레슨'
                : `Lesson ${String(lessonFilter).padStart(2, '0')}`
            }
            iconName="filter_list"
            highlight={lessonFilter !== 'all'}
          >
            {[
              { label: '전체 레슨', value: 'all' as LessonFilter },
              ...VIBE_LESSONS.map((l) => ({
                label: `Lesson ${String(l.num).padStart(2, '0')}`,
                value: l.num as LessonFilter,
              })),
            ].map((opt) => (
              <DropdownItem
                key={String(opt.value)}
                active={lessonFilter === opt.value}
                onClick={() => {
                  setLessonFilter(opt.value);
                  setLessonOpen(false);
                }}
                label={opt.label}
              />
            ))}
          </DropdownButton>
        </div>

        {/* 코스 필터 chips (레슨 필터 좌측 별도 row) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: '전체 코스', value: 'all' as CourseFilter },
            ...QNA_COURSES.map((c) => ({
              label: c.name,
              value: c.id as CourseFilter,
            })),
          ].map((opt) => {
            const active = courseFilter === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  setCourseFilter(opt.value);
                  setLessonFilter('all');
                }}
                style={{
                  padding: '6px 14px',
                  background: active ? '#181D27' : '#fff',
                  color: active ? '#fff' : '#535862',
                  border: `1px solid ${active ? '#181D27' : '#E9EAEB'}`,
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* 피드 그리드 */}
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              fontSize: 14,
              color: '#A4A7AE',
              background: '#fff',
              border: '1px solid #E9EAEB',
              borderRadius: 12,
            }}
          >
            <MaterialIcon
              name="auto_awesome"
              size={32}
              style={{
                color: '#D5D7DA',
                display: 'block',
                margin: '0 auto 12px',
              }}
            />
            조건에 맞는 피드가 없어요.
          </div>
        ) : (
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
                  onClick={() => router.push(`/community/feed/${item.id}`)}
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
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'inline-flex',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={DUMMY_PROFILE_IMAGE_SRC}
                          alt=""
                          width={26}
                          height={26}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
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
                      }}
                    >
                      <MaterialIcon
                        name="favorite"
                        size={14}
                        filled={isLiked}
                        style={{ color: isLiked ? '#F63D68' : '#717680' }}
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
        )}
      </div>

      <PostFeedModal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        onSubmit={handlePost}
        defaultLessonNum={lessonFilter === 'all' ? 5 : lessonFilter}
        defaultCourseId={
          courseFilter === 'all' ? 'vibe-intro' : (courseFilter as string)
        }
        showCourseSelect
      />
    </div>
  );
}
