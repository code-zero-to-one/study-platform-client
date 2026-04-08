'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import Button from '@/components/common/ui/button';
import { SingleDropdown } from '@/components/common/ui/dropdown';
import FormField from '@/components/common/ui/form/form-field';
import { TextAreaInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import { GroupItems } from '@/components/common/ui/toggle';
import type { ToggleOption } from '@/components/common/ui/toggle/group';
import {
  useAvailableStudyTimesQuery,
  useStudySubjectsQuery,
  useJobsQuery,
  useCareersQuery,
  useStudyFormatTypesQuery,
  useUpdateUserProfileInfoMutation,
} from '@/hooks/queries/user/use-update-user-profile-mutation';
import type { MemberInfo } from '@/types/api/user.types';
import {
  ProfileInfoFormSchema,
  type ProfileInfoFormValues,
  buildProfileInfoDefaultValues,
  toUpdateUserProfileInfoRequest,
} from '@/types/schemas/profile-info-form.schema';

interface Props {
  memberId: number;
  memberInfo: MemberInfo;
}

// jobs 최대 제한을 위한 래퍼 컴포넌트
// TODO : ui 컴포넌트에 반영 필요
function LimitedGroupItems({
  options,
  value,
  onChange,
  maxSelection = 5,
}: {
  options: ToggleOption[];
  value?: string[];
  onChange?: (v: string[]) => void;
  maxSelection?: number;
}) {
  const handleChange = (newValue: string[]) => {
    const limited = newValue.slice(0, maxSelection);
    onChange?.(limited);
  };

  return (
    <GroupItems
      options={options}
      multiple={true}
      value={value}
      onChange={handleChange}
    />
  );
}

export default function ProfileInfoEditModal({ memberId, memberInfo }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      sendGTMEvent({
        event: 'profile_edit_modal_open',
      });
    }
  }, [isOpen]);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger onClick={() => setIsOpen(true)}>
        <div className="rounded-75 bg-fill-neutral-default-default font-designer-13b text-text-default cursor-pointer px-150 py-75">
          편집
        </div>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium">
          <Modal.Header className="border-border-default border-b">
            <div className="flex items-center justify-between">
              <Modal.Title>내 스터디 정보 수정</Modal.Title>
              <Modal.Close>
                <XIcon />
              </Modal.Close>
            </div>
          </Modal.Header>

          <ProfileInfoEditForm
            memberId={memberId}
            memberInfo={memberInfo}
            onClose={() => setIsOpen(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function ProfileInfoEditForm({
  memberId,
  memberInfo,
  onClose,
}: {
  memberId: number;
  memberInfo: MemberInfo;
  onClose: () => void;
}) {
  const { data: availableStudyTimes = [] } = useAvailableStudyTimesQuery();
  const { data: studySubjects = [] } = useStudySubjectsQuery();
  const { data: jobs = [] } = useJobsQuery();
  const { data: careers = [] } = useCareersQuery();
  const { data: studyFormatTypes = [] } = useStudyFormatTypesQuery();
  const { mutate: updateProfileInfo } =
    useUpdateUserProfileInfoMutation(memberId);

  const methods = useForm<ProfileInfoFormValues>({
    resolver: zodResolver(ProfileInfoFormSchema),
    mode: 'onChange',
    defaultValues: buildProfileInfoDefaultValues(memberInfo),
  });

  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
  } = methods;

  const preferredStudySubjectId = useWatch({
    control,
    name: 'preferredStudySubjectId',
  });
  const subjectOk = Boolean(preferredStudySubjectId);
  const isDisabled = !isValid || isSubmitting || !subjectOk;

  const onValidSubmit = (values: ProfileInfoFormValues) => {
    const formData = toUpdateUserProfileInfoRequest(values);

    updateProfileInfo(formData, {
      onSuccess: () => {
        // TODO : TBD
        // const selectedNames =
        //   techStacks
        //     .filter((t) => values.techStackIds?.includes(String(t.techStackId)))
        //     .map((t) => t.techStackName) ?? [];

        // sendGTMEvent({
        //   event: 'custom_member_card',
        //   dl_timestamp: new Date().toISOString(),
        //   dl_member_id: hashValue(String(memberId)),
        //   dl_tags: selectedNames,
        // });

        onClose();
      },
    });
  };

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

  const jobOptions = useMemo(
    () =>
      jobs.map(({ job, description }) => ({
        value: String(job),
        label: description,
      })),
    [jobs],
  );

  const careerOptions = useMemo(
    () =>
      careers.map(({ career, description }) => ({
        value: String(career),
        label: description,
      })),
    [careers],
  );

  const studyFormatTypeOptions = useMemo(
    () =>
      studyFormatTypes.map(({ studyFormatType, description }) => ({
        value: studyFormatType, // 이미 Enum 문자열이므로 String() 불필요
        label: description,
      })),
    [studyFormatTypes],
  );

  return (
    <>
      <Modal.Body>
        <FormProvider {...methods}>
          <form
            id="profile-info-form"
            className="flex flex-col gap-300"
            onSubmit={handleSubmit(onValidSubmit)}
          >
            <FormField<ProfileInfoFormValues, 'selfIntroduction'>
              name="selfIntroduction"
              label="자기소개"
              description="간단한 자기소개를 입력해 주세요."
              direction="vertical"
              showCounterRight
              maxCharCount={500}
            >
              <TextAreaInput
                maxLength={500}
                placeholder="입력해주세요."
                hideMeta
              />
            </FormField>

            <FormField<ProfileInfoFormValues, 'studyPlan'>
              name="studyPlan"
              label="공부 주제 및 계획"
              description="스터디에서 다루고 싶은 주제와 학습 목표를 알려주세요."
              direction="vertical"
              showCounterRight
              maxCharCount={500}
              required
            >
              <TextAreaInput
                maxLength={500}
                placeholder="입력해주세요."
                hideMeta
              />
            </FormField>

            <FormField<ProfileInfoFormValues, 'preferredStudySubjectId'>
              name="preferredStudySubjectId"
              label="선호하는 스터디 주제"
              description="관심있는 스터디 유형을 선택해주세요."
              direction="vertical"
              required
            >
              <SingleDropdown
                options={subjectOptions}
                placeholder="선택해주세요"
              />
            </FormField>

            <FormField<ProfileInfoFormValues, 'availableStudyTimeIds', string[]>
              name="availableStudyTimeIds"
              label="가능 시간대"
              helper="스터디 참여가 가능한 시간대를 모두 선택해 주세요."
              direction="vertical"
              required
            >
              <GroupItems options={timeOptions} />
            </FormField>

            {/* 기본 정보 (profile-edit-modal)로 이동 */}
            {/* <FormField<ProfileInfoFormValues, 'techStackIds', string[]>
              name="techStackIds"
              label="사용 가능한 기술 스택"
              helper="현재 본인이 사용할 수 있는 기술 스택을 모두 선택해 주세요."
              direction="vertical"
              required
            >
              <MultiDropdown options={techOptions} placeholder="선택해주세요" />
            </FormField> */}

            {/* 회원가입시 받는 내용 (SPRINT2 프로필개선) */}
            <FormField<ProfileInfoFormValues, 'jobs', string[]>
              name="jobs"
              label="직무"
              description="본인의 직무를 선택해 주세요. (최대 5개 선택 가능)"
              direction="vertical"
              required
            >
              <LimitedGroupItems options={jobOptions} maxSelection={5} />
            </FormField>

            {/* 회원가입시 받는 내용 (SPRINT2 프로필개선) */}
            <FormField<ProfileInfoFormValues, 'career'>
              name="career"
              label="경력"
              description="본인의 경력을 선택해 주세요."
              direction="vertical"
              required
            >
              <SingleDropdown
                options={careerOptions}
                placeholder="선택해주세요"
              />
            </FormField>

            {/* 회원가입시 받는 내용 (SPRINT2 프로필개선) */}
            <FormField<ProfileInfoFormValues, 'studyFormatTypes', string[]>
              name="studyFormatTypes"
              label="스터디 형태"
              description="본인의 스터디 형태를 선택해 주세요."
              direction="vertical"
              required
            >
              <GroupItems options={studyFormatTypeOptions} multiple={true} />
            </FormField>

            {/* 회원가입시 받는 내용 (SPRINT2 프로필개선) */}
            <FormField<ProfileInfoFormValues, 'goal', string[]>
              name="goal"
              label="스터디 목표"
              description="본인의 스터디 목표를 선택해 주세요."
              direction="vertical"
              showCounterRight
              maxCharCount={500}
            >
              <TextAreaInput
                maxLength={500}
                placeholder="입력해주세요."
                hideMeta
              />
            </FormField>
          </form>
        </FormProvider>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end gap-100">
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
          <Button
            color="primary"
            size="large"
            type="submit"
            form="profile-info-form"
            disabled={isDisabled}
          >
            {isSubmitting ? '수정 중…' : '수정 완료'}
          </Button>
        </div>
      </Modal.Footer>
    </>
  );
}
