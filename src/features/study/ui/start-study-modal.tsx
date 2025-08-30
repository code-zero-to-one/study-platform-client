'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { patchAutoMatching } from '@/entities/user/api/get-user-profile';
import {
  useAvailableStudyTimesQuery,
  useStudySubjectsQuery,
  useTechStacksQuery,
} from '@/features/my-page/model/use-update-user-profile-mutation';

import Button from '@/shared/ui/button';
import { SingleDropdown, MultiDropdown } from '@/shared/ui/dropdown';
import FormField from '@/shared/ui/form/form-field';
import { BaseInput, TextAreaInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';

import { ToggleGroup } from '@/shared/ui/toggle';
import { studySteps } from '../consts/study-const';

import { useJoinStudyMutation } from '../model/use-study-query';
import {
  StartStudyFormSchema,
  type StartStudyFormValues,
  buildStartStudyDefaultValues,
  toJoinStudyRequest,
} from '../participation/model/start-study-form.schema';

interface StartStudyModalProps {
  memberId: number;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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
          {items.map((item, idx) => (
            <li key={idx} className="mb-100 last:mb-0">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function StartStudyModal({
  memberId,
  trigger,
  open,
  onOpenChange,
}: StartStudyModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Modal.Trigger asChild>{trigger}</Modal.Trigger> : null}
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

          <StartStudyForm
            memberId={memberId}
            onClose={() => onOpenChange?.(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function StartStudyForm({
  memberId,
  onClose,
}: {
  memberId: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const { data: availableStudyTimes = [] } = useAvailableStudyTimesQuery();
  const { data: studySubjects = [] } = useStudySubjectsQuery();
  const { data: techStacks = [] } = useTechStacksQuery();
  const { mutate: joinStudy } = useJoinStudyMutation();

  const methods = useForm<StartStudyFormValues>({
    resolver: zodResolver(StartStudyFormSchema),
    mode: 'onChange',
    defaultValues: buildStartStudyDefaultValues(),
  });

  const { handleSubmit } = methods;

  const subjectOptions = useMemo(
    () =>
      studySubjects.map(({ studySubjectId, name }) => ({
        value: String(studySubjectId),
        label: name,
      })),
    [studySubjects],
  );

  const timeOptions = useMemo(
    () =>
      availableStudyTimes.map(({ availableTimeId, display }) => ({
        value: String(availableTimeId),
        label: display,
      })),
    [availableStudyTimes],
  );

  const techOptions = useMemo(
    () =>
      techStacks.map(({ techStackId, techStackName }) => ({
        value: String(techStackId),
        label: techStackName,
      })),
    [techStacks],
  );

  const queryClient = useQueryClient();

  const onValidSubmit = (values: StartStudyFormValues) => {
    const body = toJoinStudyRequest(memberId, values);

    joinStudy(body, {
      onSuccess: async () => {
        alert('스터디 신청이 완료되었습니다!');
        // todo: usePatchAutoMatchingMutation 쓰기
        await patchAutoMatching({ memberId, autoMatching: true });
        await queryClient.invalidateQueries({
          queryKey: ['weeklyReservationMembers'],
        });
        onClose();
        router.refresh();
      },
      onError: () => {
        alert('스터디 신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
      },
    });
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

        <FormProvider {...methods}>
          <form
            id="start-study-form"
            className="flex flex-col gap-400"
            onSubmit={handleSubmit(onValidSubmit)}
          >
            <FormField<StartStudyFormValues, 'selfIntroduction'>
              name="selfIntroduction"
              label="자기 소개"
              helper="간단한 자기소개를 입력해 주세요."
              direction="vertical"
              required
            >
              <TextAreaInput
                placeholder="신입 프론트엔드 개발자입니다.
                  리액트를 중심으로 공부 중이고, 꾸준히 기록하는 습관을 들이고 있어요."
                maxLength={500}
              />
            </FormField>

            <FormField<StartStudyFormValues, 'studyPlan'>
              name="studyPlan"
              label="공부 주제 및 계획"
              helper="스터디에서 다루고 싶은 주제와 학습 목표를 알려주세요."
              direction="vertical"
              required
            >
              <TextAreaInput
                placeholder="CS 기본기를 탄탄하게 다지는 것이 목표입니다.
                  각자 맡은 주제를 정리하고 공유하는 방식으로 진행하고 싶어요."
                maxLength={500}
              />
            </FormField>

            <FormField<StartStudyFormValues, 'tel'>
              name="tel"
              label="연락처"
              helper="스터디 진행을 위해 연락 가능한 정보를 입력해 주세요. 입력하신 정보는 매칭된 스터디원에게만 제공되며, 외부에는 노출되지 않습니다."
              direction="vertical"
              required
            >
              <BaseInput placeholder="010-1234-5678" />
            </FormField>

            <FormField<StartStudyFormValues, 'preferredStudySubjectId'>
              name="preferredStudySubjectId"
              label="선호하는 스터디 주제"
              helper="관심 있는 스터디 유형을 선택해 주세요."
              direction="vertical"
              required
            >
              <SingleDropdown
                options={subjectOptions}
                placeholder="선택해주세요"
              />
            </FormField>

            <FormField<StartStudyFormValues, 'availableStudyTimeIds', string[]>
              name="availableStudyTimeIds"
              label="가능 시간대"
              helper="스터디 참여가 가능한 시간대를 모두 선택해 주세요."
              direction="vertical"
              required
            >
              <ToggleGroup options={timeOptions} />
            </FormField>

            <FormField<StartStudyFormValues, 'techStackIds', string[]>
              name="techStackIds"
              label="사용 가능한 기술 스택"
              helper="현재 본인이 사용할 수 있는 기술 스택을 모두 선택해 주세요."
              direction="vertical"
              required
            >
              <MultiDropdown
                options={techOptions}
                placeholder="기술을 선택해주세요"
              />
            </FormField>

            <FormField<StartStudyFormValues, 'githubLink'>
              name="githubLink"
              label="GitHub"
              helper="본인의 활동을 확인할 수 있는 GitHub 링크를 입력해 주세요."
              direction="vertical"
            >
              <BaseInput placeholder="https://github.com/@zero-one" />
            </FormField>

            <FormField<StartStudyFormValues, 'blogOrSnsLink'>
              name="blogOrSnsLink"
              label="블로그/SNS 등 링크"
              helper="본인의 활동을 확인할 수 있는 외부 링크가 있다면 입력해 주세요."
              direction="vertical"
            >
              <BaseInput placeholder="https://velog.io/@zero-one" />
            </FormField>
          </form>
        </FormProvider>
      </Modal.Body>

      <Modal.Footer className="flex justify-end gap-100">
        <Modal.Close asChild>
          <Button color="secondary" size="large">
            취소
          </Button>
        </Modal.Close>
        <Button
          size="large"
          color="primary"
          type="submit"
          form="start-study-form"
          disabled={
            !methods.formState.isValid || methods.formState.isSubmitting
          }
        >
          {methods.formState.isSubmitting ? '신청 중…' : '신청 완료'}
        </Button>
      </Modal.Footer>
    </>
  );
}
