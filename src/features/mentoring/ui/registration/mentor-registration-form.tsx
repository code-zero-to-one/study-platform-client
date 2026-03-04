'use client';

import {
  CircleCheck,
  Eye,
  Info,
  MessageCircle,
  Monitor,
  Phone,
  RotateCcw,
  Star,
  UserRound,
  Users,
} from 'lucide-react';
import { type ReactNode, useEffect, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import ChipButton from '@/components/ui/chip/chip-button';
import SingleDropdown from '@/components/ui/dropdown/single';
import FieldErrorText from '@/components/ui/form/field-error-text';
import FormSectionCard from '@/components/ui/form/form-section-card';
import SelectableTagsInput from '@/components/ui/form/multi-item-selector';
import { BaseInput } from '@/components/ui/input';
import BorderedTextarea from '@/components/ui/input/bordered-textarea';
import {
  CONSULTING_DURATION_DROPDOWN_OPTIONS,
  MENTOR_APPEAL_LINE_PRESETS,
} from '@/features/mentoring/model/mentor-setting-options';
import MentorMarkdownEditor from '@/features/mentoring/ui/registration/mentor-markdown-editor';
import WeeklyScheduleGrid from '@/features/mentoring/ui/settings/weekly-schedule-grid';
import {
  type MentorRegistrationFormProps,
  type MentorRegistrationMethodField,
} from '@/types/mentoring/registration-view';
import { MENTORING_TITLE_MAX_LENGTH } from '@/types/schemas/mentor-registration-schema';

const METHOD_FIELDS: MentorRegistrationMethodField[] = [
  {
    enabledField: 'noteEnabled',
    priceField: 'notePrice',
    label: '쪽지상담',
    description:
      '미리 질문/고민/자료를 전달하고 텍스트로 빠르게 답변받는 비동기 상담입니다.',
    policySummary: '결제 후 멘토의 첫 답장이 수락 처리됩니다.',
  },
  {
    enabledField: 'simpleEnabled',
    priceField: 'simplePrice',
    label: '간편상담',
    description:
      '허들을 낮춘 빠른 상담 방식입니다. 질문/자료를 선제출하고 15분 내 핵심 피드백을 받습니다.',
    policySummary:
      '결제 후 멘토 수락이 필요하며, 48시간 내 미응답 시 자동 거절됩니다.',
  },
  {
    enabledField: 'deepEnabled',
    priceField: 'deepPrice',
    durationField: 'deepDurationMinutes',
    durationOptions: [
      { value: '30', label: '30분' },
      { value: '60', label: '60분' },
    ],
    label: '심층상담',
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

const MIN_MENTORING_PRICE = 3000;
const MAX_MENTORING_PRICE = 1_000_000;
const PRICE_INPUT_STEP = 1000;
const PRICE_INPUT_CLASS =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

type FieldRequirementState = 'required' | 'optional';

const FIELD_REQUIREMENT_META: Record<
  FieldRequirementState,
  { label: string; className: string }
> = {
  required: {
    label: '필수',
    className: 'text-text-error',
  },
  optional: {
    label: '선택',
    className: 'text-text-subtle',
  },
};

const FieldRequirementBadge = ({ state }: { state: FieldRequirementState }) => {
  const meta = FIELD_REQUIREMENT_META[state];

  return (
    <span
      className={cn(
        'font-designer-12r border-border-subtle rounded-500 border px-75 py-25',
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
};

const METHOD_ICON_MAP: Record<
  MentorRegistrationMethodField['enabledField'],
  ReactNode
> = {
  noteEnabled: <MessageCircle className="h-16 w-16" />,
  simpleEnabled: <Phone className="h-16 w-16" />,
  deepEnabled: <Monitor className="h-16 w-16" />,
  offlineEnabled: <Users className="h-16 w-16" />,
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

const collectErrorMessages = (value: unknown): string[] => {
  if (!value || typeof value !== 'object') {
    return [];
  }

  const messages: string[] = [];
  const visited = new WeakSet<object>();
  const queue: unknown[] = [value];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || typeof node !== 'object') {
      continue;
    }

    if (visited.has(node)) {
      continue;
    }
    visited.add(node);

    if (Array.isArray(node)) {
      queue.push(...node);
      continue;
    }

    if (!isPlainObject(node)) {
      continue;
    }

    const message = node.message;
    if (typeof message === 'string') {
      const trimmed = message.trim();
      if (trimmed.length > 0) {
        messages.push(trimmed);
      }
    }

    Object.entries(node).forEach(([key, child]) => {
      if (key === 'ref') {
        return;
      }
      queue.push(child);
    });
  }

  return messages;
};

export default function MentorRegistrationForm({
  form,
  options,
  onCancel,
  onSubmit,
}: MentorRegistrationFormProps) {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const dirtyValidationOptions = {
    shouldValidate: true,
    shouldDirty: true,
  } as const;

  const jobGroup = watch('jobGroup');
  const jobTitle = watch('jobTitle');
  const careerYears = watch('careerYears');
  const skillTags = watch('skillTags');
  const noteEnabled = watch('noteEnabled');
  const hideCompanyName = watch('hideCompanyName');
  const listVisible = watch('listVisible');
  const simpleEnabled = watch('simpleEnabled');
  const deepEnabled = watch('deepEnabled');
  const offlineEnabled = watch('offlineEnabled');
  const methodEnabledState: Record<
    MentorRegistrationMethodField['enabledField'],
    boolean
  > = {
    noteEnabled,
    simpleEnabled,
    deepEnabled,
    offlineEnabled,
  };
  const jobGroupOptions = useMemo(() => {
    return options.jobGroups
      .filter((option) => option.active)
      .map((option) => ({
        value: option.code,
        label: option.label,
      }));
  }, [options.jobGroups]);
  const jobTitleOptions = useMemo(
    () =>
      options.jobTitles
        .filter((option) => option.active && option.jobGroupCode === jobGroup)
        .map((option) => ({
          value: option.code,
          label: option.label,
        })),
    [jobGroup, options.jobTitles],
  );
  const careerOptions = useMemo(
    () =>
      options.careers
        .filter((option) => option.active)
        .map((option) => ({
          value: option.code,
          label: option.label,
        })),
    [options.careers],
  );
  const coreKeywordOptions = useMemo(
    () =>
      options.coreKeywords
        .filter((keyword) => {
          if (!keyword.active) {
            return false;
          }

          const matchesJobGroup =
            keyword.jobGroupCodes.length === 0 ||
            keyword.jobGroupCodes.includes(jobGroup);
          const matchesJobTitle =
            keyword.jobTitleCodes.length === 0 ||
            keyword.jobTitleCodes.includes(jobTitle);

          return matchesJobGroup && matchesJobTitle;
        })
        .map((keyword) => ({
          value: keyword.code,
          label: keyword.label,
        })),
    [jobGroup, jobTitle, options.coreKeywords],
  );
  const coreKeywordValueSet = useMemo(
    () => new Set(coreKeywordOptions.map((option) => option.value)),
    [coreKeywordOptions],
  );
  const validJobTitleSet = useMemo(
    () => new Set(jobTitleOptions.map((option) => option.value)),
    [jobTitleOptions],
  );
  const validCareerSet = useMemo(
    () => new Set(careerOptions.map((option) => option.value)),
    [careerOptions],
  );

  const needsSchedule = simpleEnabled || deepEnabled || offlineEnabled;
  const interviewQuestionError =
    (errors.interviewQuestions?.message as string | undefined) ??
    (errors.interviewQuestions?.[0]?.message as string | undefined);
  const isSaveDisabled = !isValid || isSubmitting;
  const saveDisabledReasons = useMemo(() => {
    if (isSubmitting) {
      return ['저장 요청을 처리하는 중입니다. 잠시만 기다려주세요.'];
    }

    if (isValid) {
      return [];
    }

    const messages = Array.from(new Set(collectErrorMessages(errors))).slice(
      0,
      3,
    );

    if (messages.length > 0) {
      return messages;
    }

    return ['필수 항목을 다시 확인해주세요.'];
  }, [errors, isSubmitting, isValid]);

  useEffect(() => {
    if (!jobTitle) {
      return;
    }

    if (!validJobTitleSet.has(jobTitle)) {
      setValue('jobTitle', '', {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [jobTitle, setValue, validJobTitleSet]);

  useEffect(() => {
    if (!careerYears) {
      return;
    }

    if (!validCareerSet.has(careerYears)) {
      setValue('careerYears', '', {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [careerYears, setValue, validCareerSet]);

  useEffect(() => {
    const maxSelectable = Math.max(1, options.maxCoreKeywordCount);
    const nextSelected = skillTags
      .filter((code) => coreKeywordValueSet.has(code))
      .slice(0, maxSelectable);

    if (nextSelected.length === skillTags.length) {
      return;
    }

    setValue('skillTags', nextSelected, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [coreKeywordValueSet, options.maxCoreKeywordCount, setValue, skillTags]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-225 pb-500">
      <div
        data-form-preview-section="headline"
        className="grid grid-cols-1 gap-200"
      >
        <FormSectionCard
          className="h-full"
          title={
            <span className="inline-flex items-center gap-75">
              <UserRound className="text-text-brand h-18 w-18" />
              기본 정보
            </span>
          }
          description="멘티가 목록에서 먼저 확인하는 핵심 소개입니다."
          bodyClassName="space-y-200"
        >
          <section className="space-y-100">
            <div>
              <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                <Info className="text-text-subtle h-14 w-14" />
                이메일 정보
                <FieldRequirementBadge state="required" />
              </p>
              <p className="font-designer-12r text-text-subtle">
                멘티 문의와 알림을 받는 연락처입니다.
              </p>
            </div>
            <BaseInput
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="연락 가능한 이메일 입력"
              {...register('contactEmail')}
            />
            <FieldErrorText message={errors.contactEmail?.message} />
          </section>

          <section className="border-border-subtle space-y-100 border-t pt-200">
            <div>
              <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                <Star className="text-text-subtle h-14 w-14" />
                멘토링 명
                <FieldRequirementBadge state="required" />
              </p>
              <p className="font-designer-12r text-text-subtle">
                멘토링 목록 카드 제목으로 노출됩니다.
              </p>
            </div>
            <BaseInput
              placeholder="예) 개발자 취업 / 면접 / 이직 / 커리어 멘토링"
              maxLength={MENTORING_TITLE_MAX_LENGTH}
              {...register('mentoringTitle')}
            />
            <FieldErrorText message={errors.mentoringTitle?.message} />
            <p className="font-designer-12r text-text-subtle">
              멘토링명은 최대 {MENTORING_TITLE_MAX_LENGTH}자까지 입력할 수
              있습니다.
            </p>
          </section>

          <section className="border-border-subtle space-y-100 border-t pt-200">
            <div>
              <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                <MessageCircle className="text-text-subtle h-14 w-14" />한 줄
                어필
                <FieldRequirementBadge state="required" />
              </p>
              <p className="font-designer-12r text-text-subtle">
                대표 강점을 짧게 적어 멘티의 클릭을 유도하세요.
              </p>
            </div>
            <BaseInput
              placeholder="예) 금융권 대기업 / 네카라쿠배 / 쿠팡"
              {...register('appealLine')}
            />
            <FieldErrorText message={errors.appealLine?.message} />
            <div className="rounded-100 bg-background-alternative p-125">
              <div className="flex flex-wrap gap-100">
                {MENTOR_APPEAL_LINE_PRESETS.map((preset) => (
                  <ChipButton
                    key={preset}
                    type="button"
                    variant="preset"
                    onClick={() =>
                      setValue('appealLine', preset, dirtyValidationOptions)
                    }
                  >
                    {preset}
                  </ChipButton>
                ))}
              </div>
            </div>
            <p className="font-designer-12r text-text-subtle">
              멘토링 목록 카드에서 강조 노출됩니다.
            </p>
          </section>

          <section className="border-border-subtle space-y-100 border-t pt-200">
            <div className="flex items-start justify-between gap-100">
              <div>
                <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                  <Eye className="text-text-subtle h-14 w-14" />
                  멘토링 목록 노출
                  <FieldRequirementBadge state="required" />
                </p>
                <p className="font-designer-12r text-text-subtle">
                  비노출로 설정하면 멘토링 목록/상세에서 보이지 않습니다.
                </p>
              </div>
              <label className="font-designer-13r text-text-subtle inline-flex items-center gap-75">
                <input
                  type="checkbox"
                  className="border-border-default rounded-50 accent-fill-brand-default-default size-200 border"
                  {...register('listVisible')}
                />
                노출
              </label>
            </div>
            <p className="font-designer-12r text-text-subtle">
              {listVisible
                ? '현재 멘토링 목록에 노출됩니다.'
                : '현재 멘토링 목록 비노출 상태입니다.'}
            </p>
          </section>
        </FormSectionCard>

        <FormSectionCard
          className="h-full"
          title={
            <span className="inline-flex items-center gap-75">
              <Users className="text-text-brand h-18 w-18" />
              멘토정보
            </span>
          }
          description="멘토 포지션, 회사 공개, 핵심 키워드를 한 번에 설정하세요."
          bodyClassName="space-y-200"
        >
          <section className="space-y-100">
            <div>
              <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                <Users className="text-text-subtle h-14 w-14" />
                멘토 포지션
                <FieldRequirementBadge state="required" />
              </p>
              <p className="font-designer-12r text-text-subtle">
                직군, 직무, 경력 조합으로 탐색 필터에 노출됩니다.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-150 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-3">
              <Controller
                name="jobGroup"
                control={control}
                render={({ field }) => (
                  <SingleDropdown
                    options={jobGroupOptions}
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
                    options={jobTitleOptions}
                    value={field.value}
                    onChange={(value) => field.onChange(value ?? '')}
                    placeholder={jobGroup ? '멘토 직무' : '먼저 멘토 직군 선택'}
                    disabled={!jobGroup}
                  />
                )}
              />
              <Controller
                name="careerYears"
                control={control}
                render={({ field }) => (
                  <SingleDropdown
                    options={careerOptions}
                    value={field.value}
                    onChange={(value) => field.onChange(value ?? '')}
                    placeholder="멘토 경력"
                  />
                )}
              />
            </div>
            <FieldErrorText
              message={
                errors.jobGroup?.message ??
                errors.jobTitle?.message ??
                errors.careerYears?.message
              }
            />
          </section>

          <section className="border-border-subtle space-y-100 border-t pt-200">
            <div className="flex items-start justify-between gap-100">
              <div>
                <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                  <UserRound className="text-text-subtle h-14 w-14" />
                  회사명
                  <FieldRequirementBadge state="required" />
                </p>
                <p className="font-designer-12r text-text-subtle">
                  멘티가 신뢰도를 판단할 때 참고하는 정보입니다.
                </p>
              </div>
              <label className="font-designer-13r text-text-subtle inline-flex items-center gap-75">
                <input
                  type="checkbox"
                  className="border-border-default rounded-50 accent-fill-brand-default-default size-200 border"
                  {...register('hideCompanyName')}
                />
                비노출
              </label>
            </div>
            <BaseInput
              placeholder="구체적인 회사명 입력"
              {...register('companyName')}
            />
            <FieldErrorText message={errors.companyName?.message} />
            {hideCompanyName && (
              <p className="font-designer-12r text-text-subtle">
                회사명은 상세 페이지에서만 노출됩니다.
              </p>
            )}
          </section>

          <section className="border-border-subtle space-y-100 border-t pt-200">
            <div>
              <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                <Star className="text-text-subtle h-14 w-14" />
                핵심 키워드
                <FieldRequirementBadge state="required" />
              </p>
              <p className="font-designer-12r text-text-subtle">
                선택된 키워드는 프로필 카드/상세에 강조됩니다.
              </p>
            </div>
            <Controller
              name="skillTags"
              control={control}
              render={({ field }) => (
                <SelectableTagsInput
                  value={field.value}
                  onChange={field.onChange}
                  maxSelectable={Math.max(1, options.maxCoreKeywordCount)}
                  options={coreKeywordOptions}
                  allowCustom={false}
                />
              )}
            />
            <FieldErrorText message={errors.skillTags?.message} />
          </section>
        </FormSectionCard>
      </div>

      <div data-form-preview-section="methods">
        <FormSectionCard
          title={
            <span className="inline-flex items-center gap-75">
              <Phone className="text-text-brand h-18 w-18" />
              가격 / 시간
            </span>
          }
          description="상담 방식별 금액과 진행 시간을 설정해주세요."
        >
          <div className="rounded-125 border-border-warning bg-background-accent-yellow-subtle mb-200 border px-150 py-125">
            <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
              <Phone className="text-text-warning h-14 w-14" />첫 멘토링은
              간편상담으로 시작해보세요.
            </p>
            <p className="font-designer-13r text-text-subtle leading-relaxed">
              쪽지/간편 포맷은 멘티의 시작 허들을 낮출 수 있습니다. 신청서에서
              질문/고민/자료를 먼저 받아 빠르게 답변할 수 있도록 운영해보세요.
            </p>
          </div>

          <div className="mt-200 grid grid-cols-1 gap-150 lg:grid-cols-2">
            {METHOD_FIELDS.map((field) => {
              const enabled = methodEnabledState[field.enabledField];
              const priceErrorMessage = errors[field.priceField]?.message as
                | string
                | undefined;
              const durationErrorMessage = field.durationField
                ? (errors[field.durationField]?.message as string | undefined)
                : undefined;

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
                      <p className="font-designer-16b text-text-default flex items-center gap-75">
                        <span className="text-text-brand">
                          {METHOD_ICON_MAP[field.enabledField]}
                        </span>
                        {field.label}
                        <FieldRequirementBadge state="optional" />
                      </p>
                      <p className="font-designer-13r text-text-subtle mt-25">
                        {field.description}
                      </p>
                      <p className="font-designer-12r text-text-subtle mt-50 leading-relaxed">
                        {field.policySummary}
                      </p>
                    </div>
                    <ChipButton
                      type="button"
                      onClick={() =>
                        setValue(field.enabledField, !enabled, {
                          ...dirtyValidationOptions,
                        })
                      }
                      variant="state"
                      active={enabled}
                    >
                      {enabled ? '활성' : '비활성'}
                    </ChipButton>
                  </div>

                  <div>
                    <p className="font-designer-13r text-text-subtle mb-50 flex items-center gap-50">
                      <Star className="h-12 w-12" />
                      회당 가격 (원)
                    </p>
                    <BaseInput
                      type="number"
                      min={MIN_MENTORING_PRICE}
                      max={MAX_MENTORING_PRICE}
                      step={PRICE_INPUT_STEP}
                      disabled={!enabled}
                      className={PRICE_INPUT_CLASS}
                      {...register(field.priceField)}
                      placeholder="가격(원)"
                    />
                    <FieldErrorText message={priceErrorMessage} />
                  </div>

                  {field.durationField && (
                    <div className="mt-125">
                      <p className="font-designer-13r text-text-subtle mb-50 flex items-center gap-50">
                        <RotateCcw className="h-12 w-12" />
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
                      <FieldErrorText message={durationErrorMessage} />
                    </div>
                  )}

                  {field.enabledField === 'simpleEnabled' && (
                    <p className="font-designer-12r text-text-subtle mt-100">
                      간편상담은 15분 고정으로 운영됩니다.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
          <FieldErrorText message={errors.noteEnabled?.message} />
        </FormSectionCard>
      </div>

      <div data-form-preview-section="methods">
        <FormSectionCard
          title={
            <span className="inline-flex items-center gap-75">
              <RotateCcw className="text-text-brand h-18 w-18" />
              스케줄 설정
              <FieldRequirementBadge state="required" />
            </span>
          }
          description="간편/심층/대면 상담 가능한 요일/시간(30분 단위)을 선택해주세요."
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
            <FieldErrorText
              message={errors.schedule?.message as string | undefined}
            />
          )}
        </FormSectionCard>
      </div>

      <div data-form-preview-section="description">
        <FormSectionCard
          title={
            <span className="inline-flex items-center gap-75">
              <MessageCircle className="text-text-brand h-18 w-18" />
              멘토 소개
              <FieldRequirementBadge state="required" />
            </span>
          }
          description="마크다운으로 소개를 작성하고, 이미지 파일을 직접 업로드할 수 있습니다."
        >
          <Controller
            name="detailedDescription"
            control={control}
            render={({ field }) => (
              <MentorMarkdownEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="멘토 소개, 전문 분야, 상담 범위를 자유롭게 작성해주세요."
              />
            )}
          />
          <FieldErrorText message={errors.detailedDescription?.message} />
        </FormSectionCard>
      </div>

      <div data-form-preview-section="interview">
        <FormSectionCard
          title={
            <span className="inline-flex items-center gap-75">
              <CircleCheck className="text-text-brand h-18 w-18" />
              상담 전 준비사항
              <FieldRequirementBadge state="optional" />
            </span>
          }
          description="멘티가 상담 전에 준비하거나 전달해야 할 내용이 있다면 한 줄에 하나씩 작성해주세요."
        >
          <Controller
            name="interviewQuestions"
            control={control}
            render={({ field }) => (
              <BorderedTextarea
                value={field.value.join('\n')}
                onChange={(event) => {
                  const nextQuestions = event.target.value
                    .split('\n')
                    .map((question) => question.trim())
                    .filter((question) => question.length > 0);
                  field.onChange(nextQuestions);
                }}
                placeholder={
                  '예) 이력서/포트폴리오 링크를 미리 공유해주세요.\n예) 상담에서 다루고 싶은 질문 2~3개를 정리해주세요.\n예) 사전 과제/코드가 있다면 레포지토리 링크를 남겨주세요.'
                }
              />
            )}
          />
          <p className="font-designer-12r text-text-subtle mt-75">
            최대 8개까지 작성할 수 있습니다.
          </p>
          <FieldErrorText message={interviewQuestionError} />
        </FormSectionCard>
      </div>

      <div data-form-preview-section="notice">
        <FormSectionCard
          title={
            <span className="inline-flex items-center gap-75">
              <Info className="text-text-brand h-18 w-18" />
              멘토링 사전 안내
              <FieldRequirementBadge state="optional" />
            </span>
          }
        >
          <p className="font-designer-13r text-text-subtle mb-75">
            상담 확정 후 멘티에게 전달할 준비 안내를 간단히 작성해주세요.
          </p>
          <p className="font-designer-12r text-text-subtlest mb-125">
            예) 상담 24시간 전까지 이력서/포트폴리오 링크와 질문 3개를
            보내주세요.
          </p>
          <BorderedTextarea
            {...register('preNotice')}
            placeholder="수업 전 멘티에게 전달할 안내를 작성해주세요."
          />
          <FieldErrorText message={errors.preNotice?.message} />
        </FormSectionCard>
      </div>

      <FormSectionCard
        title={
          <span className="inline-flex items-center gap-75">
            <Info className="text-text-brand h-18 w-18" />
            정산 정보 (추후 제공)
            <FieldRequirementBadge state="required" />
          </span>
        }
        description="정산정보 등록 기능은 현재 준비 중이며, 추후 업데이트에서 제공됩니다."
      >
        <div className="flex flex-col gap-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-designer-14r text-text-subtle">
              정산정보는 추후 기능으로 제공될 예정입니다.
            </p>
            <p className="font-designer-12r text-text-subtle mt-50">
              지금은 정산정보 없이도 멘토 등록/수정 저장이 가능합니다.
            </p>
          </div>
          <Button
            type="button"
            color="outlined"
            size="small"
            className="w-full sm:w-auto"
            disabled
            aria-disabled
          >
            추후 제공 예정
          </Button>
        </div>
      </FormSectionCard>

      <div className="bg-background-default/95 border-border-subtle supports-[backdrop-filter]:bg-background-default/85 sticky bottom-0 z-20 border-t px-150 py-125 backdrop-blur">
        <div className="flex flex-col gap-100">
          <div className="flex flex-col gap-100 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-designer-12r text-text-subtle">
              {isValid
                ? '저장 준비가 완료되었습니다. 미리보기를 확인한 뒤 저장하세요.'
                : '필수 항목을 모두 입력하면 저장 버튼이 활성화됩니다.'}
            </p>
            <div className="flex w-full gap-100 sm:w-auto">
              <Button
                type="button"
                color="secondary"
                size="large"
                className="flex-1 sm:flex-none"
                onClick={onCancel}
              >
                취소
              </Button>
              <Button
                type="submit"
                color="primary"
                size="large"
                className="flex-1 sm:flex-none"
                disabled={isSaveDisabled}
              >
                {isSubmitting ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          </div>
          {isSaveDisabled && (
            <div className="rounded-100 border-border-warning bg-background-accent-yellow-subtle border px-125 py-100">
              <div className="flex flex-col gap-25">
                {saveDisabledReasons.map((reason) => (
                  <p
                    key={reason}
                    className="font-designer-12r text-text-subtle"
                  >
                    • {reason}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
