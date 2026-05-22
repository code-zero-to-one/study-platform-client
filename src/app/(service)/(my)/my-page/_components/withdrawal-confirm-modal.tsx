'use client';

import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';

interface WithdrawalConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
            <Modal.Title>탈퇴 전, 안내 사항</Modal.Title>
          </Modal.Header>

          <Modal.Body variant="alert">
            <ol className="flex flex-col gap-150">
              <li className="flex items-start gap-150">
                <span className="font-designer-14m text-text-subtle mt-50 shrink-0">
                  1.
                </span>
                <span className="font-designer-14r text-text-subtle">
                  탈퇴하기 클릭 시,{' '}
                  <span className="font-bold text-primary-500">
                    ZERO-ONE 서비스에서 탈퇴 처리
                  </span>{' '}
                  됩니다.
                </span>
              </li>
              <li className="flex items-start gap-150">
                <span className="font-designer-14m text-text-subtle mt-50 shrink-0">
                  2.
                </span>
                <span className="font-designer-14r text-text-subtle">
                  탈퇴 시 계정과 관련된 모든 권한이 사라지며 복구할 수 없습니다.
                </span>
              </li>
              <li className="flex items-start gap-150">
                <span className="font-designer-14m text-text-subtle mt-50 shrink-0">
                  3.
                </span>
                <span className="font-designer-14r text-text-subtle">
                  직접 작성한 콘텐츠(빌더 피드, 질문답변, 게시물, 댓글 등)는
                  자동으로 삭제되지 않으며, 만일 삭제를 원하시면 탈퇴 이전에
                  수동 삭제가 필요합니다.
                </span>
              </li>
              <li className="flex items-start gap-150">
                <span className="font-designer-14m text-text-subtle mt-50 shrink-0">
                  4.
                </span>
                <span className="font-designer-14r text-text-subtle">
                  탈퇴 후 연동된 소셜 계정 정보도 사라지며 기존 계정 재가입이
                  불가능합니다.
                </span>
              </li>
              <li className="flex items-start gap-150">
                <span className="font-designer-14m text-text-subtle mt-50 shrink-0">
                  5.
                </span>
                <span className="font-designer-14r text-text-subtle">
                  탈퇴하기 클릭 시 위 내용에 동의하는 것으로 간주됩니다.
                </span>
              </li>
            </ol>
          </Modal.Body>

          <Modal.Footer variant="alert">
            <div className="flex gap-200">
              <Button
                color="secondary"
                size="medium"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                취소
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
