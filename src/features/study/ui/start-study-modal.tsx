'use client';

import { XIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { JoinStudyRequest } from '../api/types';
import { studySteps } from '../consts/study-const';
import { useJoinStudyMutation } from '../model/use-study-query';

interface StartStudyModalProps {
  memberId: number;
}

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

type JoinStudyFormError = {
  [K in keyof Omit<
    JoinStudyRequest,
    'memberId' | 'githubLink' | 'blogOrSnsLink'
  >]: boolean;
};

export default function StartStudyModal({ memberId }: StartStudyModalProps) {
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

          <StartStudyForm memberId={memberId} />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function StartStudyForm({ memberId }: StartStudyModalProps) {
  const [form, setForm] = useState<Omit<JoinStudyRequest, 'memberId'>>({
    selfIntroduction: '',
    studyPlan: '',
    tel: '',
    githubLink: '',
    blogOrSnsLink: '',
    preferredStudySubjectId: undefined,
    availableStudyTimeIds: [],
    techStackIds: [],
  });

  const [error, setError] = useState<JoinStudyFormError>({
    selfIntroduction: false,
    studyPlan: false,
    tel: false,
    preferredStudySubjectId: false,
    availableStudyTimeIds: false,
    techStackIds: false,
  });

  const {
    selfIntroduction,
    studyPlan,
    tel,
    githubLink,
    blogOrSnsLink,
    preferredStudySubjectId,
    availableStudyTimeIds,
  } = form;

  const { data: availableStudyTimes } = useAvailableStudyTimesQuery();
  const { data: studySubjects } = useStudySubjectsQuery();
  const { data: techStacks } = useTechStacksQuery();
  const router = useRouter();

  const { mutate: joinStudy } = useJoinStudyMutation();

  const toggleStudyTime = (id: number) => {
    setForm((prev) =>
      prev.availableStudyTimeIds.includes(id)
        ? {
            ...prev,
            availableStudyTimeIds: prev.availableStudyTimeIds.filter(
              (item) => item !== id,
            ),
          }
        : {
            ...prev,
            availableStudyTimeIds: [...prev.availableStudyTimeIds, id],
          },
    );
  };

  const handleSubmit = () => {
    const newError: JoinStudyFormError = {
      selfIntroduction: selfIntroduction.trim() === '',
      studyPlan: studyPlan.trim() === '',
      tel: !/^\d{2,3}-\d{3,4}-\d{4}$/.test(tel),
      preferredStudySubjectId: preferredStudySubjectId === undefined,
      availableStudyTimeIds: availableStudyTimeIds.length === 0,
      techStackIds: form.techStackIds.length === 0,
    };

    if (Object.values(newError).some(Boolean)) {
      setError(newError);

      return;
    }

    joinStudy(
      {
        ...form,
        memberId,
        githubLink: githubLink.trim() || undefined,
        blogOrSnsLink: blogOrSnsLink.trim() || undefined,
      },
      {
        onSuccess: () => {
          alert('스터디 신청이 완료되었습니다!');
          router.refresh();
        },
        onError: () => {
          alert('스터디 신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
        },
      },
    );
  };

  return (
    <>
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
              placeholder="신입 프론트엔드 개발자입니다. 리액트를 중심으로 공부 중이고, 꾸준히 기록하는 습관을 들이고 있어요."
              value={selfIntroduction}
              color={error.selfIntroduction ? 'error' : 'default'}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  selfIntroduction: e.target.value,
                }));
                setError((prev) => ({
                  ...prev,
                  selfIntroduction: e.target.value.trim() === '',
                }));
              }}
            />
          </LabeledField>

          <LabeledField
            label="공부 주제 및 계획"
            required
            description="스터디에서 다루고 싶은 주제와 학습 목표를 알려주세요."
          >
            <BaseInput
              color={error.studyPlan ? 'error' : 'default'}
              placeholder="CS 기본기를 탄탄하게 다지는 것이 목표입니다. 각자 맡은 주제를 정리하고 공유하는 방식으로 진행하고 싶어요."
              value={studyPlan}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  studyPlan: e.target.value,
                }));
                setError((prev) => ({
                  ...prev,
                  studyPlan: e.target.value.trim() === '',
                }));
              }}
            />
          </LabeledField>

          <LabeledField
            label="선호하는 스터디 주제"
            required
            description="관심 있는 스터디 유형을 선택해 주세요."
          >
            <SingleDropdown
              error={error.preferredStudySubjectId}
              defaultValue={preferredStudySubjectId}
              options={(studySubjects ?? []).map(
                ({ studySubjectId, name }) => ({
                  value: studySubjectId,
                  label: name,
                }),
              )}
              placeholder="선택하세요"
              onChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  preferredStudySubjectId: value.toString(),
                }));
                setError((prev) => ({
                  ...prev,
                  preferredStudySubjectId: value === undefined,
                }));
              }}
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
                    pressed={availableStudyTimeIds.includes(availableTimeId)}
                    onPressedChange={() => toggleStudyTime(availableTimeId)}
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
              error={error.techStackIds}
              options={(techStacks ?? []).map(
                ({ techStackId, techStackName }) => ({
                  value: techStackId,
                  label: techStackName,
                }),
              )}
              onChange={(newSelected) => {
                setForm((prev) => ({
                  ...prev,
                  techStackIds: newSelected as number[],
                }));
                setError((prev) => ({
                  ...prev,
                  techStackIds: newSelected.length === 0,
                }));
              }}
              placeholder="기술을 선택해주세요"
            />
          </LabeledField>

          <LabeledField
            label="연락처"
            required
            description="스터디 진행을 위해 연락 가능한 정보를 입력해 주세요. 입력하신 정보는 매칭된 스터디원에게만 제공되며, 외부에는 노출되지 않습니다."
          >
            <BaseInput
              placeholder="010-1234-5678"
              value={tel}
              color={error.tel ? 'error' : 'default'}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  tel: e.target.value,
                }));
                setError((prev) => ({
                  ...prev,
                  tel: !/^\d{2,3}-\d{3,4}-\d{4}$/.test(e.target.value),
                }));
              }}
            />
          </LabeledField>

          <LabeledField
            label="GitHub"
            description="본인의 활동을 확인할 수 있는 GitHub 링크를 입력해 주세요."
          >
            <BaseInput
              placeholder="https://github.com/@zero-one"
              value={githubLink}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, githubLink: e.target.value }))
              }
            />
          </LabeledField>

          <LabeledField
            label="블로그/SNS 등 링크"
            description="본인의 활동을 확인할 수 있는 외부 링크가 있다면 입력해 주세요."
          >
            <BaseInput
              placeholder="https://velog.io/@zero-one"
              value={blogOrSnsLink}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  blogOrSnsLink: e.target.value,
                }))
              }
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
        <Button size="large" color="primary" onClick={handleSubmit}>
          신청 완료
        </Button>
      </Modal.Footer>
    </>
  );
}
