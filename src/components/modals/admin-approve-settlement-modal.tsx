import { useApproveSettlement } from '@/hooks/queries/admin-settlement-api';
import Button from '../ui/button';
import { Modal } from '../ui/modal';
import { StudySettlementSummaryResponse } from '@/api/openapi';

export default function AdminApproveSettlementModal({
  settlementId,
  open,
  onOpenChange,
}: {
  settlementId: StudySettlementSummaryResponse['settlementId'];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: approveSettlement } = useApproveSettlement();

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header className="border-border-default flex justify-center border-b">
            <Modal.Title>정산 승인하기</Modal.Title>
          </Modal.Header>

          <Modal.Body className="font-designer-14r text-text-default flex justify-center py-250">
            <span>정산을 승인하시겠습니까?</span>
          </Modal.Body>

          <Modal.Footer className="flex justify-center gap-200 border-t-0 py-250">
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
                approveSettlement(settlementId, {
                  onSuccess: () => {
                    onOpenChange(false);
                  },
                });
              }}
            >
              정산 승인하기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
