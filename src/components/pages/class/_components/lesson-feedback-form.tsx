'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToastStore } from '@/stores/use-toast-store';
import { MaterialIcon } from './material-icon';

interface LessonFeedbackFormProps {
  lessonNum: number;
  isFinalLesson: boolean;
}

interface FeedbackOption {
  id: string;
  label: string;
  tone: 'good' | 'bad';
}

/** 2열 그리드(행 순)에서 좌=긍정·우=부정이 되도록 [긍정, 부정]쌍 순서로 둠 */
const FEEDBACK_OPTIONS: FeedbackOption[] = [
  { id: 'easy', label: '설명이 이해하기 쉬웠어요', tone: 'good' },
  { id: 'hard', label: '설명이 어려웠어요', tone: 'bad' },
  { id: 'fun', label: '실습이 재밌었어요', tone: 'good' },
  { id: 'stuck', label: '실습이 막혔어요', tone: 'bad' },
  { id: 'made', label: '뭐가 만들어졌다는 게 신기했어요', tone: 'good' },
  { id: 'confused', label: '뭘 하는 건지 모르겠어요', tone: 'bad' },
];

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

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 13,
  fontFamily: 'inherit',
  color: '#181D27',
  background: '#fff',
  border: '1px solid #D5D7DA',
  borderRadius: 8,
  outline: 'none',
  resize: 'vertical',
  minHeight: 88,
  lineHeight: 1.5,
};

/** 피드 올리기(`post-feed-modal`)·피드 상세 `motiv`와 동일 기준 */
const FEEDBACK_MOTIV_MIN = 20;
const FEEDBACK_MOTIV_MAX = 200;
/** 오늘 배운 것 — 동일한 카운터·입력 패턴 */
const FEEDBACK_DISCOVERY_MIN = 20;
const FEEDBACK_DISCOVERY_MAX = 200;
/** 레슨 피드백 자유 메모 */
const FEEDBACK_FREE_TEXT_MAX = 500;

const STAR_LABELS = [
  '',
  '거의 모르겠어요',
  '조금 어려웠어요',
  '보통이에요',
  '잘 이해됐어요',
  '완전 이해했어요!',
] as const;

