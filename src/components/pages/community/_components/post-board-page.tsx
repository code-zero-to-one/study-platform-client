'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageAttachField } from '@/components/pages/class/_components/image-attach-field';
import { MarkdownEditor } from '@/components/pages/class/_components/markdown-editor';
import { MaterialIcon } from '@/components/pages/class/_components/material-icon';
import { parseDaysAgo } from '@/components/pages/class/_data/qna-data';
import { useToastStore } from '@/stores/use-toast-store';
import { DUMMY_PROFILE_IMAGE_SRC } from '../_data/community-dummy-assets';
import {
  type CommunityPost,
  POST_CURRENT_USER,
  type PostBoardKind,
} from '../_data/post-data';

const TITLE_MAX = 80;
const BODY_MIN = 20;
const BODY_MAX = 5000;

const composerCounterStyle: React.CSSProperties = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: 10.5,
  color: '#A4A7AE',
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  pointerEvents: 'none',
};

type SortKey = 'latest' | 'views' | 'likes';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '최신순' },
  { key: 'views', label: '조회순' },
  { key: 'likes', label: '추천순' },
];

interface PostBoardPageProps {
  board: PostBoardKind;
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
  posts: CommunityPost[];
  myFilterLabel: string;
  onCreate: (payload: {
    title: string;
    body: string;
    images: string[];
  }) => CommunityPost;
}

export function PostBoardPage({
  board,
  title,
  description,
  iconName,
  iconColor,
  iconBg,
  posts: initialPosts,
  myFilterLabel,
  onCreate,
}: PostBoardPageProps) {
  const showToast = useToastStore((s) => s.showToast);
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [sort, setSort] = useState<SortKey>('latest');
  const [keyword, setKeyword] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const base = posts.filter((p) => {
      if (onlyMine && p.author !== POST_CURRENT_USER) return false;
      if (!k) return true;
      return (
        p.title.toLowerCase().includes(k) ||
        p.body.toLowerCase().includes(k) ||
        p.author.toLowerCase().includes(k)
      );
    });
    return [...base].sort((a, b) => {
      if (sort === 'views') return b.views - a.views;
      if (sort === 'likes') return b.likes - a.likes;
      return parseDaysAgo(a.when) - parseDaysAgo(b.when);
    });
  }, [posts, sort, keyword, onlyMine]);

  const myCount = posts.filter((p) => p.author === POST_CURRENT_USER).length;

  const handleSubmit = (payload: {
    title: string;
    body: string;
    images: string[];
  }) => {
    const next = onCreate(payload);
    setPosts([next, ...posts]);
    showToast('글이 게시되었어요!', 'success');
    setComposerOpen(false);
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
            background: iconBg,
            borderRadius: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: '#fff',
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MaterialIcon name={iconName} size={30} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#181D27',
                letterSpacing: '-0.015em',
                margin: '0 0 4px',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: 13,
                color: '#535862',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* 내 글 필터 chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
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
            {onlyMine ? <MaterialIcon name="check" size={14} /> : null}
            {myFilterLabel} ({myCount})
          </button>
        </div>

        {/* 검색 + 정렬 + 글 작성 */}
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
                top: '50%',
                left: 12,
                transform: 'translateY(-50%)',
                color: '#A4A7AE',
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

          <div ref={sortRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
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
                {SORT_OPTIONS.map((opt) => {
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

          <button
            type="button"
            onClick={() => setComposerOpen(true)}
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
            글 작성하기
          </button>
        </div>

        {/* 게시판 목록 */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #E9EAEB',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {/* 테이블 헤더 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              background: '#F9FAFB',
              borderBottom: '1px solid #F2F4F7',
              fontSize: 11,
              fontWeight: 700,
              color: '#A4A7AE',
              letterSpacing: '0.05em',
            }}
          >
            <span style={{ flex: 1 }}>제목</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexShrink: 0,
              }}
            >
              <span style={{ width: 84, textAlign: 'right' }}>작성자</span>
              <span style={{ width: 44, textAlign: 'right' }}>추천</span>
              <span style={{ width: 52, textAlign: 'right' }}>조회</span>
              <span style={{ width: 60, textAlign: 'right' }}>작성일</span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                padding: '60px 24px',
                textAlign: 'center',
                fontSize: 14,
                color: '#A4A7AE',
              }}
            >
              <MaterialIcon
                name="forum"
                size={32}
                style={{
                  color: '#D5D7DA',
                  display: 'block',
                  margin: '0 auto 12px',
                }}
              />
              {keyword
                ? '검색 결과가 없어요.'
                : '아직 작성된 글이 없어요. 첫 글을 남겨보세요!'}
            </div>
          ) : (
            filtered.map((post) => (
              <PostRow
                key={`${post.board}-${post.id}`}
                post={post}
                href={`/community/${post.board}/${post.id}`}
              />
            ))
          )}
        </div>
      </div>

      <ComposerModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleSubmit}
        boardLabel={title}
      />
    </div>
  );
}

