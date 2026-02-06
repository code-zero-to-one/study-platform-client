import { useDeletePeerReview } from '@/hooks/queries/peer-review-api';
import { useToastStore } from '@/stores/use-toast-store';
import Button from '../ui/button';
import { Modal } from '../ui/modal';

interface DeletePeerReviewModalProps {
  peerReviewId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 피어 리뷰 삭제 모달
export default function DeletePeerReviewModal({
  peerReviewId,
  open,
  onOpenChange,
}: DeletePeerReviewModalProps) {
  const { mutate: deletePeerReview } = useDeletePeerReview();
  const showToast = useToastStore((state) => state.showToast);

  const handleDelete = () => {
    deletePeerReview(peerReviewId, {
      onSuccess: () => {
        showToast('피어 리뷰가 삭제되었습니다!');
        onOpenChange(false);
      },
      onError: () => {
        showToast('피어 리뷰 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
      },
    });
  };

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
              onClick={handleDelete}
            >
              삭제하기
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
