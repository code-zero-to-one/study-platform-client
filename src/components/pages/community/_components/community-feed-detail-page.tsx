'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { GradeBadge } from '@/components/pages/class/_components/builder-detail-modal';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';
import { MiniThumb } from '@/components/pages/class/_components/mini-site-thumbs';
import {
  type FeedItem,
  FEED_ITEMS,
  FEED_CURRENT_USER,
  type FeedReply,
  type FeedThread,
} from '@/components/pages/class/_data/feed-data';
import { DUMMY_PROFILE_IMAGE_SRC } from '@/components/pages/community/_data/community-dummy-assets';
import CommunityPostReportMenu from '@/features/community/ui/community-post-report-menu';
import { useToastStore } from '@/stores/use-toast-store';

interface CommunityFeedDetailPageProps {
  feedId: number;
}

function noop(): void {
  // intentional empty handler
}

const DEFAULT_THREADS: FeedThread[] = [
  {
    id: 1,
    name: '제로호준',
    grade: '운영자',
    text: '진심이 담긴 결과물이에요. 다음 챕터에서 또 만나요!',
    when: '2시간 전',
    likes: 5,
    dislikes: 0,
    replies: [
      {
        id: 101,
        name: '지윤메이커',
        grade: '2학년',
        text: '감사합니다! 다음 코스도 기대하고 있어요.',
        when: '1시간 전',
        likes: 2,
        dislikes: 0,
      },
    ],
  },
  {
    id: 2,
    name: '지영코덕',
    grade: '4학년',
    text: '저도 이런 거 만들어보고 싶어요. 어떤 색 조합 쓰셨어요?',
    when: '5시간 전',
    likes: 3,
    dislikes: 0,
    replies: [],
  },
];

type Reaction = 'like' | 'dislike' | undefined;

export function CommunityFeedDetailPage({
  feedId,
}: CommunityFeedDetailPageProps) {
  const router = useRouter();
  const showToast = useToastStore((s) => s.showToast);

  const item: FeedItem | undefined = useMemo(
    () => FEED_ITEMS.find((it) => it.id === feedId),
    [feedId],
  );

  const baseThreads = useMemo(
    () => item?.threadsList ?? DEFAULT_THREADS,
    [item],
  );

  const [liked, setLiked] = useState(false);
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

  if (!item) {
    return (
      <div
        style={{
          background: '#FAFAFA',
          minHeight: 'calc(100vh - 64px)',
          padding: '40px 24px 80px',
        }}
      >
        <div
          style={{
            maxWidth: 880,
            margin: '0 auto',
            padding: '60px 24px',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E9EAEB',
            textAlign: 'center',
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
          <p style={{ fontSize: 14, color: '#535862', margin: 0 }}>
            존재하지 않는 피드예요.
          </p>
          <button
            type="button"
            onClick={() => router.push('/community/feed')}
            style={{
              marginTop: 16,
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
            목록으로
          </button>
        </div>
      </div>
    );
  }

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
        padding: '32px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => router.push('/community/feed')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 16,
            padding: '6px 10px 6px 6px',
            background: 'transparent',
            color: '#535862',
            border: 0,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <MaterialIcon name="arrow_back_ios" size={14} />
          목록으로
        </button>

        <article
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #E9EAEB',
            overflow: 'hidden',
          }}
        >
          {/* 히어로 이미지 */}
          <div
            style={{
              aspectRatio: '16/9',
              background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 32,
            }}
          >
            <div
              style={{
                width: '70%',
                aspectRatio: '4/3',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #E9EAEB',
                boxShadow:
                  '0 24px 48px -12px rgba(16,24,40,0.16), 0 8px 16px -8px rgba(16,24,40,0.08)',
              }}
            >
              <MiniThumb kind={item.thumbKind} />
            </div>
          </div>

          {/* 본문 */}
          <div style={{ padding: '28px 32px 24px' }}>
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
                  fontWeight: 700,
                  color: '#535862',
                  background: '#fff',
                  border: '1px solid #D5D7DA',
                  padding: '3px 8px',
                  borderRadius: 4,
                  letterSpacing: '0.04em',
                }}
              >
                Lesson {item.day}
              </span>
              <span style={{ fontSize: 12, color: '#A4A7AE' }}>
                {item.when}
              </span>
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
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#181D27',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {item.title}
              </h1>
              <CommunityPostReportMenu
                contentTitle={item.title}
                dialogTitle="빌더 피드 신고"
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 24,
                paddingBottom: 20,
                borderBottom: '1px solid #F5F5F5',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
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
                  width={36}
                  height={36}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#181D27',
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                  }}
                >
                  {item.name}
                  <GradeBadge grade={item.grade} />
                </div>
                <div style={{ fontSize: 11, color: '#A4A7AE', marginTop: 2 }}>
                  {item.role}
                </div>
              </div>
            </div>

            <section style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#717680',
                  letterSpacing: '0.06em',
                  margin: '0 0 8px',
                  textTransform: 'uppercase',
                }}
              >
                왜 만들었나요?
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: '#252B37',
                  lineHeight: 1.75,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {item.motiv}
              </p>
            </section>

            <section>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#717680',
                  letterSpacing: '0.06em',
                  margin: '0 0 8px',
                  textTransform: 'uppercase',
                }}
              >
                후기
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: '#252B37',
                  lineHeight: 1.75,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {item.review}
              </p>
            </section>

            {/* 액션 */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 28,
                paddingTop: 20,
                borderTop: '1px solid #F5F5F5',
              }}
            >
              <button
                type="button"
                onClick={() => setLiked((v) => !v)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  background: liked ? '#FFE4E8' : '#fff',
                  color: liked ? '#E31B54' : '#535862',
                  border: `1px solid ${liked ? '#FEA3B4' : '#D5D7DA'}`,
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <MaterialIcon name="favorite" size={15} filled={liked} />
                좋아요 {item.likes + (liked ? 1 : 0)}
              </button>
              <button
                type="button"
                onClick={() =>
                  showToast('배포 URL은 코스 진행 후 안내됩니다.', 'success')
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  background: '#fff',
                  color: '#535862',
                  border: '1px solid #D5D7DA',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <MaterialIcon name="open_in_new" size={15} />
                사이트 열기
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard
                      .writeText(window.location.href)
                      .catch(noop);
                  }
                  showToast('링크가 복사되었어요!', 'success');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  background: '#fff',
                  color: '#535862',
                  border: '1px solid #D5D7DA',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <MaterialIcon name="ios_share" size={15} />
                공유하기
              </button>
            </div>
          </div>

          {/* 댓글 섹션 (BuilderDetailModal과 동일 패턴) */}
          <div
            style={{
              padding: '20px 32px 32px',
              borderTop: '1px solid #E9EAEB',
              background: '#FAFAFA',
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
                      onDislike={() =>
                        toggleThreadReaction(thread.id, 'dislike')
                      }
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
                          borderLeft: '2px solid #E9EAEB',
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
          </div>
        </article>
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
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 6,
        }}
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
  grade: import('@/components/pages/class/_data/feed-data').Grade;
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
