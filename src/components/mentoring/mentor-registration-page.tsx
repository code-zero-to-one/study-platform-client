'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Info, ShieldCheck, UserRoundPlus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import MentorDetailPage from '@/components/mentoring/mentor-detail-page';
import MentoringGuideModal from '@/components/mentoring/mentoring-guide-modal';
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
  CONSULTING_DURATION_DROPDOWN_OPTIONS,
  CONTACT_COUNTRY_DROPDOWN_OPTIONS,
  JOB_GROUP_OPTIONS,
  JOB_TITLE_OPTIONS,
  MENTOR_CATEGORY_OPTIONS,
  MENTOR_SKILL_TAG_PRESETS,
} from '@/features/mentoring/model/mentor-setting-options';
import {
  createDefaultMentorSettings,
  type MentorSettlementDraft,
} from '@/features/mentoring/model/mentor-settings';
import { useAuthReady } from '@/hooks/common/use-auth';
import { getMentorSettings } from '@/mocks/mentoring-mock-data';
import { useToastStore } from '@/stores/use-toast-store';
import {
  createMentorProfileFromRegistration,
  useMentorDirectoryStore,
} from '@/stores/useMentorDirectoryStore';
import { useUserStore } from '@/stores/useUserStore';
import {
  mentorRegistrationSchema,
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

interface MethodField {
  enabledField:
    | 'noteEnabled'
    | 'phoneEnabled'
    | 'onlineEnabled'
    | 'offlineEnabled';
  priceField: 'notePrice' | 'phonePrice' | 'onlinePrice' | 'offlinePrice';
  label: string;
  description: string;
  policySummary: string;
  durationField?: 'onlineDurationMinutes' | 'offlineDurationMinutes';
  durationOptions?: { value: string; label: string }[];
}

const METHOD_FIELDS: MethodField[] = [
  {
    enabledField: 'noteEnabled',
    priceField: 'notePrice',
    label: '쪽지상담',
    description:
      '미리 질문/고민/자료를 전달하고 텍스트로 빠르게 답변받는 비동기 상담입니다.',
    policySummary: '결제 후 멘토의 첫 답장이 수락 처리됩니다.',
  },
  {
    enabledField: 'phoneEnabled',
    priceField: 'phonePrice',
    label: '15분 전화상담',
    description:
      '허들을 낮춘 빠른 상담 방식입니다. 질문/자료를 선제출하고 15분 내 핵심 피드백을 받습니다.',
    policySummary:
      '결제 후 멘토 수락이 필요하며, 48시간 내 미응답 시 자동 거절됩니다.',
  },
  {
    enabledField: 'onlineEnabled',
    priceField: 'onlinePrice',
    durationField: 'onlineDurationMinutes',
    durationOptions: [
      { value: '30', label: '30분' },
      { value: '60', label: '60분' },
    ],
    label: '온라인상담',
    description:
      '화면/코드를 함께 보며 피드백을 주고받는 방식입니다. 30/60분 중 선택합니다.',
    policySummary:
      '결제 후 멘토 수락이 필요하며, 48시간 내 미응답 시 자동 거절됩니다.',
  },
  {
    enabledField: 'offlineEnabled',
    priceField: 'offlinePrice',
    durationField: 'offlineDurationMinutes',
    label: '대면상담',
    description:
      '커피챗/심층 상담 방식입니다. 필요 시 세일즈 제안 목적 상담으로도 활용할 수 있습니다.',
    policySummary:
      '결제 후 멘토 수락이 필요하며, 48시간 내 미응답 시 자동 거절됩니다.',
  },
];

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
      <div className="bg-background-accent-rose-subtle rounded-500 mx-auto mb-200 flex h-500 w-500 items-center justify-center">
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
const toSafeInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.round(parsed);
};

