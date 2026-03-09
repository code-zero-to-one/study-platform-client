'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import {
  BaseInput,
  NativeSelect,
  TextAreaInput as BorderedTextarea,
} from '@/components/ui/input';
import {
  ADMIN_MATCHING_STATUS_OPTIONS,
  ADMIN_MATCHING_TYPE_OPTIONS,
} from '@/features/admin/matching/model/admin-matching-meta';
import type {
  AdminMatchingCreateFormInput,
  AdminMatchingCreateFormValues,
} from '@/types/schemas/admin-matching-schema';
import { adminMatchingCreateFormSchema } from '@/types/schemas/admin-matching-schema';
import { MONDAY_DATE_INPUT_MIN } from '@/utils/time';
import AdminMatchingPanel from './admin-matching-panel';
import MatchingFormField from './matching-form-field';

type CreateFormErrors = Partial<
  Record<keyof AdminMatchingCreateFormInput, string>
>;

interface AdminMatchingCreatePanelProps {
  defaultWeeklyPeriodIdentifier: string;
  isPending: boolean;
  onSubmit: (values: AdminMatchingCreateFormValues) => Promise<void>;
}

export default function AdminMatchingCreatePanel({
  defaultWeeklyPeriodIdentifier,
  isPending,
  onSubmit,
}: AdminMatchingCreatePanelProps) {
  const [formValues, setFormValues] = useState<AdminMatchingCreateFormInput>({
    memberId: '',
    partnerId: '',
    status: 'RES_ACPT',
    type: 'MANUAL',
    content: '관리자 화면에서 수동 매칭',
    weeklyPeriodIdentifier: defaultWeeklyPeriodIdentifier,
  });
  const [errors, setErrors] = useState<CreateFormErrors>({});

  useEffect(() => {
    setFormValues((previous) => {
      if (previous.weeklyPeriodIdentifier) {
        return previous;
      }

      return {
        ...previous,
        weeklyPeriodIdentifier: defaultWeeklyPeriodIdentifier,
      };
    });
  }, [defaultWeeklyPeriodIdentifier]);

  const handleFieldChange = (
    field: keyof AdminMatchingCreateFormInput,
    value: string,
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

  const handleInputChange =
    (field: keyof AdminMatchingCreateFormInput) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      handleFieldChange(field, event.target.value);
    };

  const handleSubmit = async () => {
    const parsed = adminMatchingCreateFormSchema.safeParse(formValues);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        memberId: fieldErrors.memberId?.[0],
        partnerId: fieldErrors.partnerId?.[0],
        status: fieldErrors.status?.[0],
        type: fieldErrors.type?.[0],
        content: fieldErrors.content?.[0],
        weeklyPeriodIdentifier: fieldErrors.weeklyPeriodIdentifier?.[0],
      });

      return;
    }

    await onSubmit(parsed.data);
    setFormValues((previous) => ({
      ...previous,
      memberId: '',
      partnerId: '',
      content: '관리자 화면에서 수동 매칭',
    }));
  };

  return (
    <AdminMatchingPanel
      title="수동 매칭 생성"
      description="특정 두 회원을 즉시 연결할 때 사용합니다. 주차 식별자 기본값은 이번 주 월요일이며, 필요하면 직접 수정할 수 있습니다."
    >
      <div className="flex flex-col gap-150">
        <div className="grid gap-150 xl:grid-cols-2">
          <MatchingFormField
            label="회원 ID"
            error={errors.memberId}
            required
            htmlFor="create-member-id"
          >
            <BaseInput
              id="create-member-id"
              size="m"
              inputMode="numeric"
              value={formValues.memberId}
              disabled={isPending}
              onChange={handleInputChange('memberId')}
            />
          </MatchingFormField>

          <MatchingFormField
            label="파트너 ID"
            error={errors.partnerId}
            required
            htmlFor="create-partner-id"
          >
            <BaseInput
              id="create-partner-id"
              size="m"
              inputMode="numeric"
              value={formValues.partnerId}
              disabled={isPending}
              onChange={handleInputChange('partnerId')}
            />
          </MatchingFormField>

          <MatchingFormField
            label="상태"
            error={errors.status}
            required
            htmlFor="create-status"
          >
            <NativeSelect
              id="create-status"
              value={formValues.status}
              disabled={isPending}
              onChange={handleInputChange('status')}
            >
              {ADMIN_MATCHING_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value} ({option.label})
                </option>
              ))}
            </NativeSelect>
          </MatchingFormField>

          <MatchingFormField
            label="유형"
            error={errors.type}
            required
            htmlFor="create-type"
          >
            <NativeSelect
              id="create-type"
              value={formValues.type}
              disabled={isPending}
              onChange={handleInputChange('type')}
            >
              {ADMIN_MATCHING_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </MatchingFormField>
        </div>

        <MatchingFormField
          label="주차 식별자"
          helper="이번 주 월요일이 기본값이며, 월요일 날짜만 선택할 수 있습니다."
          error={errors.weeklyPeriodIdentifier}
          required
          htmlFor="create-weekly-period"
        >
          <BaseInput
            id="create-weekly-period"
            type="date"
            size="m"
            min={MONDAY_DATE_INPUT_MIN}
            step={7}
            value={formValues.weeklyPeriodIdentifier}
            disabled={isPending}
            onChange={handleInputChange('weeklyPeriodIdentifier')}
          />
        </MatchingFormField>

        <MatchingFormField
          label="메모"
          helper="255자 이하로 입력합니다."
          error={errors.content}
          htmlFor="create-content"
        >
          <BorderedTextarea
            id="create-content"
            maxLength={255}
            value={formValues.content}
            disabled={isPending}
            onChange={handleInputChange('content')}
          />
        </MatchingFormField>

        <div className="flex justify-end">
          <Button
            type="button"
            size="small"
            loading={isPending}
            onClick={() => {
              handleSubmit().catch((): undefined => undefined);
            }}
          >
            수동 매칭 생성
          </Button>
        </div>
      </div>
    </AdminMatchingPanel>
  );
}
