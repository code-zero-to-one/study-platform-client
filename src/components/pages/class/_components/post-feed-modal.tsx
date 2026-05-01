'use client';

import { type ChangeEvent, useEffect, useState } from 'react';
import { ImageAttachField } from './image-attach-field';
import { MarkdownEditor } from './markdown-editor';
import { MaterialIcon } from './material-icon';
import { VIBE_LESSONS } from '../_data/courses';
import { QNA_COURSES } from '../_data/qna-data';

export interface PostFeedPayload {
  title: string;
  motiv: string;
  review: string;
  images: string[];
  lessonNum: number;
  courseId?: string;
}

const TITLE_MAX = 60;
const MOTIV_MIN = 20;
const MOTIV_MAX = 200;
const REVIEW_MIN = 20;
const REVIEW_MAX = 5000;

const counterStyleInline: React.CSSProperties = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: 10.5,
  color: '#A4A7AE',
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  pointerEvents: 'none',
};

const counterStyleBottom: React.CSSProperties = {
  position: 'absolute',
  right: 12,
  bottom: 8,
  fontSize: 10.5,
  color: '#A4A7AE',
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  pointerEvents: 'none',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 13,
  fontFamily: 'inherit',
  color: '#181D27',
  background: '#fff',
  border: '1px solid #D5D7DA',
  borderRadius: 8,
  outline: 'none',
};

interface PostFeedModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: PostFeedPayload) => void;
  defaultLessonNum?: number;
  defaultCourseId?: string;
  showCourseSelect?: boolean;
}

export function PostFeedModal({
  open,
  onClose,
  onSubmit,
  defaultLessonNum = 5,
  defaultCourseId = 'vibe-intro',
  showCourseSelect = false,
}: PostFeedModalProps) {
  const [title, setTitle] = useState<string>('');
  const [motiv, setMotiv] = useState<string>('');
  const [review, setReview] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [lessonNum, setLessonNum] = useState<number>(defaultLessonNum);
  const [courseId, setCourseId] = useState<string>(defaultCourseId);

  useEffect(() => {
    if (open) {
      setTitle('');
      setMotiv('');
      setReview('');
      setImages([]);
      setLessonNum(defaultLessonNum);
      setCourseId(defaultCourseId);
    }
  }, [open, defaultLessonNum, defaultCourseId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return undefined;

  const canSubmit =
    title.trim().length > 0 &&
    motiv.trim().length >= MOTIV_MIN &&
    review.trim().length >= REVIEW_MIN;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit?.({ title, motiv, review, images, lessonNum, courseId });
    onClose();
  };

  const handleLessonChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLessonNum(Number.parseInt(e.target.value, 10));
  };

  const handleCourseChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCourseId(e.target.value);
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
          width: 640,
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
            flexShrink: 0,
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
              빌더 피드
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: '2px 0 0',
                color: '#181D27',
              }}
            >
              피드 올리기
            </h3>
          </div>
          <CloseIconButton onClose={onClose} />
        </div>

        <div style={{ padding: '18px 24px 22px', overflowY: 'auto', flex: 1 }}>
          {showCourseSelect ? (
            <>
              <FieldLabel>어떤 코스에서 만든 결과물인가요?</FieldLabel>
              <select
                value={courseId}
                onChange={handleCourseChange}
                style={inputStyle}
              >
                {QNA_COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div style={{ height: 16 }} />
            </>
          ) : null}

          <FieldLabel>어떤 레슨에서 만든 결과물인가요?</FieldLabel>
          <select
            value={lessonNum}
            onChange={handleLessonChange}
            style={inputStyle}
          >
            {VIBE_LESSONS.map((l) => (
              <option key={l.num} value={l.num}>
                Lesson {String(l.num).padStart(2, '0')}. {l.title}
              </option>
            ))}
          </select>

          <div style={{ height: 16 }} />

          <FieldLabel required>제목</FieldLabel>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder="만든 결과물의 이름을 적어주세요"
              style={{ ...inputStyle, paddingRight: 60 }}
            />
            <span style={counterStyleInline}>
              {title.length}/{TITLE_MAX}
            </span>
          </div>

          <div style={{ height: 16 }} />

          <FieldLabel required>
            왜 만들었나요?
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#535862',
                marginLeft: 8,
              }}
            >
              (최소 {MOTIV_MIN}자)
            </span>
          </FieldLabel>
          <div style={{ position: 'relative' }}>
            <textarea
              value={motiv}
              onChange={(e) => setMotiv(e.target.value.slice(0, MOTIV_MAX))}
              placeholder="만들게 된 동기를 적어주세요"
              rows={2}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: 1.6,
                paddingBottom: 26,
              }}
            />
            <span style={counterStyleBottom}>
              {motiv.length}/{MOTIV_MAX}
            </span>
          </div>

          <div style={{ height: 16 }} />

          <FieldLabel required>
            후기
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#535862',
                marginLeft: 8,
              }}
            >
              (최소 {REVIEW_MIN}자, 마크다운 사용 가능)
            </span>
          </FieldLabel>
          <MarkdownEditor
            value={review}
            onChange={setReview}
            placeholder="만들면서 느낀 점이나 어려웠던 부분을 적어주세요"
            rows={6}
            maxLength={REVIEW_MAX}
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
            flexShrink: 0,
          }}
        >
          <SecondaryButton onClick={onClose}>취소</SecondaryButton>
          <PrimaryButton onClick={submit} disabled={!canSubmit}>
            게시하기
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function CloseIconButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="닫기"
      style={{
        width: 38,
        height: 38,
        borderRadius: 999,
        border: 0,
        background: 'transparent',
        color: '#535862',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#F5F5F5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <MaterialIcon name="close" size={20} />
    </button>
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

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '9px 18px',
        background: disabled ? '#F2F4F7' : '#181D27',
        color: disabled ? '#A4A7AE' : '#fff',
        border: 0,
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
      {children}
    </button>
  );
}
