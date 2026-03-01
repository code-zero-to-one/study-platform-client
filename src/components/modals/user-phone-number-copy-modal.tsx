import { XIcon } from 'lucide-react';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export default function UserPhoneNumberCopyModal({
  trigger,
  phoneNumber,
  realName,
}: {
  trigger: React.ReactNode;
  phoneNumber: string;
  realName?: string;
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
              연락하기
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-300 p-400">
            <div className="bg-background-alternative border-border-subtle rounded-150 flex items-center gap-200 border px-300 py-250">
              <div className="flex min-w-0 flex-1 flex-col gap-50">
                <div className="font-designer-16b text-text-strong truncate">
                  {realName || '상대방'}
                </div>
                <div className="font-designer-13r text-text-subtle">
                  스터디 파트너
                </div>
              </div>
            </div>

            <div className="border-border-default rounded-150 flex items-center justify-between gap-200 border px-300 py-250">
              <div className="flex flex-col gap-50">
                <span className="text-text-subtle text-[12px] font-medium">
                  전화번호
                </span>
                <span className="text-text-default font-designer-18m tracking-wide">
                  {phoneNumber}
                </span>
              </div>

              <Button size="medium" onClick={handleCopy}>
                복사
              </Button>
            </div>

            <div className="bg-fill-neutral-subtle-default rounded-100 text-text-subtle px-200 py-150 text-center text-[12px]">
              개인정보 보호를 위해 통화 시 주의해 주세요.
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
