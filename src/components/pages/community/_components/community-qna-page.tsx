'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type AskQuestionPayload,
  AskQuestionModal,
} from '@/components/pages/class/_components/ask-question-modal';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';
import { QuestionCard } from '@/components/pages/class/_components/question-card';
import { VIBE_LESSONS } from '@/components/pages/class/_data/courses';
import {
  QNA_COURSES,
  QNA_CURRENT_USER,
  QNA_ITEMS,
  type QnaQuestion,
  parseDaysAgo,
} from '@/components/pages/class/_data/qna-data';
import { useToastStore } from '@/stores/use-toast-store';

type LessonFilter = number | 'all';
type CourseFilter = string | 'all';
type QnaSort = 'latest' | 'views';

export function CommunityQnaPage() {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [items, setItems] = useState<QnaQuestion[]>(QNA_ITEMS);
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');
  const [lessonFilter, setLessonFilter] = useState<LessonFilter>('all');
  const [onlyMine, setOnlyMine] = useState(false);
  const [sort, setSort] = useState<QnaSort>('latest');
  const [askOpen, setAskOpen] = useState(false);

  const [keyword, setKeyword] = useState('');
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
    const base = items.filter((q) => {
      if (courseFilter !== 'all' && q.courseId !== courseFilter) return false;
      if (lessonFilter !== 'all' && q.lessonNum !== lessonFilter) return false;
      if (onlyMine && q.author !== QNA_CURRENT_USER) return false;
      if (k) {
        const hay = `${q.title} ${q.body} ${q.author}`.toLowerCase();
        if (!hay.includes(k)) return false;
      }
      return true;
    });
    return [...base].sort((a, b) =>
      sort === 'views'
        ? b.views - a.views
        : parseDaysAgo(a.when) - parseDaysAgo(b.when),
    );
  }, [items, courseFilter, lessonFilter, onlyMine, sort, keyword]);

  const myCount = items.filter((q) => q.author === QNA_CURRENT_USER).length;

  const handleAsk = (payload: AskQuestionPayload) => {
    const next: QnaQuestion = {
      id: String(Date.now()),
      courseId:
        courseFilter === 'all' ? 'vibe-intro' : (courseFilter as string),
      courseName:
        QNA_COURSES.find(
          (c) =>
            c.id === (courseFilter === 'all' ? 'vibe-intro' : courseFilter),
        )?.name ?? '바이브코딩 입문자 코스',
      lessonNum: payload.lessonNum,
      author: QNA_CURRENT_USER,
      role: 'me',
      grade: '빌더',
      title: payload.title,
      body: payload.body,
      images: payload.images,
      views: 0,
      when: '방금',
      answers: [],
    };
    setItems([next, ...items]);
    showToast('질문이 등록되었어요!', 'success');
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
            background: '#E0F2FE',
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
              color: '#0369A1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MaterialIcon name="help" size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#0C4A6E',
                letterSpacing: '-0.02em',
                margin: '0 0 6px',
              }}
            >
              질문답변
            </h1>
            <p
              style={{
                fontSize: 13,
                color: '#535862',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              막히는 것, 궁금한 것 모두 질문해주세요.{' '}
              <span style={{ fontWeight: 700, color: '#0369A1' }}>
                운영진 24시간 상시 답변
              </span>
            </p>
          </div>
        </div>

        {/* 내 질문 chip + 질문하기 */}
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
            {onlyMine ? <MaterialIcon name="check" size={14} /> : null}내 질문 (
            {myCount})
          </button>

          <span style={{ flex: 1 }} />

          <button
            type="button"
            onClick={() => setAskOpen(true)}
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
            질문하기
          </button>
        </div>

        {/* 검색 + 정렬/레슨 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, position: 'relative', minWidth: 240 }}>
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
          <div ref={sortRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              style={dropdownTriggerStyle(false)}
            >
              <MaterialIcon
                name="swap_vert"
                size={15}
                style={{ color: '#535862' }}
              />
              {sort === 'latest' ? '최신순' : '조회수순'}
              <MaterialIcon
                name={sortOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                size={15}
                style={{ color: '#535862' }}
              />
            </button>
            {sortOpen ? (
              <div style={dropdownPanelStyle()}>
                {[
                  { key: 'latest' as QnaSort, label: '최신순' },
                  { key: 'views' as QnaSort, label: '조회수순' },
                ].map((opt) => (
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
              </div>
            ) : null}
          </div>

          {/* 레슨 드롭다운 */}
          <div ref={lessonRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setLessonOpen((v) => !v)}
              style={dropdownTriggerStyle(lessonFilter !== 'all')}
            >
              <MaterialIcon
                name="filter_list"
                size={15}
                style={{ color: '#535862' }}
              />
              {lessonFilter === 'all'
                ? '전체 레슨'
                : `Lesson ${String(lessonFilter).padStart(2, '0')}`}
              <MaterialIcon
                name={lessonOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                size={15}
                style={{ color: '#535862' }}
              />
            </button>
            {lessonOpen ? (
              <div style={dropdownPanelStyle()}>
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
              </div>
            ) : null}
          </div>
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

        {/* 질문 카드 리스트 — 클릭 시 상세 페이지로 이동 */}
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
              name="help_outline"
              size={32}
              style={{
                color: '#D5D7DA',
                display: 'block',
                margin: '0 auto 12px',
              }}
            />
            조건에 맞는 질문이 없어요.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((q) => (
              <QuestionCard
                key={q.id}
                q={q}
                expanded={false}
                onToggle={() => router.push(`/community/qna/${q.id}`)}
                hideExpandIcon
              />
            ))}
          </div>
        )}
      </div>

      <AskQuestionModal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        onSubmit={handleAsk}
        defaultLessonNum={lessonFilter === 'all' ? 3 : lessonFilter}
        defaultCourseId={
          courseFilter === 'all' ? 'vibe-intro' : (courseFilter as string)
        }
        showCourseSelect
      />
    </div>
  );
}

function dropdownTriggerStyle(highlight: boolean): React.CSSProperties {
  return {
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
  };
}

function dropdownPanelStyle(): React.CSSProperties {
  return {
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
  };
}

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
