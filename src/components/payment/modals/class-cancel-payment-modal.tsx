'use client';

import { useState } from 'react';
import Button from '@/components/common/ui/button';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import { Modal } from '@/components/common/ui/modal';
import { useCancelCoursePayment } from '@/hooks/queries/course/course-api';

const CANCEL_REASONS = [
  { value: 'PAYMENT_METHOD_CHANGE', label: '결제 수단 변경 후 재결제' },
  { value: 'DUPLICATE_PURCHASE', label: '중복 결제' },
  { value: 'CHANGE_OF_MIND', label: '단순 변심' },
  { value: 'CONTENT_UNSATISFIED', label: '강의 내용 불만족' },
  { value: 'TECHNICAL_ISSUE', label: '기술적 문제 / 오류' },
  { value: 'OTHER', label: '기타(상세 내용에 기재)' },
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
          <Modal.Content size="medium">
            <Modal.Header variant="alert">
              <Modal.Title>환불이 완료되었습니다</Modal.Title>
            </Modal.Header>

            <Modal.Body variant="alert">
              <div className="flex flex-col gap-100 text-center">
                <p className="font-designer-14r text-text-default">
                  카드 환불 시 카드사에 따라 영업일 2-3일 정도 소요될 수
                  있습니다.
                </p>
                <p className="font-designer-14r text-text-default">
                  무통장 환불 시 영업일 7일 이내로 환불 예정입니다.
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
        <Modal.Content size="large">
          <Modal.Header variant="alert">
            <Modal.Title>환불 요청하기</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <div className="flex flex-col gap-300">
              <p className="font-designer-14r text-text-subtle">
                환불 요청 시 진행하시는 클래스에 더 이상 참여하실 수 없습니다.
              </p>

              <div className="flex flex-col gap-100">
                <label className="font-designer-14m text-text-default">
                  환불 사유
                </label>
                <SingleDropdown
                  options={CANCEL_REASONS}
                  value={reason}
                  onChange={setReason}
                  placeholder="사유를 선택해 주세요."
                  size="l"
                />
              </div>

              <div className="flex flex-col gap-100">
                <label className="font-designer-14m text-text-default">
                  상세 내용
                </label>
                <textarea
                  className="border-border-default rounded-100 font-designer-14r text-text-default placeholder:text-text-subtlest h-1500 w-full resize-none border p-150 outline-none"
                  placeholder="환불 이유를 간략히 적어주세요."
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
                환불하기
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
