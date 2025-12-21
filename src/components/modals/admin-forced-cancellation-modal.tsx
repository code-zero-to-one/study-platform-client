import Button from '../ui/button';
import { Modal } from '../ui/modal';

export default function AdminForcedCancellationModal({
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
            <Modal.Title>강제 취소</Modal.Title>
          </Modal.Header>

          <Modal.Body className="font-designer-14r text-text-default flex justify-center py-250">
            <span>
              스터디 시작 이전 회원 제제, 유저 요청 등의 사유로 관리자 강제
              취소
            </span>
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
              onClick={() => onOpenChange(false)}
            >
              강제 취소하기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
