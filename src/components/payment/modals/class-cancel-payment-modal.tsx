'use client';

import { useState } from 'react';
import Button from '@/components/common/ui/button';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import { Modal } from '@/components/common/ui/modal';
import { useCancelCoursePayment } from '@/hooks/queries/course/course-api';

const CANCEL_REASONS = [
  { value: 'CHANGE_OF_MIND', label: '단순 변심' },
  { value: 'CONTENT_UNSATISFIED', label: '강의 내용 불만족' },
  { value: 'DUPLICATE_PURCHASE', label: '중복 구매' },
  { value: 'OTHER', label: '기타' },
] as const;

interface ClassCancelPaymentModalProps {
  courseId: number;
  paymentId: number;
  paymentMethod: 'CARD' | 'VIRTUAL_ACCOUNT';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClassCancelPaymentModal({
  courseId,
  paymentId,
  paymentMethod,
  open,
  onOpenChange,
}: ClassCancelPaymentModalProps) {
  const [step, setStep] = useState<'form' | 'complete'>('form');
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [detail, setDetail] = useState('');

  const { mutate: cancelPayment, isPending } = useCancelCoursePayment();

  const handleConfirm = () => {
    cancelPayment(
      { courseId, paymentId },
      {
        onSuccess: () => setStep('complete'),
      },
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('form');
    setReason(undefined);
    setDetail('');
  };

  if (step === 'complete') {
    return (
      <Modal.Root open={open} onOpenChange={handleClose}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content size="small" className="w-[423px]">
            <Modal.Header variant="alert">
              <Modal.Title>취소 완료</Modal.Title>
            </Modal.Header>

            <Modal.Body variant="alert">
              <div className="flex flex-col items-center gap-200 text-center">
                <p className="font-designer-16b text-text-default">
                  취소가 완료되었습니다
                </p>
                <p className="font-designer-14r text-text-subtle">
                  {paymentMethod === 'CARD'
                    ? '카드 결제 취소는 영업일 기준 3~5일 이내 처리됩니다.'
                    : '무통장 입금 취소는 결제 취소 요청 즉시 처리됩니다.'}
                </p>
              </div>
            </Modal.Body>

            <Modal.Footer variant="alert">
              <Button
                color="primary"
                size="medium"
                className="w-full"
                onClick={handleClose}
              >
                확인
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    );
  }

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header variant="alert">
            <Modal.Title>결제 취소 요청하기</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <div className="flex flex-col gap-300">
              <p className="font-designer-14r text-text-subtle">
                취소 요청 시 클래스에 더 이상 참여하실 수 없습니다.
              </p>

              <div className="flex flex-col gap-100">
                <label className="font-designer-14m text-text-default">
                  취소 사유
                </label>
                <SingleDropdown
                  options={CANCEL_REASONS}
                  value={reason}
                  onChange={setReason}
                  placeholder="취소 사유를 선택해주세요"
                  size="l"
                />
              </div>

              <div className="flex flex-col gap-100">
                <label className="font-designer-14m text-text-default">
                  상세 내용
                </label>
                <textarea
                  className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest h-[120px] w-full resize-none border p-150 outline-none"
                  placeholder="상세 내용을 입력해주세요"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                />
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer variant="alert">
            <div className="flex gap-200">
              <Button
                color="secondary"
                size="medium"
                className="flex-1"
                onClick={handleClose}
              >
                취소
              </Button>
              <Button
                color="primary"
                size="medium"
                className="flex-1"
                disabled={isPending}
                onClick={handleConfirm}
              >
                확인
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
