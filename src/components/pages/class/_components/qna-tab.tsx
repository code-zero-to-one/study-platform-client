'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useToastStore } from '@/stores/use-toast-store';
import { AnswerModal } from './answer-modal';
import {
  type AskQuestionPayload,
  AskQuestionModal,
} from './ask-question-modal';
import { MaterialIcon } from './material-icon';
import { QuestionCard } from './question-card';
import { VIBE_LESSONS } from '../_data/courses';
import {
  type QnaQuestion,
  QNA_CURRENT_USER,
  QNA_ITEMS,
  parseDaysAgo,
} from '../_data/qna-data';

type LessonFilter = number | 'all';
type QnaSort = 'latest' | 'views';

export function QnaTab() {
  const showToast = useToastStore((state) => state.showToast);
  const [items, setItems] = useState<QnaQuestion[]>(QNA_ITEMS);
  const [lessonFilter, setLessonFilter] = useState<LessonFilter>('all');
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | undefined>(undefined);
  const [askOpen, setAskOpen] = useState<boolean>(false);
  const [answerTarget, setAnswerTarget] = useState<QnaQuestion | undefined>(
    undefined,
  );
  const [sort, setSort] = useState<QnaSort>('latest');
  const [lessonDropdownOpen, setLessonDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const lessonDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        lessonDropdownRef.current &&
        !lessonDropdownRef.current.contains(e.target as Node)
      ) {
        setLessonDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const base = items.filter((q) => {
      if (lessonFilter !== 'all' && q.lessonNum !== lessonFilter) return false;
      if (onlyMine && q.author !== QNA_CURRENT_USER) return false;
      return true;
    });
    return [...base].sort((a, b) =>
      sort === 'views'
        ? b.views - a.views
        : parseDaysAgo(a.when) - parseDaysAgo(b.when),
    );
  }, [items, lessonFilter, onlyMine, sort]);

  const myCount = items.filter((q) => q.author === QNA_CURRENT_USER).length;

  const handleViewIncrement = (id: string) => {
    setItems((prev) =>
      prev.map((q) => (q.id === id ? { ...q, views: q.views + 1 } : q)),
    );
  };

  const handleAsk = (payload: AskQuestionPayload) => {
    const next: QnaQuestion = {
      id: String(Date.now()),
      courseId: 'vibe-intro',
      courseName: '바이브코딩 입문자 코스',
      lessonNum: payload.lessonNum,
      author: QNA_CURRENT_USER,
      role: 'me',
      grade: '빌더',
      title: payload.title,
      body: payload.body,
      views: 0,
      when: '방금',
      answers: [],
    };
    setItems([next, ...items]);
    showToast('질문이 등록되었습니다!', 'success');
  };

  const handleAnswer = (body: string) => {
    if (!answerTarget) return;
    setItems(
      items.map((q) =>
        q.id === answerTarget.id
          ? {
              ...q,
              answers: [
                ...q.answers,
                {
                  id: `${q.id}-a${q.answers.length + 1}`,
                  author: 'ZERO-ONE 운영팀',
                  role: 'admin',
                  body,
                  when: '방금',
                },
              ],
            }
          : q,
      ),
    );
    showToast('답변이 게시됐어요.', 'success');
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
              막히는 것, 궁금한 것 모두 질문하세요.{' '}
              <span style={{ fontWeight: 600, color: '#181D27' }}>
                운영진 24시간 상시 답변
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdmin((v) => !v)}
            title="프로토타입 데모용 — 운영자 시점으로 전환해 답변 달기 버튼 노출"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              background: isAdmin ? '#FFE4E8' : 'transparent',
              color: isAdmin ? '#C01048' : '#717680',
              border: `1px solid ${isAdmin ? '#FEA3B4' : '#E9EAEB'}`,
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              flexShrink: 0,
            }}
          >
            <MaterialIcon
              name={isAdmin ? 'admin_panel_settings' : 'visibility'}
              size={13}
            />
            {isAdmin ? '운영자 시점' : '운영자 시점으로 보기'}
          </button>
          <button
            type="button"
            onClick={() => setAskOpen(true)}
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
            질문하기
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
            {onlyMine ? <MaterialIcon name="check" size={14} /> : null}내 질문 (
            {myCount})
          </button>

          <span style={{ flex: 1 }} />

          {/* 정렬 드롭다운 */}
          <div ref={sortDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen((v) => !v)}
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
              {sort === 'latest' ? '최신순' : '조회수순'}
              <MaterialIcon
                name={
                  sortDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
                }
                size={15}
                style={{ color: '#535862' }}
              />
            </button>
            {sortDropdownOpen ? (
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
                {[
                  { key: 'latest' as QnaSort, label: '최신순' },
                  { key: 'views' as QnaSort, label: '조회수순' },
                ].map((opt) => {
                  const active = sort === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setSort(opt.key);
                        setSortDropdownOpen(false);
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
          <div ref={lessonDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setLessonDropdownOpen((v) => !v)}
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
                name={
                  lessonDropdownOpen
                    ? 'keyboard_arrow_up'
                    : 'keyboard_arrow_down'
                }
                size={15}
                style={{ color: '#535862' }}
              />
            </button>
            {lessonDropdownOpen ? (
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
                        setLessonDropdownOpen(false);
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

        {filtered.length === 0 ? (
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
            조건에 맞는 질문이 아직 없어요.
            <br />
            <button
              type="button"
              onClick={() => setAskOpen(true)}
              style={{
                marginTop: 10,
                padding: '6px 14px',
                background: '#F63D68',
                color: '#fff',
                border: 0,
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              질문 남기기
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((q) => (
              <QuestionCard
                key={q.id}
                q={q}
                expanded={expandedId === q.id}
                onToggle={() =>
                  setExpandedId(expandedId === q.id ? undefined : q.id)
                }
                onExpand={() => handleViewIncrement(q.id)}
                onAnswerClick={() => setAnswerTarget(q)}
                isAdmin={isAdmin}
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
      />
      <AnswerModal
        open={!!answerTarget}
        question={answerTarget}
        onClose={() => setAnswerTarget(undefined)}
        onSubmit={handleAnswer}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 12px',
        background: active ? '#181D27' : '#fff',
        color: active ? '#fff' : '#252B37',
        border: `1px solid ${active ? '#181D27' : '#E9EAEB'}`,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: active ? 700 : 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'all 120ms ease',
        letterSpacing: active ? '0.02em' : 0,
      }}
    >
      {children}
    </button>
  );
}
