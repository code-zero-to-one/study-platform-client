'use client';

import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';

interface WithdrawalConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WARNINGS = [
  '탈퇴 시 모든 클래스 수강 기록이 삭제됩니다.',
  '보유한 쿠폰 및 포인트는 복구되지 않습니다.',
  '진행 중인 스터디 및 멘토링에서 즉시 탈퇴 처리됩니다.',
  '작성한 게시글, 댓글, 피드 등의 활동 데이터가 삭제됩니다.',
  '탈퇴 후 동일 소셜 계정으로 재가입해도 이전 데이터는 복구되지 않습니다.',
];

// TODO: withdrawal API not yet available — wire DELETE /api/v1/members/me when added
export default function WithdrawalConfirmModal({
  open,
  onOpenChange,
}: WithdrawalConfirmModalProps) {
  const handleConfirm = async () => {
    // TODO: call DELETE /api/v1/members/me and redirect to /
    onOpenChange(false);
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium">
          <Modal.Header variant="alert">
            <Modal.Title>정말 탈퇴하시겠어요?</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <div className="flex flex-col gap-200">
              <p className="font-designer-14m text-text-default">
                탈퇴 전 아래 내용을 꼭 확인해 주세요.
              </p>
              <ul className="flex flex-col gap-150">
                {WARNINGS.map((warning, index) => (
                  <li key={index} className="flex items-start gap-150">
                    <span className="font-designer-12r text-primary-500 mt-50 shrink-0">
                      •
                    </span>
                    <span className="font-designer-14r text-text-subtle">
                      {warning}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Modal.Body>

          <Modal.Footer variant="alert">
            <div className="flex gap-200">
              <Button
                color="secondary"
                size="medium"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                계속 이용하기
              </Button>
              <Button
                color="primary"
                size="medium"
                className="flex-1"
                onClick={handleConfirm}
              >
                탈퇴하기
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
