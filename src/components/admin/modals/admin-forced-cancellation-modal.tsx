import { AdminTransactionListResponse } from '@/api/openapi';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { useForceCancelPayment } from '@/hooks/queries/admin/admin-payment-api';

export default function AdminForcedCancellationModal({
  paymentId,
  open,
  onOpenChange,
}: {
  paymentId: AdminTransactionListResponse['paymentId'];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: forceCancelPayment } = useForceCancelPayment();

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header variant="alert">
            <Modal.Title>강제 취소</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <span className="font-designer-14r">
              스터디 시작 이전 회원 제제, 유저 요청 등의 사유로 관리자 강제 취소
            </span>
          </Modal.Body>

          <Modal.Footer variant="alert">
            <Button
              color="secondary"
              className="w-[160px]"
              size="medium"
              onClick={() => onOpenChange(false)}
            >
              아니오
            </Button>
            <Button
              color="primary"
              className="w-[160px]"
              size="medium"
              onClick={() => {
                forceCancelPayment(
                  {
                    paymentId,
                  },
                  {
                    onSuccess: () => {
                      onOpenChange(false);
                    },
                  },
                );
              }}
            >
              강제 취소하기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
