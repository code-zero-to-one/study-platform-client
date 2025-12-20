import { Modal } from '@/components/ui/modal';
import Button from '../ui/button';

export default function PremiumStudyCancelPaymentModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header className="border-border-default flex justify-center border-b">
            <Modal.Title>결제 취소</Modal.Title>
          </Modal.Header>

          <Modal.Body className="font-designer-14r text-text-default flex justify-center">
            <span>해당 스터디의 결제를 취소하시겠습니까?</span>
          </Modal.Body>

          <Modal.Footer className="flex justify-center gap-200 border-t-0">
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
              onClick={() => onOpenChange(false)}
            >
              결제 취소
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
