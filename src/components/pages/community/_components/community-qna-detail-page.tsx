'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GradeBadge } from '@/components/pages/class/_components/builder-detail-modal';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';
import { VIBE_LESSONS } from '@/components/pages/class/_data/courses';
import {
  QNA_ADMIN,
  QNA_CURRENT_USER,
  QNA_ITEMS,
  type QnaQuestion,
} from '@/components/pages/class/_data/qna-data';
import CommunityPostReportMenu from '@/features/community/ui/community-post-report-menu';
import { DUMMY_PROFILE_IMAGE_SRC } from '../_data/community-dummy-assets';
import {
  type AdminReply,
  ADMIN_ANSWER_REPLIES,
} from '../_data/qna-admin-replies';

type Reaction = 'like' | 'dislike' | undefined;

interface ImageViewerProps {
  src: string;
  onClose: () => void;
}

function ImageViewer({ src, onClose }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(255,255,255,0.15)',
          border: 0,
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
        }}
      >
        <MaterialIcon name="close" size={20} />
      </button>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 16,
          position: 'absolute',
          bottom: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.max(0.5, z - 0.25));
          }}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 0,
            borderRadius: '50%',
            width: 32,
            height: 32,
            cursor: 'pointer',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcon name="zoom_out" size={16} />
        </button>
        <span style={{ color: '#fff', fontSize: 13 }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => Math.min(3, z + 0.25));
          }}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 0,
            borderRadius: '50%',
            width: 32,
            height: 32,
            cursor: 'pointer',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcon name="zoom_in" size={16} />
        </button>
      </div>
      <img
        src={src}
        alt="이미지 확대"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '80vh',
          objectFit: 'contain',
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          transition: 'transform 200ms ease',
          borderRadius: 8,
          cursor: 'default',
        }}
      />
    </div>,
    document.body,
  );
}

interface CommunityQnaDetailPageProps {
  questionId: string;
}

