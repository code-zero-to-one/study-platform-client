import { XIcon } from 'lucide-react';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';

export default function UserPhoneNumberCopyModal({
  trigger,
  phoneNumber,
}: {
  trigger: React.ReactNode;
  phoneNumber: string;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      alert('전화번호가 복사되었습니다.');
    } catch (e) {
      alert('전화번호 복사에 실패하였습니다');
    }
  };

  return (
    <Modal.Root>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>

      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="small" className="w-full">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              전화하기
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex flex-col items-center gap-150 p-400">
            <div className="border-border-default rounded-100 flex w-full justify-between rounded border py-150 pr-200 pl-250">
              <span className="text-text-default font-designer-18m">
                {phoneNumber}
              </span>

              <Button size="medium" onClick={handleCopy}>
                복사
              </Button>
            </div>

            <span className="text-text-subtle font-designer-14r">
              개인정보 보호를 위해 통화 시 주의해 주세요.
            </span>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
