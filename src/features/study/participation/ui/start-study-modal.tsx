'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { sendGTMEvent } from '@next/third-parties/google';
import { XIcon, Calendar, Users, MessageCircle } from 'lucide-react'; // 아이콘 추가
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/ui/button';
import { SingleDropdown, MultiDropdown } from '@/components/ui/dropdown';
import FormField from '@/components/ui/form/form-field';
import { BaseInput, TextAreaInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

import { GroupItems } from '@/components/ui/toggle';
import { useUserProfileQuery } from '@/entities/user/model/use-user-profile-query';
import {
  useAvailableStudyTimesQuery,
  useStudySubjectsQuery,
  useTechStacksQuery,
  useUpdateUserProfileMutation,
  useUpdateUserProfileInfoMutation,
} from '@/features/my-page/model/use-update-user-profile-mutation';

import { usePhoneVerificationStore } from '@/features/phone-verification/model/store';
import PhoneVerificationModal from '@/features/phone-verification/ui/phone-verification-modal';

import {
  StartStudyFormSchema,
  type StartStudyFormValues,
  buildStartStudyDefaultValues,
  toJoinStudyRequest,
} from '@/features/study/participation/model/start-study-form.schema';
import { useJoinStudyMutation } from '@/features/study/participation/model/use-participation-query';

interface StartStudyModalProps {
  memberId: number;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// 컴팩트한 스터디 설명 컴포넌트
function StudyGuideCard() {
  return (
    <div className="bg-fill-neutral-subtle-default rounded-100 flex flex-col gap-200 p-300">
      <h3 className="font-designer-16b text-text-strong flex items-center gap-75">
        🔥 1:1 CS 스터디, 이렇게 진행돼요!
      </h3>
      <div className="flex flex-col gap-150">
        <div className="flex items-start gap-100">
          <div className="bg-fill-brand-subtle-default rounded-50 mt-[2px] p-50">
            <Users className="text-text-brand h-[14px] w-[14px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-designer-14b text-text-strong">
              파트너 매칭
            </span>
            <span className="font-designer-13r text-text-subtle">
              주말 동안 나와 딱 맞는 파트너가 매칭돼요.
            </span>
          </div>
        </div>
        <div className="flex items-start gap-100">
          <div className="bg-fill-brand-subtle-default rounded-50 mt-[2px] p-50">
            <Calendar className="text-text-brand h-[14px] w-[14px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-designer-14b text-text-strong">
              월~금 매일 10분
            </span>
            <span className="font-designer-13r text-text-subtle">
              한 주간 정해진 시간에 온라인으로 만나요.
            </span>
          </div>
        </div>
        <div className="flex items-start gap-100">
          <div className="bg-fill-brand-subtle-default rounded-50 mt-[2px] p-50">
            <MessageCircle className="text-text-brand h-[14px] w-[14px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-designer-14b text-text-strong">
              발표와 질문
            </span>
            <span className="font-designer-13r text-text-subtle">
              하루씩 번갈아가며 설명하고 질문하는 시간을 가져요.
            </span>
          </div>
        </div>
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
  const { isVerified, setVerified } = usePhoneVerificationStore();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const [internalOpen, setInternalOpen] = useState(false);
  const isModalOpen = open ?? internalOpen;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !isVerified) {
      setIsVerificationModalOpen(true);
      if (onOpenChange) onOpenChange(false);
      setInternalOpen(false);

      return;
    }

    if (onOpenChange) {
      onOpenChange(isOpen);
    } else {
      setInternalOpen(isOpen);
    }

    if (isOpen) {
      sendGTMEvent({
        event: 'study_apply_modal_open',
        location: 'home',
      });
    }
  };

  // 모달이 열릴 때 인증 여부 체크 (외부 제어 open prop 대응)
  useEffect(() => {
    if (isModalOpen && !isVerified) {
      setIsVerificationModalOpen(true);
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setInternalOpen(false);
      }
    }
  }, [isModalOpen, isVerified, onOpenChange]);

  const handleVerificationComplete = (phoneNumber: string) => {
    setVerified(phoneNumber);
    setIsVerificationModalOpen(false);

    if (onOpenChange) {
      onOpenChange(true);
    } else {
      setInternalOpen(true);
    }
  };

  return (
    <>
      <Modal.Root open={isModalOpen} onOpenChange={handleOpenChange}>
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
              onClose={() => handleOpenChange(false)}
            />
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <PhoneVerificationModal
        open={isVerificationModalOpen}
        onOpenChange={setIsVerificationModalOpen}
        onVerificationComplete={handleVerificationComplete}
        memberId={memberId}
      />
    </>
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
  const { mutate: updateProfile } = useUpdateUserProfileMutation(memberId);
  const { mutate: updateProfileInfo } =
    useUpdateUserProfileInfoMutation(memberId);

  const { data: profile } = useUserProfileQuery(memberId);

  const methods = useForm<StartStudyFormValues>({
    resolver: zodResolver(StartStudyFormSchema),
    mode: 'onChange',
    defaultValues: buildStartStudyDefaultValues(profile),
  });

  const { handleSubmit, reset } = methods;

  // 프로필 정보가 로드되면 폼 기본값 업데이트
  useEffect(() => {
    if (profile) {
      const defaultValues = buildStartStudyDefaultValues(profile);
      reset(defaultValues);
    }
  }, [profile, reset]);

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

  const onValidSubmit = (values: StartStudyFormValues) => {
    const body = toJoinStudyRequest(memberId, values);

    // 프로필 정보와 비교하여 변경된 항목만 업데이트
    const profileUpdates: {
      profile?: Parameters<typeof updateProfile>[0];
      profileInfo?: Parameters<typeof updateProfileInfo>[0];
    } = {};

    // memberProfile 업데이트 (githubLink, blogOrSnsLink, techStackIds)
    if (profile) {
      const githubChanged =
        values.githubLink !== (profile.memberProfile.githubLink?.url ?? '');
      const blogChanged =
        values.blogOrSnsLink !==
        (profile.memberProfile.blogOrSnsLink?.url ?? '');
      const techStacksChanged =
        JSON.stringify(values.techStackIds.sort()) !==
        JSON.stringify(
          profile.memberProfile.techStacks
            ?.map((t) => String(t.techStackId))
            .sort() ?? [],
        );

      if (githubChanged || blogChanged || techStacksChanged) {
        profileUpdates.profile = {
          nickname: profile.memberProfile.nickname,
          githubLink: values.githubLink || undefined,
          blogOrSnsLink: values.blogOrSnsLink || undefined,
          techStackIds: values.techStackIds.map(Number),
        };
      }

      // memberInfo 업데이트 (selfIntroduction, studyPlan, preferredStudySubjectId, availableStudyTimeIds)
      const selfIntroChanged =
        values.selfIntroduction !== (profile.memberInfo.selfIntroduction ?? '');
      const studyPlanChanged =
        values.studyPlan !== (profile.memberInfo.studyPlan ?? '');
      const subjectChanged =
        values.preferredStudySubjectId !==
        (profile.memberInfo.preferredStudySubject?.studySubjectId ?? '');
      const timesChanged =
        JSON.stringify(values.availableStudyTimeIds.sort()) !==
        JSON.stringify(
          profile.memberInfo.availableStudyTimes
            ?.map((t) => String(t.id))
            .sort() ?? [],
        );

      if (
        selfIntroChanged ||
        studyPlanChanged ||
        subjectChanged ||
        timesChanged
      ) {
        profileUpdates.profileInfo = {
          selfIntroduction: values.selfIntroduction,
          studyPlan: values.studyPlan,
          preferredStudySubjectId: values.preferredStudySubjectId,
          availableStudyTimeIds: values.availableStudyTimeIds.map(Number),
          // 기존 프로필 정보 유지
          jobs:
            profile.memberInfo.jobs?.map((j) => j.job ?? '').filter(Boolean) ??
            [],
          career: profile.memberInfo.career?.career ?? '',
          studyFormatTypes:
            profile.memberInfo.studyFormatTypes
              ?.map((s) => s.studyFormatType ?? '')
              .filter(Boolean) ?? [],
          goal: profile.memberInfo.goal ?? '',
        };
      }
    }

    // 프로필 업데이트와 스터디 신청을 순차적으로 실행
    const updateProfilePromise = profileUpdates.profile
      ? new Promise<void>((resolve, reject) => {
          updateProfile(profileUpdates.profile!, {
            onSuccess: () => resolve(),
            onError: reject,
          });
        })
      : Promise.resolve();

    const updateProfileInfoPromise = profileUpdates.profileInfo
      ? new Promise<void>((resolve, reject) => {
          updateProfileInfo(profileUpdates.profileInfo!, {
            onSuccess: () => resolve(),
            onError: reject,
          });
        })
      : Promise.resolve();

    Promise.all([updateProfilePromise, updateProfileInfoPromise])
      .then(() => {
        // 프로필 업데이트 완료 후 스터디 신청
        joinStudy(body, {
          onSuccess: () => {
            sendGTMEvent({
              event: 'study_apply_success',
              location: 'home',
              preferred_subject: values.preferredStudySubjectId,
              available_times_count: values.availableStudyTimeIds.length,
              tech_stacks_count: values.techStackIds.length,
            });
            alert('스터디 신청이 완료되었습니다!');
            onClose();
            router.refresh();
          },
          onError: () => {
            sendGTMEvent({
              event: 'study_apply_error',
              location: 'home',
            });
            alert('스터디 신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
          },
        });
      })
      .catch(() => {
        // 프로필 업데이트 실패해도 스터디 신청은 진행
        joinStudy(body, {
          onSuccess: () => {
            sendGTMEvent({
              event: 'study_apply_success',
              location: 'home',
              preferred_subject: values.preferredStudySubjectId,
              available_times_count: values.availableStudyTimeIds.length,
              tech_stacks_count: values.techStackIds.length,
            });
            alert('스터디 신청이 완료되었습니다!');
            onClose();
            router.refresh();
          },
          onError: () => {
            sendGTMEvent({
              event: 'study_apply_error',
              location: 'home',
            });
            alert('스터디 신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
          },
        });
      });
  };

  return (
    <>
      <Modal.Body className="flex flex-col gap-500">
        {/* 기존 목록형 설명 제거하고 카드형 설명으로 대체 */}
        <StudyGuideCard />

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

            {/* 전화번호 입력 필드 제거 (값은 useEffect에서 자동 주입) */}

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
              <GroupItems options={timeOptions} />
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
              required
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
