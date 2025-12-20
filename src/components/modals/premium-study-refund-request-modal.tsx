import { Modal } from '@/components/ui/modal';
import Button from '../ui/button';

export default function PremiumStudyRefundRequestModal({
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
              onClick={() => onOpenChange(false)}
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
