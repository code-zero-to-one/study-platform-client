'use client';

import { AlertCircle, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/common/ui/button';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import { BaseInput } from '@/components/common/ui/input';
import { Modal } from '@/components/common/ui/modal';
import { useSearchBanks } from '@/hooks/queries/bank-search-queries';
import {
  type MentorSettlementAccountInput,
  type MentorSettlementRegisterModalProps,
} from '@/types/mentoring/registration-view';

const FALLBACK_BANK_OPTIONS = [
  { value: '국민은행', label: '국민은행' },
  { value: '신한은행', label: '신한은행' },
  { value: '우리은행', label: '우리은행' },
  { value: '하나은행', label: '하나은행' },
  { value: '기업은행', label: '기업은행' },
  { value: '농협은행', label: '농협은행' },
  { value: '카카오뱅크', label: '카카오뱅크' },
  { value: '케이뱅크', label: '케이뱅크' },
] as const;

const getInitialDraftState = (
  initialValue: MentorSettlementRegisterModalProps['initialValue'],
): MentorSettlementAccountInput => {
  if (initialValue) {
    return {
      bankName: initialValue.bankName,
      accountNumber: initialValue.accountNumber,
      accountHolder: initialValue.accountHolder,
    };
  }

  return {
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  };
};

export default function SettlementRegisterModal({
  open,
  initialValue,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: MentorSettlementRegisterModalProps) {
  const { data: bankList } = useSearchBanks();
  const [draft, setDraft] = useState<MentorSettlementAccountInput>(() =>
    getInitialDraftState(initialValue),
  );
  const [errorMessage, setErrorMessage] = useState('');

  const bankOptions = useMemo(() => {
    const mappedOptions = (bankList ?? []).map((bank) => ({
      value: bank.bankName ?? '',
      label: bank.bankName ?? '',
    }));
    const validOptions = mappedOptions.filter(
      (option) => option.value !== '' && option.label !== '',
    );

    if (validOptions.length > 0) {
      return validOptions;
    }

    return FALLBACK_BANK_OPTIONS.map((option) => ({ ...option }));
  }, [bankList]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraft(getInitialDraftState(initialValue));
    setErrorMessage('');
  }, [initialValue, open]);

  const closeModal = () => {
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);
  };

  const hasRequiredFields =
    draft.bankName.trim().length > 0 &&
    draft.accountHolder.trim().length > 0 &&
    draft.accountNumber.trim().length >= 8;

  const handleSubmit = async () => {
    if (!hasRequiredFields) {
      setErrorMessage('은행, 계좌번호, 예금주를 모두 입력해주세요.');

      return;
    }

    setErrorMessage('');

    try {
      await onSubmit({
        bankName: draft.bankName.trim(),
        accountNumber: draft.accountNumber.trim(),
        accountHolder: draft.accountHolder.trim(),
      });
      closeModal();
    } catch {
      // Errors are surfaced by the caller toast. Keep the modal open so the
      // user can retry without re-entering the values.
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-full max-w-[720px]">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title className="font-designer-28b text-text-default">
              정산 계좌 등록
            </Modal.Title>
            <Modal.Close
              onClick={closeModal}
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
            >
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-150 sm:gap-200">
            <div className="rounded-100 bg-fill-brand-subtle-default text-text-brand flex items-start gap-100 px-200 py-150">
              <AlertCircle className="h-18 w-18 shrink-0" />
              <p className="font-designer-16m leading-relaxed">
                멘티 신청을 받으려면 정산 계좌 등록이 필요합니다. 계좌 정보는
                멘토 본인에게만 표시됩니다.
              </p>
            </div>

            <SingleDropdown
              options={bankOptions}
              value={draft.bankName}
              onChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  bankName: value ?? '',
                }))
              }
              placeholder="은행 선택"
            />

            <BaseInput
              value={draft.accountNumber}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  accountNumber: value,
                }))
              }
              placeholder="계좌번호"
            />

            <BaseInput
              value={draft.accountHolder}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  accountHolder: value,
                }))
              }
              placeholder="예금주명"
            />

            {errorMessage && (
              <p className="font-designer-13r text-text-error">
                {errorMessage}
              </p>
            )}
          </Modal.Body>

          <Modal.Footer className="gap-100 border-t-0 sm:justify-end">
            <Button
              type="button"
              color="secondary"
              size="medium"
              className="w-full sm:w-auto"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="button"
              color="primary"
              size="medium"
              className="w-full sm:w-auto"
              onClick={(): void => {
                handleSubmit().catch((): undefined => undefined);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? '저장 중...'
                : initialValue
                  ? '정산 계좌 수정'
                  : '정산 계좌 등록'}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
