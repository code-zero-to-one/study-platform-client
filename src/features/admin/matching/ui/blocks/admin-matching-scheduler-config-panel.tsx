'use client';

import { useEffect, useMemo, useState } from 'react';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import { BaseInput, NativeSelect } from '@/components/common/ui/input';
import KeyValueRow from '@/components/common/ui/key-value-row';
import { ToggleSwitch } from '@/components/common/ui/toggle';
import {
  ADMIN_MATCHING_SCHEDULED_DAY_OPTIONS,
  ADMIN_MATCHING_SCHEDULER_ENABLED_META,
  ADMIN_MATCHING_TEMPLATE_OPTIONS,
} from '@/features/admin/matching/model/admin-matching-meta';
import type { AdminMatchingAdminOption } from '@/types/matching/admin-domain';
import type {
  AdminMatchingSchedulerConfigFormInput,
  AdminMatchingSchedulerConfigFormValues,
} from '@/types/schemas/admin-matching-schema';
import { adminMatchingSchedulerConfigFormSchema } from '@/types/schemas/admin-matching-schema';
import AdminMatchingPanel from './admin-matching-panel';
import MatchingFormField from './matching-form-field';

type SchedulerConfigFormErrors = Partial<
  Record<keyof AdminMatchingSchedulerConfigFormInput, string>
>;

interface AdminMatchingSchedulerConfigPanelProps {
  adminOptions: AdminMatchingAdminOption[];
  adminOptionsErrorMessage?: string;
  defaultValues: AdminMatchingSchedulerConfigFormInput;
  errorMessage?: string;
  isAdminOptionsLoading: boolean;
  isLoading: boolean;
  isPending: boolean;
  schedulerMeta: {
    label: string;
    color: React.ComponentProps<typeof Badge>['color'];
    description: string;
  };
  schedulerSummary: {
    adminText: string;
    autoCycleEndText: string;
    scheduledRunText: string;
    updatedAtText: string;
  };
  onSubmit: (values: AdminMatchingSchedulerConfigFormValues) => Promise<void>;
}

const serializeSchedulerConfigFormInput = (
  values: AdminMatchingSchedulerConfigFormInput,
) => JSON.stringify(values);

