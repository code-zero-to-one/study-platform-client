'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GradeBadge } from '@/components/pages/class/_components/builder-detail-modal';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';
import {
  type FeedReply,
  type FeedThread,
  FEED_CURRENT_USER,
  type Grade,
} from '@/components/pages/class/_data/feed-data';
import { DUMMY_PROFILE_IMAGE_SRC } from '@/components/pages/community/_data/community-dummy-assets';
import CommunityPostReportMenu from '@/features/community/ui/community-post-report-menu';
import { useToastStore } from '@/stores/use-toast-store';
import { type CommunityPost, type PostBoardKind } from '../_data/post-data';

type Reaction = 'like' | 'dislike' | undefined;

const DEFAULT_THREADS: FeedThread[] = [
  {
    id: 1,
    name: '민서위크',
    grade: '빌더',
    text: '저도 같은 고민이었는데, 깔끔하게 정리해주셔서 도움 많이 됐어요!',
    when: '1시간 전',
    likes: 4,
    dislikes: 0,
    replies: [
      {
        id: 101,
        name: '제로호준',
        grade: '운영자',
        text: '좋은 인사이트 공유 감사합니다 :)',
        when: '40분 전',
        likes: 2,
        dislikes: 0,
      },
    ],
  },
  {
    id: 2,
    name: '수빈코덕',
    grade: '2학년',
    text: '관련해서 추천하는 도구나 자료 있으신가요?',
    when: '3시간 전',
    likes: 1,
    dislikes: 0,
    replies: [],
  },
];

interface PostDetailPageProps {
  post: CommunityPost | undefined;
  board: PostBoardKind;
  boardLabel: string;
}