export function LessonFeedbackForm({
  lessonNum,
  isFinalLesson,
}: LessonFeedbackFormProps) {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const [lessonRating, setLessonRating] = useState(0);
  const [discovery, setDiscovery] = useState('');
  const [motiv, setMotiv] = useState('');
  const [uploadType, setUploadType] = useState<'image' | 'link' | undefined>(
    undefined,
  );
  const [uploadValue, setUploadValue] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleReason = (label: string) => {
    setReasons((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  };

  const allValid =
    lessonRating >= 1 &&
    discovery.trim().length >= FEEDBACK_DISCOVERY_MIN &&
    motiv.trim().length >= FEEDBACK_MOTIV_MIN &&
    uploadValue.trim().length > 0;

  const submit = () => {
    if (!allValid || submitted) return;
    setSubmitted(true);
    if (isFinalLesson) {
      setTimeout(() => router.push('/class/vibe-intro/celebrate'), 700);
    } else {
      showToast('🎉 다음 레슨이 열렸어요!', 'success');
      setTimeout(() => router.push('/class/vibe-intro/roadmap'), 1400);
    }
  };

  return (
    <>
      <p
        style={{
          fontSize: 13,
          color: '#535862',
          margin: '0 0 20px',
          lineHeight: 1.6,
        }}
      >
        오늘 만든 결과물과 배운 점을 가볍게 적어주세요. 기록을 제출하면 다음
        레슨이 자동으로 열려요.
      </p>

      <Field
        label="이 내용이 얼마나 이해됐나요?"
        required
        hint="별점을 선택해 오늘 레슨 내용 이해도를 알려 주세요."
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            background: '#FAFAFA',
            borderRadius: 12,
            border: '1px solid #E9EAEB',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 2,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {[1, 2, 3, 4, 5].map((s) => {
              const active = s <= lessonRating;
              return (
                <button
                  key={s}
                  type="button"
                  aria-label={`${s}점, ${STAR_LABELS[s]}`}
                  title={STAR_LABELS[s]}
                  onClick={() => setLessonRating(s)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform .12s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <MaterialIcon
                    name="star"
                    size={22}
                    filled={active}
                    style={{ color: active ? '#F79009' : '#E9EAEB' }}
                  />
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: '#717680', fontWeight: 600 }}>
            {lessonRating === 0 ? '별을 눌러주세요' : STAR_LABELS[lessonRating]}
          </div>
        </div>
      </Field>

      <Field
        label="실습 결과물"
        required
        hint="스크린샷 또는 링크 (둘 중 하나만)"
      >
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <UploadTypeButton
            active={uploadType === 'image'}
            icon="image"
            label="스크린샷 첨부"
            onClick={() => {
              setUploadType('image');
              setUploadValue(`screenshot_${Date.now()}.png`);
            }}
          />
          <UploadTypeButton
            active={uploadType === 'link'}
            icon="link"
            label="링크 입력"
            onClick={() => {
              setUploadType('link');
              setUploadValue('');
            }}
          />
        </div>

        {uploadType === 'image' && uploadValue ? (
          <div
            style={{
              padding: '12px 14px',
              background: '#D1FADF',
              border: '1px solid #6CE9A6',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
            }}
          >
            <MaterialIcon
              name="check_circle"
              size={18}
              style={{ color: '#027A48' }}
            />
            <span style={{ flex: 1, color: '#054F31' }}>{uploadValue}</span>
            <button
              type="button"
              aria-label="첨부 제거"
              onClick={() => {
                setUploadValue('');
                setUploadType(undefined);
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                border: 0,
                background: 'transparent',
                color: '#054F31',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <MaterialIcon name="close" size={14} />
            </button>
          </div>
        ) : null}

        {uploadType === 'link' ? (
          <input
            type="url"
            value={uploadValue}
            onChange={(e) => setUploadValue(e.target.value)}
            placeholder="https://..."
            style={inputStyle}
          />
        ) : null}
      </Field>

      <Field
        label="왜 만들었나요?"
        required
        hint="이번 실습 결과를 왜 만들고 싶었는지, 시작할 때 어떤 점을 가장 기대했는지 적어 주세요."
      >
        <textarea
          value={motiv}
          onChange={(e) =>
            setMotiv(e.target.value.slice(0, FEEDBACK_MOTIV_MAX))
          }
          placeholder="만들게 된 동기를 적어주세요"
          rows={4}
          style={textareaStyle}
        />
        <div
          style={{
            fontSize: 11,
            marginTop: 6,
            textAlign: 'right',
            color:
              motiv.trim().length >= FEEDBACK_MOTIV_MIN ? '#027A48' : '#717680',
            fontFamily: 'var(--font-pretendard), sans-serif',
          }}
        >
          {motiv.length}/{FEEDBACK_MOTIV_MAX} · 최소 {FEEDBACK_MOTIV_MIN}자
          {motiv.trim().length >= FEEDBACK_MOTIV_MIN ? ' ✓' : ''}
        </div>
      </Field>

      <Field
        label="오늘 배운 것"
        required
        hint="어떤 작은 것이라도 좋아요. AI에게 시키는 법, 단축키, 폴더 구조…"
      >
        <textarea
          value={discovery}
          onChange={(e) =>
            setDiscovery(e.target.value.slice(0, FEEDBACK_DISCOVERY_MAX))
          }
          placeholder="예: Cursor에서 Cmd+K를 누르면 Claude가 바로 나타나는 게 신기했다."
          rows={3}
          style={textareaStyle}
        />
        <div
          style={{
            fontSize: 11,
            marginTop: 6,
            textAlign: 'right',
            color:
              discovery.trim().length >= FEEDBACK_DISCOVERY_MIN
                ? '#027A48'
                : '#717680',
            fontFamily: 'var(--font-pretendard), sans-serif',
          }}
        >
          {discovery.length}/{FEEDBACK_DISCOVERY_MAX} · 최소{' '}
          {FEEDBACK_DISCOVERY_MIN}자
          {discovery.trim().length >= FEEDBACK_DISCOVERY_MIN ? ' ✓' : ''}
        </div>
      </Field>

      <div
        role="presentation"
        style={{
          borderTop: '1px solid #E9EAEB',
          marginTop: 22,
          paddingTop: 22,
          marginBottom: 0,
        }}
      />

      <Field
        label="레슨 피드백"
        hint="선택 입력이에요. 표현 칩과 추가 메모는 비워두고 제출해도 돼요."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
        >
          {FEEDBACK_OPTIONS.map((opt) => {
            const checked = reasons.includes(opt.label);
            const positive = opt.tone === 'good';
            const activeBorder = positive ? '#12B76A' : '#F04438';
            const activeBg = positive ? '#D1FADF' : '#FEE4E2';
            const activeText = positive ? '#054F31' : '#7A271A';
            const activeFill = positive ? '#12B76A' : '#F04438';

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleReason(opt.label)}
                style={{
                  padding: '11px 12px',
                  border: `1px solid ${checked ? activeBorder : '#D5D7DA'}`,
                  background: checked ? activeBg : '#fff',
                  color: checked ? activeText : '#252B37',
                  borderRadius: 8,
                  fontFamily: 'inherit',
                  fontSize: 12.5,
                  fontWeight: checked ? 700 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all .15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    flexShrink: 0,
                    border: checked ? 0 : '1.5px solid #D5D7DA',
                    background: checked ? activeFill : '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {checked ? (
                    <MaterialIcon
                      name="check"
                      size={11}
                      style={{ color: '#fff' }}
                    />
                  ) : null}
                </span>
                <MaterialIcon
                  name={
                    positive
                      ? 'sentiment_very_satisfied'
                      : 'sentiment_dissatisfied'
                  }
                  size={15}
                  style={{
                    color: checked ? activeFill : '#717680',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, lineHeight: 1.3 }}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: '#535862', marginBottom: 6 }}>
            더 자세히 알려주세요{' '}
            <span style={{ color: '#717680', fontWeight: 500 }}>
              (선택, 생략 가능)
            </span>
          </div>
          <textarea
            value={freeText}
            onChange={(e) =>
              setFreeText(e.target.value.slice(0, FEEDBACK_FREE_TEXT_MAX))
            }
            placeholder={
              '예: 전반적으로 따라가기 좋았어요 · 터미널 명령 부분만 조금 더 천천히 보고 싶었어요 · 막히는 지점에 예제가 하나 더 있으면 좋겠어요'
            }
            rows={3}
            style={textareaStyle}
          />
          <div
            style={{
              fontSize: 11,
              marginTop: 6,
              textAlign: 'right',
              color: '#717680',
              fontFamily: 'var(--font-pretendard), sans-serif',
            }}
          >
            {freeText.length}/{FEEDBACK_FREE_TEXT_MAX}
          </div>
        </div>
      </Field>

      <button
        type="button"
        onClick={submit}
        disabled={!allValid || submitted}
        style={{
          width: '100%',
          marginTop: 16,
          padding: '16px',
          fontSize: 15,
          fontWeight: 700,
          background: '#F63D68',
          color: '#fff',
          border: 0,
          borderRadius: 8,
          fontFamily: 'inherit',
          cursor: !allValid || submitted ? 'not-allowed' : 'pointer',
          opacity: !allValid && !submitted ? 0.5 : 1,
          boxShadow:
            allValid && !submitted
              ? '0 8px 24px -4px rgba(246,61,104,0.25)'
              : 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => {
          if (allValid && !submitted)
            e.currentTarget.style.background = '#E31B54';
        }}
        onMouseLeave={(e) => {
          if (allValid && !submitted)
            e.currentTarget.style.background = '#F63D68';
        }}
      >
        {submitted ? (
          <>
            <MaterialIcon name="celebration" size={20} />
            열리고 있어요...
          </>
        ) : isFinalLesson ? (
          <>제출하면 완주! 👏</>
        ) : (
          <>
            <MaterialIcon name="lock_open" size={18} />
            제출하고 다음 레슨 열기
          </>
        )}
      </button>

      {/* lessonNum is intentionally not used yet — wired in submit handler */}
      <span aria-hidden="true" style={{ display: 'none' }}>
        {`lesson-${lessonNum}`}
      </span>
    </>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          marginBottom: 4,
        }}
      >
        <label style={{ fontSize: 13, fontWeight: 700, color: '#181D27' }}>
          {label}
        </label>
        {required ? (
          <span style={{ color: '#F63D68', fontSize: 13 }}>*</span>
        ) : null}
      </div>
      {hint ? (
        <div style={{ fontSize: 11.5, color: '#535862', marginBottom: 8 }}>
          {hint}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function UploadTypeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '10px 14px',
        background: active ? '#181D27' : '#fff',
        color: active ? '#fff' : '#181D27',
        border: `1px solid ${active ? '#181D27' : '#D5D7DA'}`,
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      <MaterialIcon name={icon} size={16} />
      {label}
    </button>
  );
}
