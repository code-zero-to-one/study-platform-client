'use client';

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import { INTERVIEW_QUESTION_TEXTAREA_MAX_LENGTH } from '@/types/schemas/mentor-registration-schema';

const INTERVIEW_QUESTION_PLACEHOLDER =
  '예) 이력서/포트폴리오 링크를 미리 공유해주세요.\n예) 상담에서 다루고 싶은 질문 2~3개를 정리해주세요.\n예) 사전 과제/코드가 있다면 레포지토리 링크를 남겨주세요.';

const normalizeInterviewQuestions = (value: string): string[] => {
  return value
    .split('\n')
    .map((question) => question.trim())
    .filter((question) => question.length > 0);
};

const toInterviewQuestionList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

interface InterviewQuestionsTextareaProps {
  value: unknown;
  onChange: (value: string[]) => void;
}

export default function InterviewQuestionsTextarea({
  value,
  onChange,
}: InterviewQuestionsTextareaProps) {
  const safeValue = toInterviewQuestionList(value);
  const valueText = safeValue.join('\n');
  const [draftText, setDraftText] = useState(valueText);
  const lastCommittedValueTextRef = useRef(valueText);

  useEffect(() => {
    if (valueText === lastCommittedValueTextRef.current) {
      return;
    }

    setDraftText(valueText);
    lastCommittedValueTextRef.current = valueText;
  }, [valueText]);

  const handleChange = (nextText: string) => {
    setDraftText(nextText);

    const nextQuestions = normalizeInterviewQuestions(nextText);
    lastCommittedValueTextRef.current = nextQuestions.join('\n');
    onChange(nextQuestions);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.stopPropagation();
    }
  };

  return (
    <BorderedTextarea
      value={draftText}
      onChange={(event) => handleChange(event.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={INTERVIEW_QUESTION_PLACEHOLDER}
      maxLength={INTERVIEW_QUESTION_TEXTAREA_MAX_LENGTH}
    />
  );
}
