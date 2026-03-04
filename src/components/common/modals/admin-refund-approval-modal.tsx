import { AdminTransactionListResponse } from '@/api/openapi';
import {
  useApproveRefund,
  useRejectRefund,
} from '@/hooks/queries/admin-refund-api';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';

interface AdminRefundApprovalModalProps extends Pick<
  AdminTransactionListResponse,
  | 'refundId'
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
  refundId,
  groupStudyName,
  paymentMemberName,
  paymentMemberId,
  transactionAmount,
}: AdminRefundApprovalModalProps) {
  const { mutate: approveRefund } = useApproveRefund();
  const { mutate: rejectRefund } = useRejectRefund();

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header variant="alert">
            <Modal.Title>환불 승인/반려</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert" className="flex-col gap-100">
            <span className="font-designer-14r">{groupStudyName}</span>
            <span className="font-designer-14r">
              {paymentMemberName}({paymentMemberId})
            </span>
            <span className="font-designer-14r">
              {transactionAmount.toLocaleString()}원(무통장입금)
            </span>
          </Modal.Body>

          <Modal.Footer variant="alert">
            <Button
              color="secondary"
              className="w-[160px]"
              size="medium"
              onClick={() => {
                rejectRefund(
                  {
                    refundId,
                    request: {
                      reason: '',
                    },
                  },
                  {
                    onSuccess: () => {
                      onOpenChange(false);
                    },
                  },
                );
              }}
            >
              환불 반려
            </Button>
            <Button
              color="primary"
              className="w-[160px]"
              size="medium"
              onClick={() => {
                approveRefund(
                  {
                    refundId,
                    request: {},
                  },
                  {
                    onSuccess: () => {
                      onOpenChange(false);
                    },
                  },
                );
              }}
            >
              환불 승인
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
