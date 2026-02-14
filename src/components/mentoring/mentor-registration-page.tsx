'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Info, ShieldCheck, UserRoundPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import MentoringGuideModal from '@/components/mentoring/mentoring-guide-modal';
import HolidayEditor from '@/components/mentoring/settings/holiday-editor';
import SettlementRegisterModal from '@/components/mentoring/settings/settlement-register-modal';
import WeeklyScheduleGrid from '@/components/mentoring/settings/weekly-schedule-grid';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import SingleDropdown from '@/components/ui/dropdown/single';
import SelectableTagsInput from '@/components/ui/form/multi-item-selector';
import { BaseInput } from '@/components/ui/input';
import ToggleGroup from '@/components/ui/toggle/group';
import { hasMentorWritePermission } from '@/features/mentoring/model/mentor-permission';
import {
  CAREER_YEAR_OPTIONS,
  CONTACT_COUNTRY_DROPDOWN_OPTIONS,
  JOB_GROUP_OPTIONS,
  JOB_TITLE_OPTIONS,
  MAX_PARTICIPANT_OPTIONS,
  MENTOR_CATEGORY_OPTIONS,
  MENTOR_SKILL_TAG_PRESETS,
  SESSION_DURATION_DROPDOWN_OPTIONS,
} from '@/features/mentoring/model/mentor-setting-options';
import {
  createDefaultMentorSettings,
  type MentorSettlementDraft,
} from '@/features/mentoring/model/mentor-settings';
import { useAuthReady } from '@/hooks/common/use-auth';
import { getMentorSettings } from '@/mocks/mentoring-mock-data';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useUserStore } from '@/stores/useUserStore';
import {
  mentorRegistrationSchema,
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

const METHOD_FIELDS = [
  {
    enabledField: 'chatEnabled',
    priceField: 'chatPrice',
    label: '채팅상담',
    description: '일정 선택 없이 텍스트 질문을 주고받습니다.',
  },
  {
    enabledField: 'callEnabled',
    priceField: 'callPrice',
    label: '전화/온라인 상담',
    description: '요일/시간 스케줄을 선택해 예약 멘토링을 진행합니다.',
  },
  {
    enabledField: 'offlineEnabled',
    priceField: 'offlinePrice',
    label: '대면 컨설팅',
    description: '오프라인 또는 화상으로 깊이 있는 상담을 제공합니다.',
  },
] as const;

const DEFAULT_VALUES: MentorRegistrationFormInputValues = {
  ...createDefaultMentorSettings(),
  preNotice: '',
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="font-designer-13r text-text-error mt-75">{message}</p>;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-150 border-border-subtle bg-background-default border p-250">
      <h2 className="font-designer-20b text-text-default mb-75">{title}</h2>
      {description && (
        <p className="font-designer-13r text-text-subtle mb-150">
          {description}
        </p>
      )}
      {children}
    </section>
  );
}

function GuardCard({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section className="rounded-200 border-border-subtle bg-background-default mx-auto max-w-[720px] border px-300 py-400 text-center">
      <div className="bg-background-accent-rose-subtle mx-auto mb-200 flex h-500 w-500 items-center justify-center rounded-full">
        <ShieldCheck className="text-text-brand h-28 w-28" />
      </div>
      <h1 className="font-designer-24b text-text-strong mb-100">{title}</h1>
      <p className="font-designer-14r text-text-subtle mb-300">{description}</p>
      <Link href={ctaHref}>
        <Button color="primary" size="large">
          {ctaLabel}
        </Button>
      </Link>
    </section>
  );
}

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

const PAGE_CONTAINER_CLASS =
  'mx-auto w-full max-w-[1280px] px-150 py-400 sm:px-300 xl:px-400 xl:py-500';
const GUARD_CONTAINER_CLASS =
  'mx-auto w-full max-w-[1280px] px-150 py-500 sm:px-300 xl:px-400';

