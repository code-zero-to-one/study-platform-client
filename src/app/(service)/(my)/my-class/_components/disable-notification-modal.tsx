'use client';

import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';

interface DisableNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DisableNotificationModal({
  open,
  onOpenChange,
  onConfirm,
}: DisableNotificationModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium">
          <Modal.Header variant="alert">
            <Modal.Title>알림톡 끄기</Modal.Title>
          </Modal.Header>
          <Modal.Body variant="alert">
            <p className="font-designer-14r text-center text-text-subtle">
              학습 알림톡을 끄면 매일 설정한 시간에 알림을 받지 못합니다.
              <br />
              정말 끄시겠습니까?
            </p>
          </Modal.Body>
          <Modal.Footer variant="alert">
            <div className="flex gap-200">
              <Button
                color="secondary"
                size="medium"
                className="flex-1 whitespace-nowrap"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button
                color="primary"
                size="medium"
                className="flex-1 whitespace-nowrap"
                onClick={onConfirm}
              >
                끄기
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
