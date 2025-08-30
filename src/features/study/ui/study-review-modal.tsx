'use client';

import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import UserAvatar from '@/shared/ui/avatar';
import Button from '@/shared/ui/button';
import Checkbox from '@/shared/ui/checkbox';
import { TextAreaInput } from '@/shared/ui/input';
import ListItem from '@/shared/ui/list-item';
import { Modal } from '@/shared/ui/modal';
import { EvalKeyword, StudyEvaluationResponse } from '../api/types';
import {
  useAddStudyReviewMutation,
  usePartnerStudyReviewQuery,
} from '../model/use-review-query';

interface FormState {
  studySpaceId: number;
  targetMemberId: number;
  satisfactionId: 10 | 20 | 30 | null; // 10 - "아쉬워요", 20 - "괜찮아요", 30 - "좋았어요"
  keywordIds: number[];
  content: string;
}

export default function StudyReviewModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="large">
          <Modal.Header className="border-border-default flex justify-end border-b">
            <Modal.Close onClick={() => onOpenChange(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <div className="flex flex-col items-center justify-center gap-100 px-400 pt-300">
            <Modal.Title>함께 스터디한 멤버에 대해 알려주세요</Modal.Title>

            <div className="font-designer-14r text-text-subtle flex flex-col text-center">
              <span>
                같이 성장할 수 있는 스터디 문화를 만들기 위해 평가를 남겨주세요.
              </span>
              <span>평가한 내용은 성실 온도에 반영됩니다.</span>
            </div>
          </div>

          <StudyReviewForm onClose={() => onOpenChange(false)} />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function StudyReviewForm({ onClose }: { onClose: () => void }) {
  const { data } = usePartnerStudyReviewQuery();
  const { mutate: addStudyReview, isPending } = useAddStudyReviewMutation();

  const [form, setForm] = useState<FormState>({
    studySpaceId: data?.studySpaceId,
    targetMemberId: data?.targetMembers[0].memberId,
    satisfactionId: null,
    keywordIds: [],
    content: '',
  });

  if (!data) return null;

  const handleSubmit = () => {
    if (form.keywordIds.length === 0 || form.satisfactionId === null) return;

    addStudyReview(
      {
        ...form,
        content: form.content || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <>
      <Modal.Body className="mt-400 flex flex-col gap-400 pt-0">
        <PartnerInfo {...data} />

        <div className="flex flex-col items-center justify-center gap-100">
          <span className="font-designer-16b text-text-default">
            스터디 만족도
          </span>

          <div className="flex items-center justify-center gap-200">
            <SatisfactionButton
              label="아쉬워요"
              isSelected={form.satisfactionId === 30}
              imageSrc="/icons/shame-review.svg"
              onClick={() => {
                setForm({
                  ...form,
                  satisfactionId: 30,
                  keywordIds: [],
                  content: '',
                });
              }}
            />

            <SatisfactionButton
              label="괜찮아요"
              isSelected={form.satisfactionId === 20}
              imageSrc="/icons/fine-review.svg"
              onClick={() => {
                setForm({
                  ...form,
                  satisfactionId: 20,
                  keywordIds: [],
                  content: '',
                });
              }}
            />

            <SatisfactionButton
              label="좋았어요"
              isSelected={form.satisfactionId === 10}
              imageSrc="/icons/good-review.svg"
              onClick={() => {
                setForm({
                  ...form,
                  satisfactionId: 10,
                  keywordIds: [],
                  content: '',
                });
              }}
            />
          </div>
        </div>

        {form.satisfactionId === 30 && (
          <NegativeReview data={data} form={form} onChange={setForm} />
        )}

        {(form.satisfactionId === 10 || form.satisfactionId === 20) && (
          <PositiveReview data={data} form={form} onChange={setForm} />
        )}
      </Modal.Body>
      <Modal.Footer className="flex justify-end gap-100">
        <Modal.Close asChild>
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
        </Modal.Close>
        <Button
          color="primary"
          size="large"
          disabled={
            form.keywordIds.length === 0 ||
            form.satisfactionId === null ||
            isPending
          }
          onClick={handleSubmit}
        >
          등록하기
        </Button>
      </Modal.Footer>
    </>
  );
}

function PartnerInfo(data: StudyEvaluationResponse) {
  const partner = data.targetMembers[0];

  return (
    <div className="flex justify-center gap-200">
      <UserAvatar
        image={partner.profileImageUrl}
        size={80}
        alt="Study Member"
      />

      <div className="flex flex-col justify-center gap-50">
        <span className="text-text-default font-designer-16b">
          {partner.memberName}
        </span>

        <p>
          <span className="font-designer-14r text-text-default">
            {data.studySubject}
          </span>
          <span className="font-designer-14r text-text-subtlest">
            {data.startDate} ~ {data.endDate}
          </span>
        </p>
      </div>
    </div>
  );
}

function SatisfactionButton({
  label,
  isSelected,
  imageSrc,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  imageSrc: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex w-[5.75rem] cursor-pointer flex-col items-center gap-100"
      onClick={onClick}
    >
      <span className="text-text-default font-designer-14r">{label}</span>

      <div
        className={`bg-background-neutral-subtle w-fit rounded-full p-150 ${isSelected ? 'opacity-100' : 'opacity-40'} transform transition-all ease-in-out hover:scale-110 hover:opacity-100`}
      >
        <Image src={imageSrc} width="24" height="24" alt={label} />
      </div>
    </button>
  );
}

function PositiveReview({
  data,
  form,
  onChange,
}: {
  form: FormState;
  data: StudyEvaluationResponse;
  onChange: (form: FormState | ((prev: FormState) => FormState)) => void;
}) {
  return (
    <>
      <PositiveCheckboxList
        positiveKeywords={
          form.satisfactionId === 20
            ? data.notBadEvalKeywords
            : data.satisfiedEvalKeywords
        }
        keywordIds={form.keywordIds}
        onChange={(keywordIds) => onChange((prev) => ({ ...prev, keywordIds }))}
      />
      <PositiveTextArea
        value={form.content}
        onChange={(content) => onChange((prev) => ({ ...prev, content }))}
      />
    </>
  );
}

function NegativeReview({
  data,
  form,
  onChange,
}: {
  data: StudyEvaluationResponse;
  form: FormState;
  onChange: (form: FormState | ((prev: FormState) => FormState)) => void;
}) {
  return (
    <>
      <NegativeCheckboxList
        negativeKeywords={data.unsatisfiedEvalKeywords}
        keywordIds={form.keywordIds}
        onChange={(keywordIds) => onChange((prev) => ({ ...prev, keywordIds }))}
      />
      <NegativeTextArea
        value={form.content}
        onChange={(content) => onChange((prev) => ({ ...prev, content }))}
      />
    </>
  );
}

function PositiveCheckboxList({
  positiveKeywords,
  keywordIds,
  onChange,
}: {
  positiveKeywords: EvalKeyword[];
  keywordIds: FormState['keywordIds'];
  onChange: (keywordIds: FormState['keywordIds']) => void;
}) {
  const handleToggle = (id: number) => {
    const isChecked = keywordIds.includes(id);
    const newKeywordIds = isChecked
      ? keywordIds.filter((k) => k !== id)
      : [...keywordIds, id];

    onChange(newKeywordIds);
  };

  return (
    <div className="flex flex-col justify-center gap-100">
      <div className="flex items-center justify-center gap-100">
        <span className="font-designer-16b text-text-default">
          이런 점이 좋았어요
        </span>
        <span className="font-designer-13m text-text-error">필수</span>
      </div>

      <ul className="mx-auto">
        {positiveKeywords.map(({ id, keyword }) => (
          <ListItem key={id}>
            <Checkbox
              id={`satisfaction-${id}`}
              checked={keywordIds.includes(id)}
              onToggle={() => {
                handleToggle(id);
              }}
            />
            <label htmlFor={`satisfaction-${id}`}>{keyword}</label>
          </ListItem>
        ))}
      </ul>
    </div>
  );
}

function PositiveTextArea({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) {
  return (
    <div className="flex flex-col gap-100">
      <div>
        <h3 className="text-text-default font-designer-16b text-center">
          어떤 점이 좋았나요?
        </h3>
        <div className="font-designer-14r text-text-subtle flex flex-col text-center">
          <span>
            같이 성장할 수 있는 스터디 문화를 만들기 위해 평가를 남겨주세요.
          </span>
          <span>평가한 내용은 성실 온도에 반영됩니다.</span>
        </div>
      </div>

      <TextAreaInput
        value={value}
        maxLength={1000}
        placeholder="좋았던 점을 자세히 말해주세요"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function NegativeCheckboxList({
  negativeKeywords,
  keywordIds,
  onChange,
}: {
  negativeKeywords: StudyEvaluationResponse['unsatisfiedEvalKeywords'];
  keywordIds: FormState['keywordIds'];
  onChange: (keywordIds: FormState['keywordIds']) => void;
}) {
  const handleToggle = (id: number) => {
    const isChecked = keywordIds.includes(id);
    const newKeywordIds = isChecked
      ? keywordIds.filter((k) => k !== id)
      : [...keywordIds, id];

    onChange(newKeywordIds);
  };

  return (
    <div className="flex flex-col justify-center gap-100">
      <div className="flex items-center justify-center gap-100">
        <span className="font-designer-16b text-text-default">
          이런 점이 아쉬웠어요
        </span>
        <span className="font-designer-13m text-text-error">필수</span>
      </div>

      <ul className="mx-auto">
        {negativeKeywords.map(({ id, keyword }) => (
          <ListItem key={id}>
            <Checkbox
              id={`bad-satisfaction-${id}`}
              checked={keywordIds.includes(id)}
              onToggle={() => {
                handleToggle(id);
              }}
            />
            <label htmlFor={`bad-satisfaction-${id}`}>{keyword}</label>
          </ListItem>
        ))}
      </ul>
    </div>
  );
}

function NegativeTextArea({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) {
  return (
    <div className="flex flex-col gap-100">
      <div>
        <h3 className="text-text-default font-designer-16b text-center">
          어떤 점이 아쉬웠나요?
        </h3>
        <div className="font-designer-14r text-text-subtle flex flex-col text-center">
          <span>
            스터디 과정에서 아쉬웠던 점이 있다면, 이는 성장을 위한 소중한
            피드백이 됩니다.
          </span>
          <span>작성하신 내용은 오직 상대방만 확인할 수 있어요.</span>
        </div>
      </div>

      <TextAreaInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={1000}
        placeholder="아쉬웠던 점을 자세히 말해주세요"
      />
    </div>
  );
}
