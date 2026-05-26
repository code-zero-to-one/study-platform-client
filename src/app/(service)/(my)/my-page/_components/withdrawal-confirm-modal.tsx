'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { useWithdrawMemberMutation } from '@/hooks/queries/user/use-withdraw-member-mutation';

interface WithdrawalConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WithdrawalConfirmModal({
  open,
  onOpenChange,
}: WithdrawalConfirmModalProps) {
  const { mutate: withdraw, isPending } = useWithdrawMemberMutation();

  const handleConfirm = () => {
    withdraw();
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium">
          <Modal.Header className={cn('border-none', 'text-left')}>
            <Modal.Title className="font-designer-24b">
              탈퇴 전, 안내 사항
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <ol className="flex flex-col gap-100 text-left">
              <li className="flex items-start gap-125">
                <span className="font-designer-18r text-text-default shrink-0">
                  1.
                </span>
                <span className="font-designer-18r text-text-default">
                  탈퇴하기 클릭 시,{' '}
                  <span className="font-designer-18b text-text-brand">
                    ZERO-ONE 서비스에서 탈퇴 처리
                  </span>{' '}
                  됩니다.
                </span>
              </li>
              <li className="flex items-start gap-125">
                <span className="font-designer-18r text-text-default shrink-0">
                  2.
                </span>
                <span className="font-designer-18r text-text-default">
                  탈퇴 시 계정과 관련된 모든 권한이 사라지며 복구할 수 없습니다.
                </span>
              </li>
              <li className="flex items-start gap-125">
                <span className="font-designer-18r text-text-default shrink-0">
                  3.
                </span>
                <span className="font-designer-18r text-text-default">
                  직접 작성한 콘텐츠(빌더 피드, 질문답변, 게시물, 댓글 등)는
                  자동으로 삭제되지 않으며, 만일 삭제를 원하시면 탈퇴 이전에
                  수동 삭제가 필요합니다.
                </span>
              </li>
              <li className="flex items-start gap-125">
                <span className="font-designer-18r text-text-default shrink-0">
                  4.
                </span>
                <span className="font-designer-18r text-text-default">
                  탈퇴 후 연동된 소셜 계정 정보도 사라지며 기존 계정 재가입이
                  불가능합니다.
                </span>
              </li>
              <li className="flex items-start gap-125">
                <span className="font-designer-18r text-text-default shrink-0">
                  5.
                </span>
                <span className="font-designer-18r text-text-default">
                  탈퇴하기 클릭 시 위 내용에 동의하는 것으로 간주됩니다.
                </span>
              </li>
            </ol>
          </Modal.Body>

          <Modal.Footer variant="alert">
            <div className="flex w-full gap-200">
              <Button
                color="secondary"
                size="medium"
                className="flex-1"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button
                color="primary"
                size="medium"
                className="flex-1"
                disabled={isPending}
                onClick={handleConfirm}
              >
                {isPending ? '탈퇴 중...' : '탈퇴하기'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
