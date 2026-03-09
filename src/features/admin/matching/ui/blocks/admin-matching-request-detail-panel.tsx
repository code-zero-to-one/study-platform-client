'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  BaseInput,
  NativeSelect,
  TextAreaInput as BorderedTextarea,
} from '@/components/ui/input';
import KeyValueRow from '@/components/ui/key-value-row';
import SurfacePanel from '@/components/ui/surface-panel';
import {
  ADMIN_MATCHING_STATUS_OPTIONS,
  ADMIN_MATCHING_TYPE_META,
} from '@/features/admin/matching/model/admin-matching-meta';
import ConfirmDeleteModal from '@/features/study/group/ui/confirm-delete-modal';
import type { AdminMatchingRequestDetail } from '@/types/matching/admin-domain';
import type {
  AdminMatchingUpdateFormInput,
  AdminMatchingUpdateFormValues,
} from '@/types/schemas/admin-matching-schema';
import { adminMatchingUpdateFormSchema } from '@/types/schemas/admin-matching-schema';
import AdminMatchingPanel from './admin-matching-panel';
import MatchingFormField from './matching-form-field';

type UpdateFormErrors = Partial<
  Record<keyof AdminMatchingUpdateFormInput, string>
>;

const EMPTY_UPDATE_FORM_VALUES: AdminMatchingUpdateFormInput = {
  partnerId: '',
  status: 'RES_ACPT',
  content: '',
};

interface AdminMatchingRequestDetailPanelProps {
  selectedRequest?: AdminMatchingRequestDetail;
  selectedRequestSummary?: {
    memberText: string;
    partnerText: string;
    createdAtText: string;
    updatedAtText: string;
    weeklyPeriodIdentifierText: string;
  };
  selectedRequestStatusMeta?: {
    label: string;
    color: React.ComponentProps<typeof Badge>['color'];
  };
  detailErrorMessage?: string;
  isLoading: boolean;
  isUpdatePending: boolean;
  isDeletePending: boolean;
  className?: string;
  onUpdateRequest: (values: AdminMatchingUpdateFormValues) => Promise<void>;
  onDeleteRequest: () => Promise<void>;
}

