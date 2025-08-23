'use client';

import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Button from '@/shared/ui/button';
import Checkbox from '@/shared/ui/checkbox';
import { TextAreaInput } from '@/shared/ui/input';
import ListItem from '@/shared/ui/list-item';
import { Modal } from '@/shared/ui/modal';
import { EvalKeyword, StudyEvaluationResponse } from '../api/types';
import { usePartnerStudyReviewQuery } from '../model/use-review-query';

export default function StudyReviewModal() {
  // 10 - "아쉬워요", 20 - "괜찮아요", 30 - "좋았어요"
  const [satisfactionId, setSatisfactionId] = useState<10 | 20 | 30 | null>(
    null,
  );

  const { data } = usePartnerStudyReviewQuery();

  if (!data) return null;

  return (
    <Modal.Root>
      <Modal.Trigger>
        <div className="bg-background-alternative rounded-100 flex items-center justify-between px-250 py-300">
          <p className="flex flex-col items-start gap-50">
            <span className="font-designer-15b text-text-default">
              CS 스터디를 시작해 보세요!
            </span>
            <span className="font-designer-12m text-text-subtlest">
              스터디 신청하기
            </span>
          </p>
        </div>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="large">
          <Modal.Header className="border-border-default flex justify-end border-b">
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-400">
            <div className="flex flex-col items-center justify-center gap-100">
              <Modal.Title>함께 스터디한 멤버에 대해 알려주세요</Modal.Title>

              <div className="font-designer-14r text-text-subtle flex flex-col text-center">
                <span>
                  같이 성장할 수 있는 스터디 문화를 만들기 위해 평가를
                  남겨주세요.
                </span>
                <span>평가한 내용은 성실 온도에 반영됩니다.</span>
              </div>
            </div>

            <PartnerInfo {...data} />

            <div className="flex flex-col items-center justify-center gap-100">
              <span className="font-designer-16b text-text-default">
                스터디 만족도
              </span>

              <div className="flex items-center justify-center gap-200">
                <SatisfactionButton
                  label="아쉬워요"
                  isSelected={satisfactionId === 10}
                  imageSrc="/icons/shame-review.svg"
                  onClick={() => setSatisfactionId(10)}
                />

                <SatisfactionButton
                  label="괜찮아요"
                  isSelected={satisfactionId === 20}
                  imageSrc="/icons/fine-review.svg"
                  onClick={() => setSatisfactionId(20)}
                />

                <SatisfactionButton
                  label="좋았어요"
                  isSelected={satisfactionId === 30}
                  imageSrc="/icons/good-review.svg"
                  onClick={() => setSatisfactionId(30)}
                />
              </div>
            </div>

            {satisfactionId === 10 && <NegativeReview data={data} />}

            {(satisfactionId === 20 || satisfactionId === 30) && (
              <PositiveReview satisfactionId={satisfactionId} data={data} />
            )}
          </Modal.Body>
          <Modal.Footer className="flex justify-end gap-100">
            <Button color="secondary" size="large">
              취소
            </Button>
            <Button color="primary" size="large" disabled>
              등록하기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function PartnerInfo(data: StudyEvaluationResponse) {
  const partner = data.targetMembers[0];

  return (
    <div className="flex justify-center gap-200">
      <Image
        src={partner.profileImageUrl || '/profile-default.svg'}
        alt="Study Member"
        width={80}
        height={80}
        className="rounded-full"
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
  satisfactionId,
  data,
}: {
  satisfactionId: 20 | 30;
  data: StudyEvaluationResponse;
}) {
  return (
    <>
      <PositiveCheckboxList
        positiveKeywords={
          satisfactionId === 20
            ? data.notBadEvalKeywords
            : data.satisfiedEvalKeywords
        }
      />
      <PositiveTextArea />
    </>
  );
}

function NegativeReview({ data }: { data: StudyEvaluationResponse }) {
  return (
    <>
      <NegativeCheckboxList negativeKeywords={data.unsatisfiedEvalKeywords} />
      <NegativeTextArea />
    </>
  );
}

function PositiveCheckboxList({
  positiveKeywords,
}: {
  positiveKeywords: EvalKeyword[];
}) {
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
            <Checkbox id={`satisfaction-${id}`} />
            <label htmlFor={`satisfaction-${id}`}>{keyword}</label>
          </ListItem>
        ))}
      </ul>
    </div>
  );
}

function PositiveTextArea() {
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
        value={''}
        maxLength={1000}
        placeholder="좋았던 점을 자세히 말해주세요"
      />
    </div>
  );
}

function NegativeCheckboxList({
  negativeKeywords,
}: {
  negativeKeywords: StudyEvaluationResponse['unsatisfiedEvalKeywords'];
}) {
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
            <Checkbox id={`bad-satisfaction-${id}`} />
            <label htmlFor={`bad-satisfaction-${id}`}>{keyword}</label>
          </ListItem>
        ))}
      </ul>
    </div>
  );
}

function NegativeTextArea() {
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
        value={''}
        maxLength={1000}
        placeholder="아쉬웠던 점을 자세히 말해주세요"
      />
    </div>
  );
}