export default function MentorRegistrationPage() {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { isHydrated, isAuthenticated, memberId, data } = useAuthReady();
  const { tel } = useUserStore();
  const registerMentorProfile = useMentorDirectoryStore(
    (state) => state.registerMentorProfile,
  );
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const mentorStoreHydrated = useMentorDirectoryStore(
    (state) => state.hasHydrated,
  );
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const dirtyValidationOptions = {
    shouldValidate: true,
    shouldDirty: true,
  } as const;

  const {
    register,
    control,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<
    MentorRegistrationFormInputValues,
    unknown,
    MentorRegistrationFormValues
  >({
    resolver: zodResolver(mentorRegistrationSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (tel) {
      setValue('contactPhone', sanitizeDigits(tel), {
        shouldValidate: true,
      });
    }
  }, [setValue, tel]);

  useEffect(() => {
    if (!memberId || !mentorStoreHydrated) {
      return;
    }

    const mentorId = mentorIdByMember[memberId];
    if (!mentorId) {
      return;
    }

    const existingProfile = createdMentors.find(
      (mentor) => mentor.id === mentorId,
    );
    if (!existingProfile) {
      return;
    }

    const settings = getMentorSettings(existingProfile);
    reset({
      ...settings,
      updatedAt: settings.updatedAt || new Date().toISOString(),
      schemaVersion: 2,
    });
  }, [createdMentors, memberId, mentorIdByMember, mentorStoreHydrated, reset]);

  const canWriteMentorProfile = hasMentorWritePermission(data?.roleIds);

  const handleSave = (values: MentorRegistrationFormValues) => {
    if (!memberId) {
      showToast('로그인 정보를 확인할 수 없습니다.', 'error');

      return;
    }

    const finalizedValues: MentorRegistrationFormValues = {
      ...values,
      updatedAt: new Date().toISOString(),
      schemaVersion: 2,
    };

    registerMentorProfile(memberId, finalizedValues);
    showToast('멘토링 설정이 저장되었습니다.', 'success');
    router.push('/mentoring-management');
  };

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);

      return;
    }

    router.push('/mentoring-management');
  };

  if (!isHydrated) {
    return (
      <div className={GUARD_CONTAINER_CLASS}>
        <div className="rounded-200 bg-background-alternative h-[240px] animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={GUARD_CONTAINER_CLASS}>
        <GuardCard
          title="로그인 후 멘토 등록이 가능합니다"
          description="멘토 프로필을 생성하려면 먼저 로그인해주세요."
          ctaLabel="로그인하러 가기"
          ctaHref="/login"
        />
      </div>
    );
  }

  if (!canWriteMentorProfile) {
    return (
      <div className={GUARD_CONTAINER_CLASS}>
        <GuardCard
          title="멘토/관리자 권한이 필요합니다"
          description="이 페이지는 ROLE_MENTOR 또는 ROLE_ADMIN 권한 사용자만 접근할 수 있습니다."
          ctaLabel="멘토링 목록으로 이동"
          ctaHref="/mentoring"
        />
      </div>
    );
  }

  const categories = watch('categories');
  const settlementDraft = watch('settlementDraft');
  const callEnabled = watch('callEnabled');
  const offlineEnabled = watch('offlineEnabled');

  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <header className="mb-250 flex flex-col gap-150 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-75 flex items-center gap-100">
            <UserRoundPlus className="text-text-brand h-24 w-24" />
            <h1 className="font-designer-28b text-text-default">멘토링 설정</h1>
          </div>
          <p className="font-designer-14r text-text-subtle">
            입력한 정보는 멘토링 목록/상세/신청 화면에 즉시 반영됩니다.
          </p>
        </div>
        <button
          type="button"
          className="font-designer-14m text-text-subtle hover:text-text-default border-border-subtlest rounded-75 inline-flex items-center gap-50 self-start border px-100 py-75 sm:self-auto"
          onClick={() => setIsGuideOpen(true)}
        >
          <Info className="h-14 w-14" />
          멘토링 안내
        </button>
      </header>

      <form onSubmit={handleSubmit(handleSave)} className="space-y-200 pb-600">
        <Section title="기본 정보">
          <div className="grid grid-cols-1 gap-150 md:grid-cols-[220px_1fr]">
            <Controller
              name="contactCountryCode"
              control={control}
              render={({ field }) => (
                <SingleDropdown
                  options={CONTACT_COUNTRY_DROPDOWN_OPTIONS}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? '+82')}
                  placeholder="국가코드"
                />
              )}
            />
            <div>
              <BaseInput
                {...register('contactPhone')}
                onChange={(event) => {
                  setValue('contactPhone', sanitizeDigits(event.target.value), {
                    ...dirtyValidationOptions,
                  });
                }}
                placeholder="휴대폰 번호 입력"
              />
              <FieldError message={errors.contactPhone?.message} />
            </div>
          </div>

          <div className="mt-150">
            <BaseInput
              placeholder="연락 가능한 이메일 입력"
              {...register('contactEmail')}
            />
            <FieldError message={errors.contactEmail?.message} />
          </div>
        </Section>

        <Section title="카테고리" description="복수 선택 가능">
          <ToggleGroup
            multiple
            options={MENTOR_CATEGORY_OPTIONS.map((category) => ({
              value: category,
              label: category,
            }))}
            value={categories}
            onChange={(next) => {
              setValue(
                'categories',
                next.map((item) => String(item)),
                dirtyValidationOptions,
              );
            }}
            variant="square"
          />
          <FieldError message={errors.categories?.message} />
        </Section>

        <Section title="멘토링 정보">
          <div className="mb-150">
            <BaseInput
              placeholder="예) 개발자 취업 / 면접 / 이직 / 커리어 멘토링"
              {...register('mentoringTitle')}
            />
            <FieldError message={errors.mentoringTitle?.message} />
          </div>

          <div className="grid grid-cols-1 gap-150 sm:grid-cols-2 lg:grid-cols-3">
            <Controller
              name="jobGroup"
              control={control}
              render={({ field }) => (
                <SingleDropdown
                  options={JOB_GROUP_OPTIONS.map((value) => ({
                    value,
                    label: value,
                  }))}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? '')}
                  placeholder="멘토 직군"
                />
              )}
            />
            <Controller
              name="jobTitle"
              control={control}
              render={({ field }) => (
                <SingleDropdown
                  options={JOB_TITLE_OPTIONS.map((value) => ({
                    value,
                    label: value,
                  }))}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? '')}
                  placeholder="멘토 직무"
                />
              )}
            />
            <Controller
              name="careerYears"
              control={control}
              render={({ field }) => (
                <SingleDropdown
                  options={CAREER_YEAR_OPTIONS.map((value) => ({
                    value,
                    label: value,
                  }))}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? '')}
                  placeholder="멘토 경력"
                />
              )}
            />
          </div>
          <FieldError
            message={
              errors.jobGroup?.message ??
              errors.jobTitle?.message ??
              errors.careerYears?.message
            }
          />

          <div className="mt-150">
            <Controller
              name="skillTags"
              control={control}
              render={({ field }) => (
                <SelectableTagsInput
                  value={field.value}
                  onChange={field.onChange}
                  maxSelectable={5}
                  options={MENTOR_SKILL_TAG_PRESETS}
                />
              )}
            />
            <FieldError message={errors.skillTags?.message} />
          </div>

          <div className="mt-150">
            <BaseInput
              placeholder="현재 소속 회사명"
              {...register('companyName')}
            />
            <FieldError message={errors.companyName?.message} />
            <label className="font-designer-13r text-text-subtle mt-100 inline-flex items-center gap-75">
              <input
                type="checkbox"
                className="border-border-default rounded-50 accent-fill-brand-default-default size-200 border"
                {...register('hideCompanyName')}
              />
              회사명 비노출
            </label>
          </div>
        </Section>

        <Section title="가격 / 시간">
          <div className="mb-150 grid grid-cols-1 gap-100 md:grid-cols-2">
            <Controller
              name="sessionDurationMinutes"
              control={control}
              render={({ field }) => (
                <SingleDropdown
                  options={SESSION_DURATION_DROPDOWN_OPTIONS}
                  value={String(field.value)}
                  onChange={(value) => {
                    field.onChange(Number(value ?? '30'));
                  }}
                  placeholder="1회 시간"
                />
              )}
            />
            <Controller
              name="maxParticipants"
              control={control}
              render={({ field }) => (
                <SingleDropdown
                  options={MAX_PARTICIPANT_OPTIONS}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value ?? '1'))}
                  placeholder="1회 최대인원"
                />
              )}
            />
          </div>
          <FieldError
            message={
              errors.sessionDurationMinutes?.message ??
              errors.maxParticipants?.message
            }
          />

          <div className="mt-150 grid grid-cols-1 gap-125 sm:grid-cols-2 lg:grid-cols-3">
            {METHOD_FIELDS.map((field) => {
              const enabled = watch(field.enabledField);

              return (
                <article
                  key={field.enabledField}
                  className="rounded-100 border-border-default bg-background-alternative border p-125"
                >
                  <div className="mb-100 flex items-center justify-between gap-75">
                    <div>
                      <p className="font-designer-14b text-text-default">
                        {field.label}
                      </p>
                      <p className="font-designer-12r text-text-subtle">
                        {field.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setValue(field.enabledField, !enabled, {
                          ...dirtyValidationOptions,
                        })
                      }
                      className={cn(
                        'font-designer-13b rounded-100 border px-100 py-50',
                        enabled
                          ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                          : 'border-border-default bg-background-default text-text-subtle',
                      )}
                    >
                      {enabled ? '활성' : '비활성'}
                    </button>
                  </div>
                  <BaseInput
                    type="number"
                    disabled={!enabled}
                    {...register(field.priceField)}
                    placeholder="가격(원)"
                  />
                </article>
              );
            })}
          </div>
          <FieldError
            message={
              errors.chatEnabled?.message ??
              errors.chatPrice?.message ??
              errors.callPrice?.message ??
              errors.offlinePrice?.message
            }
          />
        </Section>

        <Section
          title="스케줄 설정"
          description="멘토링 가능한 요일/시간(30분 단위)을 선택해주세요."
        >
          <Controller
            name="schedule"
            control={control}
            render={({ field }) => (
              <WeeklyScheduleGrid
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {(callEnabled || offlineEnabled) && (
            <FieldError
              message={errors.schedule?.message as string | undefined}
            />
          )}
        </Section>

        <Controller
          name="holidays"
          control={control}
          render={({ field }) => (
            <HolidayEditor holidays={field.value} onChange={field.onChange} />
          )}
        />
        <FieldError message={errors.holidays?.message as string | undefined} />

        <Section title="멘토링 상세설명">
          <textarea
            {...register('detailedDescription')}
            className={cn(
              'font-designer-14r rounded-100 border-border-default bg-background-default',
              'text-text-default min-h-[220px] w-full resize-y border p-150',
              'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
            )}
            placeholder="멘토링 본문, 범위, 자기소개 등을 작성해주세요."
          />
          <FieldError message={errors.detailedDescription?.message} />
        </Section>

        <Section title="멘토링 사전 안내">
          <textarea
            {...register('preNotice')}
            className={cn(
              'font-designer-14r rounded-100 border-border-default bg-background-default',
              'text-text-default min-h-[180px] w-full resize-y border p-150',
              'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
            )}
            placeholder="수업 전 멘티에게 전달할 안내를 작성해주세요."
          />
          <FieldError message={errors.preNotice?.message} />
        </Section>

        <Section
          title="정산 정보"
          description="정산정보를 등록하면 멘토링 정산에 사용됩니다."
        >
          <div className="flex flex-col gap-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-designer-14r text-text-subtle">
                {settlementDraft
                  ? `${settlementDraft.accountHolder} / ${settlementDraft.accountNumber}`
                  : '아직 등록한 정산정보가 없어요.'}
              </p>
              {settlementDraft?.verified && (
                <p className="font-designer-13r text-text-success mt-50">
                  정산정보 인증 완료
                </p>
              )}
            </div>
            <Button
              type="button"
              color="outlined"
              size="small"
              className="w-full sm:w-auto"
              onClick={() => setIsSettlementModalOpen(true)}
            >
              {settlementDraft ? '정산정보 수정' : '정산정보 등록'}
            </Button>
          </div>
          <FieldError
            message={errors.settlementDraft?.message as string | undefined}
          />
        </Section>

        <div className="bg-background-default/95 border-border-subtle fixed right-0 bottom-0 left-0 border-t backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1280px] gap-100 px-150 py-125 sm:justify-end sm:px-300 xl:px-400">
            <Button
              type="button"
              color="secondary"
              size="large"
              className="flex-1 sm:flex-none"
              onClick={handleCancel}
            >
              취소
            </Button>
            <Button
              type="submit"
              color="primary"
              size="large"
              className="flex-1 sm:flex-none"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </div>
      </form>

      <MentoringGuideModal open={isGuideOpen} onOpenChange={setIsGuideOpen} />

      <SettlementRegisterModal
        open={isSettlementModalOpen}
        initialValue={settlementDraft ?? undefined}
        onOpenChange={setIsSettlementModalOpen}
        onSubmit={(draft: MentorSettlementDraft) => {
          setValue('settlementDraft', draft, dirtyValidationOptions);
          showToast('정산정보가 등록되었습니다.', 'success');
        }}
      />

      {isCancelModalOpen && (
        <div className="bg-background-dimmer fixed inset-0 z-50 flex items-center justify-center">
          <div className="rounded-150 bg-background-default w-full max-w-[420px] p-250">
            <h3 className="font-designer-20b text-text-default mb-75">
              작성 내용을 취소할까요?
            </h3>
            <p className="font-designer-14r text-text-subtle mb-200">
              저장하지 않고 이동하면 입력한 내용이 사라집니다.
            </p>
            <div className="flex flex-col-reverse gap-100 sm:flex-row sm:justify-end">
              <Button
                type="button"
                color="secondary"
                size="medium"
                className="w-full sm:w-auto"
                onClick={() => setIsCancelModalOpen(false)}
              >
                계속 작성
              </Button>
              <Button
                type="button"
                color="primary"
                size="medium"
                className="w-full sm:w-auto"
                onClick={() => router.push('/mentoring-management')}
              >
                나가기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