export default function AdminMatchingRequestDetailPanel({
  selectedRequest,
  selectedRequestSummary,
  selectedRequestStatusMeta,
  detailErrorMessage,
  isLoading,
  isUpdatePending,
  isDeletePending,
  className,
  onUpdateRequest,
  onDeleteRequest,
}: AdminMatchingRequestDetailPanelProps) {
  const [updateFormValues, setUpdateFormValues] =
    useState<AdminMatchingUpdateFormInput>(EMPTY_UPDATE_FORM_VALUES);
  const [updateErrors, setUpdateErrors] = useState<UpdateFormErrors>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!selectedRequest) {
      setUpdateFormValues(EMPTY_UPDATE_FORM_VALUES);
      setUpdateErrors({});

      return;
    }

    setUpdateFormValues({
      partnerId: String(selectedRequest.partnerId),
      status: selectedRequest.status,
      content: selectedRequest.content ?? '',
    });
    setUpdateErrors({});
  }, [selectedRequest]);

  const handleUpdateSubmit = async () => {
    const parsed = adminMatchingUpdateFormSchema.safeParse(updateFormValues);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setUpdateErrors({
        partnerId: fieldErrors.partnerId?.[0],
        status: fieldErrors.status?.[0],
        content: fieldErrors.content?.[0],
      });

      return;
    }

    await onUpdateRequest(parsed.data);
  };

  const handleUpdateClick = async () => {
    try {
      await handleUpdateSubmit();
    } catch {
      // Error toast is already handled in the controller action.
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDeleteRequest();
      setIsDeleteDialogOpen(false);
    } catch {
      // Error toast is already handled in the controller action.
    }
  };

  const handleInputChange =
    (field: keyof AdminMatchingUpdateFormInput) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const nextValue = event.target.value;

      setUpdateFormValues((previous) => ({
        ...previous,
        [field]:
          field === 'status'
            ? (nextValue as AdminMatchingUpdateFormInput['status'])
            : nextValue,
      }));
      setUpdateErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    };

  const typeMeta = selectedRequest
    ? ADMIN_MATCHING_TYPE_META[selectedRequest.type]
    : undefined;

  return (
    <>
      <AdminMatchingPanel
        title="선택된 매칭 요청 상세와 수정"
        description="목록에서 선택한 매칭 요청의 상세 정보를 확인하고 파트너, 상태, 메모를 수정합니다."
        className={className}
        bodyClassName="h-full"
      >
        <div className="flex h-full flex-col gap-150">
          {isLoading ? (
            <div className="rounded-100 bg-background-neutral-subtle px-150 py-200">
              <p className="font-designer-14r text-text-subtle">
                매칭 요청 상세를 불러오는 중입니다.
              </p>
            </div>
          ) : null}

          {!isLoading && detailErrorMessage ? (
            <div className="rounded-100 border-border-error bg-fill-danger-subtle-default border px-150 py-200">
              <p className="font-designer-14r text-text-error">
                {detailErrorMessage}
              </p>
            </div>
          ) : null}

          {!isLoading && selectedRequest && selectedRequestSummary ? (
            <>
              <SurfacePanel className="p-200">
                <div className="border-border-subtle mb-150 flex items-center justify-between gap-150 border-b pb-150">
                  <div>
                    <h3 className="font-designer-16b text-text-default">
                      요청 상세
                    </h3>
                    <p className="font-designer-13r text-text-subtle mt-50">
                      선택된 매칭 요청의 현재 상태와 메타데이터입니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-75">
                    {selectedRequestStatusMeta ? (
                      <Badge
                        color={selectedRequestStatusMeta.color}
                        shape="rectangle"
                      >
                        {selectedRequestStatusMeta.label}
                      </Badge>
                    ) : null}
                    {typeMeta ? (
                      <Badge color={typeMeta.color} shape="rectangle">
                        {typeMeta.label}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-150 xl:grid-cols-2">
                  <KeyValueRow
                    label="요청 ID"
                    columnsClassName="grid-cols-[96px_minmax(0,1fr)]"
                  >
                    #{selectedRequest.matchingRequestId}
                  </KeyValueRow>
                  <KeyValueRow
                    label="회원"
                    columnsClassName="grid-cols-[96px_minmax(0,1fr)]"
                  >
                    {selectedRequestSummary.memberText}
                  </KeyValueRow>
                  <KeyValueRow
                    label="파트너"
                    columnsClassName="grid-cols-[96px_minmax(0,1fr)]"
                  >
                    {selectedRequestSummary.partnerText}
                  </KeyValueRow>
                  <KeyValueRow
                    label="주차"
                    columnsClassName="grid-cols-[96px_minmax(0,1fr)]"
                  >
                    {selectedRequestSummary.weeklyPeriodIdentifierText}
                  </KeyValueRow>
                  <KeyValueRow
                    label="생성일"
                    columnsClassName="grid-cols-[96px_minmax(0,1fr)]"
                  >
                    {selectedRequestSummary.createdAtText}
                  </KeyValueRow>
                  <KeyValueRow
                    label="수정일"
                    columnsClassName="grid-cols-[96px_minmax(0,1fr)]"
                  >
                    {selectedRequestSummary.updatedAtText}
                  </KeyValueRow>
                </div>
              </SurfacePanel>

              <div className="flex flex-col gap-150">
                <div className="grid gap-150 xl:grid-cols-2">
                  <MatchingFormField
                    label="파트너 ID"
                    error={updateErrors.partnerId}
                    required
                    htmlFor="update-partner-id"
                  >
                    <BaseInput
                      id="update-partner-id"
                      size="m"
                      inputMode="numeric"
                      value={updateFormValues.partnerId}
                      disabled={isUpdatePending || isDeletePending}
                      onChange={handleInputChange('partnerId')}
                    />
                  </MatchingFormField>

                  <MatchingFormField
                    label="상태"
                    error={updateErrors.status}
                    required
                    htmlFor="update-status"
                  >
                    <NativeSelect
                      id="update-status"
                      value={updateFormValues.status}
                      disabled={isUpdatePending || isDeletePending}
                      onChange={handleInputChange('status')}
                    >
                      {ADMIN_MATCHING_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.value} ({option.label})
                        </option>
                      ))}
                    </NativeSelect>
                  </MatchingFormField>
                </div>

                <MatchingFormField
                  label="메모"
                  helper="내용을 비우고 저장하면 메모를 제거할 수 있습니다."
                  error={updateErrors.content}
                  htmlFor="update-content"
                >
                  <BorderedTextarea
                    id="update-content"
                    maxLength={255}
                    value={updateFormValues.content}
                    disabled={isUpdatePending || isDeletePending}
                    onChange={handleInputChange('content')}
                  />
                </MatchingFormField>

                <div className="flex flex-wrap justify-end gap-100">
                  <Button
                    type="button"
                    size="small"
                    color="outlined"
                    className="border-border-error text-text-error"
                    disabled={isDeletePending || isUpdatePending}
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    삭제
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    loading={isUpdatePending}
                    disabled={isDeletePending}
                    onClick={handleUpdateClick}
                  >
                    수정 적용
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          {!isLoading && !detailErrorMessage && !selectedRequest ? (
            <div className="bg-background-neutral-subtle rounded-100 flex flex-1 items-center px-150 py-200">
              <p className="font-designer-14r text-text-subtle">
                목록에서 매칭 요청을 선택하면 상세 정보와 수정 폼이 표시됩니다.
              </p>
            </div>
          ) : null}
        </div>
      </AdminMatchingPanel>

      <ConfirmDeleteModal
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
        title="매칭 요청 삭제"
        content="삭제는 논리 삭제로 처리됩니다. 현재 선택한 매칭 요청을 삭제하시겠습니까?"
        confirmText="삭제"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
