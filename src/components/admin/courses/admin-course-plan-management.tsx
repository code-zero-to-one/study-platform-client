'use client';

import { Plus, Trash2 } from 'lucide-react';
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
  items: PlanItemFormValue[];
}

interface PlanItemFormValue {
  itemCode: string;
  label: string;
  valueAmount: string;
  displayOrder: string;
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
  items: [],
};

const emptyPlanItemForm: PlanItemFormValue = {
  itemCode: '',
  label: '',
  valueAmount: '',
  displayOrder: '',
};

const toDateTimeLocalValue = (value: string | null) => {
  if (!value) return '';
  return value.slice(0, 16);
};

const toKstOffsetDateTime = (value: string) => {
  if (!value) return null;
  return `${value.length === 16 ? `${value}:00` : value}+09:00`;
};

const isDigitsOnly = (value: string) => /^\d+$/.test(value);

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
  items: plan.items.map((item) => ({
    itemCode: item.itemCode ?? '',
    label: item.label,
    valueAmount:
      item.valueAmount === null || item.valueAmount === undefined
        ? ''
        : String(item.valueAmount),
    displayOrder:
      item.displayOrder === null || item.displayOrder === undefined
        ? ''
        : String(item.displayOrder),
  })),
});

const parseRequiredPositiveNumber = (value: string, fieldName: string) => {
  const trimmed = value.trim();
  const parsed = Number(trimmed);
  if (!isDigitsOnly(trimmed) || !Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} 양수 숫자를 입력해주세요.`);
  }
  return parsed;
};

const parseRequiredNonNegativeNumber = (value: string, fieldName: string) => {
  const trimmed = value.trim();
  const parsed = Number(trimmed);
  if (!isDigitsOnly(trimmed) || !Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} 숫자를 입력해주세요.`);
  }
  return parsed;
};

const parseOptionalNonNegativeNumber = (value: string, fieldName: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return parseRequiredNonNegativeNumber(trimmed, fieldName);
};

const parsePlanItems = (
  items: PlanItemFormValue[],
): AdminCoursePlanItemUpsertRequest[] =>
  items.map((item, index) => {
    const label = item.label.trim();

    if (!label) {
      throw new Error(`구성 항목 ${index + 1}의 항목명을 입력해주세요.`);
    }

    return {
      itemCode: item.itemCode.trim() || null,
      label,
      valueAmount: parseOptionalNonNegativeNumber(
        item.valueAmount,
        '항목 금액',
      ),
      displayOrder:
        parseOptionalNonNegativeNumber(item.displayOrder, '항목 순서') ?? index,
    };
  });

const showValidationError = (error: unknown) => {
  if (error instanceof Error) {
    useToastStore.getState().showToast(error.message, 'info');
  }
};

const toPlanPayload = (form: PlanFormValues): AdminCoursePlanUpsertRequest => {
  if (!form.planCode.trim() || !form.name.trim()) {
    throw new Error('플랜 코드와 이름을 입력해주세요.');
  }

  const regularPrice = parseRequiredPositiveNumber(form.regularPrice, '정가');
  const discountPrice = parseRequiredPositiveNumber(
    form.discountPrice,
    '얼리버드 할인가',
  );

  if (discountPrice > regularPrice) {
    throw new Error('얼리버드 할인가는 정가보다 클 수 없습니다.');
  }

  return {
    planCode: form.planCode.trim(),
    name: form.name.trim(),
    subtitle: form.subtitle.trim() || null,
    description: form.description.trim() || null,
    regularPrice,
    discountPrice,
    earlyBirdEndsAt: toKstOffsetDateTime(form.earlyBirdEndsAt),
    isActive: form.isActive === 'true',
    isRecommended: form.isRecommended === 'true',
    displayOrder: parseRequiredNonNegativeNumber(
      form.displayOrder,
      '노출 순서',
    ),
    items: parsePlanItems(form.items),
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

  const hasRecommendedPlanConflict = (
    targetForm: PlanFormValues,
    targetPlanId?: number,
  ) => {
    if (targetForm.isRecommended !== 'true') return false;

    return (
      plansQuery.data?.some((plan) => {
        if (plan.planId === targetPlanId) return false;
        const planForm = editForms[plan.planId] ?? toPlanFormValues(plan);
        return planForm.isRecommended === 'true';
      }) ?? false
    );
  };

  const handleCreatePlan = async () => {
    let request: AdminCoursePlanUpsertRequest;

    if (hasRecommendedPlanConflict(createForm)) {
      useToastStore
        .getState()
        .showToast('대표 플랜은 코스당 하나만 저장할 수 있습니다.', 'info');
      return;
    }

    try {
      request = toPlanPayload(createForm);
    } catch (error) {
      showValidationError(error);
      return;
    }

    await createPlanMutation.mutateAsync({
      courseId,
      request,
    });
    setCreateForm(emptyPlanForm);
  };

  const handleUpdatePlan = async (planId: number) => {
    const form = editForms[planId];
    if (!form) return;

    let request: AdminCoursePlanUpsertRequest;

    if (hasRecommendedPlanConflict(form, planId)) {
      useToastStore
        .getState()
        .showToast('대표 플랜은 코스당 하나만 저장할 수 있습니다.', 'info');
      return;
    }

    try {
      request = toPlanPayload(form);
    } catch (error) {
      showValidationError(error);
      return;
    }

    await updatePlanMutation.mutateAsync({
      courseId,
      planId,
      request,
    });
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
            <div className="flex items-center gap-75">
              <p className="font-designer-12r text-text-subtle">
                신규 결제에서 제외되며 기존 결제에는 영향이 없습니다.
              </p>
              <Button
                color="outlined"
                size="xsmall"
                disabled={isLocked || form.isActive === 'false'}
                onClick={onDeactivate}
              >
                비활성화
              </Button>
            </div>
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
              onChange('isActive', event.target.value as 'true' | 'false')
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
              onChange('isRecommended', event.target.value as 'true' | 'false')
            }
          >
            <option value="true">대표</option>
            <option value="false">일반</option>
          </NativeSelect>
        </label>
      </div>
      <PlanItemsEditor
        disabled={isLocked}
        items={form.items}
        onChange={(items) => onChange('items', items)}
      />
    </div>
  );
}

