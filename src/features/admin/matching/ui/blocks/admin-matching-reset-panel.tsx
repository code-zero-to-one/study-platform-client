'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/common/ui/button';
import { BaseInput } from '@/components/common/ui/input';
import KeyValueRow from '@/components/common/ui/key-value-row';
import { Modal } from '@/components/common/ui/modal';
import SurfacePanel from '@/components/common/ui/surface-panel';
import type { AdminMatchingResetSummary } from '@/types/matching/admin-domain';
import type {
  ResetWeeklyMatchingFormInput,
  ResetWeeklyMatchingFormValues,
} from '@/types/schemas/admin-matching-schema';
import { resetWeeklyMatchingFormSchema } from '@/types/schemas/admin-matching-schema';
import { MONDAY_DATE_INPUT_MIN } from '@/utils/time';
import AdminMatchingPanel from './admin-matching-panel';
import MatchingFormField from './matching-form-field';

type ResetFormErrors = Partial<
  Record<keyof ResetWeeklyMatchingFormInput, string>
>;

interface AdminMatchingResetPanelProps {
  defaultWeeklyPeriodIdentifier: string;
  isPending: boolean;
  onSubmit: (
    values: ResetWeeklyMatchingFormValues,
  ) => Promise<AdminMatchingResetSummary | undefined>;
}

export default function AdminMatchingResetPanel({
  defaultWeeklyPeriodIdentifier,
  isPending,
  onSubmit,
}: AdminMatchingResetPanelProps) {
  const [formValues, setFormValues] = useState<ResetWeeklyMatchingFormInput>({
    weeklyPeriodIdentifier: defaultWeeklyPeriodIdentifier,
  });
  const [errors, setErrors] = useState<ResetFormErrors>({});
  const [lastResetResult, setLastResetResult] =
    useState<AdminMatchingResetSummary>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    setFormValues((previous) => {
      if (previous.weeklyPeriodIdentifier) {
        return previous;
      }

      return {
        weeklyPeriodIdentifier: defaultWeeklyPeriodIdentifier,
      };
    });
  }, [defaultWeeklyPeriodIdentifier]);

  const validateForm = () => {
    const parsed = resetWeeklyMatchingFormSchema.safeParse(formValues);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        weeklyPeriodIdentifier: fieldErrors.weeklyPeriodIdentifier?.[0],
      });

      return undefined;
    }

    setErrors({});

    return parsed.data;
  };

  const handleOpenConfirm = () => {
    const parsed = validateForm();

    if (!parsed) {
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmReset = async () => {
    const parsed = validateForm();

    if (!parsed) {
      setIsConfirmOpen(false);

      return;
    }

    const result = await onSubmit(parsed);

    setLastResetResult(result);
    setIsConfirmOpen(false);
  };

  const handleConfirmResetClick = async () => {
    try {
      await handleConfirmReset();
    } catch {
      // Error toast is already handled in the controller action.
    }
  };

  return (
    <AdminMatchingPanel
      title="주차 매칭 데이터 초기화"
      description="특정 주차의 매칭 요청, 스터디 멤버, 데일리 스터디, 출석까지 일괄 초기화합니다."
    >
      <div className="flex flex-col gap-150">
        <MatchingFormField
          label="주차 식별자"
          helper="이번 주 월요일이 기본값이며, 삭제 기준은 월요일 날짜만 선택할 수 있습니다."
          error={errors.weeklyPeriodIdentifier}
          required
          htmlFor="reset-weekly-period"
        >
          <BaseInput
            id="reset-weekly-period"
            type="date"
            size="m"
            min={MONDAY_DATE_INPUT_MIN}
            step={7}
            value={formValues.weeklyPeriodIdentifier}
            disabled={isPending}
            onChange={(event) => {
              setFormValues({
                weeklyPeriodIdentifier: event.target.value,
              });
              setErrors({});
            }}
          />
        </MatchingFormField>

        <div className="flex justify-end">
          <Button
            type="button"
            size="small"
            color="outlined"
            loading={isPending}
            onClick={handleOpenConfirm}
          >
            주차 데이터 초기화
          </Button>
        </div>

        <Modal.Root
          open={isConfirmOpen}
          onOpenChange={(nextOpen) => {
            if (isPending) {
              return;
            }

            setIsConfirmOpen(nextOpen);
          }}
        >
          <Modal.Portal>
            <Modal.Overlay />
            <Modal.Content
              size="small"
              description="선택한 주차의 매칭 운영 데이터를 초기화할지 다시 확인합니다."
            >
              <Modal.Header variant="alert">
                <Modal.Title>주차 데이터 초기화 확인</Modal.Title>
              </Modal.Header>
              <Modal.Body variant="alert" className="items-start text-left">
                <div className="flex flex-col gap-100">
                  <p className="font-designer-14b text-text-default">
                    {formValues.weeklyPeriodIdentifier || '-'} 주차 데이터를
                    초기화합니다.
                  </p>
                  <p>
                    이 작업은 매칭 요청, 매칭 결과, 스터디 스페이스, 데일리
                    스터디, 출석, 스터디 멤버를 함께 삭제합니다.
                  </p>
                  <p>삭제 후에는 되돌릴 수 없습니다.</p>
                </div>
              </Modal.Body>
              <Modal.Footer variant="alert">
                <Button
                  type="button"
                  color="secondary"
                  disabled={isPending}
                  onClick={() => setIsConfirmOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  loading={isPending}
                  onClick={handleConfirmResetClick}
                >
                  초기화 실행
                </Button>
              </Modal.Footer>
            </Modal.Content>
          </Modal.Portal>
        </Modal.Root>

        {lastResetResult ? (
          <SurfacePanel className="p-200">
            <div className="border-border-subtle mb-150 border-b pb-150">
              <h3 className="font-designer-16b text-text-default">
                최근 초기화 결과
              </h3>
            </div>
            <div className="grid gap-100 xl:grid-cols-2">
              <KeyValueRow
                label="주차"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {lastResetResult.weeklyPeriodIdentifier ?? '-'}
              </KeyValueRow>
              <KeyValueRow
                label="매칭 요청"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {lastResetResult.deletedMatchingRequests ?? 0}건
              </KeyValueRow>
              <KeyValueRow
                label="매칭 결과"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {lastResetResult.deletedMatchingRequestPartners ?? 0}건
              </KeyValueRow>
              <KeyValueRow
                label="스터디 스페이스"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {lastResetResult.deletedStudySpaces ?? 0}건
              </KeyValueRow>
              <KeyValueRow
                label="데일리 스터디"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {lastResetResult.deletedDailyStudies ?? 0}건
              </KeyValueRow>
              <KeyValueRow
                label="출석"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {lastResetResult.deletedAttendances ?? 0}건
              </KeyValueRow>
              <KeyValueRow
                label="스터디 멤버"
                columnsClassName="grid-cols-[120px_minmax(0,1fr)]"
              >
                {lastResetResult.deletedStudyMembers ?? 0}건
              </KeyValueRow>
            </div>
          </SurfacePanel>
        ) : null}
      </div>
    </AdminMatchingPanel>
  );
}