const toDurationMinutes = (
  value: unknown,
  fallback: 30 | 60 | 90,
): 30 | 60 | 90 => {
  const parsed = Number(value);
  if (parsed === 30 || parsed === 60 || parsed === 90) {
    return parsed;
  }

  return fallback;
};

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
  const nextMentorId = useMentorDirectoryStore((state) => state.nextMentorId);
  const mentorStoreHydrated = useMentorDirectoryStore(
    (state) => state.hasHydrated,
  );
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(640);
  const [isResizing, setIsResizing] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const panelWidthRef = useRef(640);

  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const measure = () => setHeaderHeight(header.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidthRef.current;
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const newWidth = Math.max(
        360,
        Math.min(Math.floor(window.innerWidth * 0.75), startWidth + delta),
      );
      panelWidthRef.current = newWidth;
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
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
      schemaVersion: 3,
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
      schemaVersion: 3,
    };

    const mentorId = registerMentorProfile(memberId, finalizedValues);
    showToast('멘토링 설정이 저장되었습니다.', 'success');
    router.push(`/mentoring/${mentorId}`);
  };

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelModalOpen(true);

      return;
    }

    router.push('/mentoring-management');
  };

  const categories = watch('categories');
  const settlementDraft = watch('settlementDraft');
  const mentoringTitle = watch('mentoringTitle');
  const jobGroup = watch('jobGroup');
  const jobTitle = watch('jobTitle');
  const careerYears = watch('careerYears');
  const skillTags = watch('skillTags');
  const companyName = watch('companyName');
  const hideCompanyName = watch('hideCompanyName');
  const detailedDescription = watch('detailedDescription');
  const interviewQuestions = watch('interviewQuestions');
  const preNotice = watch('preNotice');
  const notePrice = watch('notePrice');
  const phonePrice = watch('phonePrice');
  const onlinePrice = watch('onlinePrice');
  const offlinePrice = watch('offlinePrice');
  const onlineDurationMinutes = watch('onlineDurationMinutes');
  const offlineDurationMinutes = watch('offlineDurationMinutes');
  const noteEnabled = watch('noteEnabled');
  const phoneEnabled = watch('phoneEnabled');
  const onlineEnabled = watch('onlineEnabled');
  const offlineEnabled = watch('offlineEnabled');
  const contactCountryCode = watch('contactCountryCode');
  const contactPhone = watch('contactPhone');
  const contactEmail = watch('contactEmail');
  const maxParticipants = watch('maxParticipants');
  const schedule = watch('schedule');
  const holidays = watch('holidays');

  const handleAddCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) return;
    const allExisting = [
      ...MENTOR_CATEGORY_OPTIONS,
      ...customCategories,
    ] as string[];
    if (allExisting.includes(trimmed)) {
      setCustomCategoryInput('');

      return;
    }
    setCustomCategories((prev) => [...prev, trimmed]);
    setValue('categories', [...categories, trimmed], dirtyValidationOptions);
    setCustomCategoryInput('');
  };

  const handleRemoveCustomCategory = (cat: string) => {
    setCustomCategories((prev) => prev.filter((c) => c !== cat));
    setValue(
      'categories',
      categories.filter((c) => c !== cat),
      dirtyValidationOptions,
    );
  };

  const handleToggleCustomCategory = (cat: string) => {
    const next = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    setValue('categories', next, dirtyValidationOptions);
  };
  const needsSchedule = phoneEnabled || onlineEnabled || offlineEnabled;
  const interviewQuestionError =
    (errors.interviewQuestions?.message as string | undefined) ??
    (errors.interviewQuestions?.[0]?.message as string | undefined);
  const previewMentorId =
    memberId !== undefined
      ? (mentorIdByMember[memberId] ?? nextMentorId)
      : nextMentorId;
  const previewFormValues = useMemo<MentorRegistrationFormValues>(() => {
    const defaults = createDefaultMentorSettings();

    return {
      ...defaults,
      contactCountryCode: contactCountryCode ?? defaults.contactCountryCode,
      contactPhone: contactPhone ?? '',
      contactEmail: contactEmail ?? '',
      categories,
      mentoringTitle: mentoringTitle ?? '',
      jobGroup: jobGroup ?? '',
      jobTitle: jobTitle ?? '',
      careerYears: careerYears ?? '',
      skillTags,
      companyName: companyName ?? '',
      hideCompanyName: hideCompanyName ?? false,
      maxParticipants: Math.min(
        10,
        Math.max(1, toSafeInteger(maxParticipants, defaults.maxParticipants)),
      ),
      noteEnabled: noteEnabled ?? defaults.noteEnabled,
      notePrice: toSafeInteger(notePrice, defaults.notePrice),
      phoneEnabled: phoneEnabled ?? defaults.phoneEnabled,
      phonePrice: toSafeInteger(phonePrice, defaults.phonePrice),
      onlineEnabled: onlineEnabled ?? defaults.onlineEnabled,
      onlinePrice: toSafeInteger(onlinePrice, defaults.onlinePrice),
      onlineDurationMinutes: toDurationMinutes(
        onlineDurationMinutes,
        defaults.onlineDurationMinutes,
      ),
      offlineEnabled: offlineEnabled ?? defaults.offlineEnabled,
      offlinePrice: toSafeInteger(offlinePrice, defaults.offlinePrice),
      offlineDurationMinutes: toDurationMinutes(
        offlineDurationMinutes,
        defaults.offlineDurationMinutes,
      ),
      schedule: schedule ?? defaults.schedule,
      holidays: holidays ?? [],
      detailedDescription: detailedDescription ?? '',
      interviewQuestions: interviewQuestions ?? [],
      preNotice: preNotice ?? '',
      settlementDraft: settlementDraft ?? null,
      schemaVersion: 3,
      updatedAt: new Date().toISOString(),
    };
  }, [
    categories,
    companyName,
    contactCountryCode,
    contactEmail,
    contactPhone,
    detailedDescription,
    hideCompanyName,
    holidays,
    interviewQuestions,
    jobGroup,
    jobTitle,
    maxParticipants,
    mentoringTitle,
    noteEnabled,
    notePrice,
    offlineDurationMinutes,
    offlineEnabled,
    offlinePrice,
    onlineDurationMinutes,
    onlineEnabled,
    onlinePrice,
    phoneEnabled,
    phonePrice,
    preNotice,
    schedule,
    settlementDraft,
    skillTags,
    careerYears,
  ]);
  const previewMentor = useMemo(() => {
    return createMentorProfileFromRegistration(
      previewMentorId,
      previewFormValues,
      previewFormValues.updatedAt,
    );
  }, [previewFormValues, previewMentorId]);

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

  return (
    <div
      className={cn(PAGE_CONTAINER_CLASS, isResizing && 'select-none')}
      style={isResizing ? { cursor: 'col-resize' } : undefined}
    >
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

      <div
        className={cn(
          isPreviewOpen && !isResizing && 'transition-[padding] duration-300',
          isPreviewOpen && 'xl:pr-[var(--preview-panel-width)]',
        )}
        style={
          isPreviewOpen
            ? ({ '--preview-panel-width': `${panelWidth}px` } as React.CSSProperties)
            : undefined
        }
      >
        <form
          onSubmit={handleSubmit(handleSave)}
          className="space-y-200 pb-400"
        >
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
                    setValue(
                      'contactPhone',
                      sanitizeDigits(event.target.value),
                      {
                        ...dirtyValidationOptions,
                      },
                    );
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
            >
              {customCategories.map((cat) => {
                const selected = categories.includes(cat);

                return (
                  <div
                    key={cat}
                    className={cn(
                      'rounded-150 font-designer-14m inline-flex items-center gap-50 border px-150 py-100 transition-colors',
                      selected
                        ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                        : 'border-border-default bg-fill-neutral-subtle-default text-text-default',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleCustomCategory(cat)}
                    >
                      {cat}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomCategory(cat)}
                      className="text-text-subtle hover:text-text-default"
                      aria-label={`${cat} 삭제`}
                    >
                      <X className="h-12 w-12" />
                    </button>
                  </div>
                );
              })}
            </ToggleGroup>

            <div className="mt-125 flex gap-100">
              <BaseInput
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomCategory();
                  }
                }}
                placeholder="카테고리 직접 입력 후 추가"
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleAddCustomCategory}
                className="font-designer-14m text-text-brand border-border-brand rounded-100 border px-150 py-100 whitespace-nowrap"
              >
                추가
              </button>
            </div>

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

          <Section
            title="가격 / 시간"
            description="상담 방식별 금액과 진행 시간을 설정해주세요."
          >
            <div className="rounded-125 border-border-warning bg-background-accent-yellow-subtle mb-200 border px-150 py-125">
              <p className="font-designer-13b text-text-default mb-50">
                멘토 테스트는 15분 전화상담으로 시작해보세요.
              </p>
              <p className="font-designer-13r text-text-subtle leading-relaxed">
                쪽지/전화 포맷은 멘티의 시작 허들을 낮추는 용도입니다.
                신청서에서 질문/고민/자료를 먼저 받아 빠르게 답변할 수 있도록
                운영해보세요.
              </p>
            </div>

            <div className="mt-200 flex flex-col gap-150">
              {METHOD_FIELDS.map((field) => {
                const enabled = watch(field.enabledField);

                return (
                  <article
                    key={field.enabledField}
                    className={cn(
                      'rounded-100 border-border-default border p-150',
                      enabled
                        ? 'bg-background-default'
                        : 'bg-background-alternative opacity-80',
                    )}
                  >
                    <div className="mb-125 flex items-start justify-between gap-150">
                      <div>
                        <p className="font-designer-16b text-text-default">
                          {field.label}
                        </p>
                        <p className="font-designer-13r text-text-subtle mt-25">
                          {field.description}
                        </p>
                        <p className="font-designer-12r text-text-warning mt-50 leading-relaxed">
                          {field.policySummary}
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

                    <div>
                      <p className="font-designer-13r text-text-subtle mb-50">
                        회당 가격 (원)
                      </p>
                      <BaseInput
                        type="number"
                        disabled={!enabled}
                        {...register(field.priceField)}
                        placeholder="가격(원)"
                      />
                    </div>

                    {field.durationField && (
                      <div className="mt-125">
                        <p className="font-designer-13r text-text-subtle mb-50">
                          상담 시간
                        </p>
                        <Controller
                          name={field.durationField}
                          control={control}
                          render={({ field: durationField }) => (
                            <SingleDropdown
                              options={
                                field.durationOptions ??
                                CONSULTING_DURATION_DROPDOWN_OPTIONS
                              }
                              value={String(durationField.value)}
                              onChange={(value) =>
                                durationField.onChange(Number(value ?? '60'))
                              }
                              placeholder="상담 시간"
                            />
                          )}
                        />
                      </div>
                    )}

                    {field.enabledField === 'phoneEnabled' && (
                      <p className="font-designer-12r text-text-subtle mt-100">
                        전화상담은 15분 고정으로 운영됩니다.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
            <FieldError
              message={
                errors.noteEnabled?.message ??
                errors.notePrice?.message ??
                errors.phonePrice?.message ??
                errors.onlinePrice?.message ??
                errors.onlineDurationMinutes?.message ??
                errors.offlinePrice?.message ??
                errors.offlineDurationMinutes?.message
              }
            />
          </Section>

          <Section
            title="스케줄 설정"
            description="전화/온라인/대면 상담 가능한 요일/시간(30분 단위)을 선택해주세요."
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
            {needsSchedule && (
              <FieldError
                message={errors.schedule?.message as string | undefined}
              />
            )}
          </Section>

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

          <Section
            title="멘토 소개 인터뷰 질문"
            description="멘티가 상담 전에 답해오면 좋은 질문을 한 줄에 하나씩 작성해주세요."
          >
            <Controller
              name="interviewQuestions"
              control={control}
              render={({ field }) => (
                <textarea
                  value={field.value.join('\n')}
                  onChange={(event) => {
                    const nextQuestions = event.target.value
                      .split('\n')
                      .map((question) => question.trim())
                      .filter((question) => question.length > 0);
                    field.onChange(nextQuestions);
                  }}
                  className={cn(
                    'font-designer-14r rounded-100 border-border-default bg-background-default',
                    'text-text-default min-h-[180px] w-full resize-y border p-150',
                    'placeholder:text-text-subtlest focus:border-border-brand focus:outline-none',
                  )}
                  placeholder={
                    '예) 현재 목표 직무는 무엇인가요?\n예) 최근 3개월간 가장 막혔던 문제는 무엇인가요?\n예) 이번 상담에서 꼭 해결하고 싶은 1가지는 무엇인가요?'
                  }
                />
              )}
            />
            <p className="font-designer-12r text-text-subtle mt-75">
              최대 8개까지 작성할 수 있습니다.
            </p>
            <FieldError message={interviewQuestionError} />
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

          <div className="flex justify-end gap-100 pt-100">
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
        </form>
      </div>

      {!isPreviewOpen && (
        <>
          {/* xl: 오른쪽 끝에 붙는 세로 탭 버튼 */}
          <button
            type="button"
            className="bg-fill-brand-default-default text-text-inverse border-border-brand rounded-l-150 font-designer-13b shadow-2 fixed right-0 z-30 hidden items-center gap-100 border py-300 px-125 xl:flex xl:flex-col"
            style={
              headerHeight > 0
                ? { top: `calc(50% + ${headerHeight / 2}px)`, transform: 'translateY(-50%)' }
                : { top: '50%', transform: 'translateY(-50%)' }
            }
            onClick={() => setIsPreviewOpen(true)}
            aria-label="실시간 미리보기 열기"
          >
            <Eye className="h-16 w-16" />
            <span className="[writing-mode:vertical-rl] tracking-widest">
              미리보기
            </span>
          </button>
          {/* 모바일/태블릿: 우측 하단 FAB */}
          <button
            type="button"
            className="bg-fill-brand-default-default text-text-inverse border-border-brand font-designer-14b shadow-3 fixed right-200 bottom-200 z-40 flex items-center gap-75 rounded-500 border px-200 py-150 xl:hidden"
            onClick={() => setIsPreviewOpen(true)}
            aria-label="실시간 미리보기 열기"
          >
            <Eye className="h-16 w-16" />
            미리보기
          </button>
        </>
      )}

      {isPreviewOpen && (
        <button
          type="button"
          className="bg-background-dimmer fixed inset-0 z-40 xl:hidden"
          onClick={() => setIsPreviewOpen(false)}
          aria-label="실시간 미리보기 닫기"
        />
      )}

      <aside
        className={cn(
          'bg-background-default border-border-subtle fixed right-0 z-40 flex w-full flex-col border-l xl:w-[var(--preview-panel-width)]',
          !isResizing && 'transition-transform duration-300',
          isPreviewOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={
          {
            '--preview-panel-width': `${panelWidth}px`,
            top: headerHeight > 0 ? `${headerHeight}px` : 0,
            height:
              headerHeight > 0
                ? `calc(100dvh - ${headerHeight}px)`
                : '100dvh',
          } as React.CSSProperties
        }
      >
        {/* 리사이즈 핸들 (xl 이상에서만) */}
        <div
          className="group absolute top-0 left-0 z-10 hidden h-full w-[8px] cursor-col-resize xl:block"
          onMouseDown={handleResizeStart}
        >
          <div className="bg-border-subtle group-hover:bg-border-brand absolute top-0 left-[3px] h-full w-[2px] transition-colors" />
          <div className="border-border-subtle bg-background-default group-hover:border-border-brand absolute top-1/2 left-0 flex h-[40px] w-[8px] -translate-y-1/2 flex-col items-center justify-center gap-[3px] rounded-l-[4px] border border-r-0 transition-colors">
            <span className="bg-border-default group-hover:bg-border-brand h-[12px] w-[2px] rounded-full transition-colors" />
          </div>
        </div>

        {/* 미리보기 패널 헤더 */}
        <div className="border-border-subtle bg-background-default flex shrink-0 items-center justify-between border-b px-250 py-150">
          <div className="flex items-center gap-100">
            <Eye className="text-text-brand h-16 w-16" />
            <span className="font-designer-14b text-text-default">
              실시간 미리보기
            </span>
            <span className="font-designer-12r text-text-subtlest">
              · 실제 화면과 동일하게 표시됩니다
            </span>
          </div>
          <button
            type="button"
            className="font-designer-13b text-text-subtle hover:text-text-default border-border-default rounded-75 flex items-center gap-50 border px-100 py-75 transition-colors"
            onClick={() => setIsPreviewOpen(false)}
            aria-label="실시간 미리보기 닫기"
          >
            <X className="h-14 w-14" />
            닫기
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="[&_a]:pointer-events-none [&_button]:pointer-events-none">
            <MentorDetailPage mentor={previewMentor} previewMode />
          </div>
        </div>
      </aside>

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
