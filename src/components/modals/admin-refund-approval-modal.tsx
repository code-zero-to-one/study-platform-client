import { AdminTransactionListResponse } from '@/api/openapi';
import Button from '../ui/button';
import { Modal } from '../ui/modal';

interface AdminRefundApprovalModalProps
  extends Pick<
    AdminTransactionListResponse,
    | 'groupStudyName'
    | 'paymentMemberName'
    | 'paymentMemberId'
    | 'transactionAmount'
  > {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminRefundApprovalModal({
  open,
  onOpenChange,
  groupStudyName,
  paymentMemberName,
  paymentMemberId,
  transactionAmount,
}: AdminRefundApprovalModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header className="border-border-default flex justify-center border-b">
            <Modal.Title>환불 승인/반려</Modal.Title>
          </Modal.Header>

          <Modal.Body className="font-designer-14r text-text-default flex flex-col items-center gap-100 py-250">
            <span>{groupStudyName}</span>
            <span>
              {paymentMemberName}({paymentMemberId})
            </span>
            <span>{transactionAmount.toLocaleString()}원(무통장입금)</span>
          </Modal.Body>

          <Modal.Footer className="flex justify-center gap-200 border-t-0 py-250">
            <Button
              color="secondary"
              className="w-[160px]"
              size="medium"
              onClick={() => onOpenChange(false)}
            >
              환불 반려
            </Button>
            <Button
              color="primary"
              className="w-[160px]"
              size="medium"
              onClick={() => onOpenChange(false)}
            >
              환불 승인
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
