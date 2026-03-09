'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import { BaseInput, NativeSelect } from '@/components/ui/input';
import {
  ADMIN_MATCHING_TARGET_WEEK_OPTIONS,
  ADMIN_MATCHING_TEMPLATE_OPTIONS,
} from '@/features/admin/matching/model/admin-matching-meta';
import type { AdminMatchingAdminOption } from '@/types/matching/admin-domain';
import type {
  AutoRunMatchingFormInput,
  AutoRunMatchingFormValues,
} from '@/types/schemas/admin-matching-schema';
import { autoRunMatchingFormSchema } from '@/types/schemas/admin-matching-schema';
import AdminMatchingPanel from './admin-matching-panel';
import MatchingFormField from './matching-form-field';

const INITIAL_FORM_VALUES: AutoRunMatchingFormInput = {
  adminId: '',
  targetWeek: 'NEXT',
  templateType: 'STUDY',
  matchingKValue: '',
  numberOfNearestNeighbors: '',
  chunkSize: '',
  saveResultsChunkSize: '',
};

type AutoRunFormErrors = Partial<
  Record<keyof AutoRunMatchingFormInput, string>
>;

interface AdminMatchingRunFormPanelProps {
  adminOptions: AdminMatchingAdminOption[];
  adminOptionsErrorMessage?: string;
  defaultAdminId?: number;
  isAdminOptionsLoading: boolean;
  isPending: boolean;
  onSubmit: (values: AutoRunMatchingFormValues) => Promise<void>;
}