function PostRow({ post, href }: { post: CommunityPost; href: string }) {
  return (
    <Link
      href={href}
      prefetch
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 20px',
        background: '#fff',
        borderBottom: '1px solid #F2F4F7',
        cursor: 'pointer',
        transition: 'background 120ms ease',
        textDecoration: 'none',
        color: 'inherit',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#FAFAFA';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = '#fff';
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#181D27',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {post.title}
        </span>
        {post.comments.length > 0 ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#F63D68',
              flexShrink: 0,
            }}
          >
            [{post.comments.length}]
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexShrink: 0,
          fontSize: 12,
          color: '#717680',
        }}
      >
        <span
          style={{
            width: 84,
            textAlign: 'right',
            display: 'inline-flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
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
              width={18}
              height={18}
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
              fontWeight: 600,
              color: '#535862',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {post.author}
          </span>
        </span>
        <span
          style={{
            width: 44,
            textAlign: 'right',
            color: post.likes > 0 ? '#181D27' : '#A4A7AE',
            fontWeight: post.likes > 0 ? 700 : 400,
          }}
        >
          {post.likes}
        </span>
        <span style={{ width: 52, textAlign: 'right' }}>{post.views}</span>
        <span
          style={{
            width: 60,
            textAlign: 'right',
            color: '#A4A7AE',
          }}
        >
          {post.when}
        </span>
      </div>
    </Link>
  );
}

function ComposerModal({
  open,
  onClose,
  onSubmit,
  boardLabel,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    body: string;
    images: string[];
  }) => void;
  boardLabel: string;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setTitle('');
      setBody('');
      setImages([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return undefined;

  const canSubmit = title.trim().length > 0 && body.trim().length >= BODY_MIN;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({ title, body, images });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(10,13,18,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 600,
          maxWidth: '94vw',
          maxHeight: '92vh',
          background: '#fff',
          borderRadius: 24,
          boxShadow:
            '0 20px 24px -4px rgba(16,24,40,0.08), 0 8px 8px -4px rgba(16,24,40,0.03)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E9EAEB',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#717680',
                letterSpacing: '0.06em',
              }}
            >
              {boardLabel}
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: '2px 0 0',
                color: '#181D27',
              }}
            >
              글 작성하기
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: 0,
              background: 'transparent',
              color: '#535862',
              cursor: 'pointer',
            }}
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        <div
          style={{
            padding: '18px 24px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <FieldLabel required>제목</FieldLabel>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder="제목을 입력하세요"
              style={{
                width: '100%',
                padding: '10px 12px',
                paddingRight: 60,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'inherit',
                color: '#181D27',
                background: '#fff',
                border: '1px solid #D5D7DA',
                borderRadius: 8,
                outline: 'none',
              }}
            />
            <span style={composerCounterStyle}>
              {title.length}/{TITLE_MAX}
            </span>
          </div>

          <div style={{ height: 16 }} />

          <FieldLabel required>
            내용
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#535862',
                marginLeft: 8,
              }}
            >
              (최소 {BODY_MIN}자, 마크다운 사용 가능)
            </span>
          </FieldLabel>
          <MarkdownEditor
            value={body}
            onChange={setBody}
            placeholder="자유롭게 이야기해보세요"
            rows={8}
            maxLength={BODY_MAX}
          />

          <div style={{ height: 16 }} />

          <FieldLabel>
            이미지 첨부
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#535862',
                marginLeft: 8,
              }}
            >
              (선택, 최대 3장)
            </span>
          </FieldLabel>
          <ImageAttachField images={images} setImages={setImages} max={3} />
        </div>

        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #E9EAEB',
            background: '#FAFAFA',
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 16px',
              background: '#fff',
              color: '#535862',
              border: '1px solid #D5D7DA',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            style={{
              padding: '9px 18px',
              background: canSubmit ? '#181D27' : '#F2F4F7',
              color: canSubmit ? '#fff' : '#A4A7AE',
              border: 0,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            게시하기
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  required,
  children,
}: {
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        fontSize: 12.5,
        fontWeight: 700,
        color: '#181D27',
        display: 'block',
        marginBottom: 6,
      }}
    >
      {children}
      {required ? <span style={{ color: '#F63D68' }}> *</span> : null}
    </label>
  );
}
