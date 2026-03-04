import { useState } from 'react';

import { MissionListResponse } from '@/api/openapi';
import { useDeleteMission } from '@/hooks/queries/mission-api';
import { useToastStore } from '@/stores/use-toast-store';
import Button from '../common/ui/button';
import { Modal } from '../common/ui/modal';

interface DeleteMissionModalProps {
  missionId: MissionListResponse['missionId'];
  groupStudyId: number;
  onSuccess?: () => void;
}

// 미션 삭제 모달
export default function DeleteMissionModal({
  missionId,
  groupStudyId,
  onSuccess,
}: DeleteMissionModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const { mutate: deleteMission } = useDeleteMission();
  const showToast = useToastStore((state) => state.showToast);

  const handleDelete = () => {
    deleteMission(
      { missionId, groupStudyId },
      {
        onSuccess: () => {
          showToast('미션이 성공적으로 삭제되었습니다!');
          setOpen(false);
          onSuccess?.();
        },
        onError: () => {
          showToast('미션 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
        },
      },
    );
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
            <Modal.Title>미션을 삭제하시겠습니까?</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <span className="font-designer-14r">
              해당 미션과 연결된 제출 및 평가 정보가 사라집니다.
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