export default function AdminMatchingRunFormPanel({
  adminOptions,
  adminOptionsErrorMessage,
  defaultAdminId,
  isAdminOptionsLoading,
  isPending,
  onSubmit,
}: AdminMatchingRunFormPanelProps) {
  const [formValues, setFormValues] =
    useState<AutoRunMatchingFormInput>(INITIAL_FORM_VALUES);
  const [errors, setErrors] = useState<AutoRunFormErrors>({});
  const [hasUserSelectedAdmin, setHasUserSelectedAdmin] = useState(false);

  useEffect(() => {
    if (adminOptions.length === 0) {
      return;
    }

    setFormValues((previous) => {
      const hasSelectedAdmin = previous.adminId
        ? adminOptions.some(
            (adminOption) => String(adminOption.memberId) === previous.adminId,
          )
        : false;

      if (hasUserSelectedAdmin && hasSelectedAdmin) {
        return previous;
      }

      const preferredAdmin =
        adminOptions.find(
          (adminOption) => adminOption.memberId === defaultAdminId,
        ) ?? adminOptions[0];
      const preferredAdminId = String(preferredAdmin.memberId);

      if (previous.adminId === preferredAdminId) {
        return previous;
      }

      return {
        ...previous,
        adminId: preferredAdminId,
      };
    });
  }, [adminOptions, defaultAdminId, hasUserSelectedAdmin]);

  const selectedAdmin = adminOptions.find(
    (adminOption) => String(adminOption.memberId) === formValues.adminId,
  );

  const adminFieldHelper = (() => {
    if (isAdminOptionsLoading) {
      return '활성 관리자 목록을 불러오는 중입니다.';
    }

    if (selectedAdmin) {
      const selectedAdminText = selectedAdmin.memberNickname
        ? `${selectedAdmin.memberName} (${selectedAdmin.memberNickname}) (#${selectedAdmin.memberId})`
        : `${selectedAdmin.memberName} (#${selectedAdmin.memberId})`;

      return `홀수 인원 발생 시 ${selectedAdminText} 계정과 연결합니다.`;
    }

    return '활성 관리자 목록에서 자동 매칭에 사용할 관리자를 선택해주세요.';
  })();

  const handleFieldChange = (
    field: keyof AutoRunMatchingFormInput,
    value: string,
  ) => {
    if (field === 'adminId') {
      setHasUserSelectedAdmin(true);
    }

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
    (field: keyof AutoRunMatchingFormInput) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      handleFieldChange(field, event.target.value);
    };

  const handleSubmit = async () => {
    const parsed = autoRunMatchingFormSchema.safeParse(formValues);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        adminId: fieldErrors.adminId?.[0],
        targetWeek: fieldErrors.targetWeek?.[0],
        templateType: fieldErrors.templateType?.[0],
        matchingKValue: fieldErrors.matchingKValue?.[0],
        numberOfNearestNeighbors: fieldErrors.numberOfNearestNeighbors?.[0],
        chunkSize: fieldErrors.chunkSize?.[0],
        saveResultsChunkSize: fieldErrors.saveResultsChunkSize?.[0],
      });

      return;
    }

    await onSubmit(parsed.data);
  };

  return (
    <AdminMatchingPanel
      title="자동 매칭 수동 실행"
      description="홀수 인원 발생 시 연결할 관리자와 실행 옵션을 지정해 자동 매칭을 즉시 실행합니다."
    >
      <div className="flex flex-col gap-150">
        <div className="grid gap-150 xl:grid-cols-2">
          <MatchingFormField
            label="관리자"
            helper={adminFieldHelper}
            error={errors.adminId ?? adminOptionsErrorMessage}
            required
            htmlFor="run-admin-id"
          >
            <NativeSelect
              id="run-admin-id"
              value={formValues.adminId}
              disabled={
                isPending || isAdminOptionsLoading || adminOptions.length === 0
              }
              onChange={handleInputChange('adminId')}
            >
              <option value="" disabled>
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
            label="대상 주차"
            error={errors.targetWeek}
            required
            htmlFor="run-target-week"
          >
            <NativeSelect
              id="run-target-week"
              value={formValues.targetWeek}
              disabled={isPending}
              onChange={handleInputChange('targetWeek')}
            >
              {ADMIN_MATCHING_TARGET_WEEK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </MatchingFormField>

          <MatchingFormField
            label="매칭 템플릿"
            error={errors.templateType}
            required
            htmlFor="run-template-type"
          >
            <NativeSelect
              id="run-template-type"
              value={formValues.templateType}
              disabled={isPending}
              onChange={handleInputChange('templateType')}
            >
              {ADMIN_MATCHING_TEMPLATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          </MatchingFormField>

          <MatchingFormField
            label="K 값"
            helper="비워두면 서버가 자동 계산합니다."
            error={errors.matchingKValue}
            htmlFor="run-matching-k"
          >
            <BaseInput
              id="run-matching-k"
              size="m"
              inputMode="numeric"
              value={formValues.matchingKValue ?? ''}
              disabled={isPending}
              onChange={handleInputChange('matchingKValue')}
            />
          </MatchingFormField>

          <MatchingFormField
            label="최근접 이웃 수"
            helper="비워두면 서버가 자동 계산합니다."
            error={errors.numberOfNearestNeighbors}
            htmlFor="run-neighbors"
          >
            <BaseInput
              id="run-neighbors"
              size="m"
              inputMode="numeric"
              value={formValues.numberOfNearestNeighbors ?? ''}
              disabled={isPending}
              onChange={handleInputChange('numberOfNearestNeighbors')}
            />
          </MatchingFormField>

          <MatchingFormField
            label="처리 청크 크기"
            helper="숫자를 입력하면 한 번에 처리할 회원 수를 고정합니다."
            error={errors.chunkSize}
            htmlFor="run-chunk-size"
          >
            <BaseInput
              id="run-chunk-size"
              size="m"
              inputMode="numeric"
              value={formValues.chunkSize ?? ''}
              disabled={isPending}
              onChange={handleInputChange('chunkSize')}
            />
          </MatchingFormField>

          <MatchingFormField
            label="결과 저장 청크"
            helper="비워두면 서버 기본값을 사용합니다."
            error={errors.saveResultsChunkSize}
            htmlFor="run-save-results-chunk"
          >
            <BaseInput
              id="run-save-results-chunk"
              size="m"
              inputMode="numeric"
              value={formValues.saveResultsChunkSize ?? ''}
              disabled={isPending}
              onChange={handleInputChange('saveResultsChunkSize')}
            />
          </MatchingFormField>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            size="small"
            disabled={
              isPending || isAdminOptionsLoading || adminOptions.length === 0
            }
            loading={isPending}
            onClick={() => {
              handleSubmit().catch((): undefined => undefined);
            }}
          >
            자동 매칭 실행
          </Button>
        </div>
      </div>
    </AdminMatchingPanel>
  );
}
