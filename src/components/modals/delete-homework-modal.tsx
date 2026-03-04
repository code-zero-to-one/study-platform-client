import { useState } from 'react';
import { useDeleteHomework } from '@/hooks/queries/group-study-homework-api';
import { useToastStore } from '@/stores/use-toast-store';
import Button from '../common/ui/button';
import { Modal } from '../common/ui/modal';

interface DeleteHomeworkModalProps {
  homeworkId: number;
  onSuccess?: () => void;
}

// 과제 삭제 모달
export default function DeleteHomeworkModal({
  homeworkId,
  onSuccess,
}: DeleteHomeworkModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const { mutate: deleteHomework } = useDeleteHomework();
  const showToast = useToastStore((state) => state.showToast);

  const handleDelete = () => {
    deleteHomework(homeworkId, {
      onSuccess: () => {
        showToast('과제가 성공적으로 삭제되었습니다!');
        setOpen(false);
        onSuccess?.();
      },
      onError: () => {
        showToast('과제 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
      },
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          size="medium"
          className="font-designer-14r w-fit"
          color="outlined"
        >
          삭제하기
        </Button>
      </Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-[423px]">
          <Modal.Header variant="alert">
            <Modal.Title>과제를 삭제하시겠습니까?</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <span className="font-designer-14r">
              해당 과제에 대해 학생들이 제출한 과제가 영구적으로 삭제됩니다.
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
