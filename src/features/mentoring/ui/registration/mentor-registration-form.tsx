'use client';

import { useEffect, useMemo } from 'react';
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
  CAREER_YEAR_OPTIONS,
  COMPANY_CATEGORY_DROPDOWN_OPTIONS,
  CONSULTING_DURATION_DROPDOWN_OPTIONS,
  getJobTitleOptionsByGroup,
  JOB_GROUP_OPTIONS,
  MENTOR_APPEAL_LINE_PRESETS,
  MENTOR_SKILL_TAG_PRESETS,
} from '@/features/mentoring/model/mentor-setting-options';
import MentorMarkdownEditor from '@/features/mentoring/ui/mentor-markdown-editor';
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

const MIN_MENTORING_PRICE = 3000;
const MAX_MENTORING_PRICE = 1_000_000;
const CAREER_YEAR_OPTION_SET: ReadonlySet<string> = new Set(
  CAREER_YEAR_OPTIONS,
);

export default function MentorRegistrationForm({
  form,
  onCancel,
  onOpenSettlementModal,
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

  const settlementDraft = watch('settlementDraft');
  const jobGroup = watch('jobGroup');
  const jobTitle = watch('jobTitle');
  const careerYears = watch('careerYears');
  const phoneEnabled = watch('phoneEnabled');
  const onlineEnabled = watch('onlineEnabled');
  const offlineEnabled = watch('offlineEnabled');
  const jobTitleOptions = useMemo(
    () => getJobTitleOptionsByGroup(jobGroup),
    [jobGroup],
  );
  const validJobTitleSet = useMemo(
    () =>
      new Set(
        jobTitleOptions
          .map((option) => option.value)
          .filter((value) => value.length > 0),
      ),
    [jobTitleOptions],
  );

  const needsSchedule = phoneEnabled || onlineEnabled || offlineEnabled;
  const interviewQuestionError =
    (errors.interviewQuestions?.message as string | undefined) ??
    (errors.interviewQuestions?.[0]?.message as string | undefined);

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

    if (!CAREER_YEAR_OPTION_SET.has(careerYears)) {
      setValue('careerYears', '', {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [careerYears, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="min-w-[640px] space-y-200 pb-400"
    >
      <FormSectionCard
        title="연락 정보"
        description="휴대폰 번호는 본인인증 정보로 자동 등록됩니다."
      >
        <div className="mt-150">
          <BaseInput
            placeholder="연락 가능한 이메일 입력"
            {...register('contactEmail')}
          />
          <FieldErrorText message={errors.contactEmail?.message} />
        </div>
      </FormSectionCard>

      <FormSectionCard title="멘토링 정보">
        <div className="mb-150">
          <p className="font-designer-13r text-text-subtle mb-50">멘토링 명</p>
          <BaseInput
            placeholder="예) 개발자 취업 / 면접 / 이직 / 커리어 멘토링"
            maxLength={MENTORING_TITLE_MAX_LENGTH}
            {...register('mentoringTitle')}
          />
          <FieldErrorText message={errors.mentoringTitle?.message} />
          <p className="font-designer-12r text-text-subtle mt-75">
            멘토링명은 최대 {MENTORING_TITLE_MAX_LENGTH}자까지 입력할 수
            있습니다.
          </p>
        </div>

        <div className="mb-150">
          <p className="font-designer-13r text-text-subtle mb-50">한 줄 어필</p>
          <BaseInput
            placeholder="예) 금융권 대기업 / 네카라쿠배 / 쿠팡"
            {...register('appealLine')}
          />
          <FieldErrorText message={errors.appealLine?.message} />
          <div className="mt-100 flex flex-wrap gap-75">
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
          <p className="font-designer-12r text-text-subtle mt-75">
            멘토링 목록 카드에서 강조 노출됩니다.
          </p>
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
        <FieldErrorText
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
          <FieldErrorText message={errors.skillTags?.message} />
        </div>

        <div className="mt-150">
          <Controller
            name="companyCategory"
            control={control}
            render={({ field }) => (
              <SingleDropdown
                options={COMPANY_CATEGORY_DROPDOWN_OPTIONS}
                value={field.value}
                onChange={(value) => field.onChange(value ?? '기타')}
                placeholder="회사 카테고리"
              />
            )}
          />
          <FieldErrorText message={errors.companyCategory?.message} />
        </div>

        <div className="mt-125">
          <BaseInput
            placeholder="구체적인 회사명 입력"
            {...register('companyName')}
          />
          <FieldErrorText message={errors.companyName?.message} />
          <p className="font-designer-12r text-text-subtle mt-75">
            목록에는 회사 카테고리만 노출되고, 회사명은 상세에서만 노출됩니다.
          </p>
          <label className="font-designer-13r text-text-subtle mt-100 inline-flex items-center gap-75">
            <input
              type="checkbox"
              className="border-border-default rounded-50 accent-fill-brand-default-default size-200 border"
              {...register('hideCompanyName')}
            />
            회사명 비노출
          </label>
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="가격 / 시간"
        description="상담 방식별 금액과 진행 시간을 설정해주세요."
      >
        <div className="rounded-125 border-border-warning bg-background-accent-yellow-subtle mb-200 border px-150 py-125">
          <p className="font-designer-13b text-text-default mb-50">
            멘토 테스트는 15분 전화상담으로 시작해보세요.
          </p>
          <p className="font-designer-13r text-text-subtle leading-relaxed">
            쪽지/전화 포맷은 멘티의 시작 허들을 낮추는 용도입니다. 신청서에서
            질문/고민/자료를 먼저 받아 빠르게 답변할 수 있도록 운영해보세요.
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
                  <p className="font-designer-13r text-text-subtle mb-50">
                    회당 가격 (원)
                  </p>
                  <BaseInput
                    type="number"
                    min={MIN_MENTORING_PRICE}
                    max={MAX_MENTORING_PRICE}
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
        <FieldErrorText
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
      </FormSectionCard>

      <FormSectionCard
        title="스케줄 설정"
        description="전화/온라인/대면 상담 가능한 요일/시간(30분 단위)을 선택해주세요."
      >
        <Controller
          name="schedule"
          control={control}
          render={({ field }) => (
            <WeeklyScheduleGrid value={field.value} onChange={field.onChange} />
          )}
        />
        {needsSchedule && (
          <FieldErrorText
            message={errors.schedule?.message as string | undefined}
          />
        )}
      </FormSectionCard>

      <FormSectionCard
        title="멘토 소개"
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

      <FormSectionCard
        title="상담 전 준비사항"
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

      <FormSectionCard title="멘토링 사전 안내">
        <BorderedTextarea
          {...register('preNotice')}
          placeholder="수업 전 멘티에게 전달할 안내를 작성해주세요."
        />
        <FieldErrorText message={errors.preNotice?.message} />
      </FormSectionCard>

      <FormSectionCard
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
            onClick={onOpenSettlementModal}
          >
            {settlementDraft ? '정산정보 수정' : '정산정보 등록'}
          </Button>
        </div>
        <FieldErrorText
          message={errors.settlementDraft?.message as string | undefined}
        />
      </FormSectionCard>

      <div className="flex justify-end gap-100 pt-100">
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
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    </form>
  );
}