function PlanItemsEditor({
  disabled,
  items,
  onChange,
}: {
  disabled: boolean;
  items: PlanItemFormValue[];
  onChange: (items: PlanItemFormValue[]) => void;
}) {
  const updateItem = <FieldName extends keyof PlanItemFormValue>(
    index: number,
    field: FieldName,
    value: PlanItemFormValue[FieldName],
  ) => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    onChange([...items, { ...emptyPlanItemForm }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="mt-150 flex flex-col gap-75">
      <div className="flex items-center justify-between gap-100">
        <p className="font-designer-13m text-text-subtle">구성 항목</p>
        <Button
          color="outlined"
          size="xsmall"
          disabled={disabled}
          icon={<Plus />}
          onClick={addItem}
        >
          구성 항목 추가
        </Button>
      </div>
      <div className="border-border-default rounded-100 overflow-hidden border">
        <div className="bg-background-alternative grid grid-cols-12 gap-75 px-100 py-75">
          <span className="font-designer-12m text-text-subtle col-span-3">
            항목 코드
          </span>
          <span className="font-designer-12m text-text-subtle col-span-4">
            항목명
          </span>
          <span className="font-designer-12m text-text-subtle col-span-2">
            항목 금액
          </span>
          <span className="font-designer-12m text-text-subtle col-span-2">
            노출 순서
          </span>
          <span className="font-designer-12m text-text-subtle col-span-1">
            제거
          </span>
        </div>
        {items.length === 0 ? (
          <div className="px-100 py-125">
            <p className="font-designer-13r text-text-subtle">
              구성 항목이 없습니다.
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="border-border-subtle grid grid-cols-12 items-start gap-75 border-t px-100 py-75"
            >
              <div className="col-span-3">
                <BaseInput
                  disabled={disabled}
                  size="m"
                  value={item.itemCode}
                  placeholder="learning"
                  onValueChange={(value) =>
                    updateItem(index, 'itemCode', value)
                  }
                />
              </div>
              <div className="col-span-4">
                <BaseInput
                  disabled={disabled}
                  size="m"
                  value={item.label}
                  placeholder="학습 콘텐츠"
                  onValueChange={(value) => updateItem(index, 'label', value)}
                />
              </div>
              <div className="col-span-2">
                <BaseInput
                  disabled={disabled}
                  min={0}
                  size="m"
                  type="number"
                  value={item.valueAmount}
                  onValueChange={(value) =>
                    updateItem(index, 'valueAmount', value)
                  }
                />
              </div>
              <div className="col-span-2">
                <BaseInput
                  disabled={disabled}
                  min={0}
                  size="m"
                  type="number"
                  value={item.displayOrder}
                  onValueChange={(value) =>
                    updateItem(index, 'displayOrder', value)
                  }
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  aria-label="구성 항목 제거"
                  color="outlined"
                  size="xsmall"
                  disabled={disabled}
                  icon={<Trash2 />}
                  onClick={() => removeItem(index)}
                />
              </div>
            </div>
          ))
        )}
      </div>
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