export function CommunityQnaDetailPage({
  questionId,
}: CommunityQnaDetailPageProps) {
  const router = useRouter();
  const [q, setQ] = useState<QnaQuestion | undefined>(() =>
    QNA_ITEMS.find((item) => item.id === questionId),
  );
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!viewTracked.current && q) {
      setQ((prev) => (prev ? { ...prev, views: prev.views + 1 } : prev));
      viewTracked.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [viewerSrc, setViewerSrc] = useState<string | undefined>(undefined);

  const initialReplies = useMemo(
    () => ADMIN_ANSWER_REPLIES[questionId] ?? [],
    [questionId],
  );
  const [adminReplies, setAdminReplies] =
    useState<AdminReply[]>(initialReplies);
  const [replyDraft, setReplyDraft] = useState('');
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyReactions, setReplyReactions] = useState<
    Record<number, Reaction>
  >({});

  const handleSubmitAdminReply = () => {
    const text = replyDraft.trim();
    if (!text) return;
    const newReply: AdminReply = {
      id: Date.now(),
      name: QNA_CURRENT_USER,
      grade: '빌더',
      text,
      when: '방금 전',
      likes: 0,
      dislikes: 0,
    };
    setAdminReplies((prev) => [...prev, newReply]);
    setReplyDraft('');
    setReplyOpen(false);
  };

  const toggleReplyReaction = (id: number, next: Reaction) => {
    setReplyReactions((prev) => {
      const current = prev[id];
      return { ...prev, [id]: current === next ? undefined : next };
    });
  };

  const reactionDelta = (
    current: Reaction,
    target: 'like' | 'dislike',
    base: number,
  ) => (current === target ? base + 1 : base);

  if (!q) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 128px)',
          gap: 12,
          color: '#A4A7AE',
        }}
      >
        <MaterialIcon
          name="help_outline"
          size={40}
          style={{ color: '#D5D7DA' }}
        />
        <p style={{ fontSize: 15, margin: 0 }}>존재하지 않는 질문입니다.</p>
        <button
          type="button"
          onClick={() => router.push('/community/qna')}
          style={{
            marginTop: 8,
            padding: '8px 18px',
            background: '#181D27',
            color: '#fff',
            border: 0,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          질문 목록으로
        </button>
      </div>
    );
  }

  const lesson = VIBE_LESSONS.find((l) => l.num === q.lessonNum);
  const imageCount = q.images?.length ?? 0;
  const gridCols = imageCount === 1 ? 1 : imageCount === 2 ? 2 : 3;

  return (
    <div
      style={{
        background: '#FAFAFA',
        minHeight: 'calc(100vh - 64px)',
        padding: '40px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* 뒤로 가기 */}
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 24,
            padding: '6px 0',
            background: 'transparent',
            border: 0,
            fontSize: 13,
            fontWeight: 600,
            color: '#717680',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <MaterialIcon name="arrow_back" size={16} />
          목록으로
        </button>

        {/* 질문 카드 */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #E9EAEB',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          {/* 헤더 */}
          <div style={{ padding: '24px 24px 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: '#E0F2FE',
                  color: '#0369A1',
                }}
              >
                {q.courseName}
              </span>
              {lesson ? (
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: '#FFE4E8',
                    color: '#C01048',
                  }}
                >
                  Lesson {String(lesson.num).padStart(2, '0')} · {lesson.title}
                </span>
              ) : null}
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: '#A4A7AE' }}>{q.when}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <h1
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#181D27',
                  letterSpacing: '-0.015em',
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {q.title}
              </h1>
              <CommunityPostReportMenu
                contentTitle={q.title}
                dialogTitle="질문 신고"
              />
            </div>

            {/* 작성자 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingBottom: 16,
                borderBottom: '1px solid #F2F4F7',
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
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
                  width={28}
                  height={28}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#252B37' }}>
                {q.author}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 4,
                  background: '#F5F5F5',
                  color: '#535862',
                }}
              >
                {q.grade}
              </span>
              <span style={{ flex: 1 }} />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  color: '#A4A7AE',
                }}
              >
                <MaterialIcon
                  name="visibility"
                  size={14}
                  style={{ color: '#D5D7DA' }}
                />
                {q.views}
              </span>
            </div>
          </div>

          {/* 본문 */}
          <div style={{ padding: '20px 24px' }}>
            <p
              style={{
                fontSize: 15,
                color: '#374151',
                lineHeight: 1.75,
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {q.body}
            </p>

            {/* 이미지 */}
            {imageCount > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  gap: 8,
                  marginTop: 20,
                }}
              >
                {q.images!.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setViewerSrc(src)}
                    style={{
                      padding: 0,
                      border: '1px solid #E9EAEB',
                      borderRadius: 10,
                      overflow: 'hidden',
                      cursor: 'zoom-in',
                      background: 'transparent',
                      aspectRatio: '4 / 3',
                    }}
                  >
                    <img
                      src={src}
                      alt={`첨부 이미지 ${i + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* 답변 목록 */}
        {q.answers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {q.answers.map((ans) => {
              const isAdmin = ans.role === 'admin';
              return (
                <div
                  key={ans.id}
                  style={{
                    background: '#fff',
                    border: `1px solid ${isAdmin ? '#FEA3B4' : '#E9EAEB'}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  {isAdmin ? (
                    <div
                      style={{
                        padding: '10px 20px',
                        background: '#FFF1F3',
                        borderBottom: '1px solid #FEA3B4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 14,
                          fontWeight: 800,
                          color: '#C01048',
                          letterSpacing: '0.02em',
                        }}
                      >
                        <MaterialIcon name="verified" size={16} />
                        운영진의 답변
                      </span>
                      <span style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: '#A4A7AE' }}>
                        {ans.when}
                      </span>
                    </div>
                  ) : null}
                  <div style={{ padding: '20px' }}>
                    {!isAdmin ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 12,
                        }}
                      >
                        <span
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
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#252B37',
                          }}
                        >
                          {ans.author}
                        </span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 11, color: '#A4A7AE' }}>
                          {ans.when}
                        </span>
                      </div>
                    ) : null}
                    <p
                      style={{
                        fontSize: 14,
                        color: '#374151',
                        lineHeight: 1.75,
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {ans.body}
                    </p>

                    {/* 운영진 답변에 대한 대댓글 */}
                    {isAdmin ? (
                      <div
                        style={{
                          marginTop: 16,
                          paddingTop: 16,
                          borderTop: '1px solid #F5F5F5',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 12,
                          }}
                        >
                          <MaterialIcon
                            name="forum"
                            size={14}
                            style={{ color: '#535862' }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#252B37',
                            }}
                          >
                            답글 {adminReplies.length}
                          </span>
                          <span style={{ flex: 1 }} />
                          <button
                            type="button"
                            onClick={() => setReplyOpen((v) => !v)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '4px 10px',
                              fontSize: 12,
                              fontWeight: 600,
                              color: replyOpen ? '#181D27' : '#717680',
                              background: 'transparent',
                              border: 0,
                              borderRadius: 6,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            <MaterialIcon name="reply" size={14} />
                            답글 달기
                          </button>
                        </div>

                        {adminReplies.length > 0 ? (
                          <div
                            style={{
                              marginLeft: 12,
                              paddingLeft: 14,
                              borderLeft: '2px solid #F5F5F5',
                            }}
                          >
                            {adminReplies.map((reply) => {
                              const r = replyReactions[reply.id];
                              return (
                                <div
                                  key={reply.id}
                                  style={{ padding: '12px 0' }}
                                >
                                  <ReplyBody
                                    name={reply.name}
                                    grade={reply.grade}
                                    when={reply.when}
                                    text={reply.text}
                                    likes={reactionDelta(
                                      r,
                                      'like',
                                      reply.likes,
                                    )}
                                    dislikes={reactionDelta(
                                      r,
                                      'dislike',
                                      reply.dislikes,
                                    )}
                                    reaction={r}
                                    onLike={() =>
                                      toggleReplyReaction(reply.id, 'like')
                                    }
                                    onDislike={() =>
                                      toggleReplyReaction(reply.id, 'dislike')
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : null}

                        {replyOpen ? (
                          <div style={{ marginTop: 8 }}>
                            <ReplyComposer
                              value={replyDraft}
                              onChange={setReplyDraft}
                              onSubmit={handleSubmitAdminReply}
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '36px 24px',
              textAlign: 'center',
              background: '#fff',
              border: '1px solid #E9EAEB',
              borderRadius: 14,
            }}
          >
            <MaterialIcon
              name="forum"
              size={28}
              style={{
                color: '#D5D7DA',
                display: 'block',
                margin: '0 auto 10px',
              }}
            />
            <p style={{ fontSize: 14, color: '#A4A7AE', margin: 0 }}>
              {QNA_ADMIN.name}이 답변을 준비 중이에요.
            </p>
          </div>
        )}

        {viewerSrc ? (
          <ImageViewer
            src={viewerSrc}
            onClose={() => setViewerSrc(undefined)}
          />
        ) : null}
      </div>
    </div>
  );
}

interface ReplyBodyProps {
  name: string;
  grade: import('@/components/pages/class/_data/feed-data').Grade;
  when: string;
  text: string;
  likes: number;
  dislikes: number;
  reaction: Reaction;
  onLike: () => void;
  onDislike: () => void;
}

function ReplyBody({
  name,
  grade,
  when,
  text,
  likes,
  dislikes,
  reaction,
  onLike,
  onDislike,
}: ReplyBodyProps) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={DUMMY_PROFILE_IMAGE_SRC}
          alt=""
          width={28}
          height={28}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: '#181D27' }}>
            {name}
          </span>
          <GradeBadge grade={grade} />
          <span style={{ fontSize: 11, color: '#A4A7AE' }}>{when}</span>
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: '#252B37',
            marginTop: 4,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {text}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 6,
          }}
        >
          <SmallReactionBtn
            icon="thumb_up"
            count={likes}
            active={reaction === 'like'}
            onClick={onLike}
          />
          <SmallReactionBtn
            icon="thumb_down"
            count={dislikes}
            active={reaction === 'dislike'}
            onClick={onDislike}
          />
        </div>
      </div>
    </div>
  );
}

