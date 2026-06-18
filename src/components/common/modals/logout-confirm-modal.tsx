'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';
import { useLogoutMutation } from '@/hooks/queries/auth/use-auth-mutation';

interface LogoutConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LogoutConfirmModal({
  open,
  onOpenChange,
}: LogoutConfirmModalProps) {
  const { mutate: logout, isPending } = useLogoutMutation();

  const handleConfirm = () => {
    logout();
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium">
          <Modal.Header className={cn('border-none', 'text-left')}>
            <Modal.Title className="font-designer-24b">
              로그아웃 하시겠어요?
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p className="font-designer-18r text-left text-text-default">
              로그아웃하면 다시 로그인해야 ZERO-ONE 서비스를 이용할 수 있어요.
            </p>
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
                {isPending ? '로그아웃 중...' : '로그아웃'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
