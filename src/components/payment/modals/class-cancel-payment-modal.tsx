'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { useCancelCoursePayment } from '@/hooks/queries/course/course-api';

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
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'complete'>('form');

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
  };

  const handleCompleteClose = () => {
    onOpenChange(false);
    setStep('form');
    router.push('/class-payment-management');
  };

  if (step === 'complete') {
    return (
      <Modal.Root open={open} onOpenChange={handleCompleteClose}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content size="medium">
            <Modal.Header variant="alert">
              <Modal.Title>결제가 취소되었습니다</Modal.Title>
            </Modal.Header>

            <Modal.Body variant="alert">
              <p className="font-designer-14r text-text-default text-center">
                결제가 정상적으로 취소되었습니다.
              </p>
            </Modal.Body>

            <Modal.Footer variant="alert">
              <Button
                color="primary"
                size="medium"
                className="w-full"
                onClick={handleCompleteClose}
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
        <Modal.Content size="medium">
          <Modal.Header variant="alert">
            <Modal.Title>결제 취소하기</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <p className="font-designer-14r text-text-subtle">
              결제를 취소하시겠습니까? 취소 후에는 되돌릴 수 없습니다.
            </p>
          </Modal.Body>

          <Modal.Footer variant="alert">
            <div className="flex gap-200">
              <Button
                color="secondary"
                size="medium"
                className="flex-1"
                onClick={handleClose}
              >
                돌아가기
              </Button>
              <Button
                color="primary"
                size="medium"
                className="flex-1"
                disabled={isPending}
                onClick={handleConfirm}
              >
                취소하기
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
