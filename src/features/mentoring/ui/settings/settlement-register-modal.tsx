'use client';

import { AlertCircle, XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SETTLEMENT_PAYER_OPTIONS } from '@/features/mentoring/model/mentor-setting-options';
import { useSearchBanks } from '@/hooks/queries/bank-search-api';
import { type MentorSettlementRegisterModalProps } from '@/types/mentoring/registration-view';
import {
  type MentorSettlementDraft,
  type SettlementPayerType,
} from '@/types/mentoring/settings';
import Button from '@/components/ui/button';
import SingleDropdown from '@/components/ui/dropdown/single';
import { BaseInput } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

const FALLBACK_BANK_OPTIONS = [
  { value: '004', label: '국민은행' },
  { value: '088', label: '신한은행' },
  { value: '020', label: '우리은행' },
  { value: '081', label: '하나은행' },
  { value: '003', label: '기업은행' },
  { value: '011', label: '농협은행' },
  { value: '090', label: '카카오뱅크' },
  { value: '089', label: '케이뱅크' },
] as const;

const getInitialDraftState = (
  initialValue: MentorSettlementDraft | undefined,
): MentorSettlementDraft => {
  if (initialValue) {
    return initialValue;
  }

  return {
    payerType: 'INDIVIDUAL',
    contractName: '',
    accountHolder: '',
    bankCode: '',
    accountNumber: '',
    residentId: '',
    businessName: '',
    businessRegistrationNumber: '',
    verified: false,
    updatedAt: new Date().toISOString(),
  };
};

export default function SettlementRegisterModal({
  open,
  initialValue,
  onOpenChange,
  onSubmit,
}: MentorSettlementRegisterModalProps) {
  const { data: bankList } = useSearchBanks();
  const [draft, setDraft] = useState<MentorSettlementDraft>(() =>
    getInitialDraftState(initialValue),
  );
  const [errorMessage, setErrorMessage] = useState('');

  const bankOptions = useMemo(() => {
    const mappedOptions = (bankList ?? []).map((bank) => ({
      value: bank.bankCode ?? '',
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

  const resetState = () => {
    setDraft(getInitialDraftState(initialValue));
    setErrorMessage('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const closeModal = () => {
    handleOpenChange(false);
  };

  const isIndividual = draft.payerType === 'INDIVIDUAL';
  const isBusiness = draft.payerType === 'BUSINESS';

  const hasBaseFields =
    draft.contractName.trim().length > 0 &&
    draft.accountHolder.trim().length > 0 &&
    draft.bankCode.trim().length > 0 &&
    draft.accountNumber.trim().length > 0;

  const hasTypeSpecificFields = (() => {
    if (isIndividual) {
      return (draft.residentId ?? '').trim().length > 0;
    }

    if (isBusiness) {
      return (
        (draft.businessName ?? '').trim().length > 0 &&
        (draft.businessRegistrationNumber ?? '').trim().length > 0
      );
    }

    return true;
  })();

  const handleVerify = () => {
    if (!hasBaseFields || !hasTypeSpecificFields) {
      setErrorMessage('필수 항목을 모두 입력한 후 인증을 진행해주세요.');

      return;
    }

    setDraft((prev) => ({
      ...prev,
      verified: true,
      updatedAt: new Date().toISOString(),
    }));
    setErrorMessage('');
  };

  const handleSubmit = () => {
    if (!draft.verified || !hasBaseFields || !hasTypeSpecificFields) {
      setErrorMessage('정산정보 인증 완료 후 등록해주세요.');

      return;
    }

    onSubmit({
      ...draft,
      contractName: draft.contractName.trim(),
      accountHolder: draft.accountHolder.trim(),
      accountNumber: draft.accountNumber.trim(),
      residentId: draft.residentId?.trim(),
      businessName: draft.businessName?.trim(),
      businessRegistrationNumber: draft.businessRegistrationNumber?.trim(),
      updatedAt: new Date().toISOString(),
    });
    closeModal();
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-full max-w-[840px]">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title className="font-designer-28b text-text-default">
              정산정보 등록
            </Modal.Title>
            <Modal.Close onClick={closeModal}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-150 sm:gap-200">
            <div className="rounded-100 bg-fill-brand-subtle-default text-text-brand flex items-start gap-100 px-200 py-150">
              <AlertCircle className="h-18 w-18 shrink-0" />
              <p className="font-designer-16m">
                정산정보는 모든 강의에 동일하게 적용되며, 정산은 익월 10
                영업일에 확정됩니다.
              </p>
            </div>

            <div className="flex flex-col gap-150">
              <h3 className="font-designer-20b text-text-default">
                정산자 유형
              </h3>
              <div className="grid grid-cols-1 gap-100 sm:grid-cols-3">
                {SETTLEMENT_PAYER_OPTIONS.map((option) => {
                  const isSelected = draft.payerType === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          payerType: option.value as SettlementPayerType,
                          verified: false,
                        }))
                      }
                      className={[
                        'rounded-100 border px-150 py-125 text-left',
                        isSelected
                          ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                          : 'border-border-default bg-background-default text-text-default',
                      ].join(' ')}
                    >
                      <span className="font-designer-18m">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <BaseInput
              value={draft.contractName}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  contractName: value,
                  verified: false,
                }))
              }
              placeholder="계약자명"
            />
            <BaseInput
              value={draft.accountHolder}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  accountHolder: value,
                  verified: false,
                }))
              }
              placeholder="정산자명(예금주명)"
            />

            {isIndividual && (
              <BaseInput
                value={draft.residentId ?? ''}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    residentId: value,
                    verified: false,
                  }))
                }
                placeholder="주민등록번호(숫자만)"
              />
            )}

            {isBusiness && (
              <>
                <BaseInput
                  value={draft.businessName ?? ''}
                  onValueChange={(value) =>
                    setDraft((prev) => ({
                      ...prev,
                      businessName: value,
                      verified: false,
                    }))
                  }
                  placeholder="사업체명"
                />
                <BaseInput
                  value={draft.businessRegistrationNumber ?? ''}
                  onValueChange={(value) =>
                    setDraft((prev) => ({
                      ...prev,
                      businessRegistrationNumber: value,
                      verified: false,
                    }))
                  }
                  placeholder="사업자등록번호"
                />
              </>
            )}

            <SingleDropdown
              options={bankOptions}
              value={draft.bankCode}
              placeholder="은행 선택"
              onChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  bankCode: value ?? '',
                  verified: false,
                }))
              }
            />

            <div className="flex flex-col gap-100 sm:flex-row">
              <BaseInput
                value={draft.accountNumber}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    accountNumber: value,
                    verified: false,
                  }))
                }
                placeholder="- 없이 숫자만 입력"
                className="flex-1"
              />
              <Button
                type="button"
                color="primary"
                size="large"
                className="w-full sm:w-auto"
                onClick={handleVerify}
              >
                인증
              </Button>
            </div>

            {errorMessage && (
              <p className="font-designer-13r text-text-error">
                {errorMessage}
              </p>
            )}
            {draft.verified && (
              <p className="font-designer-13r text-text-success">
                계좌 인증이 완료되었습니다.
              </p>
            )}
          </Modal.Body>

          <Modal.Footer className="flex flex-col-reverse gap-100 sm:flex-row sm:justify-end">
            <Button
              type="button"
              color="secondary"
              size="large"
              className="w-full sm:w-auto"
              onClick={closeModal}
            >
              취소
            </Button>
            <Button
              type="button"
              color="primary"
              size="large"
              className="w-full sm:w-auto"
              onClick={handleSubmit}
              disabled={!draft.verified}
            >
              등록하기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
