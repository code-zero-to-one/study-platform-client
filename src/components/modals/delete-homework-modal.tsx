import { useState } from 'react';
import { useDeleteHomework } from '@/hooks/queries/group-study-homework-api';
import Button from '../ui/button';
import { Modal } from '../ui/modal';

interface DeleteHomeworkModalProps {
  homeworkId: number;
}

// 과제 삭제 모달
export default function DeleteHomeworkModal({
  homeworkId,
}: DeleteHomeworkModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const { mutate: deleteHomework } = useDeleteHomework();

  const handleDelete = () => {
    deleteHomework(homeworkId, {
      onSuccess: () => {
        alert('과제가 성공적으로 삭제되었습니다!');
        setOpen(false);
      },
      onError: () => {
        alert('과제 삭제에 실패했습니다. 다시 시도해주세요.');
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
          <Modal.Header className="border-border-default flex justify-center border-b py-200">
            <Modal.Title>과제를 삭제하시겠습니까?</Modal.Title>
          </Modal.Header>

          <Modal.Body className="font-designer-14r text-text-default flex justify-center py-250">
            제출한 과제가 영구적으로 삭제됩니다.
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
