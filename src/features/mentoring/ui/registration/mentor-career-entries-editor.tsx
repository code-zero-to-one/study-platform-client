'use client';

import { BriefcaseBusiness, CirclePlus, Trash2 } from 'lucide-react';
import { type ReactNode } from 'react';
import {
  useFieldArray,
  useFormState,
  useWatch,
  type FieldArrayWithId,
  type FieldPath,
  type UseFormReturn,
} from 'react-hook-form';
import Button from '@/components/common/ui/button';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import BaseInput from '@/components/common/ui/input/base';
import {
  createEmptyMentorCareerEntry,
  getCurrentMentorCareerEntryMonth,
} from '@/features/mentoring/model/mentor-settings';
import type {
  MentorRegistrationFormInputValues,
  MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';
import {
  CAREER_ENTRY_MAX_COUNT,
  MAJOR_HISTORY_ENTRY_MAX_LENGTH,
} from '@/types/schemas/mentor-registration-schema';

interface MentorCareerEntriesEditorProps {
  form: UseFormReturn<
    MentorRegistrationFormInputValues,
    unknown,
    MentorRegistrationFormValues
  >;
}

type MentorCareerEntryMetaFieldPath =
  | `careerEntries.${number}.startMonth`
  | `careerEntries.${number}.endMonth`
  | `careerEntries.${number}.isCurrent`;

const DIRTY_VALIDATION_OPTIONS = {
  shouldDirty: true,
  shouldValidate: true,
} as const;
const CAREER_ENTRY_MIN_YEAR = 1900;
const CAREER_ENTRY_MONTH_OPTIONS = Array.from({ length: 12 }, (_, offset) => {
  const value = String(offset + 1).padStart(2, '0');

  return {
    value,
    label: `${offset + 1}월`,
  };
});

const OptionalBadge = () => {
  return (
    <span className="font-designer-12r border-border-subtle text-text-subtle rounded-500 border px-75 py-25">
      선택
    </span>
  );
};

const MajorHistoryEntryCardHeader = ({ children }: { children: ReactNode }) => {
  return (
    <div className="border-border-subtle flex items-center justify-between gap-125 border-b px-250 py-200">
      {children}
    </div>
  );
};

const MajorHistoryEntryCardBody = ({ children }: { children: ReactNode }) => {
  return <div className="space-y-125 px-250 py-200">{children}</div>;
};

const splitCareerEntryMonth = (value?: string) => {
  if (!value || !value.includes('-')) {
    return {
      year: '',
      month: '',
    };
  }

  const [year, month] = value.split('-');

  return {
    year,
    month,
  };
};

const buildCareerEntryMonthValue = ({
  year,
  month,
}: {
  year: string;
  month: string;
}) => {
  if (!year) {
    return '';
  }

  return month ? `${year}-${month}` : `${year}-`;
};

interface MentorCareerEntryCardProps {
  form: MentorCareerEntriesEditorProps['form'];
  index: number;
  currentCareerEntryIndex: number;
  currentCareerEntryMonth: string;
  currentCareerEntryYear: number;
  careerEntryYearOptions: Array<{
    label: string;
    value: string;
  }>;
  onRemove: (index: number) => void;
}

const MentorCareerEntryCard = ({
  form,
  index,
  currentCareerEntryIndex,
  currentCareerEntryMonth,
  currentCareerEntryYear,
  careerEntryYearOptions,
  onRemove,
}: MentorCareerEntryCardProps) => {
  const { clearErrors, control, getValues, register, setValue } = form;
  const [startMonth, endMonth, isCurrent, periodEnabled] = useWatch({
    control,
    name: [
      `careerEntries.${index}.startMonth`,
      `careerEntries.${index}.endMonth`,
      `careerEntries.${index}.isCurrent`,
      `careerEntries.${index}.periodEnabled`,
    ],
  }) as [
    string | undefined,
    string | undefined,
    boolean | undefined,
    boolean | undefined,
  ];
  const { errors } = useFormState({
    control,
    name: [
      `careerEntries.${index}.description`,
      `careerEntries.${index}.startMonth`,
      `careerEntries.${index}.endMonth`,
    ],
  });
  const careerEntryErrors = Array.isArray(errors.careerEntries)
    ? errors.careerEntries[index]
    : undefined;
  const startParts = splitCareerEntryMonth(startMonth);
  const endParts = splitCareerEntryMonth(endMonth);
  const descriptionError = careerEntryErrors?.description?.message;
  const startMonthError = careerEntryErrors?.startMonth?.message;
  const endMonthError = careerEntryErrors?.endMonth?.message;
  const periodError =
    typeof startMonthError === 'string'
      ? startMonthError
      : typeof endMonthError === 'string'
        ? endMonthError
        : undefined;
  const isPeriodEditorOpen = periodEnabled === true;
  const isCurrentCareerEntry = isCurrent === true;
  const isAnotherCurrentCareerEntrySelected =
    currentCareerEntryIndex >= 0 &&
    currentCareerEntryIndex !== index &&
    !isCurrentCareerEntry;
  const startMonthOptions =
    startParts.year === String(currentCareerEntryYear)
      ? CAREER_ENTRY_MONTH_OPTIONS.filter(
          (option) => option.value <= currentCareerEntryMonth,
        )
      : CAREER_ENTRY_MONTH_OPTIONS;
  const endMonthOptions =
    endParts.year === String(currentCareerEntryYear)
      ? CAREER_ENTRY_MONTH_OPTIONS.filter(
          (option) => option.value <= currentCareerEntryMonth,
        )
      : CAREER_ENTRY_MONTH_OPTIONS;
  const handlePeriodEnabledChange = (enabled: boolean) => {
    setValue(
      `careerEntries.${index}.periodEnabled`,
      enabled,
      DIRTY_VALIDATION_OPTIONS,
    );

    if (enabled) {
      return;
    }

    clearErrors([
      `careerEntries.${index}.startMonth`,
      `careerEntries.${index}.endMonth`,
    ]);
  };
  const handleCareerEntryMonthPartChange = ({
    field,
    nextYear,
    nextMonth,
  }: {
    field: 'startMonth' | 'endMonth';
    nextYear: string;
    nextMonth: string;
  }) => {
    setValue(
      `careerEntries.${index}.${field}`,
      buildCareerEntryMonthValue({
        year: nextYear,
        month: nextMonth,
      }),
      DIRTY_VALIDATION_OPTIONS,
    );
  };
  const handleIsCurrentChange = (nextIsCurrent: boolean) => {
    const currentEntries = getValues('careerEntries') ?? [];

    setValue(
      'careerEntries',
      currentEntries.map((entry, entryIndex) => {
        const currentEntry = entry ?? createEmptyMentorCareerEntry();

        if (entryIndex !== index) {
          return nextIsCurrent
            ? {
                ...currentEntry,
                isCurrent: false,
              }
            : currentEntry;
        }

        return {
          ...currentEntry,
          isCurrent: nextIsCurrent,
          endMonth: nextIsCurrent ? '' : (currentEntry.endMonth ?? ''),
        };
      }),
      DIRTY_VALIDATION_OPTIONS,
    );

    if (nextIsCurrent) {
      clearErrors([`careerEntries.${index}.endMonth`, 'careerEntries']);
    }
  };

  return (
    <article className="rounded-150 border-border-subtle bg-background-default overflow-hidden border">
      <MajorHistoryEntryCardHeader>
        <div className="flex items-center gap-75">
          <span className="font-designer-14b text-text-default">
            이력 {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="font-designer-12r text-text-subtle inline-flex items-center gap-50 self-start transition-colors hover:text-text-default"
        >
          <Trash2 className="h-14 w-14" />
          삭제
        </button>
      </MajorHistoryEntryCardHeader>

      <MajorHistoryEntryCardBody>
        <div className="space-y-125">
          <p className="font-designer-12b text-text-subtle">주요 이력</p>
          <BaseInput
            size="l"
            maxLength={MAJOR_HISTORY_ENTRY_MAX_LENGTH}
            placeholder="예: 네이버 백엔드 인턴 수료"
            className="font-designer-14r"
            {...register(`careerEntries.${index}.description`)}
          />
          <FieldErrorText
            message={
              typeof descriptionError === 'string'
                ? descriptionError
                : undefined
            }
          />
        </div>

        <div className="space-y-125">
          <div className="flex items-start justify-between gap-100">
            <p className="font-designer-12b text-text-subtle">
              기간
              <span className="font-designer-12r border-border-subtle text-text-subtle rounded-500 border px-75 py-25">
                선택
              </span>
            </p>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-125">
              <label className="font-designer-13r text-text-subtle inline-flex items-center gap-75">
                <input
                  type="checkbox"
                  className="border-border-default rounded-50 accent-fill-brand-default-default size-200 border"
                  checked={isCurrentCareerEntry}
                  disabled={isAnotherCurrentCareerEntrySelected}
                  onChange={(event) =>
                    handleIsCurrentChange(event.target.checked)
                  }
                />
                재직 중
              </label>
              <label className="font-designer-13r text-text-subtle inline-flex items-center gap-75">
                <input
                  type="checkbox"
                  className="border-border-default rounded-50 accent-fill-brand-default-default size-200 border"
                  checked={isPeriodEditorOpen}
                  onChange={() =>
                    handlePeriodEnabledChange(!isPeriodEditorOpen)
                  }
                />
                기간 입력
              </label>
            </div>
          </div>
          {isPeriodEditorOpen ? (
            <div className="rounded-100 border-border-subtle bg-background-alternative border px-150 py-150">
              <div className="grid grid-cols-1 gap-100 sm:grid-cols-2">
                <div className="space-y-50">
                  <p className="font-designer-12r text-text-subtle">시작</p>
                  <div className="grid grid-cols-fluid-120 gap-75">
                    <SingleDropdown
                      options={careerEntryYearOptions}
                      value={startParts.year || undefined}
                      placeholder="연도 선택"
                      ariaLabel={`이력 ${index + 1} 시작 연도 선택`}
                      className="w-full"
                      onChange={(value) => {
                        const nextYear = value ?? '';
                        const nextMonth =
                          nextYear === String(currentCareerEntryYear) &&
                          startParts.month > currentCareerEntryMonth
                            ? ''
                            : startParts.month;

                        handleCareerEntryMonthPartChange({
                          field: 'startMonth',
                          nextYear,
                          nextMonth,
                        });
                      }}
                    />
                    <SingleDropdown
                      options={startMonthOptions}
                      value={startParts.month || undefined}
                      placeholder="월 선택"
                      ariaLabel={`이력 ${index + 1} 시작 월 선택`}
                      className="w-full"
                      disabled={!startParts.year}
                      onChange={(value) =>
                        handleCareerEntryMonthPartChange({
                          field: 'startMonth',
                          nextYear: startParts.year,
                          nextMonth: value ?? '',
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-50">
                  <p className="font-designer-12r text-text-subtle">종료</p>
                  {isCurrentCareerEntry ? (
                    <div className="font-designer-14m border-border-subtle text-text-subtle rounded-100 bg-background-default border px-150 py-125">
                      현재
                    </div>
                  ) : (
                    <div className="grid grid-cols-fluid-120 gap-75">
                      <SingleDropdown
                        options={careerEntryYearOptions}
                        value={endParts.year || undefined}
                        placeholder="연도 선택"
                        ariaLabel={`이력 ${index + 1} 종료 연도 선택`}
                        className="w-full"
                        onChange={(value) => {
                          const nextYear = value ?? '';
                          const nextMonth =
                            nextYear === String(currentCareerEntryYear) &&
                            endParts.month > currentCareerEntryMonth
                              ? ''
                              : endParts.month;

                          handleCareerEntryMonthPartChange({
                            field: 'endMonth',
                            nextYear,
                            nextMonth,
                          });
                        }}
                      />
                      <SingleDropdown
                        options={endMonthOptions}
                        value={endParts.month || undefined}
                        placeholder="월 선택"
                        ariaLabel={`이력 ${index + 1} 종료 월 선택`}
                        className="w-full"
                        disabled={!endParts.year}
                        onChange={(value) =>
                          handleCareerEntryMonthPartChange({
                            field: 'endMonth',
                            nextYear: endParts.year,
                            nextMonth: value ?? '',
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-100">
                <FieldErrorText message={periodError} />
              </div>
            </div>
          ) : null}
        </div>
      </MajorHistoryEntryCardBody>
    </article>
  );
};

export default function MentorCareerEntriesEditor({
  form,
}: MentorCareerEntriesEditorProps) {
  const { control } = form;
  const { fields, append, remove } = useFieldArray<
    MentorRegistrationFormInputValues,
    'careerEntries'
  >({
    control,
    name: 'careerEntries',
  });
  const typedFields = fields as FieldArrayWithId<
    MentorRegistrationFormInputValues,
    'careerEntries'
  >[];
  const { errors } = useFormState({
    control,
    name: 'careerEntries',
  });
  const careerEntryMetaFieldNames = typedFields.flatMap((_, index) => {
    return [
      `careerEntries.${index}.startMonth`,
      `careerEntries.${index}.endMonth`,
      `careerEntries.${index}.isCurrent`,
    ] satisfies MentorCareerEntryMetaFieldPath[];
  }) as FieldPath<MentorRegistrationFormInputValues>[];
  const watchedCareerEntryMetaValues = (useWatch({
    control,
    name: careerEntryMetaFieldNames,
  }) ?? []) as Array<string | boolean | undefined>;
  const watchedCareerEntryStartMonths = typedFields.map((_, index) => {
    return watchedCareerEntryMetaValues[index * 3];
  });
  const watchedCareerEntryEndMonths = typedFields.map((_, index) => {
    return watchedCareerEntryMetaValues[index * 3 + 1];
  });
  const watchedCareerEntryCurrentFlags = typedFields.map((_, index) => {
    return watchedCareerEntryMetaValues[index * 3 + 2];
  });
  const [currentYear, currentMonth] =
    getCurrentMentorCareerEntryMonth().split('-');
  const currentCareerEntryYear = Number(currentYear);
  const currentCareerEntryMonth = currentMonth;
  const minimumCareerEntryYear = Math.min(
    CAREER_ENTRY_MIN_YEAR,
    ...typedFields.flatMap((_, index) => {
      return [
        watchedCareerEntryStartMonths[index],
        watchedCareerEntryEndMonths[index],
      ].flatMap((value) => {
        if (typeof value !== 'string') {
          return [];
        }

        const year = Number(value?.split('-')[0]);

        return Number.isInteger(year) && year > 0 ? [year] : [];
      });
    }),
  );
  const careerEntryYearOptions = Array.from(
    { length: currentCareerEntryYear - minimumCareerEntryYear + 1 },
    (_, offset) => {
      const value = String(currentCareerEntryYear - offset);

      return {
        value,
        label: `${value}년`,
      };
    },
  );
  const listErrorMessage =
    typeof errors.careerEntries?.message === 'string'
      ? errors.careerEntries.message
      : undefined;
  const currentCareerEntryIndex = watchedCareerEntryCurrentFlags.findIndex(
    (entry) => entry === true,
  );
  const handleRemove = (index: number) => {
    remove(index);
  };

  return (
    <section className="border-border-subtle space-y-200 border-t pt-225">
      <div className="flex flex-col gap-150 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
            <BriefcaseBusiness className="text-text-subtle h-14 w-14" />
            주요 이력
            <OptionalBadge />
          </p>
          <p className="font-designer-12r text-text-subtle">
            교육활동, 경력, 학력, 수상, 자격증 등 전문성을 강조하기 위한 모든
            문구를 적을 수 있어요. 최대 {CAREER_ENTRY_MAX_COUNT}개까지 등록할 수
            있습니다.
          </p>
        </div>
        <Button
          type="button"
          color="outlined"
          size="small"
          className="shrink-0 self-start whitespace-nowrap"
          icon={<CirclePlus className="h-14 w-14" />}
          disabled={typedFields.length >= CAREER_ENTRY_MAX_COUNT}
          onClick={() => append(createEmptyMentorCareerEntry())}
        >
          이력 추가
        </Button>
      </div>

      {typedFields.length === 0 ? (
        <div className="rounded-150 border-border-subtle bg-background-alternative border px-200 py-200">
          <p className="font-designer-13r text-text-subtle leading-relaxed">
            주요 이력을 여러 개 등록하면 실시간 미리보기와 멘토 상세의 주요 이력
            섹션에 바로 반영됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-200">
          {typedFields.map((field, index) => {
            return (
              <MentorCareerEntryCard
                key={field.id}
                form={form}
                index={index}
                currentCareerEntryIndex={currentCareerEntryIndex}
                currentCareerEntryMonth={currentCareerEntryMonth}
                currentCareerEntryYear={currentCareerEntryYear}
                careerEntryYearOptions={careerEntryYearOptions}
                onRemove={handleRemove}
              />
            );
          })}
        </div>
      )}

      <FieldErrorText message={listErrorMessage} />
    </section>
  );
}