export function PostDetailPage({
  post,
  board,
  boardLabel,
}: PostDetailPageProps) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);
  const [current, setCurrent] = useState<CommunityPost | undefined>(post);
  const [liked, setLiked] = useState(false);
  const viewTracked = useRef(false);

  const baseThreads = useMemo(() => DEFAULT_THREADS, []);
  const [threads, setThreads] = useState<FeedThread[]>(baseThreads);
  const [threadInput, setThreadInput] = useState('');
  const [replyOpen, setReplyOpen] = useState<Record<number, boolean>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [threadReactions, setThreadReactions] = useState<
    Record<number, Reaction>
  >({});
  const [replyReactions, setReplyReactions] = useState<
    Record<number, Reaction>
  >({});

  useEffect(() => {
    if (!viewTracked.current && current) {
      setCurrent((prev) => (prev ? { ...prev, views: prev.views + 1 } : prev));
      viewTracked.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!current) {
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
        <MaterialIcon name="forum" size={40} style={{ color: '#D5D7DA' }} />
        <p style={{ fontSize: 15, margin: 0 }}>존재하지 않는 글입니다.</p>
        <button
          type="button"
          onClick={() => router.push(`/community/${board}`)}
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
          목록으로
        </button>
      </div>
    );
  }

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setCurrent((p) => (p ? { ...p, likes: p.likes + (liked ? -1 : 1) } : p));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('링크가 복사되었어요', 'success');
    } catch {
      showToast('복사에 실패했어요', 'error');
    }
  };

  const totalComments = threads.reduce(
    (acc, t) => acc + 1 + (t.replies?.length ?? 0),
    0,
  );

  const handleSubmitThread = () => {
    const text = threadInput.trim();
    if (!text) return;
    const newThread: FeedThread = {
      id: Date.now(),
      name: FEED_CURRENT_USER,
      grade: '빌더',
      text,
      when: '방금 전',
      likes: 0,
      dislikes: 0,
      replies: [],
    };
    setThreads((prev) => [newThread, ...prev]);
    setThreadInput('');
  };

  const handleSubmitReply = (threadId: number) => {
    const text = (replyDrafts[threadId] ?? '').trim();
    if (!text) return;
    const newReply: FeedReply = {
      id: Date.now(),
      name: FEED_CURRENT_USER,
      grade: '빌더',
      text,
      when: '방금 전',
      likes: 0,
      dislikes: 0,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, replies: [...(t.replies ?? []), newReply] }
          : t,
      ),
    );
    setReplyDrafts((prev) => ({ ...prev, [threadId]: '' }));
    setReplyOpen((prev) => ({ ...prev, [threadId]: false }));
  };

  const toggleThreadReaction = (threadId: number, next: Reaction) => {
    setThreadReactions((prev) => {
      const current = prev[threadId];
      return { ...prev, [threadId]: current === next ? undefined : next };
    });
  };

  const toggleReplyReaction = (replyId: number, next: Reaction) => {
    setReplyReactions((prev) => {
      const current = prev[replyId];
      return { ...prev, [replyId]: current === next ? undefined : next };
    });
  };

  const reactionDelta = (
    current: Reaction,
    target: 'like' | 'dislike',
    base: number,
  ) => (current === target ? base + 1 : base);

  return (
    <div
      style={{
        background: '#FAFAFA',
        minHeight: 'calc(100vh - 64px)',
        padding: '40px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* 뒤로가기 */}
        <button
          type="button"
          onClick={() => router.push(`/community/${board}`)}
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
          {boardLabel}
        </button>

        <article
          style={{
            background: '#fff',
            border: '1px solid #E9EAEB',
            borderRadius: 16,
            padding: '32px 32px 24px',
            marginBottom: 16,
          }}
        >
          {/* 제목 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <h1
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 24,
                fontWeight: 800,
                color: '#181D27',
                letterSpacing: '-0.015em',
                lineHeight: 1.4,
                margin: 0,
                wordBreak: 'break-word',
              }}
            >
              {current.title}
            </h1>
            <CommunityPostReportMenu contentTitle={current.title} />
          </div>

          {/* 작성자 + 메타 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              paddingBottom: 20,
              borderBottom: '1px solid #F2F4F7',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
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
                width={32}
                height={32}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#252B37',
                }}
              >
                {current.author}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#F5F5F5',
                    color: '#535862',
                  }}
                >
                  {current.grade}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#A4A7AE', marginTop: 2 }}>
                {current.when}
              </span>
            </div>
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
              {current.views}
            </span>
          </div>

          {/* 본문 */}
          <div
            style={{
              fontSize: 15,
              color: '#374151',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: 28,
            }}
          >
            {current.body}
          </div>

          {/* 액션 버튼 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 0 0',
              borderTop: '1px solid #F2F4F7',
            }}
          >
            <button
              type="button"
              onClick={toggleLike}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: liked ? '#FFE4E8' : '#fff',
                color: liked ? '#C01048' : '#535862',
                border: `1px solid ${liked ? '#FEA3B4' : '#D5D7DA'}`,
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <MaterialIcon name="thumb_up" size={14} filled={liked} />
              추천 {current.likes}
            </button>
            <button
              type="button"
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: '#fff',
                color: '#535862',
                border: '1px solid #D5D7DA',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <MaterialIcon name="share" size={14} />
              공유하기
            </button>
          </div>
        </article>

        {/* 댓글 섹션 (피드 댓글 스타일) */}
        <section
          style={{
            background: '#fff',
            border: '1px solid #E9EAEB',
            borderRadius: 16,
            padding: '24px 28px',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 14,
              color: '#181D27',
            }}
          >
            댓글 {totalComments}
          </div>

          <CommentComposer
            value={threadInput}
            onChange={setThreadInput}
            onSubmit={handleSubmitThread}
            placeholder="댓글을 입력해 주세요."
          />

          <div style={{ marginTop: 20 }}>
            {threads.map((thread) => {
              const tReaction = threadReactions[thread.id];
              return (
                <div
                  key={thread.id}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid #F5F5F5',
                  }}
                >
                  <CommentBody
                    name={thread.name}
                    grade={thread.grade}
                    when={thread.when}
                    text={thread.text}
                    likes={reactionDelta(tReaction, 'like', thread.likes)}
                    dislikes={reactionDelta(
                      tReaction,
                      'dislike',
                      thread.dislikes,
                    )}
                    reaction={tReaction}
                    onLike={() => toggleThreadReaction(thread.id, 'like')}
                    onDislike={() => toggleThreadReaction(thread.id, 'dislike')}
                    onReply={() =>
                      setReplyOpen((prev) => ({
                        ...prev,
                        [thread.id]: !prev[thread.id],
                      }))
                    }
                    replyOpen={replyOpen[thread.id]}
                    replyCount={thread.replies?.length ?? 0}
                  />

                  {thread.replies && thread.replies.length > 0 ? (
                    <div
                      style={{
                        marginTop: 12,
                        marginLeft: 44,
                        paddingLeft: 14,
                        borderLeft: '2px solid #F5F5F5',
                      }}
                    >
                      {thread.replies.map((reply) => {
                        const rReaction = replyReactions[reply.id];
                        return (
                          <div key={reply.id} style={{ padding: '12px 0' }}>
                            <CommentBody
                              name={reply.name}
                              grade={reply.grade}
                              when={reply.when}
                              text={reply.text}
                              likes={reactionDelta(
                                rReaction,
                                'like',
                                reply.likes,
                              )}
                              dislikes={reactionDelta(
                                rReaction,
                                'dislike',
                                reply.dislikes,
                              )}
                              reaction={rReaction}
                              onLike={() =>
                                toggleReplyReaction(reply.id, 'like')
                              }
                              onDislike={() =>
                                toggleReplyReaction(reply.id, 'dislike')
                              }
                              size="sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {replyOpen[thread.id] ? (
                    <div style={{ marginTop: 10, marginLeft: 44 }}>
                      <CommentComposer
                        value={replyDrafts[thread.id] ?? ''}
                        onChange={(v) =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [thread.id]: v,
                          }))
                        }
                        onSubmit={() => handleSubmitReply(thread.id)}
                        placeholder="답글을 입력해 주세요."
                        compact
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

interface CommentComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  compact?: boolean;
}

function CommentComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  compact,
}: CommentComposerProps) {
  const disabled = value.trim().length === 0;
  return (
    <div
      style={{
        border: '1px solid #E9EAEB',
        borderRadius: 10,
        background: '#fff',
        padding: compact ? 10 : 12,
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
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
            fontSize: 13,
            fontWeight: 700,
            background: disabled ? '#F2F4F7' : '#181D27',
            color: disabled ? '#A4A7AE' : '#fff',
            border: 0,
            borderRadius: 6,
            fontFamily: 'inherit',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          등록
        </button>
      </div>
    </div>
  );
}

interface CommentBodyProps {
  name: string;
  grade: Grade;
  when: string;
  text: string;
  likes: number;
  dislikes: number;
  reaction: Reaction;
  onLike: () => void;
  onDislike: () => void;
  onReply?: () => void;
  replyOpen?: boolean;
  replyCount?: number;
  size?: 'md' | 'sm';
}

function CommentBody({
  name,
  grade,
  when,
  text,
  likes,
  dislikes,
  reaction,
  onLike,
  onDislike,
  onReply,
  replyOpen,
  replyCount,
  size = 'md',
}: CommentBodyProps) {
  const avatarSize = size === 'sm' ? 28 : 32;
  const fontSize = size === 'sm' ? 12 : 13;
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div
        style={{
          width: avatarSize,
          height: avatarSize,
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
          width={avatarSize}
          height={avatarSize}
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
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize, fontWeight: 700, color: '#181D27' }}>
            {name}
          </span>
          <GradeBadge grade={grade} />
          <span style={{ fontSize: 11, color: '#A4A7AE' }}>{when}</span>
        </div>
        <div
          style={{
            fontSize,
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
            marginTop: 8,
          }}
        >
          <ReactionButton
            icon="thumb_up"
            count={likes}
            active={reaction === 'like'}
            onClick={onLike}
          />
          <ReactionButton
            icon="thumb_down"
            count={dislikes}
            active={reaction === 'dislike'}
            onClick={onDislike}
          />
          {onReply ? (
            <button
              type="button"
              onClick={onReply}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
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
              답글{replyCount ? ` ${replyCount}` : ''}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ReactionButton({
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
      <MaterialIcon name={icon} size={14} filled={active} />
      {count}
    </button>
  );
}
