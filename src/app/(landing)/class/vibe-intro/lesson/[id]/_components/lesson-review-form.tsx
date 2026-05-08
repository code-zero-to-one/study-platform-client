'use client';

import { Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

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

interface Props {
  reflection1: string;
  reflection2: string;
  selectedChips: Set<string>;
  feedbackText: string;
  submitDisabled: boolean;
  submitting: boolean;
  alreadySubmitted: boolean;
  onReflection1Change: (v: string) => void;
  onReflection2Change: (v: string) => void;
  onToggleChip: (chip: string) => void;
  onFeedbackChange: (v: string) => void;
  onAttachScreenshot: () => void;
  onAttachLink: () => void;
  onSubmit: () => void;
}

function QuestionBlock({
  question,
  helper,
  value,
  placeholder,
  onChange,
}: {
  question: string;
  helper: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-[28px]">
      <div className="flex flex-col gap-[10px]">
        <div className="flex items-start gap-[3px] font-designer-24m text-gray-800">
          <span>Q.</span>
          <span className="text-text-brand">*</span>
          <span>{question}</span>
        </div>
        <p className="font-designer-16r text-gray-800">{helper}</p>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[130px] w-full resize-none rounded-200 border border-gray-300 bg-background-default px-[23px] py-[20px] font-designer-16m text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
      />
    </div>
  );
}

function SectionTitle({ bold, suffix }: { bold: string; suffix: string }) {
  return (
    <div className="flex items-center gap-100">
      <p className="font-designer-28b text-gray-800">{bold}</p>
      <p className="font-designer-28r text-gray-800">{suffix}</p>
    </div>
  );
}

export function LessonReviewForm({
  reflection1,
  reflection2,
  selectedChips,
  feedbackText,
  submitDisabled,
  submitting,
  alreadySubmitted,
  onReflection1Change,
  onReflection2Change,
  onToggleChip,
  onFeedbackChange,
  onAttachScreenshot,
  onAttachLink,
  onSubmit,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-[60px]">
      {/* Title */}
      <p className="font-designer-28b text-gray-800">클래스 돌아보기</p>

      {/* Two question blocks */}
      <div className="flex flex-col gap-[30px]">
        <QuestionBlock
          question="오늘 가장 신기했던 코드 하나만 적어볼까요?"
          helper="어려웠던 점이나 뿌듯했던 순간을 기록해 보세요. 이 기록들은 모여서 당신만의 멋진 포트폴리오가 됩니다."
          value={reflection1}
          placeholder="예 : Cursor에서 Cmd+K를 누르면 Claude가 바로 나타나는 게 신기했다."
          onChange={onReflection1Change}
        />
        <QuestionBlock
          question="직접 해보니 생각과 달랐던 의외의 순간은?"
          helper="어렸웠던 순간이나 생각보다 쉬웠던 순간이 있었나요?"
          value={reflection2}
          placeholder="예 : Cursor에서 Cmd+K를 누르면 Claude가 바로 나타나는 게 신기했다."
          onChange={onReflection2Change}
        />
      </div>

      {/* Project completion */}
      <div className="flex flex-col gap-[28px]">
        <SectionTitle
          bold="오늘의 프로젝트 완성 알리기"
          suffix="(두 가지중 한 가지만)"
        />
        <div className="flex gap-[20px]">
          <button
            type="button"
            onClick={onAttachScreenshot}
            className="flex h-[62px] w-[410px] items-center justify-center gap-75 rounded-100 border border-gray-400 bg-background-default font-designer-18b text-gray-800"
          >
            <ImageIcon className="h-[24px] w-[24px]" />
            스크린샷 첨부
          </button>
          <button
            type="button"
            onClick={onAttachLink}
            className="flex h-[62px] w-[410px] items-center justify-center gap-75 rounded-100 border border-gray-400 bg-background-default font-designer-18b text-gray-800"
          >
            <LinkIcon className="h-[24px] w-[24px]" />
            링크 입력
          </button>
        </div>
      </div>

      {/* Chips */}
      <div className="flex flex-col gap-[28px]">
        <SectionTitle bold="오늘 레슨은 어떠셨나요?" suffix="(최소 2개 이상)" />
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-wrap gap-[10px]">
            {POSITIVE_CHIPS.map((chip) => (
              <ChipButton
                key={chip}
                chip={chip}
                selected={selectedChips.has(chip)}
                onClick={() => onToggleChip(chip)}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-[10px]">
            {NEGATIVE_CHIPS.map((chip) => (
              <ChipButton
                key={chip}
                chip={chip}
                selected={selectedChips.has(chip)}
                onClick={() => onToggleChip(chip)}
              />
            ))}
          </div>
        </div>
        <textarea
          value={feedbackText}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="어떠한 피드백도 좋아요! 간략히 적어주세요! (선택사항)"
          className="h-[130px] w-full resize-none rounded-200 border border-gray-300 bg-background-default px-[23px] py-[20px] font-designer-16m text-gray-800 outline-none placeholder:text-gray-400 focus:border-border-brand"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        disabled={submitDisabled}
        onClick={onSubmit}
        className={cn(
          'flex h-[80px] w-full items-center justify-center gap-150 rounded-100 font-designer-24b text-text-inverse transition-colors',
          submitDisabled
            ? 'cursor-not-allowed bg-gray-300'
            : 'bg-background-brand-default hover:opacity-90',
        )}
      >
        <Image
          src="/class/vibe-intro/lesson-lock.svg"
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
        />
        {alreadySubmitted
          ? '이미 제출했어요'
          : submitting
            ? '제출 중...'
            : '제출하고 다음 Lesson 하러 가기'}
      </button>
    </div>
  );
}

function ChipButton({
  chip,
  selected,
  onClick,
}: {
  chip: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-[30px] py-[10px] transition-colors',
        selected
          ? 'bg-[#fecdcd] font-designer-16b text-[#ff4343]'
          : 'border border-[#f76363] font-designer-16m text-[#f76363]',
      )}
    >
      {chip}
    </button>
  );
}
