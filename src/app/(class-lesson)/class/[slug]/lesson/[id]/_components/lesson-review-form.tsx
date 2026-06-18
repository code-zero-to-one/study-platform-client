'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';
import Image from 'next/image';
import { type Dispatch, useEffect, useReducer } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import {
  type LessonRetrospectivePurpose,
  normalizeRetrospectivePurpose,
} from '@/types/api/course.types';
import { getAttributionParams } from '@/utils/attribution-tracker';
import { LessonLinkModal } from './lesson-link-modal';
import { RatingBox } from './lesson-rating-box';
import { LessonScreenshotModal } from './lesson-screenshot-modal';

const POSITIVE_CHIPS = [
  '설명이 이해하기 쉬웠어요',
  '예시가 도움이 됐어요',
  '실습이 재밌었어요',
  '만들어졌다는 게 신기했어요',
];
const NEGATIVE_CHIPS = [
  '실습이 막혔어요',
  '실습 과정이 복잡했어요',
  '설명이 어려웠어요',
  '뭘 하는 건지 모르겠어요',
];

// Figma combines both retrospective questions into one markdown editor; the
// backend still expects two separate answers, so the page duplicates this
// content into highlightAnswer/unexpectedAnswer at submit time.
const REVIEW_PLACEHOLDER = `"이번 레슨, 어떤 기대로 시작했나요?"
예) 내 포트폴리오에 넣을 사이트를 만들어보고 싶었어요 / AI가 진짜 코드를 짜주는지 궁금했어요

"오늘 새롭게 알게 된 것을 적어주세요."
예) AI에게 시킬 때 구체적으로 말해야 원하는 결과가 나온다 / 터미널이 생각보다 안 무섭다`;

export interface LessonFormData {
  starRating: number;
  reviewContent: string;
  artifactImageUrls: string[];
  artifactLink: string | null;
  checklistFlags: boolean[];
  feedbackText: string;
}

interface LessonFormProps {
  lessonId: number;
  retrospectivePurpose: LessonRetrospectivePurpose;
  retrospectivePrompt?: string;
  artifactSubmissionRequired: boolean;
  alreadySubmitted: boolean;
  submitting: boolean;
  isLastLesson?: boolean;
  onSubmit: (data: LessonFormData) => void;
}

function QuestionBlock({
  question,
  helper,
  value,
  placeholder,
  onChange,
  tall,
  required = true,
}: {
  question: string;
  helper: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  tall?: boolean;
  required?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-350 mb-375">
      <div className="flex flex-col gap-125">
        <div className="flex items-start gap-30 font-designer-24m text-gray-800 mb-50">
          <span>Q.</span>
          {required && <span className="text-text-brand">*</span>}
          <span>{question}</span>
        </div>
        <p className="font-designer-16r text-gray-800">{helper}</p>
      </div>
      {tall ? (
        <MarkdownEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          uploadImage={uploadCommunityMarkdownImage}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-1625 w-full resize-none rounded-200 border border-gray-300 bg-background-default px-300 py-250 font-designer-16m text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
        />
      )}
    </div>
  );
}

function SectionTitle({ bold, suffix }: { bold: string; suffix: string }) {
  return (
    <div className="flex flex-col gap-125">
      <p className="font-designer-28b text-gray-800">{bold}</p>
      <p className="font-designer-16r text-gray-800">{suffix}</p>
    </div>
  );
}

interface LessonFormState {
  starRating: number;
  reviewContent: string;
  selectedChips: Set<string>;
  feedbackText: string;
  artifactImageUrls: string[];
  artifactPreviewUrls: string[];
  artifactLink: string | null;
  screenshotOpen: boolean;
  linkOpen: boolean;
}

type LessonFormAction =
  | { type: 'setStarRating'; rating: number }
  | { type: 'setReviewContent'; content: string }
  | { type: 'toggleChip'; chip: string }
  | { type: 'setFeedbackText'; text: string }
  | { type: 'addArtifactImages'; imageUrls: string[]; previewUrls: string[] }
  | { type: 'removeArtifactImage'; index: number }
  | { type: 'setArtifactLink'; link: string | null }
  | { type: 'setScreenshotOpen'; open: boolean }
  | { type: 'setLinkOpen'; open: boolean };

const INITIAL_LESSON_FORM: LessonFormState = {
  starRating: 0,
  reviewContent: '',
  selectedChips: new Set<string>(),
  feedbackText: '',
  artifactImageUrls: [],
  artifactPreviewUrls: [],
  artifactLink: null,
  screenshotOpen: false,
  linkOpen: false,
};

