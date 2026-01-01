import Button from '../ui/button';
import { Modal } from '../ui/modal';

interface DeletePeerReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// todo api 연결
// 피어 리뷰 삭제 모달
export default function DeletePeerReviewModal({
  open,
  onOpenChange,
}: DeletePeerReviewModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header className="border-border-default flex justify-center border-b py-200">
            <Modal.Title>피어 리뷰를 삭제하시겠습니까?</Modal.Title>
          </Modal.Header>

          <Modal.Body className="font-designer-14r text-text-default flex justify-center py-250">
            작성하신 피어 리뷰가 영구적으로 삭제됩니다.
          </Modal.Body>

          <Modal.Footer className="flex justify-center gap-200 border-t-0 py-250">
            <Button
              color="secondary"
              className="font-designer-14b w-[160px]"
              size="medium"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              color="primary"
              className="font-designer-14b w-[160px]"
              size="medium"
              onClick={() => {
                // 과제 삭제 로직
              }}
            >
              삭제하기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
