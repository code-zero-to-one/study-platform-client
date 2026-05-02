'use client';

import { useMemo, useState } from 'react';
import { useToastStore } from '@/stores/use-toast-store';
import {
  type AskQuestionPayload,
  AskQuestionModal,
} from './ask-question-modal';
import { BuilderDetailModal } from './builder-detail-modal';
import { MaterialIcon } from './material-icon';
import { MiniThumb } from './mini-site-thumbs';
import { QnaDetailModal } from './qna-detail-modal';
import { type CourseLesson, VIBE_LESSONS } from '../_data/courses';
import { type FeedItem, FEED_ITEMS } from '../_data/feed-data';
import {
  parseDaysAgo,
  QNA_CURRENT_USER,
  QNA_ITEMS,
  type QnaQuestion,
} from '../_data/qna-data';

const sliderArrowStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: '1px solid #E9EAEB',
  background: '#fff',
  color: '#535862',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

interface LessonRightSidebarProps {
  lesson: CourseLesson;
  isFinalLesson: boolean;
}

export function LessonRightSidebar({
  lesson,
  isFinalLesson,
}: LessonRightSidebarProps) {
  return (
    <aside
      style={{
        position: 'sticky',
        top: 128,
        alignSelf: 'start',
        width: '100%',
        minWidth: 0,
        maxHeight: 'calc(100vh - 144px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ flexShrink: 0, width: '100%', minWidth: 0 }}>
        <BuilderFeedSlider lesson={lesson} />
      </div>
      <div style={{ flexShrink: 0, width: '100%', minWidth: 0 }}>
        <QnaHelperCard lesson={lesson} />
      </div>
      <div style={{ flexShrink: 0, width: '100%', minWidth: 0 }}>
        {isFinalLesson ? <FinalLessonCard /> : <NextUpCard lesson={lesson} />}
      </div>
    </aside>
  );
}

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E9EAEB',
        borderRadius: 16,
        boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface BuilderFeedSliderProps {
  lesson: CourseLesson;
}

function BuilderFeedSlider({ lesson }: BuilderFeedSliderProps) {
  const [openSample, setOpenSample] = useState<FeedItem | undefined>(undefined);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [idx, setIdx] = useState(0);

  // 대표 3개: 운영자 픽 · 인기순 1위 · 최신순 1위 (라벨은 UI에 노출하지 않음)
  const slides: FeedItem[] = useMemo(() => {
    const operatorPick = FEED_ITEMS[0];
    const popular = [...FEED_ITEMS].sort((a, b) => b.likes - a.likes)[0];
    const recent = [...FEED_ITEMS].sort(
      (a, b) => parseDaysAgo(a.when) - parseDaysAgo(b.when),
    )[0];
    return [operatorPick, popular, recent];
  }, []);

  const item = slides[idx];
  const next = () => setIdx((idx + 1) % slides.length);
  const prev = () => setIdx((idx - 1 + slides.length) % slides.length);

  const lessonInsight = useMemo(() => {
    const insights = [
      `Lesson ${lesson.num}에서 배운 걸 ${item.role}이 풀어낸 결과예요.`,
      `이 레슨의 핵심을 ${item.day}일차에 자기 손으로 만들었어요.`,
      `같은 레슨을 듣고 만든 ${item.role}의 1차 결과물이에요.`,
    ];
    return insights[idx % insights.length];
  }, [idx, item, lesson.num]);

  const isLiked = !!liked[item.id];

  return (
    <Card style={{ padding: 0, overflow: 'hidden', flexShrink: 0 }}>
      <div
        style={{
          padding: '14px 16px 8px',
          borderBottom: '1px solid #F5F5F5',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: '#181D27' }}>
          빌더 피드 미리보기
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-pretendard), sans-serif',
            color: '#717680',
            fontWeight: 700,
          }}
        >
          {idx + 1} / {slides.length}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpenSample(item)}
        style={{
          width: '100%',
          padding: 0,
          border: 0,
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            position: 'relative',
            aspectRatio: '4/3',
            minHeight: 140,
            background: '#FAFAFA',
            overflow: 'hidden',
          }}
        >
          <MiniThumb kind={item.thumbKind} />
        </div>

        <div style={{ padding: '12px 16px 14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#F5F5F5',
                color: '#535862',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {item.name[0]}
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#181D27',
              }}
            >
              {item.name}
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#181D27',
              marginBottom: 4,
              letterSpacing: '-0.005em',
            }}
          >
            {item.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#535862',
              lineHeight: 1.45,
            }}
          >
            {lessonInsight}
          </div>
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <MaterialIcon
                name="favorite"
                size={13}
                filled={isLiked}
                style={{ color: isLiked ? '#F63D68' : '#717680' }}
              />
              {item.likes + (isLiked ? 1 : 0)}
            </span>
            <span
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <MaterialIcon name="chat_bubble_outline" size={13} />
              {item.comments}
            </span>
          </div>
        </div>
      </button>

      <div
        style={{
          padding: '8px 12px 12px',
          display: 'grid',
          gridTemplateColumns: '28px minmax(0, 1fr) 28px',
          gap: 8,
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={prev}
          aria-label="이전"
          style={{
            ...sliderArrowStyle,
            flexShrink: 0,
            width: 28,
            boxSizing: 'border-box',
          }}
        >
          <MaterialIcon name="chevron_left" size={18} />
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            minWidth: 0,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`슬라이드 ${i + 1}`}
              onClick={() => setIdx(i)}
              style={{
                flex: 1,
                minWidth: 0,
                height: 4,
                borderRadius: 999,
                border: 0,
                background: i === idx ? '#F63D68' : '#E9EAEB',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          aria-label="다음"
          style={{
            ...sliderArrowStyle,
            flexShrink: 0,
            width: 28,
            boxSizing: 'border-box',
          }}
        >
          <MaterialIcon name="chevron_right" size={18} />
        </button>
      </div>

      <BuilderDetailModal
        item={openSample}
        onClose={() => setOpenSample(undefined)}
        liked={liked}
        onToggleLike={(id) => setLiked({ ...liked, [id]: !liked[id] })}
      />
    </Card>
  );
}

interface QnaHelperCardProps {
  lesson: CourseLesson;
}

function QnaHelperCard({ lesson }: QnaHelperCardProps) {
  const showToast = useToastStore((state) => state.showToast);
  const [askOpen, setAskOpen] = useState(false);
  const [detailQuestion, setDetailQuestion] = useState<
    QnaQuestion | undefined
  >();
  const [items, setItems] = useState<QnaQuestion[]>(QNA_ITEMS);

  const myQuestions = items.filter(
    (q) => q.author === QNA_CURRENT_USER && q.lessonNum === lesson.num,
  );
  const builderQuestions = items.filter(
    (q) => q.author !== QNA_CURRENT_USER && q.lessonNum === lesson.num,
  );

  const handleAsk = (payload: AskQuestionPayload) => {
    const next: QnaQuestion = {
      id: `q-${Date.now()}`,
      courseId: 'vibe-intro',
      courseName: '바이브코딩 입문자 코스',
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
    showToast('질문이 등록됐어요. 평일 24시간 이내 답변드릴게요.', 'success');
  };

  return (
    <Card style={{ padding: 0, flexShrink: 0 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5F5F5' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#181D27' }}>
          여기서 막혔다면?
        </div>
        <div style={{ fontSize: 11, color: '#535862', marginTop: 2 }}>
          30분 이상 막히면 무조건 질문하기
        </div>
      </div>

      <div style={{ padding: '14px 20px 18px' }}>
        <button
          type="button"
          onClick={() => setAskOpen(true)}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#FFE4E8',
            color: '#C01048',
            border: 0,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginBottom: 12,
            transition: 'background 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FECDD6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFE4E8';
          }}
        >
          <MaterialIcon name="forum" size={15} />
          질문하기
        </button>

        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#181D27' }}>
            내 질문
          </span>
          <span
            style={{
              marginLeft: 8,
              padding: '1px 8px',
              background: '#F5F5F5',
              color: '#535862',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {myQuestions.length}
          </span>
        </div>
        <QuestionList
          items={myQuestions}
          emptyMsg="아직 올린 질문이 없어요."
          onSelectQuestion={setDetailQuestion}
        />

        <div style={{ marginBottom: 8, marginTop: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#181D27' }}>
            빌더들의 질문
          </span>
          <span
            style={{
              marginLeft: 8,
              padding: '1px 8px',
              background: '#F5F5F5',
              color: '#535862',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {builderQuestions.length}
          </span>
        </div>
        <QuestionList
          items={builderQuestions}
          emptyMsg="빌더들의 질문이 아직 없어요."
          onSelectQuestion={setDetailQuestion}
        />
      </div>

      <AskQuestionModal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        onSubmit={handleAsk}
        defaultLessonNum={lesson.num}
      />
      <QnaDetailModal
        question={detailQuestion}
        onClose={() => setDetailQuestion(undefined)}
      />
    </Card>
  );
}

function QuestionList({
  items,
  emptyMsg,
  onSelectQuestion,
}: {
  items: QnaQuestion[];
  emptyMsg: string;
  onSelectQuestion: (q: QnaQuestion) => void;
}) {
  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '12px 14px',
          marginBottom: 8,
          background: '#FAFAFA',
          border: '1px dashed #D5D7DA',
          borderRadius: 8,
          fontSize: 11,
          color: '#717680',
          textAlign: 'center',
        }}
      >
        {emptyMsg}
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        marginBottom: 8,
      }}
    >
      {items.map((q) => {
        const lessonRow = VIBE_LESSONS.find((l) => l.num === q.lessonNum);
        return (
          <button
            key={q.id}
            type="button"
            aria-label={`질문 상세 보기: ${q.title}`}
            onClick={() => onSelectQuestion(q)}
            style={{
              padding: '8px 10px',
              background: '#FAFAFA',
              border: '1px solid #E9EAEB',
              borderRadius: 8,
              fontSize: 12,
              width: '100%',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              transition: 'border-color .15s ease, box-shadow .15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D5D7DA';
              e.currentTarget.style.boxShadow =
                '0 1px 2px 0 rgba(16,24,40,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E9EAEB';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10,
                color: '#717680',
                marginBottom: 4,
              }}
            >
              {lessonRow ? (
                <span
                  style={{
                    fontFamily: 'var(--font-pretendard), sans-serif',
                    fontWeight: 700,
                    padding: '1px 6px',
                    background: '#FFE4E8',
                    color: '#C01048',
                    borderRadius: 3,
                  }}
                >
                  L{String(lessonRow.num).padStart(2, '0')}
                </span>
              ) : null}
              <span style={{ flex: 1 }} />
              <span>{q.when}</span>
              <span
                style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
              >
                <MaterialIcon name="chat_bubble" size={11} />
                {q.answers.length}
              </span>
            </div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#181D27',
                lineHeight: 1.45,
              }}
            >
              {q.title}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function NextUpCard({ lesson }: { lesson: CourseLesson }) {
  const next = VIBE_LESSONS.find((l) => l.num === lesson.num + 1);
  return (
    <div
      style={{
        background: '#181D27',
        color: '#fff',
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: '#FEA3B4',
          fontWeight: 700,
          letterSpacing: '0.08em',
        }}
      >
        다음 레슨
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          marginTop: 4,
          lineHeight: 1.35,
        }}
      >
        Lesson {lesson.num + 1}. {next?.title ?? '마지막 레슨'}
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#A4A7AE',
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <MaterialIcon name="lock" size={12} />
        돌아보기 제출하면 열려요
      </div>
    </div>
  );
}

function FinalLessonCard() {
  return (
    <div
      style={{
        background: '#181D27',
        color: '#fff',
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: '#FEA3B4',
          fontWeight: 700,
          letterSpacing: '0.08em',
        }}
      >
        FINAL LESSON
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          marginTop: 4,
          lineHeight: 1.4,
        }}
      >
        마지막 한 칸만 남았어요.
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#A4A7AE',
          marginTop: 6,
          lineHeight: 1.6,
        }}
      >
        돌아보기를 제출하면 완주 인증과 축하 페이지로 이동해요.
      </div>
    </div>
  );
}
