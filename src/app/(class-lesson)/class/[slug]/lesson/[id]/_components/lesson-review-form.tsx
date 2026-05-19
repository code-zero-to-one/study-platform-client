'use client';

import { Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import MarkdownEditor from '@/components/common/ui/editor/markdown-editor';
import { uploadCommunityMarkdownImage } from '@/features/community/model/community-markdown-image-upload';
import type { LessonRetrospectivePurpose } from '@/types/api/course.types';
import { LessonLinkModal } from './lesson-link-modal';
import { RatingBox } from './lesson-rating-box';
import { LessonScreenshotModal } from './lesson-screenshot-modal';

export const POSITIVE_CHIPS = [
  '설명이 이해하기 쉬웠어요',
  '실습이 재밌었어요',
  '만들어졌다는 게 신기했어요',
];
export const NEGATIVE_CHIPS = [
  '실습이 막혔어요',
  '설명이 어려웠어요',
  '뭘 하는 건지 모르겠어요',
];

export interface LessonFormData {
  starRating: number;
  expectationAnswer: string;
  surpriseAnswer: string;
  artifactImageUrl: string | null;
  artifactLink: string | null;
  checklistFlags: boolean[];
  feedbackText: string;
}

interface LessonFormProps {
  retrospectivePurpose: LessonRetrospectivePurpose;
  retrospectivePrompt?: string;
  alreadySubmitted: boolean;
  submitting: boolean;
  onSubmit: (data: LessonFormData) => void;
}

function QuestionBlock({
  question,
  helper,
  value,
  placeholder,
  onChange,
  tall,
}: {
  question: string;
  helper: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  tall?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-350">
      <div className="flex flex-col gap-125">
        <div className="flex items-start gap-30 font-designer-24m text-gray-800">
          <span>Q.</span>
          <span className="text-text-brand">*</span>
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
          className="h-1625 w-full resize-none rounded-200 border border-gray-300 bg-background-default px-300 py-250 font-designer-16m text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
        />
      )}
    </div>
  );
}

function SectionTitle({ bold, suffix }: { bold: string; suffix: string }) {
  return (
    <div className="flex flex-col gap-75">
      <p className="font-designer-28b text-gray-800">{bold}</p>
      <p className="font-designer-16r text-gray-800">{suffix}</p>
    </div>
  );
}

