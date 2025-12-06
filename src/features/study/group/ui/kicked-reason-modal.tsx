import Link from 'next/link';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface KickedReasonModalProps {
  reason: string;
}

export default function KickedReasonModal({ reason }: KickedReasonModalProps) {
  if (!reason) return null;

  return (
    <Modal.Root defaultOpen open>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content
          onPointerDownOutside={(e) => {
            // 모달 바깥 클릭 방지
            e.preventDefault();
          }}
          onInteractOutside={(e) => {
            // 모달 바깥 클릭 방지
            e.preventDefault();
          }}
        >
          <Modal.Header>
            <Modal.Title className="font-designer-20b text-text-strong">
              스터디에 접근할 수 없습니다
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-400 px-400 pt-0 pb-150">
            <div className="font-designer-16r text-text-subtle flex flex-col">
              <span>해당 스터디에서 더 이상 활동하실 수 없습니다.</span>
              <span>
                새로운 스터디를 찾아보거나, 다른 팀과 함께 도전해보세요.
              </span>
            </div>

            <div className="text-text-default">
              <span className="font-designer-15b">강퇴사유</span>
              <p className="font-designer-16m border-border-default rounded-100 mt-150 border p-150">
                {reason}
              </p>
            </div>
          </Modal.Body>

          <Modal.Footer className="flex justify-end gap-100 border-0">
            <Link href="/">
              <Button
                type="button"
                color="primary"
                size="large"
                className="h-[48px]"
              >
                홈으로 가기
              </Button>
            </Link>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
