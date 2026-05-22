'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/common/ui/button';
import { BaseInput, NativeSelect } from '@/components/common/ui/input';
import type {
  AdminCoursePlan,
  AdminCoursePlanItemUpsertRequest,
  AdminCoursePlanUpsertRequest,
} from '@/features/admin/course-management/model/admin-course-management-contract';
import {
  useAdminCoursePlansQuery,
  useCreateAdminCoursePlanMutation,
  useDeactivateAdminCoursePlanMutation,
  useUpdateAdminCoursePlanMutation,
} from '@/features/admin/course-management/model/use-admin-course-management-query';
import { useToastStore } from '@/stores/use-toast-store';

interface PlanFormValues {
  planCode: string;
  name: string;
  subtitle: string;
  description: string;
  regularPrice: string;
  discountPrice: string;
  earlyBirdEndsAt: string;
  isActive: 'true' | 'false';
  isRecommended: 'true' | 'false';
  displayOrder: string;
  itemsText: string;
}

const emptyPlanForm: PlanFormValues = {
  planCode: '',
  name: '',
  subtitle: '',
  description: '',
  regularPrice: '',
  discountPrice: '',
  earlyBirdEndsAt: '',
  isActive: 'true',
  isRecommended: 'false',
  displayOrder: '0',
  itemsText: '',
};

const toDateTimeLocalValue = (value: string | null) => {
  if (!value) return '';
  return value.slice(0, 16);
};

const toKstOffsetDateTime = (value: string) => {
  if (!value) return null;
  return `${value.length === 16 ? `${value}:00` : value}+09:00`;
};

const serializePlanItems = (items: AdminCoursePlan['items']) => {
  return items
    .map((item, index) =>
      [
        item.itemCode ?? '',
        item.label,
        item.valueAmount ?? 0,
        item.displayOrder ?? index,
      ].join(' | '),
    )
    .join('\n');
};

const toPlanFormValues = (plan: AdminCoursePlan): PlanFormValues => ({
  planCode: plan.planCode,
  name: plan.name,
  subtitle: plan.subtitle ?? '',
  description: plan.description ?? '',
  regularPrice: String(plan.regularPrice),
  discountPrice: String(plan.discountPrice),
  earlyBirdEndsAt: toDateTimeLocalValue(plan.earlyBirdEndsAt),
  isActive: plan.isActive ? 'true' : 'false',
  isRecommended: plan.isRecommended ? 'true' : 'false',
  displayOrder: String(plan.displayOrder),
  itemsText: serializePlanItems(plan.items),
});