export function LessonReviewForm({
  retrospectivePurpose,
  retrospectivePrompt,
  alreadySubmitted,
  submitting,
  onSubmit,
}: LessonFormProps) {
  const isQuiz = retrospectivePurpose === 'SUBJECTIVE_QUIZ';

  const [starRating, setStarRating] = useState(0);
  const [expectationAnswer, setExpectationAnswer] = useState('');
  const [surpriseAnswer, setSurpriseAnswer] = useState('');
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());
  const [feedbackText, setFeedbackText] = useState('');
  const [artifactImageUrl, setArtifactImageUrl] = useState<string | null>(null);
  const [artifactPreviewUrl, setArtifactPreviewUrl] = useState<string | null>(
    null,
  );
  const [artifactLink, setArtifactLink] = useState<string | null>(null);
  const [screenshotOpen, setScreenshotOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (artifactPreviewUrl) URL.revokeObjectURL(artifactPreviewUrl);
    };
  }, [artifactPreviewUrl]);

  // Backend requires both answers non-blank for all types; artifact required for non-quiz
  const isFormValid =
    starRating > 0 &&
    expectationAnswer.trim().length > 0 &&
    surpriseAnswer.trim().length > 0 &&
    (isQuiz || !!artifactImageUrl) &&
    selectedChips.size >= 2;

  const submitDisabled = !isFormValid || submitting || alreadySubmitted;

  function toggleChip(chip: string) {
    setSelectedChips((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  }

  function handleSubmit() {
    if (submitDisabled) return;
    const chips = [...selectedChips];
    const checklistFlags = [...POSITIVE_CHIPS, ...NEGATIVE_CHIPS].map((c) =>
      chips.includes(c),
    );
    onSubmit({
      starRating,
      expectationAnswer,
      surpriseAnswer,
      artifactImageUrl,
      artifactLink,
      checklistFlags,
      feedbackText,
    });
  }

  return (
    <div className="flex w-full flex-col gap-700">
      {/* Title */}
      <div className="flex flex-col gap-125">
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
        <RatingBox rating={starRating} onChange={setStarRating} />
      </div>

      {/* Q1 — always required by backend (highlightAnswer) */}
      <div className="flex flex-col gap-350">
        <QuestionBlock
          question="이번 레슨, 어떤 기대로 시작했나요?"
          helper="어려웠던 점이나 뿌듯했던 순간을 기록해 보세요. 이 기록들은 모여서 당신만의 멋진 포트폴리오가 됩니다."
          value={expectationAnswer}
          placeholder="예 : Cursor에서 Cmd+K를 누르면 Claude가 바로 나타나는 게 신기했다."
          onChange={setExpectationAnswer}
          tall={!isQuiz}
        />
      </div>

      {/* Q2 — always required by backend (unexpectedAnswer); retrospectivePrompt overrides text for SUBJECTIVE_QUIZ */}
      <div className="flex flex-col gap-350">
        <QuestionBlock
          question={
            retrospectivePrompt ?? '직접 해보니 생각과 달랐던 의외의 순간은?'
          }
          helper="예상과 다르게 잘 됐거나, 막혔던 순간을 솔직하게 적어주세요."
          value={surpriseAnswer}
          placeholder={
            isQuiz
              ? '내용을 작성해 주세요. 정답은 없습니다.'
              : '예 : 코드 한 줄만 바꿨는데 전체 디자인이 바뀌어서 놀랐다.'
          }
          onChange={setSurpriseAnswer}
        />
      </div>

      {/* Artifact section — PRACTICE_PROOF and ARTIFACT_SHARE (backend requires artifact for !isQuiz) */}
      {!isQuiz && (
        <div className="flex flex-col gap-350">
          <SectionTitle
            bold="오늘의 프로젝트 완성 알리기"
            suffix="이미지는 필수로 등록해주세요(링크는 선택)"
          />
          <div className="flex flex-col gap-200">
            {artifactPreviewUrl ? (
              <div className="relative">
                <Image
                  src={artifactPreviewUrl}
                  alt="첨부 스크린샷"
                  width={400}
                  height={202}
                  unoptimized
                  className="h-2525 w-full rounded-150 object-cover"
                />
                <button
                  type="button"
                  aria-label="스크린샷 삭제"
                  onClick={() => {
                    if (artifactPreviewUrl)
                      URL.revokeObjectURL(artifactPreviewUrl);
                    setArtifactImageUrl(null);
                    setArtifactPreviewUrl(null);
                  }}
                  className="absolute -right-75 -top-75 flex h-250 w-250 items-center justify-center rounded-full bg-gray-800 text-background-default"
                >
                  <X className="h-150 w-150" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setScreenshotOpen(true)}
                className="flex h-800 w-full items-center justify-center gap-75 rounded-100 border border-gray-400 bg-background-default font-designer-18b text-gray-800"
              >
                <ImageIcon className="h-300 w-300" />
                스크린샷 첨부
              </button>
            )}
            {artifactLink ? (
              <div className="flex items-center justify-between rounded-100 border border-gray-300 px-300 py-200">
                <span className="truncate font-designer-14m text-gray-800">
                  {artifactLink}
                </span>
                <button
                  type="button"
                  aria-label="링크 삭제"
                  onClick={() => setArtifactLink(null)}
                  className="ml-200 shrink-0 text-gray-400 hover:text-gray-800"
                >
                  <X className="h-250 w-250" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLinkOpen(true)}
                className="flex h-800 w-full items-center justify-center gap-75 rounded-100 border border-gray-400 bg-background-default font-designer-18b text-gray-800"
              >
                <LinkIcon className="h-300 w-300" />
                링크 입력
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chips */}
      <div className="flex flex-col gap-350">
        <SectionTitle bold="오늘 레슨은 어떠셨나요?" suffix="최소 2개 이상" />
        <div className="flex flex-col gap-200">
          <div className="flex flex-wrap gap-125">
            {POSITIVE_CHIPS.map((chip) => (
              <ChipButton
                key={chip}
                chip={chip}
                selected={selectedChips.has(chip)}
                positive
                onClick={() => toggleChip(chip)}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-125">
            {NEGATIVE_CHIPS.map((chip) => (
              <ChipButton
                key={chip}
                chip={chip}
                selected={selectedChips.has(chip)}
                onClick={() => toggleChip(chip)}
              />
            ))}
          </div>
        </div>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="어떠한 피드백도 좋아요! 간략히 적어주세요! (선택사항)"
          className="h-1625 w-full resize-none rounded-200 border border-gray-300 bg-background-default px-300 py-250 font-designer-16m text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
        />
      </div>

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
          />
        )}
        {alreadySubmitted
          ? '이미 제출했어요'
          : submitting
            ? '제출 중...'
            : '제출하고 다음 Lesson 하러 가기'}
      </button>

      <LessonScreenshotModal
        open={screenshotOpen}
        onClose={() => setScreenshotOpen(false)}
        onConfirm={(imageUrl, previewUrl) => {
          setArtifactImageUrl(imageUrl);
          setArtifactPreviewUrl(previewUrl);
        }}
      />
      <LessonLinkModal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        onConfirm={(url) => setArtifactLink(url)}
      />
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
        'rounded-full px-350 py-125 transition-colors',
        positive
          ? selected
            ? 'bg-green-100 font-designer-16b text-green-500'
            : 'border border-green-500 font-designer-16m text-green-500'
          : selected
            ? 'bg-red-200 font-designer-16b text-red-500'
            : 'border border-red-400 font-designer-16m text-red-400',
      )}
    >
      {chip}
    </button>
  );
}
