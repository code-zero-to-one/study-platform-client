import { StudySettlementSummaryResponse } from '@/api/openapi';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { useCompleteSettlement } from '@/hooks/queries/admin/admin-settlement-api';

export default function AdminCompleteSettlementModal({
  settlementId,
  open,
  onOpenChange,
}: {
  settlementId: StudySettlementSummaryResponse['settlementId'];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: completeSettlement } = useCompleteSettlement();

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header variant="alert">
            <Modal.Title>정산 완료하기</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <span className="font-designer-14r">정산을 완료하시겠습니까?</span>
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
                completeSettlement(settlementId, {
                  onSuccess: () => {
                    onOpenChange(false);
                  },
                });
              }}
            >
              정산 완료하기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