const parseRequiredNumber = (value: string, fieldName: string) => {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} 숫자를 입력해주세요.`);
  }
  return parsed;
};

const parsePlanItems = (
  itemsText: string,
): AdminCoursePlanItemUpsertRequest[] =>
  itemsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [itemCode, label, valueAmount, displayOrder] = line
        .split('|')
        .map((part) => part.trim());

      if (!label) {
        throw new Error('플랜 구성 항목 label을 입력해주세요.');
      }

      return {
        itemCode: itemCode || null,
        label,
        valueAmount: valueAmount
          ? parseRequiredNumber(valueAmount, '항목 금액')
          : 0,
        displayOrder: displayOrder
          ? parseRequiredNumber(displayOrder, '항목 순서')
          : index,
      };
    });

const showValidationError = (error: unknown) => {
  if (error instanceof Error) {
    useToastStore.getState().showToast(error.message, 'info');
  }
};

const toBooleanSelectValue = (value: string): 'true' | 'false' => {
  return value === 'false' ? 'false' : 'true';
};

const toPlanPayload = (form: PlanFormValues): AdminCoursePlanUpsertRequest => {
  if (!form.planCode.trim() || !form.name.trim()) {
    throw new Error('플랜 코드와 이름을 입력해주세요.');
  }

  return {
    planCode: form.planCode.trim(),
    name: form.name.trim(),
    subtitle: form.subtitle.trim() || null,
    description: form.description.trim() || null,
    regularPrice: parseRequiredNumber(form.regularPrice, '정가'),
    discountPrice: parseRequiredNumber(form.discountPrice, '할인가'),
    earlyBirdEndsAt: toKstOffsetDateTime(form.earlyBirdEndsAt),
    isActive: form.isActive === 'true',
    isRecommended: form.isRecommended === 'true',
    displayOrder: parseRequiredNumber(form.displayOrder, '노출 순서'),
    items: parsePlanItems(form.itemsText),
  };
};

export default function AdminCoursePlanManagement({
  courseId,
}: {
  courseId: number;
}) {
  const plansQuery = useAdminCoursePlansQuery(courseId);
  const createPlanMutation = useCreateAdminCoursePlanMutation();
  const updatePlanMutation = useUpdateAdminCoursePlanMutation();
  const deactivatePlanMutation = useDeactivateAdminCoursePlanMutation();
  const [createForm, setCreateForm] = useState<PlanFormValues>(emptyPlanForm);
  const [editForms, setEditForms] = useState<Record<number, PlanFormValues>>(
    {},
  );
  const isMutating =
    createPlanMutation.isPending ||
    updatePlanMutation.isPending ||
    deactivatePlanMutation.isPending;

  useEffect(() => {
    if (!plansQuery.data) return;
    setEditForms(
      Object.fromEntries(
        plansQuery.data.map((plan) => [plan.planId, toPlanFormValues(plan)]),
      ),
    );
  }, [plansQuery.data]);

  const activePlans = useMemo(
    () => plansQuery.data?.filter((plan) => plan.isActive) ?? [],
    [plansQuery.data],
  );

  const updateCreateFormField = <FieldName extends keyof PlanFormValues>(
    field: FieldName,
    value: PlanFormValues[FieldName],
  ) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateEditFormField = <FieldName extends keyof PlanFormValues>(
    planId: number,
    field: FieldName,
    value: PlanFormValues[FieldName],
  ) => {
    setEditForms((prev) => ({
      ...prev,
      [planId]: { ...(prev[planId] ?? emptyPlanForm), [field]: value },
    }));
  };

  const handleCreatePlan = async () => {
    let request: AdminCoursePlanUpsertRequest;

    try {
      request = toPlanPayload(createForm);
    } catch (error) {
      showValidationError(error);
      return;
    }

    try {
      await createPlanMutation.mutateAsync({
        courseId,
        request,
      });
      setCreateForm(emptyPlanForm);
    } catch {
      // Mutation onError handles user-facing feedback.
    }
  };

  const handleUpdatePlan = async (planId: number) => {
    const form = editForms[planId];
    if (!form) return;

    let request: AdminCoursePlanUpsertRequest;

    try {
      request = toPlanPayload(form);
    } catch (error) {
      showValidationError(error);
      return;
    }

    try {
      await updatePlanMutation.mutateAsync({
        courseId,
        planId,
        request,
      });
    } catch {
      // Mutation onError handles user-facing feedback.
    }
  };

  return (
    <div className="border-border-default bg-background-default rounded-150 border p-200">
      <div className="mb-150 flex items-start justify-between gap-100">
        <div>
          <h2 className="font-designer-20b text-text-default">플랜 관리</h2>
          <p className="font-designer-13r text-text-subtle mt-50">
            가격과 얼리버드는 코스 기본정보가 아니라 course_plan row를 SoT로
            관리합니다.
          </p>
        </div>
        <span className="font-designer-13m text-text-subtle">
          활성 플랜 {activePlans.length}개
        </span>
      </div>

      {plansQuery.isLoading ? (
        <p className="font-designer-14r text-text-subtle">
          플랜 목록을 불러오는 중입니다.
        </p>
      ) : plansQuery.isError ? (
        <p className="font-designer-14r text-text-error">
          플랜 목록을 불러오지 못했습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-150">
          {plansQuery.data?.map((plan) => (
            <PlanEditor
              key={plan.planId}
              form={editForms[plan.planId] ?? toPlanFormValues(plan)}
              isLocked={isMutating}
              title={`${plan.name} · ${plan.planCode}`}
              onChange={(field, value) =>
                updateEditFormField(plan.planId, field, value)
              }
              onDeactivate={() =>
                deactivatePlanMutation.mutate({ courseId, planId: plan.planId })
              }
              onSave={() => handleUpdatePlan(plan.planId)}
            />
          ))}
        </div>
      )}

      <div className="border-border-subtle mt-200 border-t pt-150">
        <h3 className="font-designer-16b text-text-default">새 플랜 생성</h3>
        <PlanEditor
          form={createForm}
          isLocked={isMutating}
          title="신규 플랜"
          onChange={updateCreateFormField}
          onSave={handleCreatePlan}
        />
      </div>
    </div>
  );
}

function PlanEditor({
  form,
  isLocked,
  title,
  onChange,
  onDeactivate,
  onSave,
}: {
  form: PlanFormValues;
  isLocked: boolean;
  title: string;
  onChange: <FieldName extends keyof PlanFormValues>(
    field: FieldName,
    value: PlanFormValues[FieldName],
  ) => void;
  onDeactivate?: () => void;
  onSave: () => void;
}) {
  return (
    <div className="border-border-default rounded-150 border p-150">
      <div className="mb-125 flex items-center justify-between gap-100">
        <h3 className="font-designer-16b text-text-default">{title}</h3>
        <div className="flex gap-75">
          {onDeactivate && (
            <Button
              color="outlined"
              size="xsmall"
              disabled={isLocked || form.isActive === 'false'}
              onClick={onDeactivate}
            >
              비활성화
            </Button>
          )}
          <Button size="xsmall" disabled={isLocked} onClick={onSave}>
            저장
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-100">
        <PlanInput
          disabled={isLocked}
          label="planCode"
          value={form.planCode}
          onChange={(value) => onChange('planCode', value)}
        />
        <PlanInput
          disabled={isLocked}
          label="플랜명"
          value={form.name}
          onChange={(value) => onChange('name', value)}
        />
        <PlanInput
          disabled={isLocked}
          label="부제"
          value={form.subtitle}
          onChange={(value) => onChange('subtitle', value)}
        />
        <PlanInput
          disabled={isLocked}
          label="설명"
          value={form.description}
          onChange={(value) => onChange('description', value)}
        />
        <PlanInput
          disabled={isLocked}
          label="정가"
          type="number"
          value={form.regularPrice}
          onChange={(value) => onChange('regularPrice', value)}
        />
        <PlanInput
          disabled={isLocked}
          label="얼리버드 할인가"
          type="number"
          value={form.discountPrice}
          onChange={(value) => onChange('discountPrice', value)}
        />
        <PlanInput
          disabled={isLocked}
          label="얼리버드 종료"
          type="datetime-local"
          value={form.earlyBirdEndsAt}
          onChange={(value) => onChange('earlyBirdEndsAt', value)}
        />
        <PlanInput
          disabled={isLocked}
          label="노출 순서"
          type="number"
          value={form.displayOrder}
          onChange={(value) => onChange('displayOrder', value)}
        />
        <label className="font-designer-13m text-text-subtle flex flex-col gap-50">
          활성 여부
          <NativeSelect
            disabled={isLocked}
            value={form.isActive}
            onChange={(event) =>
              onChange('isActive', toBooleanSelectValue(event.target.value))
            }
          >
            <option value="true">활성</option>
            <option value="false">비활성</option>
          </NativeSelect>
        </label>
        <label className="font-designer-13m text-text-subtle flex flex-col gap-50">
          대표 플랜
          <NativeSelect
            disabled={isLocked}
            value={form.isRecommended}
            onChange={(event) =>
              onChange(
                'isRecommended',
                toBooleanSelectValue(event.target.value),
              )
            }
          >
            <option value="true">대표</option>
            <option value="false">일반</option>
          </NativeSelect>
        </label>
      </div>
      <label className="font-designer-13m text-text-subtle mt-100 flex flex-col gap-50">
        구성 항목
        <textarea
          className="border-border-default rounded-100 min-h-260 border bg-background-default px-100 py-75 font-designer-13r text-text-default"
          disabled={isLocked}
          value={form.itemsText}
          placeholder="itemCode | label | valueAmount | displayOrder"
          onChange={(event) => onChange('itemsText', event.target.value)}
        />
      </label>
    </div>
  );
}

function PlanInput({
  disabled,
  label,
  type = 'text',
  value,
  onChange,
}: {
  disabled: boolean;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="font-designer-13m text-text-subtle flex flex-col gap-50">
      {label}
      <BaseInput
        disabled={disabled}
        size="m"
        type={type}
        value={value}
        onValueChange={onChange}
      />
    </label>
  );
}
