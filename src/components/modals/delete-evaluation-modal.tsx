import { useState } from 'react';
import { useDeleteEvaluation } from '@/hooks/queries/evaluation-api';
import Button from '../ui/button';
import { Modal } from '../ui/modal';

interface DeleteEvaluationModalProps {
  evaluationId: number; // todo api response 타입 적용
}

// 평가 삭제 모달
export default function DeleteEvaluationModal({
  evaluationId,
}: DeleteEvaluationModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const { mutate: deleteEvaluation } = useDeleteEvaluation();

  const handleDelete = () => {
    deleteEvaluation(evaluationId, {
      onSuccess: () => {
        alert('평가가 삭제되었습니다.');
        setOpen(false);
      },
      onError: () => {
        alert('평가 삭제에 실패했습니다. 다시 시도해주세요.');
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
          <Modal.Header className="border-border-default flex justify-center border-b py-200">
            <Modal.Title>평가를 삭제하시겠습니까?</Modal.Title>
          </Modal.Header>

          <Modal.Body className="font-designer-14r text-text-default flex justify-center py-250">
            해당 평가 정보가 영구적으로 삭제됩니다.
          </Modal.Body>

          <Modal.Footer className="flex justify-center gap-200 border-t-0 py-250">
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
