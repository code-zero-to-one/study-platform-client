import { useState } from 'react';
import { useDeleteEvaluation } from '@/hooks/queries/evaluation-api';
import { useToastStore } from '@/stores/use-toast-store';
import Button from '../common/ui/button';
import { Modal } from '../common/ui/modal';

interface DeleteEvaluationModalProps {
  evaluationId: number; // todo api response 타입 적용
}

// 평가 삭제 모달
export default function DeleteEvaluationModal({
  evaluationId,
}: DeleteEvaluationModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const { mutate: deleteEvaluation } = useDeleteEvaluation();
  const showToast = useToastStore((state) => state.showToast);

  const handleDelete = () => {
    deleteEvaluation(evaluationId, {
      onSuccess: () => {
        showToast('평가가 삭제되었습니다.');
        setOpen(false);
      },
      onError: () => {
        showToast('평가 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
      },
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          color="outlined"
          size="small"
          className="font-designer-14r w-[96px]"
        >
          삭제하기
        </Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header variant="alert">
            <Modal.Title>평가를 삭제하시겠습니까?</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <span className="font-designer-14r">
              해당 평가 정보가 영구적으로 삭제됩니다.
            </span>
          </Modal.Body>

          <Modal.Footer variant="alert">
            <Button
              color="secondary"
              className="font-designer-14b w-[160px]"
              size="medium"
              onClick={() => setOpen(false)}
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