function lessonFormReducer(
  state: LessonFormState,
  action: LessonFormAction,
): LessonFormState {
  switch (action.type) {
    case 'setStarRating':
      return { ...state, starRating: action.rating };
    case 'setReviewContent':
      return { ...state, reviewContent: action.content };
    case 'toggleChip': {
      const next = new Set(state.selectedChips);
      if (next.has(action.chip)) next.delete(action.chip);
      else next.add(action.chip);
      return { ...state, selectedChips: next };
    }
    case 'setFeedbackText':
      return { ...state, feedbackText: action.text };
    case 'addArtifactImages':
      return {
        ...state,
        artifactImageUrls: [...state.artifactImageUrls, ...action.imageUrls],
        artifactPreviewUrls: [
          ...state.artifactPreviewUrls,
          ...action.previewUrls,
        ],
      };
    case 'removeArtifactImage': {
      URL.revokeObjectURL(state.artifactPreviewUrls[action.index]);
      return {
        ...state,
        artifactImageUrls: state.artifactImageUrls.filter(
          (_, i) => i !== action.index,
        ),
        artifactPreviewUrls: state.artifactPreviewUrls.filter(
          (_, i) => i !== action.index,
        ),
      };
    }
    case 'setArtifactLink':
      return { ...state, artifactLink: action.link };
    case 'setScreenshotOpen':
      return { ...state, screenshotOpen: action.open };
    case 'setLinkOpen':
      return { ...state, linkOpen: action.open };
    default:
      return state;
  }
}

