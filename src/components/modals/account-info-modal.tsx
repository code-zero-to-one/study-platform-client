import { XIcon } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import AddAccountModal from './add-account-modal';

interface AccountInfo {
  bankName: string;
  accountNumber: string;
}

interface AccountInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccountInfoModal({
  open,
  onOpenChange,
}: AccountInfoModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Mock 계좌 정보
  const accountInfo: AccountInfo = {
    bankName: '국민은행',
    accountNumber: '123-456-78901234',
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (values: {
    bankName: string;
    accountNumber: string;
  }) => {
    // TODO: API 호출로 계좌 정보 업데이트
    console.log('Updated account info:', values);
    alert('계좌 정보가 변경되었습니다!');
    setIsEditModalOpen(false);
  };

  return (
    <>
      <Modal.Root open={open} onOpenChange={onOpenChange}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content className="w-[840px]">
            <Modal.Header className="border-border-default flex justify-between border-b">
              <Modal.Title className="font-designer-20b text-text-strong">
                계좌 정보
              </Modal.Title>
              <Modal.Close onClick={() => onOpenChange(false)}>
                <XIcon />
              </Modal.Close>
            </Modal.Header>

            <Modal.Body>
              <div className="bg-background-alternative rounded-150 flex flex-col gap-300 px-400 py-300">
                <h3 className="font-designer-16b text-text-strong">
                  정산 계좌
                </h3>

                <div className="flex items-center gap-150">
                  <p className="font-designer-16m text-text-subtle">
                    {accountInfo.bankName} {accountInfo.accountNumber}
                  </p>
                  <Button
                    color="outlined"
                    size="small"
                    onClick={handleEdit}
                    className="font-designer-14r bg-background-default w-[96px]"
                  >
                    계좌 변경
                  </Button>
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-100">
              <Modal.Close asChild>
                <Button
                  color="secondary"
                  size="large"
                  onClick={() => onOpenChange(false)}
                >
                  닫기
                </Button>
              </Modal.Close>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <AddAccountModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleEditSubmit}
      />
    </>
  );
}
