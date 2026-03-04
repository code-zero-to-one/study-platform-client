import { UserTransactionListResponse } from '@/api/openapi';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { useRequestRefund } from '@/hooks/queries/refund-user-api';

export default function PremiumStudyRefundRequestModal({
  paymentId,
  open,
  onOpenChange,
}: {
  paymentId: UserTransactionListResponse['paymentId'];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: requestRefund } = useRequestRefund();

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header className="border-border-default flex justify-center border-b">
            <Modal.Title>환불 요청</Modal.Title>
          </Modal.Header>

          <Modal.Body className="font-designer-14r text-text-default flex flex-col items-center">
            <span>환불 요청 시 진행하시는 스터디에</span>
            <span>더 이상 참여할 수 없습니다.</span>
          </Modal.Body>

          <Modal.Footer className="flex justify-center gap-200 border-t-0">
            <Button
              color="secondary"
              className="w-[160px]"
              size="medium"
              onClick={() => {
                requestRefund(
                  {
                    paymentId,
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
              환불 요청하기
            </Button>
            <Button
              color="primary"
              className="w-[160px]"
              size="medium"
              onClick={() => onOpenChange(false)}
            >
              아니오
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
