import Button from '../ui/button';
import { Modal } from '../ui/modal';

interface AdminRefundApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studyTitle?: string;
  userName?: string;
  userId?: string;
  amount?: number;
}

export default function AdminRefundApprovalModal({
  open,
  onOpenChange,
  studyTitle = '데이터 분석 Python 스터디',
  userName = '김민정',
  userId = 'ab0001',
  amount = 150000,
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
            <span>{studyTitle}</span>
            <span>
              {userName}({userId})
            </span>
            <span>{amount.toLocaleString()}원(무통장입금)</span>
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