export function LessonReviewForm({
  lessonId,
  retrospectivePurpose,
  retrospectivePrompt,
  artifactSubmissionRequired,
  alreadySubmitted,
  submitting,
  isLastLesson = false,
  onSubmit,
}: LessonFormProps) {
  // Backend collapses all 6 raw purposes into PRACTICAL/THEORY/OTHER at every
  // read endpoint, so every gating/copy decision runs off `normalizedPurpose`.
  const normalizedPurpose = normalizeRetrospectivePurpose(retrospectivePurpose);
  const allowsArtifact = normalizedPurpose === 'PRACTICAL';
  const requiresQuestionAnswers = normalizedPurpose !== 'OTHER';
  const requiresFeedback = normalizedPurpose === 'OTHER';

  const [state, dispatch] = useReducer(lessonFormReducer, INITIAL_LESSON_FORM);
  const {
    starRating,
    reviewContent,
    selectedChips,
    feedbackText,
    artifactImageUrls,
    artifactPreviewUrls,
    artifactLink,
    screenshotOpen,
    linkOpen,
  } = state;

  useEffect(() => {
    return () => {
      artifactPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Backend requires an artifact exactly when the purpose is PRACTICAL; the
  // `artifactSubmissionRequired` flag is derived from the same rule server-side.
  const requiresArtifact = allowsArtifact && artifactSubmissionRequired;

  // Feedback counts as "provided" when ≥2 chips are chosen OR free text exists.
  // (A single chip alone can't be sent — see handleSubmit payload note.)
  const hasFeedback = selectedChips.size >= 2 || feedbackText.trim().length > 0;

  const isFormValid =
    starRating > 0 &&
    (!requiresQuestionAnswers || reviewContent.trim().length > 0) &&
    (!requiresArtifact || artifactImageUrls.length > 0) &&
    (!requiresFeedback || hasFeedback);

  const submitDisabled = !isFormValid || submitting || alreadySubmitted;

  function handleSubmit() {
    if (submitDisabled) return;
    const chips = [...selectedChips];
    const checklistFlags = [...POSITIVE_CHIPS, ...NEGATIVE_CHIPS].map((c) =>
      chips.includes(c),
    );
    sendGTMEvent({
      event: 'lesson_feedback_submitted',
      lesson_id: lessonId,
      chips_selected: chips.join(','),
      has_comment: Boolean(feedbackText.trim()),
      ...getAttributionParams(),
    });
    onSubmit({
      starRating,
      reviewContent,
      artifactImageUrls,
      artifactLink,
      checklistFlags,
      feedbackText,
    });
  }

  return (
    <div className="flex w-full flex-col">
      {/* Title */}
      <div className="flex flex-col gap-125 mb-375">
        <p className="font-designer-28b text-gray-800">레슨 돌아보기</p>
        <p className="font-designer-16r text-gray-800">
          오늘 만든 결과물과 배운점을 가볍게 적어주세요. 기록을 제출하면 다음
          레슨이 자동으로 열려요.
        </p>
      </div>

      {/* Star Rating */}
      <div className="flex flex-col gap-350">
        <div className="flex flex-col gap-125">
          <div className="flex items-start gap-30 font-designer-24m text-gray-800">
            <span>Q.</span>
            <span className="text-text-brand">*</span>
            <span>오늘 코딩 바이브 내용이 얼마나 이해가 되었나요?</span>
          </div>
          <p className="font-designer-16r text-gray-800">
            별점을 선택해 오늘 레슨 내용 이해도를 알려주세요.
          </p>
        </div>
        <RatingBox
          rating={starRating}
          onChange={(rating) => dispatch({ type: 'setStarRating', rating })}
        />
      </div>

      {/* Review — PRACTICAL·THEORY only. Figma shows a single markdown editor
          covering both retrospective questions; OTHER lessons hide this section
          (backend's validateOtherRequest skips validateQuestionAnswers). */}
      {requiresQuestionAnswers && (
        <div className="flex flex-col gap-350">
          <QuestionBlock
            question={
              retrospectivePrompt ?? '이번 레슨, 어떤 기대로 시작했나요?'
            }
            helper="어려웠던 점이나 뿌듯했던 순간을 기록해 보세요. 이 기록들은 모여서 당신만의 멋진 포트폴리오가 됩니다."
            value={reviewContent}
            placeholder={REVIEW_PLACEHOLDER}
            onChange={(content) =>
              dispatch({ type: 'setReviewContent', content })
            }
            tall
          />
        </div>
      )}

      {allowsArtifact && (
        <ArtifactSection
          requiresArtifact={requiresArtifact}
          artifactPreviewUrls={artifactPreviewUrls}
          artifactLink={artifactLink}
          dispatch={dispatch}
        />
      )}

      <FeedbackSection
        requiresFeedback={requiresFeedback}
        selectedChips={selectedChips}
        feedbackText={feedbackText}
        dispatch={dispatch}
      />

      {/* Submit */}
      <button
        type="button"
        disabled={submitDisabled}
        onClick={handleSubmit}
        className={cn(
          'flex h-1000 w-full items-center justify-center gap-150 rounded-100 font-designer-24b text-text-inverse transition-colors',
          submitDisabled
            ? 'cursor-not-allowed bg-gray-300'
            : 'bg-background-brand-default hover:opacity-90',
        )}
      >
        {submitDisabled && (
          <Image
            src="/class/lesson-lock.svg"
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            unoptimized
          />
        )}
        {alreadySubmitted
          ? '이미 제출했어요'
          : submitting
            ? '제출 중...'
            : isLastLesson
              ? '완주하고 축하 페이지로 가기'
              : '제출하고 다음 Lesson 하러 가기'}
      </button>

      <LessonScreenshotModal
        open={screenshotOpen}
        onClose={() => dispatch({ type: 'setScreenshotOpen', open: false })}
        onConfirm={(imageUrls, previewUrls) =>
          dispatch({
            type: 'addArtifactImages',
            imageUrls,
            previewUrls,
          })
        }
      />
      <LessonLinkModal
        open={linkOpen}
        onClose={() => dispatch({ type: 'setLinkOpen', open: false })}
        onConfirm={(url) => dispatch({ type: 'setArtifactLink', link: url })}
      />
    </div>
  );
}

const MAX_ARTIFACT_IMAGES = 10;

function ArtifactSection({
  requiresArtifact,
  artifactPreviewUrls,
  artifactLink,
  dispatch,
}: {
  requiresArtifact: boolean;
  artifactPreviewUrls: string[];
  artifactLink: string | null;
  dispatch: Dispatch<LessonFormAction>;
}) {
  const hasImages = artifactPreviewUrls.length > 0;
  const canAddMore = artifactPreviewUrls.length < MAX_ARTIFACT_IMAGES;

  return (
    <div className="flex flex-col gap-350">
      <SectionTitle
        bold="오늘의 프로젝트 완성 알리기"
        suffix={
          requiresArtifact
            ? '이미지는 필수로 등록해주세요(링크는 선택)'
            : '이미지는 선택으로 등록할 수 있어요(링크는 선택)'
        }
      />
      <div className="flex flex-col gap-250 mb-325">
        {/* Screenshot thumbnail grid */}
        {hasImages && (
          <div className="grid grid-cols-3 gap-200">
            {artifactPreviewUrls.map((url, index) => (
              <div key={url} className="relative">
                <Image
                  src={url}
                  alt={`첨부 스크린샷 ${index + 1}`}
                  width={160}
                  height={120}
                  unoptimized
                  className="h-1500 w-full rounded-150 object-cover"
                />
                <button
                  type="button"
                  aria-label="스크린샷 삭제"
                  onClick={() =>
                    dispatch({
                      type: 'removeArtifactImage',
                      index,
                    })
                  }
                  className="absolute -right-75 -top-75 flex size-250 items-center justify-center rounded-full bg-gray-800 text-background-default"
                >
                  <X className="size-150" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-250 md:flex-row">
          <div className="min-w-0 flex-1">
            {canAddMore ? (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'setScreenshotOpen',
                    open: true,
                  })
                }
                className="flex h-800 w-full items-center justify-center gap-75 rounded-100 border border-gray-400 bg-background-default font-designer-18b text-gray-800"
              >
                <ImageIcon className="size-300" />
                {hasImages ? '스크린샷 추가' : '스크린샷 첨부'}
              </button>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            {artifactLink ? (
              <div className="flex h-800 items-center justify-between rounded-100 border border-gray-300 px-300">
                <span className="truncate font-designer-14m text-gray-800">
                  {artifactLink}
                </span>
                <button
                  type="button"
                  aria-label="링크 삭제"
                  onClick={() =>
                    dispatch({
                      type: 'setArtifactLink',
                      link: null,
                    })
                  }
                  className="ml-200 shrink-0 text-gray-400 hover:text-gray-800"
                >
                  <X className="size-250" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'setLinkOpen',
                    open: true,
                  })
                }
                className="flex h-800 w-full items-center justify-center gap-75 rounded-100 border border-gray-400 bg-background-default font-designer-18b text-gray-800"
              >
                <LinkIcon className="size-300" />
                링크 입력
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackSection({
  requiresFeedback,
  selectedChips,
  feedbackText,
  dispatch,
}: {
  requiresFeedback: boolean;
  selectedChips: Set<string>;
  feedbackText: string;
  dispatch: Dispatch<LessonFormAction>;
}) {
  return (
    <div className="flex flex-col gap-350">
      <SectionTitle
        bold="오늘 레슨은 어떠셨나요?"
        suffix={
          requiresFeedback
            ? '칩을 2개 이상 고르거나 의견을 남겨주세요 (필수)'
            : '최소 2개 이상 선택해주세요.'
        }
      />
      <div className="flex flex-col gap-200">
        <div className="flex flex-wrap gap-125">
          {POSITIVE_CHIPS.map((chip) => (
            <ChipButton
              key={chip}
              chip={chip}
              selected={selectedChips.has(chip)}
              positive
              onClick={() => dispatch({ type: 'toggleChip', chip })}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-125">
          {NEGATIVE_CHIPS.map((chip) => (
            <ChipButton
              key={chip}
              chip={chip}
              selected={selectedChips.has(chip)}
              onClick={() => dispatch({ type: 'toggleChip', chip })}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-125">
        <textarea
          value={feedbackText}
          onChange={(e) =>
            dispatch({
              type: 'setFeedbackText',
              text: e.target.value,
            })
          }
          maxLength={500}
          aria-label="피드백"
          placeholder={
            requiresFeedback
              ? '어떠한 피드백도 환영입니다! 간략히 적어주세요.'
              : '어떠한 피드백도 환영입니다! 간략히 적어주세요(선택사항).'
          }
          className="h-1625 w-full resize-none rounded-200 border border-gray-300 bg-background-default px-300 py-250 font-designer-16m text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
        />
        <p className="text-left font-designer-12r text-gray-400 mb-125 md:text-right">
          {feedbackText.length}/500
        </p>
      </div>
    </div>
  );
}

function ChipButton({
  chip,
  selected,
  positive,
  onClick,
}: {
  chip: string;
  selected: boolean;
  positive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-550 items-center justify-center rounded-full px-375 py-125 transition-colors whitespace-nowrap',
        positive
          ? selected
            ? 'bg-chip-positive-bg font-designer-16b text-chip-positive'
            : 'border border-chip-positive font-designer-16m text-chip-positive'
          : selected
            ? 'bg-chip-negative-bg font-designer-16b text-chip-negative'
            : 'border border-chip-negative-subtle font-designer-16m text-chip-negative-subtle',
      )}
    >
      {chip}
    </button>
  );
}
