'use client';

import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import {
  useAvailableStudyTimesQuery,
  useStudySubjectsQuery,
  useTechStacksQuery,
} from '@/features/my-page/model/use-update-user-profile-mutation';
import { cn } from '@/shared/shadcn/lib/utils';
import Button from '@/shared/ui/button';
import { SingleDropdown, MultiDropdown } from '@/shared/ui/dropdown';
import { BaseInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';
import { ToggleButton } from '@/shared/ui/toggle';

interface LabeledFieldProps {
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

interface NumberedBulletSectionProps {
  title: string;
  items: string[];
}

const studySteps = [
  {
    title: '1. 면접 준비',
    items: [
      '‘면접 준비하기’ 버튼을 클릭한 후 주제와 학습 자료 링크를 등록합니다.',
    ],
  },
  {
    title: '2. 스터디 진행 (면접관 & 지원자)',
    items: [
      '면접관은 당일 오전, 학습 자료를 바탕으로 지원자와 최소 3문항 이상의 Q&A를 주고받으며 약 20분간 스터디를 진행합니다.',
      '기본 스터디 시간은 오전 9시 30분이며, 상황에 따라 일정 조율이 가능합니다.',
      '스터디는 기본적으로 전화로 진행되며, 필요 시 Zoom 또는 Google Meet 등의 화상 회의 도구를 활용할 수 있습니다.',
    ],
  },
  {
    title: '3. 스터디 종료 후 처리',
    items: [
      '면접관은 ‘면접 완료하기’ 버튼을 클릭하여 진행 상태를 변경하고 코멘트를 남깁니다.',
      '만약 자료 미제출, 전화 부재(지원자/면접관) 등의 사유로 스터디가 진행되지 못한 경우, 면접관이 진행 상태를 변경합니다.',
      '스터디를 진행하지 못한 사유가 있는 경우, 귀책 당사자가 상대방에게 커피 등 소정의 기프티콘을 제공하며, 면접관은 진행 상태를 ‘미완료’로 설정합니다.',
    ],
  },
  {
    title: '4. 다음 주 스터디 휴식 설정',
    items: [
      '다음 주 스터디 참여가 어려운 경우, 금요일 저녁 전까지 스터디 매칭 토글을 ‘Off’로 변경해주세요.',
    ],
  },
];

function NumberedBulletSection({ title, items }: NumberedBulletSectionProps) {
  return (
    <div className="flex flex-col gap-150">
      <div className="font-designer-16b">{title}</div>
      <div className="bg-background-alternative rounded-75 px-200 py-300">
        <ul className="font-designer-15r text-text-subtle mx-250 list-outside list-disc pl-6">
          {items.map((item: string, idx: number) => (
            <li key={idx} className="mb-100 last:mb-0">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function LabeledField({
  label,
  required,
  description,
  children,
  className,
}: LabeledFieldProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <label className="font-designer-16b text-text-default mb-100 inline-block">
        {label}
        {required && (
          <span className="font-designer-13m text-text-error ml-100">필수</span>
        )}
      </label>
      {description && (
        <span className="font-designer-13m text-text-subtle mb-250">
          {description}
        </span>
      )}
      {children}
    </div>
  );
}

export default function StartStudyModal() {
  const [introduce, setIntroduce] = useState('');
  const [studyPlan, setStudyPlan] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [github, setGithub] = useState('');
  const [blog, setBlog] = useState('');
  const [preferredSubject, setPreferredSubject] = useState<
    string | number | undefined
  >(undefined);

  const [availableTimeSlots, setAvailableTimeSlots] = useState<number[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

  const { data: availableStudyTimes } = useAvailableStudyTimesQuery();
  const { data: studySubjects } = useStudySubjectsQuery();
  const { data: techStacks } = useTechStacksQuery();

  const toggleTimeSlot = (id: number) => {
    setAvailableTimeSlots((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const isFormValid =
    introduce.trim() !== '' &&
    studyPlan.trim() !== '' &&
    phoneNumber.trim() !== '' &&
    availableTimeSlots.length > 0;

  const getMissingFields = () => {
    const missing: string[] = [];
    if (introduce.trim() === '') missing.push('자기소개');
    if (studyPlan.trim() === '') missing.push('공부 주제 및 계획');
    if (phoneNumber.trim() === '') missing.push('연락처');
    if (availableTimeSlots.length === 0) missing.push('가능 시간대');

    return missing;
  };

  return (
    <Modal.Root>
      <Modal.Trigger>
        <Image
          src="/images/start-study.png"
          alt="스터디 시작 버튼"
          width={0}
          height={0}
          sizes="100vw"
          className="h-auto w-full"
        />
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="large">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title className="font-designer-20b">
              CS 스터디 신청하기
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-500">
            <div className="font-designer-18b">CS 스터디 진행 방법</div>
            {studySteps.map((step, idx) => (
              <NumberedBulletSection
                key={idx}
                title={step.title}
                items={step.items}
              />
            ))}

            <div className="border-border-default border-t" />

            <div className="flex flex-col gap-400">
              <LabeledField
                label="자기 소개"
                required
                description="간단한 자기소개를 입력해 주세요."
              >
                <BaseInput
                  className="border-border-default rounded-100 border p-150"
                  placeholder="신입 프론트엔드 개발자입니다. 리액트를 중심으로 공부 중이고, 꾸준히 기록하는 습관을 들이고 있어요."
                  value={introduce}
                  onChange={(e) => setIntroduce(e.target.value)}
                />
              </LabeledField>

              <LabeledField
                label="공부 주제 및 계획"
                required
                description="스터디에서 다루고 싶은 주제와 학습 목표를 알려주세요."
              >
                <BaseInput
                  className="border-border-default rounded-100 border p-150"
                  placeholder="CS 기본기를 탄탄하게 다지는 것이 목표입니다. 각자 맡은 주제를 정리하고 공유하는 방식으로 진행하고 싶어요."
                  value={studyPlan}
                  onChange={(e) => setStudyPlan(e.target.value)}
                />
              </LabeledField>

              <LabeledField
                label="선호하는 스터디 주제"
                required
                description="관심 있는 스터디 유형을 선택해 주세요."
              >
                <SingleDropdown
                  defaultValue={preferredSubject}
                  options={(studySubjects ?? []).map(
                    ({ studySubjectId, name }) => ({
                      value: studySubjectId,
                      label: name,
                    }),
                  )}
                  placeholder="선택하세요"
                  onChange={(value) => setPreferredSubject(value)}
                />
              </LabeledField>

              <LabeledField
                label="가능 시간대"
                required
                description="스터디 참여가 가능한 시간대를 모두 선택해 주세요."
              >
                <div className="grid grid-cols-5 gap-100">
                  {(availableStudyTimes ?? []).map(
                    ({ availableTimeId, display }) => (
                      <ToggleButton
                        key={availableTimeId}
                        pressed={availableTimeSlots.includes(availableTimeId)}
                        onPressedChange={() => toggleTimeSlot(availableTimeId)}
                      >
                        {display}
                      </ToggleButton>
                    ),
                  )}
                </div>
              </LabeledField>

              <LabeledField
                label="사용 가능한 기술 스택"
                required
                description="현재 본인이 사용할 수 있는 기술 스택을 모두 선택해 주세요."
              >
                <MultiDropdown
                  options={(techStacks ?? []).map(
                    ({ techStackId, techStackName }) => ({
                      value: techStackId,
                      label: techStackName,
                    }),
                  )}
                  onChange={(newSelected) =>
                    setSelectedSkills(newSelected as number[])
                  }
                  placeholder="기술을 선택해주세요"
                />
              </LabeledField>

              <LabeledField
                label="연락처"
                required
                description="스터디 진행을 위해 연락 가능한 정보를 입력해 주세요. 입력하신 정보는 매칭된 스터디원에게만 제공되며, 외부에는 노출되지 않습니다."
              >
                <BaseInput
                  className="border-border-default rounded-100 border p-150"
                  placeholder="010-1234-5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </LabeledField>

              <LabeledField
                label="GitHub"
                description="본인의 활동을 확인할 수 있는 GitHub 링크를 입력해 주세요."
              >
                <BaseInput
                  className="border-border-default rounded-100 border p-150"
                  placeholder="https://github.com/@zero-one"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </LabeledField>

              <LabeledField
                label="블로그/SNS 등 링크"
                description="본인의 활동을 확인할 수 있는 외부 링크가 있다면 입력해 주세요."
              >
                <BaseInput
                  className="border-border-default rounded-100 border p-150"
                  placeholder="https://velog.io/@zero-one"
                  value={blog}
                  onChange={(e) => setBlog(e.target.value)}
                />
              </LabeledField>
            </div>
          </Modal.Body>

          <Modal.Footer className="flex justify-end gap-100">
            <Modal.Close asChild>
              <Button color="secondary" size="large">
                취소
              </Button>
            </Modal.Close>
            <Modal.Close asChild>
              <Button
                size="large"
                color={isFormValid ? 'primary' : 'secondary'}
                className={cn(!isFormValid && 'cursor-not-allowed')}
                onClick={(e) => {
                  if (!isFormValid) {
                    e.preventDefault(); // 모달 닫힘 방지
                    const missing = getMissingFields();
                    alert(`다음 항목을 입력해 주세요: ${missing.join(', ')}`);

                    return;
                  }
                }}
              >
                작성 완료
              </Button>
            </Modal.Close>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