function SmallReactionBtn({
  icon,
  count,
  active,
  onClick,
}: {
  icon: 'thumb_up' | 'thumb_down';
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        fontSize: 12,
        fontWeight: 600,
        color: active ? '#181D27' : '#717680',
        background: 'transparent',
        border: 0,
        borderRadius: 6,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <MaterialIcon name={icon} size={13} filled={active} />
      {count}
    </button>
  );
}

function ReplyComposer({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const disabled = value.trim().length === 0;
  return (
    <div
      style={{
        border: '1px solid #E9EAEB',
        borderRadius: 10,
        background: '#fff',
        padding: 10,
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="운영진의 답변에 대한 추가 질문/의견을 남겨보세요."
        rows={2}
        style={{
          width: '100%',
          border: 0,
          outline: 'none',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: 13,
          lineHeight: 1.6,
          color: '#181D27',
          background: 'transparent',
        }}
      />
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}
      >
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          style={{
            padding: '6px 14px',
            fontSize: 12.5,
            fontWeight: 700,
            background: disabled ? '#F2F4F7' : '#181D27',
            color: disabled ? '#A4A7AE' : '#fff',
            border: 0,
            borderRadius: 6,
            fontFamily: 'inherit',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          답글 등록
        </button>
      </div>
    </div>
  );
}