export default function AdminMatchingSchedulerConfigPanel({
  adminOptions,
  adminOptionsErrorMessage,
  defaultValues,
  errorMessage,
  isAdminOptionsLoading,
  isLoading,
  isPending,
  schedulerMeta,
  schedulerSummary,
  onSubmit,
}: AdminMatchingSchedulerConfigPanelProps) {
  const [formValues, setFormValues] =
    useState<AdminMatchingSchedulerConfigFormInput>(defaultValues);
  const [baselineValues, setBaselineValues] =
    useState<AdminMatchingSchedulerConfigFormInput>(defaultValues);
  const [errors, setErrors] = useState<SchedulerConfigFormErrors>({});

  const formSignature = useMemo(
    () => serializeSchedulerConfigFormInput(formValues),
    [formValues],
  );
  const baselineSignature = useMemo(
    () => serializeSchedulerConfigFormInput(baselineValues),
    [baselineValues],
  );
  const defaultSignature = useMemo(
    () => serializeSchedulerConfigFormInput(defaultValues),
    [defaultValues],
  );
  const hasUnsavedChanges = formSignature !== baselineSignature;
  const displaySchedulerMeta = hasUnsavedChanges
    ? formValues.enabled
      ? ADMIN_MATCHING_SCHEDULER_ENABLED_META.enabled
      : ADMIN_MATCHING_SCHEDULER_ENABLED_META.disabled
    : schedulerMeta;

  useEffect(() => {
    if (defaultSignature === baselineSignature || hasUnsavedChanges) {
      return;
    }

    setFormValues(defaultValues);
    setBaselineValues(defaultValues);
    setErrors({});
  }, [baselineSignature, defaultSignature, defaultValues, hasUnsavedChanges]);

  const selectedAdmin = adminOptions.find(
    (adminOption) => String(adminOption.memberId) === formValues.adminId,
  );
  const isDisabled = isLoading || isPending;
  const scheduleTimeHelper =
    formValues.scheduledDayOfWeek === 'SUNDAY'
      ? '일요일 자동 매칭 실행 시각은 22:00 이전이어야 합니다.'
      : '토요일 자동 매칭 실행 시각은 18:00 이후여야 합니다.';
  const isSaveDisabled =
    isDisabled ||
    isAdminOptionsLoading ||
    (formValues.enabled && adminOptions.length === 0) ||
    !hasUnsavedChanges;

  const adminFieldHelper = (() => {
    if (isAdminOptionsLoading) {
      return '활성 관리자 목록을 불러오는 중입니다.';
    }

    if (selectedAdmin) {
      const selectedAdminText = selectedAdmin.memberNickname
        ? `${selectedAdmin.memberName} (${selectedAdmin.memberNickname}) (#${selectedAdmin.memberId})`
        : `${selectedAdmin.memberName} (#${selectedAdmin.memberId})`;

      return `스케줄러가 홀수 인원 보정 매칭에 사용할 관리자는 ${selectedAdminText}입니다.`;
    }

    return formValues.enabled
      ? '스케줄러를 활성화하려면 사용할 활성 관리자 계정을 선택해주세요.'
      : '비활성화 상태에서도 다음에 사용할 관리자를 미리 선택할 수 있습니다.';
  })();

  const handleFieldChange = (
    field: keyof AdminMatchingSchedulerConfigFormInput,
    value: string | boolean,
  ) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  };

  const handleSubmit = async () => {
    const parsed = adminMatchingSchedulerConfigFormSchema.safeParse(formValues);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        adminId: fieldErrors.adminId?.[0],
        scheduledDayOfWeek: fieldErrors.scheduledDayOfWeek?.[0],
        scheduledTime: fieldErrors.scheduledTime?.[0],
        templateType: fieldErrors.templateType?.[0],
        matchingKValue: fieldErrors.matchingKValue?.[0],
        numberOfNearestNeighbors: fieldErrors.numberOfNearestNeighbors?.[0],
        chunkSize: fieldErrors.chunkSize?.[0],
        saveResultsChunkSize: fieldErrors.saveResultsChunkSize?.[0],
      });

      return;
    }

    await onSubmit(parsed.data);
    setBaselineValues(formValues);
    setErrors({});
  };

  return (
    <AdminMatchingPanel
      title="자동 매칭 스케줄러 설정"
      description="매주 다음 주 자동 매칭 스케줄러가 사용할 토글, 관리자, 예약 실행 요일/시각, 실행 파라미터를 저장합니다."
      rightSlot={
        <div className="flex items-center gap-75">
          <Badge color={displaySchedulerMeta.color} shape="rectangle">
            {displaySchedulerMeta.label}
          </Badge>
          {hasUnsavedChanges ? (
            <Badge color="orange" shape="rectangle">
              변경사항 있음
            </Badge>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-col gap-150">
        {errorMessage ? (
          <div className="rounded-100 border-border-error bg-fill-danger-subtle-default border px-150 py-200">
            <p className="font-designer-14r text-text-error">{errorMessage}</p>
          </div>
        ) : null}

        <div className="grid gap-150 xl:grid-cols-2">
          <div className="rounded-150 bg-background-neutral-subtle flex flex-col gap-150 p-175">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-75">
                <p className="font-designer-16b text-text-default">
                  스케줄러 활성화
                </p>
                <Badge color={displaySchedulerMeta.color} shape="rectangle">
                  {displaySchedulerMeta.label}
                </Badge>
              </div>
              <p className="font-designer-13r text-text-subtle mt-50">
                {displaySchedulerMeta.description}
              </p>
              <p className="font-designer-13r text-text-subtle mt-25">
                토글을 눌러도 즉시 저장되지는 않으며, 저장 버튼으로 PATCH 요청을
                보냅니다.
              </p>
            </div>

            <ToggleSwitch.Label className="justify-between gap-125">
              <span className="font-designer-14b text-text-default">
                {formValues.enabled ? '활성화됨' : '비활성화됨'}
              </span>
              <ToggleSwitch.Root
                size="lg"
                checked={formValues.enabled}
                disabled={isDisabled}
                onCheckedChange={(checked) =>
                  handleFieldChange('enabled', checked)
                }
              />
            </ToggleSwitch.Label>
          </div>

          <div className="rounded-150 bg-background-neutral-subtle flex flex-col gap-150 p-175">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-75">
                <p className="font-designer-16b text-text-default">
                  자동 스터디 종료
                </p>
                <Badge
                  color={formValues.autoCycleEndEnabled ? 'blue' : 'gray'}
                  shape="rectangle"
                >
                  {formValues.autoCycleEndEnabled ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <p className="font-designer-13r text-text-subtle mt-50">
                토요일 00:00 기준 자동 스터디 사이클 종료 스케줄러를 함께
                저장합니다.
              </p>
            </div>

            <ToggleSwitch.Label className="justify-between gap-125">
              <span className="font-designer-14b text-text-default">
                {formValues.autoCycleEndEnabled ? '활성화됨' : '비활성화됨'}
              </span>
              <ToggleSwitch.Root
                size="lg"
                checked={formValues.autoCycleEndEnabled}
                disabled={isDisabled}
                onCheckedChange={(checked) =>
                  handleFieldChange('autoCycleEndEnabled', checked)
                }
              />
            </ToggleSwitch.Label>
          </div>
        </div>

        <div className="grid gap-100 xl:grid-cols-2">
          <div className="rounded-100 border-border-subtle border p-150">
            <KeyValueRow
              label="예약 실행"
              columnsClassName="grid-cols-[92px_minmax(0,1fr)] items-center"
            >
              {schedulerSummary.scheduledRunText}
            </KeyValueRow>
          </div>
          <div className="rounded-100 border-border-subtle border p-150">
            <KeyValueRow
              label="자동 종료"
              columnsClassName="grid-cols-[92px_minmax(0,1fr)] items-center"
            >
              {schedulerSummary.autoCycleEndText}
            </KeyValueRow>
          </div>
          <div className="rounded-100 border-border-subtle border p-150">
            <KeyValueRow
              label="저장 관리자"
              columnsClassName="grid-cols-[92px_minmax(0,1fr)] items-center"
            >
              {schedulerSummary.adminText}
            </KeyValueRow>
          </div>
          <div className="rounded-100 border-border-subtle border p-150">
            <KeyValueRow
              label="수정 시각"
              columnsClassName="grid-cols-[92px_minmax(0,1fr)] items-center"
            >
              {schedulerSummary.updatedAtText}
            </KeyValueRow>
          </div>
        </div>

        {hasUnsavedChanges ? (
          <div className="rounded-100 border-border-warning bg-fill-warning-subtle-default border px-150 py-150">
            <p className="font-designer-13r text-text-default">
              변경사항이 있습니다. 저장 버튼을 눌러야 실제 스케줄러 설정에
              반영됩니다.
            </p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-100 bg-background-neutral-subtle px-150 py-200">
            <p className="font-designer-14r text-text-subtle">
              자동 매칭 스케줄러 설정을 불러오는 중입니다.
            </p>
          </div>
        ) : null}

        <div className="grid gap-150 xl:grid-cols-2">
          <MatchingFormField
            label="관리자"
            helper={adminFieldHelper}
            error={errors.adminId ?? adminOptionsErrorMessage}
            required={formValues.enabled}
            htmlFor="scheduler-admin-id"
          >
            <NativeSelect
              id="scheduler-admin-id"
              value={formValues.adminId}
              disabled={isDisabled || isAdminOptionsLoading}
              onChange={(event) =>
                handleFieldChange('adminId', event.target.value)
              }
            >
              <option value="">
                {isAdminOptionsLoading
                  ? '관리자 목록 불러오는 중'
                  : adminOptions.length === 0
                    ? '선택 가능한 관리자가 없습니다'
                    : '관리자를 선택하세요'}
              </option>
              {adminOptions.map((adminOption) => (
                <option key={adminOption.memberId} value={adminOption.memberId}>
                  {adminOption.memberName}
                </option>
              ))}
            </NativeSelect>
          </MatchingFormField>

          <MatchingFormField
            label="매칭 템플릿"
            helper="비워두면 서버 기본값(STUDY)을 사용합니다."
            error={errors.templateType}
            htmlFor="scheduler-template-type"
          >
            <NativeSelect
              id="scheduler-template-type"
              value={formValues.templateType}
              disabled={isDisabled}
              onChange={(event) =>
                handleFieldChange('templateType', event.target.value)
              }
            >
              <option value="">서버 기본값 사용</option>
              {ADMIN_MATCHING_TEMPLATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </MatchingFormField>

          <MatchingFormField
            label="실행 요일"
            helper="SATURDAY 또는 SUNDAY만 저장할 수 있습니다."
            error={errors.scheduledDayOfWeek}
            required
            htmlFor="scheduler-day-of-week"
          >
            <NativeSelect
              id="scheduler-day-of-week"
              value={formValues.scheduledDayOfWeek}
              disabled={isDisabled}
              onChange={(event) =>
                handleFieldChange('scheduledDayOfWeek', event.target.value)
              }
            >
              {ADMIN_MATCHING_SCHEDULED_DAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </MatchingFormField>

          <MatchingFormField
            label="실행 시각"
            helper={scheduleTimeHelper}
            error={errors.scheduledTime}
            required
            htmlFor="scheduler-time"
          >
            <BaseInput
              id="scheduler-time"
              type="time"
              size="m"
              value={formValues.scheduledTime}
              disabled={isDisabled}
              onChange={(event) =>
                handleFieldChange('scheduledTime', event.target.value)
              }
            />
          </MatchingFormField>

          <MatchingFormField
            label="K 값"
            helper="비워두면 서버가 자동 계산합니다."
            error={errors.matchingKValue}
            htmlFor="scheduler-matching-k"
          >
            <BaseInput
              id="scheduler-matching-k"
              size="m"
              inputMode="numeric"
              value={formValues.matchingKValue}
              disabled={isDisabled}
              onChange={(event) =>
                handleFieldChange('matchingKValue', event.target.value)
              }
            />
          </MatchingFormField>

          <MatchingFormField
            label="최근접 이웃 수"
            helper="비워두면 서버가 자동 계산합니다."
            error={errors.numberOfNearestNeighbors}
            htmlFor="scheduler-neighbors"
          >
            <BaseInput
              id="scheduler-neighbors"
              size="m"
              inputMode="numeric"
              value={formValues.numberOfNearestNeighbors}
              disabled={isDisabled}
              onChange={(event) =>
                handleFieldChange(
                  'numberOfNearestNeighbors',
                  event.target.value,
                )
              }
            />
          </MatchingFormField>

          <MatchingFormField
            label="처리 청크 크기"
            helper="비워두면 서버가 자동 계산합니다."
            error={errors.chunkSize}
            htmlFor="scheduler-chunk-size"
          >
            <BaseInput
              id="scheduler-chunk-size"
              size="m"
              inputMode="numeric"
              value={formValues.chunkSize}
              disabled={isDisabled}
              onChange={(event) =>
                handleFieldChange('chunkSize', event.target.value)
              }
            />
          </MatchingFormField>

          <MatchingFormField
            label="결과 저장 청크"
            helper="비워두면 서버 기본값을 사용합니다."
            error={errors.saveResultsChunkSize}
            htmlFor="scheduler-save-results-chunk"
          >
            <BaseInput
              id="scheduler-save-results-chunk"
              size="m"
              inputMode="numeric"
              value={formValues.saveResultsChunkSize}
              disabled={isDisabled}
              onChange={(event) =>
                handleFieldChange('saveResultsChunkSize', event.target.value)
              }
            />
          </MatchingFormField>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            size="small"
            disabled={isSaveDisabled}
            loading={isPending}
            onClick={() => {
              handleSubmit().catch((): undefined => undefined);
            }}
          >
            스케줄러 설정 저장
          </Button>
        </div>
      </div>
    </AdminMatchingPanel>
  );
}
